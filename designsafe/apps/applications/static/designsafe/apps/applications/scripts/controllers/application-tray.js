(function(window, angular, $, _) {  "use strict";  angular.module('ApplicationsApp').controller('ApplicationTrayCtrl',    ['$scope', '$rootScope', '$q', '$timeout', '$uibModal', '$translate', '$state', 'Apps', 'SimpleList', 'MultipleList', 'Django', function($scope, $rootScope, $q, $timeout, $uibModal, $translate, $state, Apps, SimpleList, MultipleList, Django) {      $scope.tabs = [];      $scope.simpleList = new SimpleList();      $scope.addDefaultTabs = function (query) {        $scope.error = '';        var self = this;        var deferred = $q.defer();        $scope.simpleList.getDefaultLists(query)          .then(function(response){            deferred.resolve(response);          })          .catch(function(response){            $scope.error = $translate.instant('error_tab_get') + response.data;            deferred.reject(response);          });        return deferred.promise;      };      $scope.addUserTabs = function(query, active){        $scope.error = '';        var self = this;        var deferred = $q.defer();        Apps.list(query)          .then(            function(response){              angular.forEach(response.data, function(list){                  $scope.simpleList.lists[list.value.label] = [];                  angular.forEach(list.value.apps, function(app){                    $scope.simpleList.lists[list.value.label].push({                      label: app.id,                      type: app.type                    });                  });              });              deferred.resolve();            },            function(response){              $scope.error = $translate.instant('error_tab_get') + response.data;            }          );        return deferred.promise;      };      $scope.addTab = function(){        $scope.error = '';        $scope.requesting = true;        var self = this;        var deferred = $q.defer();        var title = 'new_list';        var promises = [];        var appMultipleList = new MultipleList();        var query = '{"value.type": "ds_app"}';        promises.push(appMultipleList.addMultipleLists(title, '{"name": "ds_app"}'));        $q.all(promises).then(          function(data) {            $scope.tabs.push({              title: title,              content: {},              edit: true,              multiple: appMultipleList,              original: appMultipleList.lists[1],              active: true,              new: true            })            $scope.requesting = false;          },          function(error){            $scope.error = $translate.instant('error_tab_add');          });        return deferred.promise;      }      $scope.editTab = function(tab){        $scope.error = '';        $scope.requesting = true;        var self = this;        var deferred = $q.defer();        var promises = [];        var appMultipleList = new MultipleList();        var query = {'name':'ds_app'};        var apps = tab.content;        appMultipleList.addEditLists(query, tab.title, apps )          .then(            function(data){              tab.content = {};              tab.multiple = appMultipleList;              tab.original = angular.copy(appMultipleList.lists[1]);              tab.edit = true;              deferred.resolve();              $scope.requesting = false;            },            function(response){              deferred.reject();              $scope.error = $translate.instant('error_tab_edit');            })          return deferred.promise;      };      $scope.saveTab = function(tab, list){        $scope.error = '';        $scope.requesting = true;        var query = {'name': 'ds_app_list', 'value.label':tab.title};        var simpleList = new SimpleList();        var mylist = list;        var mytab = tab;        simpleList.saveList(query, mytab, mylist)          .then(            function(data){              tab.new = false;              $scope.requesting = false;            },            function(error){              $scope.error = $translate.instant('error_tab_edit');            });      };      $scope.cancelTab = function(tab, list){        var simpleList = tab;        simpleList.content.selected = null;        simpleList.content = [];        angular.forEach(tab.original.items, function(item){          simpleList.content.push({label: item.label, type: item.type})        });        simpleList.edit = false;      }      $scope.removeTab = function (event, index, tab) {        $scope.error = '';        event.preventDefault();        event.stopPropagation();        var modalInstance = $uibModal.open({           templateUrl: '/static/designsafe/apps/applications/html/application-tray-delete.html',           scope: $scope,           size: 'md',           resolve: {             tab: function(){               return tab;             }           },           controller: [             '$scope', '$uibModalInstance', '$translate', 'tab', function($scope, $uibModalInstance, $translate, tab) {                $scope.tab = tab;                $scope.deleteTab = function() {                  $scope.requesting = true;                  var query = {'name': 'ds_app_list', 'value.label': tab.title};                  var simpleList = new SimpleList();                  if (tab.new === true){                    $scope.tabs.splice(index, 1);                    $scope.requesting = false;                    $uibModalInstance.dismiss();                  } else {                    simpleList.deleteList(query, tab)                      .then(                        function(data){                          $scope.tabs.splice(index, 1);                          $scope.requesting = false;                          $uibModalInstance.dismiss();                        },                        function(data){                          $scope.error = $translate.instant('error_tab_delete');                        }                      );                  }                };                $scope.cancel = function() {                  $uibModalInstance.dismiss();                };             }           ]         });     };      $scope.getSelectedItemsIncluding = function(list, item) {        item.selected = true;        return list.items.filter(function(item) { return item.selected; });      };      $scope.onDragstart = function(list, event) {         list.dragging = true;      };      $scope.onDrop = function(list, items, index) {        angular.forEach(items, function(item) { item.selected = false; });        list.items = list.items.slice(0, index)                    .concat(items)                    .concat(list.items.slice(index));        return true;      }      $scope.onMoved = function(list) {        list.items = list.items.filter(function(item) { return !item.selected; });      };      $scope.refreshApps = function() {        $scope.error = '';        $scope.requesting = true;        $scope.tabs = [];        var promises = [];        promises.push($scope.addDefaultTabs({'name': 'ds_app'}));        promises.push($scope.addUserTabs({'name': 'ds_app_list'}));        $q.all(promises).then(          function(data) {            $scope.tabs.push(              {                title: 'Private',                content: $scope.simpleList.lists['Private']              }            );            $scope.tabs.push(              {                title: 'Public',                content: $scope.simpleList.lists['Public']              }            );            angular.forEach($scope.simpleList.lists, function(list, key){              if (key !== 'Public' && key !== 'Private') {                $scope.tabs.push({                  title: key,                  content: list                })              }            });            $timeout(function(){              $scope.requesting = false;            });          },          function(error){          }        );      };      $scope.refreshApps();      $scope.getAppDetails = function(app) {        $scope.app = '';        var modalInstance = $uibModal.open({            templateUrl: '/static/designsafe/apps/applications/html/application-details.html',            scope: $scope,            size: 'md',            controller: [              '$scope', '$uibModalInstance', '$translate', function($scope, $uibModalInstance, $translate) {                $scope.app = app;                $scope.cancel = function() {                  $uibModalInstance.dismiss();                };                $scope.editApp = function(appMeta){                  $state.transitionTo('applications-edit', {appId: appMeta.id, appMeta: appMeta});                };                $scope.deleteApp = function(appMeta){                  var modalInstance = $uibModal.open({                    templateUrl: '/static/designsafe/apps/applications/html/application-delete.html',                    scope: $scope,                    size: 'sm',                    resolve: {                      appMeta: function(){                        return appMeta;                      },                      parentUibModalInstance: function(){                        return $uibModalInstance;                      },                      parentRefresh: function(){                        return $scope.refreshApps;                      },                      parentUuid: function(){                        return appMeta.uuid;                      }                    },                    controller: [                      '$scope', '$uibModalInstance', '$translate', 'appMeta', 'parentUibModalInstance', 'parentRefresh' , function($scope, $uibModalInstance, $translate, appMeta, parentUibModalInstance, parentRefresh) {                        $scope.parentUibModalInstance = parentUibModalInstance;                        $scope.parentRefresh = parentRefresh;                        $scope.cancel = function() {                          $uibModalInstance.dismiss();                        };                        $scope.deleteApp = function(){                            $scope.requesting = true;                            if (appMeta.type === 'agave'){                                Apps.deleteApp(appMeta.id)                              .then(                                function(response){                                  Apps.deleteMeta(appMeta.uuid)                                    .then(                                      function(response){                                          $scope.requesting = false;                                          $uibModalInstance.dismiss();                                          $scope.parentUibModalInstance.dismiss();                                          $scope.parentRefresh();                                      },                                      function(response){                                        $scope.requesting = false;                                        $scope.error = $translate.instant('error_app_delete');                                      }                                    );                                },                                function(response){                                  $scope.requesting = false;                                  $scope.error = $translate.instant('error_app_delete');                                }                              );                            } else {                              Apps.deleteMeta(appMeta.uuid)                                .then(                                  function(response){                                      $scope.requesting = false;                                      $uibModalInstance.dismiss();                                      $scope.parentUibModalInstance.dismiss();                                      $scope.parentRefresh();                                  },                                  function(response){                                    $scope.requesting = false;                                    $scope.error = $translate.instant('error_app_delete');                                  }                                );                            }                        }                      }]                  });                };                $scope.getMeta = function(){                  $scope.requesting = true;                  if (app.type === 'agave') {                    Apps.get(app.label)                      .then(                        function(response){                          $scope.appMeta = response.data;                          $scope.appMeta.type = 'agave';                          // TO-DO: Need check these with permissions                          var owner = response.data._links.owner.href.split('/').pop();                          if (owner === Django.user || owner === 'mock'){                            $scope.edit = true;                            $scope.delete = true;                          } else {                            $scope.edit = false;                            $scope.delete = false;                          }                          $scope.requesting = false;                        },                        function(){                          $scope.error = $translate.instant('error_app_meta');                          $scope.requesting = false;                        });                  } else {                    Apps.getMeta(app.label)                      .then(                        function(response){                          $scope.appMeta = response.data[0].value;                          $scope.appMeta.uuid = response.data[0].uuid;                          // TO-DO: Need check these with permissions                          var owner = response.data[0].owner;                          if (owner === Django.user){                            $scope.edit = true;                            $scope.delete = true;                          } else {                            $scope.edit = false;                            $scope.delete = false;                          }                          $scope.requesting = false;                        },                        function(){                          $scope.error = $translate.instant('error_app_meta');                          $scope.requesting = false;                        });                  }                };                $scope.getMeta();              }            ]          });      };    }]);})(window, angular, jQuery, _);