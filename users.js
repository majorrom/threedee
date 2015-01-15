var fs = require('fs');
var md5 = require('MD5');
var mysql = require('mysql');
var users;
var finalString;

var sqluser = "ThreeDee";
var sqlpass = "password";

exports.createAccountSql = createAccountSql;

function createAccountSql(usr, pass, callback) {
	var pool = mysql.createPool({
			connectionLimit : 2,
			host : 'localhost',
			user : sqluser,
			password : sqlpass,
			database : 'threedee'
		});

	pool.getConnection(function (err, connection) {
		connection.query('SELECT user_username FROM users WHERE user_username=' + connection.escape(usr), function (err, rows, fields) {
			if (err)
				throw err;
			if (rows.length > 0) {
				callback(JSON.stringify({
						"success" : false,
						"message" : "Username taken."
					}));
				return;
			} else {
				pool.getConnection(function (err, connection) {
					connection.query('INSERT INTO `users` (`user_username`, `user_pass`, credits) VALUES (' + connection.escape(usr) + "," + connection.escape(pass) + "," + connection.escape(0) + ")", function (err, rows, fields) {
						if (err)
							throw err;
						callback(JSON.stringify({
								"success" : true,
								"message" : "Sucessfully registered"
							}));
						return;
						console.log(usr + ' registered');
					});
					connection.release();
				});
			}
		});
		connection.release();
	});
}

function generateToken(usr, pass, credits, callback) {
	var part1 = md5(usr + pass + credits).substring(0, 7);
	var part2 = md5(credits).substring(7, 10);
	return part1 + part2;
}

exports.generateToken = generateToken;

exports.validateTokenSql = validateTokenSql;

function validateTokenSql(user, token, callback) {
	var pool = mysql.createPool({
			connectionLimit : 2,
			host : 'localhost',
			user : sqluser,
			password : sqlpass,
			database : 'threedee'
		});

	pool.getConnection(function (err, connection) {
		connection.query('SELECT * FROM users WHERE user_username=' + connection.escape(user), function (err, rows, fields) {
			if (err)
				throw err;
			if (rows.length > 0) {
				if (generateToken(user, rows[0].user_pass, +rows[0].credits) == token) {
					callback(JSON.stringify({"success": true}));
				} else {
					callback(JSON.stringify({"success": false}));
				}
			} else {
				callback(false);
			}
		});
		connection.release();
	});
}

exports.findUserWithID = findUserWithID;

function findUserWithID(id, callback) {
	var pool = mysql.createPool({
			connectionLimit : 2,
			host : 'localhost',
			user : sqluser,
			password : sqlpass,
			database : 'threedee'
		});

	pool.getConnection(function (err, connection) {
		connection.query('SELECT * FROM users WHERE user_id=' + connection.escape(id), function (err, rows, fields) {
			if (err)
				throw err;
			if (rows.length > 0) {
				callback(rows[0].user_username);
			} else {
				callback(false);
			}
		});
		connection.release();
	});
}

exports.findIDFromUser = findIDFromUser;

function findIDFromUser(user, callback) {
	var pool = mysql.createPool({
			connectionLimit : 2,
			host : 'localhost',
			user : sqluser,
			password : sqlpass,
			database : 'threedee'
		});

	pool.getConnection(function (err, connection) {
		connection.query('SELECT * FROM users WHERE user_username=' + connection.escape(user), function (err, rows, fields) {
			if (err)
				throw err;
			if (rows.length > 0) {
				callback(rows[0].user_id);
			} else {
				callback(false);
			}
		});
		connection.release();
	});
}

exports.loginSql = loginSql;

function loginSql(user, pass, callback) {
	var pool = mysql.createPool({
			connectionLimit : 2,
			host : 'localhost',
			user : sqluser,
			password : sqlpass,
			database : 'threedee'
		});

	pool.getConnection(function (err, connection) {
		connection.query('SELECT * FROM users WHERE user_username=' + connection.escape(user), function (err, rows, fields) {
			if (err)
				throw err;
			if (rows.length > 0) {
				if (rows[0].user_pass == pass) {
					console.log(user + " logged in");
					callback(JSON.stringify({
							"success" : true,
							message : "Sucessful login",
							token : generateToken(user, pass, +rows[0].credits),
							user : user
						}));
				} else {
					callback(JSON.stringify({
							"success" : false,
							message : "Incorrect username or password",
							token : "error"
						}));
				}
			} else {
				callback(JSON.stringify({
						"success" : false,
						message : "Incorrect username",
						token : "error"
					}));
			}
		});
		connection.release();
	});
}

exports.getCredits = getCredits;

function getCredits(user, token, callback) {
	var pool = mysql.createPool({
			connectionLimit : 2,
			host : 'localhost',
			user : sqluser,
			password : sqlpass,
			database : 'threedee'
		});

	pool.getConnection(function (err, connection) {
		validateTokenSql(user, token, function (good) {
			console.log(good);
			if (good) {
				connection.query('SELECT * FROM users WHERE user_username = ?', [user], function (err, rows, fields) {
					if (err)
						throw err;
					callback(rows[0].credits);
				});
				connection.release();
			}
		});
	});
}

exports.updateName = updateName;
exports.updateEmail = updateEmail;
exports.updatePhone = updatePhone;

function updateName(user, token, name, callback) {
	var pool = mysql.createPool({
			connectionLimit : 2,
			host : 'localhost',
			user : sqluser,
			password : sqlpass,
			database : 'threedee'
		});

	pool.getConnection(function (err, connection) {
		validateTokenSql(user, token, function (good) {
			if (good) {
				connection.query('UPDATE users SET realname=? WHERE user_username=?', [name, user], function (err, rows, fields) {
					if (err)
						throw err;
					callback(JSON.stringify({
							"success" : true,
							"message" : "Updated name"
						}));
				});
				connection.release();
			} else {
				callback(JSON.stringify({
						"success" : false,
						"message" : "Bad token"
					}));
			}
		});
	});
}
function updateEmail(user, token, email, callback) {
	var pool = mysql.createPool({
			connectionLimit : 2,
			host : 'localhost',
			user : sqluser,
			password : sqlpass,
			database : 'threedee'
		});

	pool.getConnection(function (err, connection) {
		validateTokenSql(user, token, function (good) {
			if (good) {
				connection.query('UPDATE users SET email=? WHERE user_username=?', [email, user], function (err, rows, fields) {
					if (err)
						throw err;
					callback(JSON.stringify({
							"success" : true,
							"message" : "Updated email"
						}));
				});
				connection.release();
			} else {
				callback(JSON.stringify({
						"success" : false,
						"message" : "Bad token"
					}));
			}
		});
	});
}

function updatePhone(user, token, phone, callback) {
	var pool = mysql.createPool({
			connectionLimit : 2,
			host : 'localhost',
			user : sqluser,
			password : sqlpass,
			database : 'threedee'
		});

	pool.getConnection(function (err, connection) {
		validateTokenSql(user, token, function (good) {
			if (good) {
				connection.query('UPDATE users SET phone=? WHERE user_username=?', [phone, user], function (err, rows, fields) {
					if (err)
						throw err;
					callback(JSON.stringify({
							"success" : true,
							"message" : "Updated phone number"
						}));
				});
				connection.release();
			} else {
				callback(JSON.stringify({
						"success" : false,
						"message" : "Bad token"
					}));
			}
		});
	});
}

exports.getInfo = getInfo;

function getInfo(user, token, callback) {
	var pool = mysql.createPool({
			connectionLimit : 2,
			host : 'localhost',
			user : sqluser,
			password : sqlpass,
			database : 'threedee'
		});

	pool.getConnection(function (err, connection) {
		validateTokenSql(user, token, function (good) {
			if (good) {
				connection.query('SELECT  * FROM users WHERE user_username=?', user, function (err, rows, fields) {
					if (err)
						throw err;
					callback({"success": true, "email": rows[0].email, "name": rows[0].realname, "phone": rows[0].phone});
				});
				connection.release();
			} else {
				callback(JSON.stringify({
						"success" : false,
						"message" : "Bad token"
					}));
			}
		});
	});
}

exports.getFull = getFull;

function getFull(user, callback) {
	var pool = mysql.createPool({
			connectionLimit : 2,
			host : 'localhost',
			user : sqluser,
			password : sqlpass,
			database : 'threedee'
		});

	pool.getConnection(function (err, connection) {
		connection.query('SELECT  * FROM users WHERE user_username=?', user, function (err, rows, fields) {
			if (err)
				throw err;
			if (rows[0].email && rows[0].realname && rows[0].phone) {
				callback(true);
			} else {
				callback(false);
			}
		});
		connection.release();
	});
}
