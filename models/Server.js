/**
 * Server Model
 */

var clout = require('clout-js'),
	Sequelize = clout.Sequelize,
	sequelize = clout.sequelize;

var Promise = require('promise'),
	debug = require('debug')('/models/Server'),
	async = require('async'),
	request = require('request');

if (!Sequelize) {
	return;
}

var definition = {
		name: { type: Sequelize.STRING, allowNull: false },
		host: { type: Sequelize.STRING, allowNull: false },
		port: { type: Sequelize.STRING, allowNull: false },
		lastSeen: { type: Sequelize.DATE, allowNull: false },
	},
	props = {
		instanceMethods: {
			isOnline: function isOnline(cb) {
				var self = this;
				return new Promise(function (resolve, reject) {
					!cb && (cb = function (err, data) {if (err) { return reject(err); } resolve(data); });
					request.get('http://' + self.host + ':' + self.port, function (err, response, body) {
						if (err) { return cb('Server Not Available'); }
						cb(null, null);
					});
				});
			}
		}
	},
	Server = sequelize.define('Server', definition, props);

require('./Service').belongsTo(Server,	{ foreignKey: 'serverId' });

module.exports = Server;
