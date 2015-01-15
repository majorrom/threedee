var users = require("./users.js");
var mysql = require("mysql");

var sqluser = "ThreeDee";
var sqlpass = "password";

exports.placeOrder = placeOrder;

function placeOrder(name, email, phone, item, cost, colour, priority, notes, custom, user, token, callback) {
	var pool = mysql.createPool({
	  connectionLimit : 10,
	  host     : 'localhost',
	  user     : sqluser,
	  password : 'superduperstrongpass',
	  database : 'threedee'
	});

	pool.getConnection(function(err, connection) {
		users.validateTokenSql(user, token, function(good) {
		if(good) {
			var date = new Date();
			users.findIDFromUser(user, function(id) {
			connection.query('INSERT INTO orders(user_id, person_name, person_phone, person_email, item, credits, colour, priority, notes, ts) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',[id, name, phone, email, item, cost, colour, priority, notes, date.getTime()], function(err, result) {
				if (err) throw err;
				var cust = JSON.parse(custom);
				console.log(cust.fields.length);
				var orderid = result.insertId;
				for(i = 0; i < cust.fields.length; i++) {
					connection.query('INSERT INTO CUST(order_id, name, value) VALUES (?,?,?)',[orderid, cust.fields[i].name, cust.fields[i].value], function(err, result) {
						if (err) throw err;
					});
				}
				callback(JSON.stringify({"success": true, "message": "Placed order"}));
			});
			connection.release();
			});
		} else {
			callback(JSON.stringify({"success": false, "message": "Bad token"}));
		}
	});
	});
}