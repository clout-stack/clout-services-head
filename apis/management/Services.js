/**
 * 
 */
var debug = require('debug')('/api/management/service'),
	async = require('async'),
	clout = require('clout-js'),
	_ = require('lodash');

module.exports = {
	get: {
		path: '/management/service',
		description: 'get services',
		method: 'get',
		params: {
			limit: ['limit', 'number', 'limit'],
			page: ['page', 'number', 'page']
		},
		// hooks: [ auth.isStaff() ],
		fn: function get(req, res) {
			var Service = req.models.Service,
				limit = req.query.limit || 250;
			if (limit > 250) {
				return res.badRequest('You cannot get more than 250 results');
			}
			async.waterfall([
				function getSubscribers(next) {
					Service.findAndCountAll({
						limit: limit,
						include: [req.models.Server]
					}).then(function (results) {
						next(null, results.count, results.rows);
					}, next);
				}
			], function (err, count, services) {
				if (err) {
					return res.error(err);
				}
				res.setHeader("X-Total-Count", count);
				res.ok(services);
			});
		}
	},
	getById: {
		path: '/management/service/:id',
		description: 'get service by id',
		method: 'get',
		// hooks: [ auth.isStaff() ],
		fn: function get(req, res) {
			var Service = req.models.Service;
			Service.findById(req.params.id).then(res.ok, res.badRequest);
		}
	},
	isOnline: {
		path: '/management/service/:id/isOnline',
		description: 'check service status',
		method: 'get',
		fn: function isOnline(req, res) {
			var Service = req.models.Service;
			Service.findById(req.params.id).then(function (service) {
				if (!service) { return res.badRequest(); }
				service.isOnline().then(function () {
					res.ok(true);
				}, function () {
					res.ok(false);
				});
			}, res.badRequest);
		}
	},
	add: {
		path: '/management/service',
		description: 'add service',
		method: 'put',
		params: {
		},
		// hooks: [ auth.isStaff(0) ],
		fn: function add(req, res) {
			var Service = req.models.Service,
				input = JSON.parse(JSON.stringify(req.query));
			_.merge(input, req.body);
			debug('add:', input);
			Service.create({
				name: input.name,
				host: input.host,
				port: input.port,
				lastSeen: new Date(),
			}).then(res.success, res.error);
		}
	},
	update: {
		path: '/management/service/:id',
		description: 'save service',
		method: 'post',
		params: {
		},
		// hooks: [ auth.isStaff(0) ],
		fn: function save(req, res) {
			var Service = req.models.Service,
				input = JSON.parse(JSON.stringify(req.query));
			_.merge(input, req.body);
			debug('save:', input);
			Service.findById(req.params.id).then(function (service) {
				input.lastSeen = new Date();
				['name', 'host', 'port', 'lastSeen'].forEach(function (k) {
					typeof input[k] !== 'undefined' && (service[k] = input[k]);
				});
				service.save().then(res.ok, res.error);
			}, res.error);
		}
	},
	delete: {
		path: '/management/service/:id',
		description: 'delete service',
		method: 'delete',
		// hooks: [ auth.isStaff() ],
		fn: function del(req, res) {
			var Service = req.models.Service;
			Service.findById(req.params.id).then(function (service) {
				if (!service) { return res.error('service not found'); }
				service.destroy().then(res.success, res.error);
			}, res.error);
		}
	}
}