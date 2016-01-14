var pizzeria = angular.module('pizzeria', ['ngRoute','ngMap']);

pizzeria.config([ '$routeProvider', function($routeProvider) {
	$routeProvider.when('/main', {
		templateUrl : 'html/main.html',
		controller : 'ControllerMain'
	}).when('/contact', {
		templateUrl : 'html/contact.html',
		controller : 'ControllerContact'
	}).when('/order', {
		templateUrl : 'html/order.html',
		controller : 'ControllerOrder'
	}).when('/status/:id', {
		templateUrl : 'html/status.html',
		controller : 'ControllerStatus'
	}).when('/', {
		templateUrl : 'html/main.html',
		controller : 'ControllerMain'
	}).otherwise({
		redirectTo : '/'
	});
} ]);

pizzeria.factory('orders', function() {
	var orders = [];
	return orders;
});

pizzeria.controller('ControllerMain',
		function($scope, $http, orders, $location) {

			$scope.orders = orders;
			$scope.basketImage = "images/basket.png";
			$scope.deleteImage = "images/delete.png";
			$scope.dollar = "images/dollar.png";
			$scope.total = function() {
				var total = 0;
				for (var i = 0; i < $scope.orders.length; i++) {
					var price = $scope.orders[i].price;
					total += price;
				}
				return total;
			};
			$scope.getMenu = function() {
				$http.get('/menu').success(function(response) {
					$scope.response = response;
				});

			};
            $scope.deleteFromBasket = function(order) {
				var index = 0;

				for (var i = 0; i < $scope.orders.length; i++)
					if (basket.name === $scope.orders[i].name)
						index = i;
				$scope.orders.splice(index, 1);
			};
			$scope.addToBasket = function(pizza) {
				var basket = {};
				basket.name = pizza.name;
				var quantity;
				if (typeof pizza.quantity === 'undefined') {
					quantity = 1;
				} else {
					quantity = pizza.quantity;
				}
				basket.quantity = quantity;
                basket.quantity = parseFloat(quantity);
				basket.price = parseFloat(pizza.price * basket.quantity);
                basket.id = pizza.id;

				if (basket.price > 0) {
					$scope.orders.push(basket);
				}

			};
			$scope.confirm = function() {
				$location.path("/order");
			};
		});

pizzeria.controller('ControllerStatus', function($scope, $http, $routeParams) {
     $scope.orderId = $routeParams.id;
    
	$scope.processStatus = function() {
		$http.get('/order/' + $scope.orderId).success(function(response) {
			$scope.response = response;
		});
	};
});

pizzeria.controller('ControllerOrder', function($scope, $http, orders, $location) {

	$scope.orders = orders;

     $scope.sendOrder = function () {
          $http({
              method  : 'POST',
              url     : '/order',
              data    : $scope.orders, 
              headers : {'Content-Type': 'application/json'} 
             }).success(function (data, status) {
                   $location.path('/status/'+data.id);
                }).error(function (data, status) {
                    $scope.orderId = 'Request failed';
                    $scope.orderStatus = status;
                });         
        };
});

pizzeria.controller('ControllerContact', function($scope, $http) {

	$scope.processContact = function() {
		$http.get('/contact').success(function(response) {
			$scope.response = response;
		});
	};
});