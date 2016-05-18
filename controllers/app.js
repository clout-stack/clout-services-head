/**
 * Application Home
 */
var path = require('path'),
	async = require('async');

var TEMPLATE_PATH = path.join(__dirname, '../views/layout');

module.exports = {
	path: '/',
	method: 'all',
	description: 'Homepage',
	fn: function (req, res, next) {
		var tpl = {
			layout: null,
			title: 'Clout Services App',
			css: ['/css/app.css'],
			javascript: ['/js/app.js']
		};
		res.render(TEMPLATE_PATH, tpl);
	}
}
