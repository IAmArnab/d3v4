app.controller("homeController", function($scope, $location, httpCallerService) {
  $scope.graphView = "template/radial_tree_template.html";
  $scope.is3D = false;
  var getValues = function(require_columns) {
    httpCallerService.getValues(require_columns)
      .then(function(result) {
          var graphData = result;
        },
        function(error) {
          console.log("Can't get columns list");
        });
  };

  $('.nav-tabs li').click(function() {
    $(this).siblings("li").removeClass('active');
    $(this).addClass('active');
  });
  $('.nav-pills li').click(function() {
    $(this).siblings("li").removeClass('active');
    $(this).addClass('active');
  });
});
