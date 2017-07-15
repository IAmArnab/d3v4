app.service('httpCallerService', ["$http", "$q", function($http, $q) {

    this.getValues = function (values) {
      var deferred = $q.defer();
      var config = {headers:  {
          'Content-Type': 'application/json',
          "required_fields" : values
        }
      };
      $http.get("/get_datas", config).then(function (response) {
        deferred.resolve(response.data);
      },
      function(error){
        deferred.reject(error);
      });
      return deferred.promise;
    };
    this.getValue = function (values) {
      var deferred = $q.defer();
      var config = {headers:  {
          'Content-Type': 'application/json',
          "required_field" : values
        }
      };
      $http.get("/get_data", config).then(function (response) {
        deferred.resolve(response.data);
      },
      function(error){
        deferred.reject(error);
      });
      return deferred.promise;
    };
}]);
