/* globals require, setTimeout, setInterval, console, __dirname */

/**
 * API: GET /contact - returns object GET /menu - returns array of objects, each
 * containing id, name, ingredients and price POST /order - post order in form
 * of array of object containing id (of the pizza) and quantity. Invalid id or
 * quantity <= 0 will return 500 error GET /order/:id - returns object with
 * order, ordered (time when order was processed) and estimated (time of
 * arrival)
 */
var express = require('express'), bodyParser = require('body-parser'), _ = require('lodash'), menu = require('./menu');

var app = express(), orders = {}, i = 0;

app.use(express.static(__dirname + '/../client/'));

app.use(bodyParser.urlencoded({
	extended : false
}));
app.use(bodyParser.text());
app.use(bodyParser.json());

app.get('/', function(req, res) {
	setTimeout(function() {
		res.sendFile(__dirname + '/../client/index.html');
	}, _.random(100, 1500));
});

app.get('/contact', function(req, res) {
	setTimeout(function() {
		res.json({
			name : 'Pizza',
            phone : '881239402',
			hours : 'caly dzien',
			address : {
				street : 'jasna 20',
				city : 'Wrocław'
			}
			
		});
	}, _.random(100, 1500));
});

app.get('/menu', function(req, res) {
	setTimeout(function() {
		res.json(menu);
	}, _.random(100, 1500));
});

/**
 * Checks if pizza in each position exists and its quantity is greater than 0
 * 
 * @param {object}
 *            order Requests body
 * @returns {boolean} Is order valid
 */
function checkIsOrderValid(order) {
 console.log('Order recived', order instanceof Array);
	var isArray = order instanceof Array, areItemsValid = _.every(order,
			function(position) {
        console.log('position',position);
				var isQuantityValid = _.isNumber(position.quantity)
						&& position.quantity > 0, isValidPizza = _
						.isNumber(position.id)
						&& !_.isEmpty(_.find(menu, {
							id : position.id
						}));

				return isQuantityValid && isValidPizza;
			});

	return isArray && areItemsValid;
}

app.post('/order', function(req, res) {
	setTimeout(function() {
		console.log('Order recived', req.body);
		if (checkIsOrderValid(req.body)) {
			var now = Date.now();
            console.log('jest');
			orders[i] = {
				order : req.body.map(function(position) {
					return {
						pizza : _.find(menu, {
							id : position.id
						}),
						quantity : position.quantity
					};
				}),
				ordered : new Date(now),
				estimated : new Date(now + _.random(15, 90))
			};
console.log('jest',orders[i]);
			res.json({
				id : i
			});
         console.log('jest');
			i++;
		} else {
            console.log('error');
			res.status(500).send('Invalid order.');
		}
	}, _.random(100, 1500));
});

app.get('/order/:id', function(req, res) {
	setTimeout(function() {
		if (orders[req.params.id] === undefined) {
			res.status(404).send('Order does not exist.');
		} else {
			res.json(orders[req.params.id]);
		}
	}, _.random(100, 1500));
});

setInterval(function() {
	_.forEach(orders, function(order, id) {
		if (order.ordered > new Date()) {
			delete orders[id];
		}
	});
}, 300);

var server = app.listen(8080, function() {
	console.log('Server running on port 8080.');
});
