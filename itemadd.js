var fs = require('fs');
var mysql = require("mysql");

var file = "octo.txt";

fs.readFile(file, function (err, data) {
	if (err) throw err;
	//console.log(data);
	var str = data.toString('utf8');
	//console.log(str);
	var item = JSON.parse(str);
	//console.log(item);
	insertitem(item, function(id) {
		for (i = 0; i < item["colours"].length; i++) {
			addColours(id, i, item, function(){});
		}
	});
});

function insertitem(json, callback) {
	var pool = mysql.createPool({
	  connectionLimit : 2,
	  host     : 'localhost',
	  user     : 'viralprogram',
	  password : 'superduperstrongpass',
	  database : 'threedee'
	});
	pool.getConnection(function(err, connection) {
		connection.query('INSERT INTO `items` (`item_name`, `item_desc`, item_basecost, item_picurl) VALUES (?, ?, ?, ?)', [json.name, json.description, json.basecost, json.pic], function(err, result) {
			if (err) throw err;
			callback(result.insertId);
			console.log('Item inserted');
		});
		connection.release();
	});
}

function addColours(id, i, json, callback) {
	var pool = mysql.createPool({
	  connectionLimit : 15,
	  host     : 'localhost',
	  user     : 'viralprogram',
	  password : 'superduperstrongpass',
	  database : 'threedee'
	});
	//console.log(json["colours"][i]);
	console.log(json["colours"][i].colour);
	pool.getConnection(function(err, connection) {
	connection.query('INSERT INTO colours (item_id, colour, pricemodifier) VALUES (?, ?, ?)', [id, json["colours"][i].colour, json["colours"][i].mod], function(err, result) {
		if (err) throw err;
		console.log('Colour inserted');
	});
	connection.release();
	});
}