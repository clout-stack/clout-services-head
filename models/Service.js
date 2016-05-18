/**
 * Service Model
 */

var clout = require('clout-js'),
	Sequelize = clout.Sequelize,
	sequelize = clout.sequelize;

var Promise = require('promise'),
	debug = require('debug')('/models/Service'),
	request = require('request'),
	async = require('async');

if (!Sequelize) {
	return;
}

var definition = {
		name:  { type: Sequelize.STRING, allowNull: false },
		user_id:  { type: Sequelize.STRING, allowNull: false },
		projectDir:  { type: Sequelize.STRING, allowNull: false },
		containerId:  { type: Sequelize.STRING, allowNull: false },
		port:  { type: Sequelize.STRING, allowNull: false },
		publicKey:  { type: Sequelize.STRING, allowNull: false },
		privateKey:  { type: Sequelize.STRING, allowNull: false },
		status: { type: Sequelize.STRING, allowNull: false },
		hosts: {
			type: Sequelize.TEXT,
			allowNull: true,
			set: function (value) {
				this.setDataValue('hosts', JSON.stringify(value));
			},
			get: function () {
				var hosts = this.getDataValue('hosts');
				return !hosts ? [] : JSON.parse(hosts);
			}
		}
	},
	props = {
		instanceMethods: {
			isOnline: function isOnline(cb) {
				var self = this;
				return new Promise(function (resolve, reject) {
					!cb && (cb = function (err, data) {if (err) { return reject(err); } resolve(data); });
					var url = 'http://' + self.hosts[0] + ':' + self.port;
					request.get(url, function (err, response, body) {
						if (err) { return cb('Server Not Available'); }
						cb(null, null);
					});
				});
			}
		}
	},
	Service = sequelize.define('Service', definition, props);

module.exports = Service;