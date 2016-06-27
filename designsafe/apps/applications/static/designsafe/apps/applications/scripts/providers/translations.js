(function(angular) {
    "use strict";
    angular.module('ApplicationsApp').config(['$translateProvider', function($translateProvider) {
        $translateProvider.translations('en', {
            error_tab_get: "An error ocurred getting your app tray",
            error_tab_add: "An error ocurred adding your tray",
            error_tab_delete: "An error ocurred deleting your tray",
            error_tab_edit: "An error ocurred editing your app tray",
            error_form_invalid: "Form is invalid. Please check all required fields",
            error_form_codemirror: "JSON parsing error. Make sure your form has valid JSON",
            error_app_create: "An error ocurred creating your app",
            error_app_delete: "An error ocurred deleting your app",
            error_app_meta: "An error ocurred getting the app",
            error_app_exists: "An app with this name and version already exists. Please change name or version",
            storage_default: "designsafe.storage.default",
            execution_default: "designsafe.community.exec.stampede"
        });
        $translateProvider.preferredLanguage('en');
    }]);
})(angular);
