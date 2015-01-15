var http = require('http');
var url = require('url');
var users = require('./users.js');
var orders = require('./orders.js');
var debug = require('./debug.js');

debug.doStuff();

function handleRequest(req, res, callback) {
	res.setHeader('Access-Control-Allow-Origin','*');
	res.writeHead(200, {"Content-Type": "application/json"});
	if (req.method == 'POST') {
		var body = '';
		req.on('data', function (data) {
			body += data;

			// Too much POST data, kill the connection!
			if (body.length > 1e6)
				req.connection.destroy();
		});
		req.on('end', function () {
			var post = qs.parse(body);
			callback(post);
		});
	} else {
		res.end(JSON.stringify({"success": false, "message": "Malformed request"}));
	}
}

var qs = require('querystring');
var url = require('url');
var server = http.createServer(function (req, res) {
	var urlparse = url.parse(req.url, true);
	//console.log(urlparse.pathname);
	if(urlparse.pathname == "/users/createaccount") {
		handleRequest(req, res, function(post) {
			if(post.user && post.pass) {
				users.createAccountSql(post.user, post.pass, function(result) {
					res.end(result);
				});
				//res.end(users.createAccount(post.user, post.pass));
			} else {
				res.end(JSON.stringify({"success": false, "message": "Malformed request"}));
			}
		});
	} else if(urlparse.pathname == "/users/login") {
		console.log('login request');
		handleRequest(req, res, function(post) {
			if(post.user && post.pass) {
				users.loginSql(post.user, post.pass, function(result) {
					res.end(result);
				});
			} else {
				res.end(JSON.stringify({"success": false, "message": "Malformed request"}));
			}
		});
	} else if(urlparse.pathname == "/users/getinfo") {
		console.log('login request');
		handleRequest(req, res, function(post) {
			if(post.user && post.token) {
				users.getInfo(post.user, post.token, function(result) {
					res.end(JSON.stringify(result));
				});
			} else {
				res.end(JSON.stringify({"success": false, "message": "Malformed request"}));
			}
		});
	} else if(urlparse.pathname == "/users/getcredits") {
		console.log('login request');
		handleRequest(req, res, function(post) {
			if(post.user && post.token) {
				users.getCredits(post.user, post.token, function(result) {
					res.end(JSON.stringify({"success": true, "credits": result}));
				});
			} else {
				res.end(JSON.stringify({"success": false, "message": "Malformed request"}));
			}
		});
	} else if(urlparse.pathname == "/users/updateinfo") {
		handleRequest(req, res, function(post) {
			console.log(post);
			if((post.name || post.email || post.phone) && post.user && post.token) {
				var togo = 3;
				if(post.name) {
					users.updateName(post.user, post.token, post.name, function(result) {
						togo-=1;
						console.log(result);
						if(togo==0) {
							res.end(JSON.stringify({"success": true, "message": "Updated info"}));
						}
					});
				} else {
					togo-=1;
				}
				if(post.email) {
					users.updateEmail(post.user, post.token, post.email, function(result) {
						togo-=1;
						console.log(result);
						if(togo==0) {
							res.end(JSON.stringify({"success": true, "message": "Updated info"}));
						}
					});
				} else {
					togo-=1;
				}
				if(post.phone) {
					users.updatePhone(post.user, post.token, post.phone, function(result) {
						togo-=1;
						console.log(result);
						if(togo==0) {
							res.end(JSON.stringify({"success": true, "message": "Updated info"}));
						}
					});
				} else {
					togo-=1;
				}
			} else {
				res.end(JSON.stringify({"success": false, "message": "Malformed request"}));
			}
		});
	} else if(urlparse.pathname == "/orders/placeorder") {
		console.log('order');
		handleRequest(req, res, function(post) {
			console.log(post);
			if(post.name && (post.email || post.phone) && post.item && post.cost && post.colour || post.notes && post.custom && post.user && post.token) {
				orders.placeOrder(post.name, post.email, post.phone, post.item, post.cost, post.colour, 0, post.notes, post.custom, post.user, post.token, function (result) {
					res.end(result);
				});
			} else {
				res.end(JSON.stringify({"success": false, "message": "Malformed request. Make sure you have an email or phone listed."}));
			}
		});
	} else if(urlparse.pathname == "/users/checktoken") {
		console.log('checking token');
		handleRequest(req, res, function(post) {
			if(post.user && post.token) {
				console.log(post.user);
				console.log(post.token);
				users.validateTokenSql(post.user, post.token, function(result) {
					res.end(result.toString());
				});
			} else {
				res.end(JSON.stringify({"success": false, "message": "Malformed request"}));
			}
		});
	}else {
		res.end(JSON.stringify({"success": false, "message": "Invalid endpoint"}));
	}
	/*} else {
		res.writeHead(404, {"Content-Type": "application/json"})
		res.end();
	}*/
});
var port = 4242;
server.listen(port);
console.log("listening on port " + port);