(function(window, angular, $, _) {
  "use strict";
  angular.module('ApplicationsApp').factory('SimpleList', ['$http', '$q', 'djangoUrl', function($http, $q, djangoUrl) {

    var SimpleList = function(){
      this.selected = null,
      this.lists = {}
    };

    SimpleList.prototype.deleteList = function(query, tab){
      var self = this;
      var deferred = $q.defer();
      $http({
        url: djangoUrl.reverse('designsafe_applications:call_api', ['meta']),
        method: 'GET',
        params: {'q': query}
      }).then(
        function(response){
          var metadata = {};
          if (response.data.length > 0){
            $http({
              url: djangoUrl.reverse('designsafe_applications:call_api', ['meta']),
              method: 'DELETE',
              params: {'uuid': response.data[0].uuid},
            }).then(
              function(resp){
                deferred.resolve(self);
              },
              function(error){
                deferred.reject();
              });
          }
        },
        function(apps){
          deferred.reject();
        });

      return deferred.promise;
    };

    SimpleList.prototype.saveList = function(query, tab, list) {
      var self = this;
      var deferred = $q.defer();
      $http({
        url: djangoUrl.reverse('designsafe_workspace:call_api', ['meta']),
        method: 'GET',
        params: {'q': query}
      }).then(
        function(response){
          var metadata = {};
          if (response.data.length === 0){
            // create metadata
            metadata.name = 'ds_app_list';
            metadata.value = {};
            metadata.value.label = list.listName;
            metadata.value.type = 'apps-list';
            metadata.value.apps = [];
            angular.forEach(list.items, function(app){
              metadata.value.apps.push({id: app.label, type: app.type});
            });
          } else {
            // update metadata
            metadata.uuid = response.data[0].uuid;
            metadata.name = 'ds_app_list';
            metadata.value = {};
            metadata.value.label = list.listName;
            metadata.value.type = 'apps-list';
            metadata.value.apps = [];
            angular.forEach(list.items, function(app){
              metadata.value.apps.push({id: app.label, type: app.type});
            });
          }
          $http({
            url: djangoUrl.reverse('designsafe_workspace:call_api', ['meta']),
            method: 'POST',
            data: metadata
          }).then(
            function(resp){
              var simpleList = tab;
              simpleList.content.selected = null;
              // simpleList.content.lists = {};
              // simpleList.content.lists[list.listName] = [];
              simpleList.content = [];
              angular.forEach(tab.multiple.lists[1].items, function(item){
                simpleList.content.push({label: item.label, type: item.type})
              });
              simpleList.title = list.listName;
              simpleList.edit = false;
              deferred.resolve(self);
            },
            function(apps){
              deferred.reject();
            }
          )
        },
        function(apps){
          deferred.reject();
        });
      return deferred.promise;
    };

    SimpleList.prototype.getDefaultLists = function(query) {
      var self = this;
      var deferred = $q.defer();
      $http({
        url: djangoUrl.reverse('designsafe_applications:call_api', ['meta']),
        method: 'GET',
        params: {'q': query}
      }).then(
        function(response){
          // default tabs
          self.lists['Private'] = [];
          self.lists['Public'] = [];

          angular.forEach(response.data, function(appMeta){

            if (appMeta.value.isPublic){
              self.lists['Public'].push({
                label: appMeta.value.id,
                type: appMeta.value.type
              });
            } else {
              self.lists['Private'].push({
                label: appMeta.value.id,
                type: appMeta.value.type
              });
            }
          });

          deferred.resolve(self);
        },
        function(apps){
          deferred.reject();
        }
      )
      return deferred.promise;
    };

    return SimpleList;
  }]);

})(window, angular, jQuery, _);
