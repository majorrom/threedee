var users = require('./users.js');
var orders = require('./orders.js');

exports.doStuff = function() {
	users.loginSql('majorrom', 'passw0rd', function(result) {
		var login = JSON.parse(result);
		/*orders.placeOrder('Ryan P', null, '4264485', 1, 30, 'Red', false, 'this is swag', {fields:[{name:"eyes", value: "true"},{name:"size", value: "large"}]}, login.user, login.token, function(result) {
			console.log(result);
		});*/
		users.getCredits('majorrom', login.token, function(creds) {
			console.log(creds);
		});
	});
}