var express = require('express');;
var hbase = require('hbase');

var app = express();
app.set('view engine', 'ejs');
app.use('/static', express.static(__dirname + '/static'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));

var db = hbase({ host: '127.0.0.1', port: 8090 }).table('YouBike');

app.get('/', function(req, res) {
	res.render('home');
});

app.get('/names', function(req, res) {
	db.scan({ maxVersions: 1 }, function(err, rows) {
		var ret = [];
		for(var i = 0; i < rows.length; ++i) {
			if(rows[i].column.toString() != 'name:name') continue;
			ret.push({
				id: rows[i].key.toString(),
				name: rows[i].$.toString()
			});
		}
		res.send(ret);
	});
});

app.get('/query', function(req, res) {
	if(!req.query.id) {
		res.send({ status: 'error' });
		return;
	}
	db.row(req.query.id).get('data', { v: 2880 }, function(err, cells) {
		if(err) {
			res.send({ status: 'error' });
			return;
		}
		var ret = [];
		for(var i = 0; i < cells.length / 2; ++i) {
			ret.push({
				timestamp: cells[i].timestamp,
				avail: cells[i].$.toString(),
				total: cells[i + cells.length / 2].$.toString()
			});
		}
		res.send(ret);
	});
});

app.listen(8089, function() {
	console.log('started');
});