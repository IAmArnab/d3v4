var app = angular.module("graphical", ['ngAnimate', 'ngRoute']);
app.config(['$qProvider', function ($qProvider) {
    $qProvider.errorOnUnhandledRejections(false);
}]);
