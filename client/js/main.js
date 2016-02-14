var pizzeria = angular.module('pizzeria', ['ngRoute','ngMap','ngDialog']);

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
		function($scope, $http, orders, $location,ngDialog) {
    
        $scope.extraIngredients = [];
        $scope.extraCost = 0;
        $scope.lastAddedPosition = {};
		$scope.orders = orders;
		$scope.basketImage = "images/basket.png";
		$scope.deleteImage = "images/delete.png";
		$scope.dollar = "images/dollar.png";
        $scope.extraIngredients = [];
		$scope.total = function() {
            var total=0;
                for (var i = 0; i < $scope.orders.length; i++) {
					var price = $scope.orders[i].price;
					total += price;
				}
				return total;
        };
		$scope.getMenu = function() {
		        $http.get('/menu').success(function(response) {
					$scope.response = response;
				}).then(function(data) {
                $scope.menuRes = data.data;
                var len = $scope.menuRes.length;
                for (var i=0; i<len; i++) {
                    pizza = $scope.menuRes[i];
                    pizza.ingredientsNumber = pizza.ingredients.length;
                }
                    
                $scope.groupBy('ingredientsNumber');
                });
        };
    
        $scope.getPizzaIngredient = function() { 
            $http.get('/ingredients').success(function(response) {
					$scope.ingredients = response;
            });
        }
     
        $scope.addPizzaIngredient = function (ingredient) {
            $scope.extraCost += ingredient.price;
            $scope.extraIngredients.push(ingredient);
            $scope.lastAddedPosition.price += ingredient.price;
        };
    
        $scope.deletePizzaIngredient = function (ingredient) {
            var ingredients = $scope.lastAddedPosition.ingredients;
            var index = ingredients.indexOf(ingredient);
            ingredients.splice(index, 1);
        };
    
        $scope.deletePizzaExtraIngredient = function (ingredient) {
            var index = $scope.extraIngredients.indexOf(ingredient);
            ingredient.price = -Math.abs(ingredient.price);
            $scope.lastAddedPosition.price += ingredient.price;
            $scope.extraIngredients.splice(index, 1);
            ingredient.price = Math.abs(ingredient.price);
        };
     
        $scope.openIngredientPopup = function () {
            var dialog = ngDialog.open({ 
                template: 'html/ingredientPopup.html',
                scope: $scope
            });
            
            dialog.closePromise.then( function () {
                index = $scope.currentIndex-1;
                $scope.orders[index].extraIngredients = $scope.extraIngredients;
                $scope.extraIngredients = [];
            });
        };
    
    
        $scope.groupBy = function(attribute) {
                $scope.groups = [];        
                $scope.menuRes.sort(
                    function(a, b) {
                        if ( a[attribute] <= b[attribute] ) {
                            return(-1);
                        }
                            return(1);
                    }
                );
                var groupValue = "_INVALID_GROUP_VALUE_";
                for (var i=0; i<$scope.menuRes.length; i++) {
                    var pizza = $scope.menuRes[i];
                    if (pizza[attribute] !== groupValue ) {
                        var group = {
                            label: pizza[attribute],
                            pizzas: []
                        };
                        groupValue = group.label;
                        $scope.groups.push(group);
                    }
                    group.pizzas.push(pizza);
                }
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
                basket.ingredients = pizza.ingredients;
                $scope.lastAddedPosition = basket;
				if (basket.price > 0) {
					$scope.orders.push(basket);
				}
                $scope.openIngredientPopup();
        };
    
        $scope.confirm = function() {
				$location.path("/order");
        };
});

pizzeria.controller('ControllerStatus', function($scope, $http, $routeParams) {
     $scope.orderId = $routeParams.id;
    try{
         var i = $scope.orders.length - 1;
        $scope.orderedExtras = $scope.orders[i].extras;
    } catch(e){
    $scope.orderedExtras = [];
    }
     $scope.total = $scope.total();
    
     $scope.processStatus = function() {
		$http.get('/order/' + $scope.orderId).success(function(response) {
			$scope.response = response;
		}).then(function(data) {
            
            var index = $scope.orders.length - 1;
            var length = $scope.orders[index].extras.length;
            for (var i=0; i<length; i++) {
                var extra = $scope.orders[index].extras[i];
                 $scope.total += extra.price;
            }
		});
	};
    

    var connection = new WebSocket('ws://localhost:8080', 'request');

    connection.onopen =  function (event) {
        var time = new Date();

        var msg = {
                    type: "Data:",
                    date: Date.now()
        };
        connection.send(JSON.stringify(msg)); 


    };

    connection.addEventListener("message", function(e) {
        document.getElementById('socket').innerHTML += e.data+'<br>';
    });
       

    connection.onmessage = function (message) {
        try {
            var json = JSON.parse(message.data);
        } catch (e) {
            console.log('error: ', message.data);
            return;
        }
    };
    
    
    
});

pizzeria.controller('ControllerOrder', function($scope, $http, orders,ngDialog,$location) {
    $scope.orderedExtras = [];
	$scope.orders = orders;
    $scope.total = $scope.total();

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
    
    $scope.openExtraPopup = function () {
            var dialog = ngDialog.open({ 
                template: 'html/extraPopup.html',
                scope: $scope
            });
            
            dialog.closePromise.then( function () {
                $scope.addPizzaExtraToOrders();
            });
    };
    
    $scope.getPizzaExtra = function() { 
            $http.get('/extras').success(function(response) {
					$scope.ingredients = response;
            }).then(function(data) {
           $scope.extras = data.data;
        });
    }
     
    $scope.addPizzaExtraToOrders = function () {
            var index = $scope.orders.length - 1;
            $scope.orders[index].extras = $scope.orderedExtras;
    };
    
    $scope.addPizzaExtra = function (extra) {
            $scope.orderedExtras.push(extra);
            $scope.total += extra.price;
    };
    
    $scope.deletePizzaExtra = function (extra) {
            $scope.total -= extra.price;
            var index = $scope.orderedExtras.indexOf(extra);
            $scope.orderedExtras.splice(index, 1);
    };
});

pizzeria.controller('ControllerContact', function($scope, $http) {

	$scope.processContact = function() {
		$http.get('/contact').success(function(response) {
			$scope.response = response;
		}).error(function (data, status) {
                    console.log(status);
                
                });
	};
});