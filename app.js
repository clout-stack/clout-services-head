/**
 * Clout Auth Server
 */
var clout = require('clout-js'),
	debug = require('debug')('head:app'),
	partials = require('express-partials'),
	Nginx = require('nginx-o');

debug('appending partials to middleware');
clout.app.use(partials()); // partials

debug('appending nginx-io to middleware');
clout.nginx = new Nginx();
clout.app.use(function (req, res, next) {
	req.nginx = clout.nginx;
	next();
});

clout.on('started', function () {
	if (clout.server.https) {
		console.info('http server started on port %s', clout.server.https.address().port);
	}
	if (clout.server.http) {
		console.info('http server started on port %s', clout.server.http.address().port);
	}
	debug('appending socket-io');
	require('./lib/socket-io')(clout);
});

clout.start();
