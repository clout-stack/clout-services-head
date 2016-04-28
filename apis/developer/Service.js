/**
 * 
 */
var debug = require('debug')('/api/dev/services'),
	async = require('async'),
	request = require('request'),
	fs = require('fs-extra'),
	multiparty = require('multiparty'),
	clout = require('clout-js');

module.exports = {
	list: {
		path: '/dev/:userid/service',
		description: 'list services',
		method: 'get',
		params: {
			limit: ['limit', 'number', 'limit'],
			page: ['page', 'number', 'page']
		},
		// hooks: [ auth.isLoggedIn() ],
		fn: function get(req, res) {
			var Service = req.models.Service,
				limit = req.query.limit || 250;
			if (limit > 250) {
				return res.badRequest('You cannot get more than 250 results');
			}
			async.waterfall([
				function getSubscribers(next) {
					Service.findAndCountAll({
						where: {
							user_id: req.params.userid
						},
						limit: limit,
						include: [ req.models.Server ]
					}).then(function (results) {
						next(null, results.count, results.rows);
					}, next);
				}
			], function (err, count, servers) {
				if (err) {
					return res.error(err);
				}
				res.setHeader("X-Total-Count", count);
				res.ok(servers);
			});
		}
	},
	publish: {
		path: '/dev/:userid/service',
		description: 'publish service',
		method: 'put',
		params: {
		},
		// hooks: [ auth.isLoggedIn() ],
		fn: function add(req, res) {
			async.waterfall([
				function (next) {
					var form = new multiparty.Form();
					form.parse(req, function(err, fields, files) {
						if (err) { return next({ error: err, code: 'INVALID_REQUEST'}); }
						var archivePath = files.archive[0].path;
						// console.log(files);
						return next(null, archivePath, req.query.application);
					});
				},
				function selectServer(archivePath, application, next) {
					var server = {
						// host: '192.168.100.23',
						host: '192.168.100.23',
						port: '8082'
					};
					next(null, archivePath, application, server);
				},
				function deploy(archivePath, application, server, next) {
					typeof application === 'string' && (application = JSON.parse(application));
					var size = fs.statSync(archivePath).size,
						uri = 'http://' + server.host + ':' + server.port + '/api/dev/' + req.params.userid + '/service?application=' + JSON.stringify(application);
					debug('application:', application);
					debug('archivePath:', archivePath);
					debug('size:', size);
					debug('uploading...');
					debug(uri);
					request({
						method: 'PUT',
						uri: uri,
					    preambleCRLF: true,
					    postambleCRLF: true,
						multipart: [
							{ 
						        'Content-Disposition' : 'name="archive"; filename="archive.zip"',
						        'Content-Type' : 'application/octet-stream',
						        // 'Content-Length': size,
						        body: fs.createReadStream(archivePath)
						    }
						],
						headers: {
							'User-Agent': 'cloutCLI',
							// 'Content-Length': size
						},
						json: true,
						alive: true
					}, function (err, resp, body) {
						if (err) { return next(err); }
						if (!body || !body.success) {
							return next(body.data || body);
						}
						debug('service:', body.data);
						next(null, archivePath, application, server, body.data);
					});
				},
				function createHosts(archivePath, application, server, service, next) {
					var name = req.params.userid + '-' + application.name,
						cname = name + '.clout.local',
						port = 8090;
					function run() {
						req.nginx.create({
						    id: name,
						    template: 'default',
						    values: {
								port: port,
								cname: cname,
								proxy_pass: 'http://' + server.host + ':' + service.port
						    }
						})
						.then(req.nginx.reload) // reload nginx
						.then(function (response) {
							service.host = cname;
							service.port = port;
						    next(null, archivePath, application, server, service);
						})
						.catch(function (err) {
						    console.log('createHosts: ' + err);
							next(null, archivePath, application, server, service);
						});
					}
					req.nginx.delete(name).then(function () {
						run();
					}, function () {
						run();
					});
				}
			], function (err, archivePath, application, server, service) {
				// cleanup
				(function (archivePath) {
					var path = archivePath + '';
					setTimeout(function () {
						debug('deleting:', path);
						fs.existsSync(path) && fs.removeSync(path);
					}, 1000);
				})(archivePath);
				if (err) { console.error('error:', err); return res.error(err); }
				res.ok(service);
			});
		}
	},
	unpublish: {
		path: '/dev/:userid/service/:name',
		description: 'unpublish service',
		method: 'delete',
		// hooks: [ auth.isLoggedIn() ],
		fn: function del(req, res) {
			var Service = req.models.Service;
			Service.find({
				where: {
					user_id: req.params.userid,
					name: req.params.name
				},
				include: [ req.models.Server ]
			}).then(function (service) {
				res.ok(service);
			}, res.error);
		}
	}
}