app.config(
  function($routeProvider){
    $routeProvider
      .when("/home",{
        templateUrl: "template/home_template.html",
        controller: "homeController"
      })
      .otherwise({
        redirectTo: "/home"
      })
  }
)
