/**
 * Socket.io library
 */
var debug = require('debug')('clout:socket-io');

module.exports = function (clout) {
	debug('initializing socket.io');
	clout.io = require('socket.io')(clout.server.http);

	// clout.io.configure(function() {
	// 	clout.io.set('store', new sio.RedisStore({
	// 		redisClient: client,
	// 		redisPub: client,
	// 		redisSub: client
	// 	}));
	// 	clout.io.enable('browser client minification');
	// 	clout.io.enable('browser client gzip');
	// });

	// append socket middleware
	clout.io.use(function (socket, next) {
		next();
	});

	// authentication
	clout.io.set('authorization', function (socket, next) {

	});

	// on user connection
	clout.io.on('connection', function (socket) {
		debug('socket', 'connection');

		socket.on('disconnect', function () {
			debug('socket', 'disconnect');
		});

	});
}
