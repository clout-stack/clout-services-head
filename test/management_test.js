/**
 * Management test
 */
const should = require('should'),
	request = require('request');

describe('management test', function () {
	var clout = null,
		url = 'http://',
		test_server = {
			id: null,
			name: 'test server',
			host: '192.168.10.110',
			port: '8082'
		},
		to_update = {
			name: 'test server 2'
		};

	/**
	 * start service and get port
	 */
	before(function (done) {
		require('..'); // start service
		clout = require('clout-js');
		// get port
		clout.once('started', function () {
			var address = clout.server.http.address();
			url += '127.0.0.1:' + address.port;
			setTimeout(done);
		});
	});

	/**
	 * CRUD test
	 */
	it('create', function (done) {
		var uri = url + '/api/management/server';
		request({
			uri: uri,
			method: 'PUT',
			body: test_server,
			json: true
		}, function (err, req, body) {
			should.not.exist(err);
			should.exist(body);
			should(body).be.a.Object();
			body.success.should.be.eql(true, body.success);
			test_server.id = body.data.id;
			done();
		});
	});

	it('read', function (done) {
		var uri = url + '/api/management/server';
		request({
			uri: uri,
			method: 'GET',
			json: true
		}, function (err, req, body) {
			should.not.exist(err);
			should.exist(body);
			should(body).be.a.Object();
			body.success.should.be.eql(true, body.success);
			done();
		});
	});

	it('update', function (done) {
		var uri = url + '/api/management/server/' + test_server.id;
		request({
			uri: uri,
			method: 'POST',
			body: to_update,
			json: true
		}, function (err, req, body) {
			should.not.exist(err);
			should.exist(body);
			should(body).be.a.Object();
			body.success.should.be.eql(true, body.success);
			body.success.should.be.eql(to_update.name === body.data.name, true);
			done();
		});
	});

	it('delete', function (done) {
		var uri = url + '/api/management/server/' + test_server.id;
		request({
			uri: uri,
			method: 'DELETE',
			json: true
		}, function (err, req, body) {
			should.not.exist(err);
			should.exist(body);
			should(body).be.a.Object();
			body.success.should.be.eql(true, body.success);
			done();
		});
	});
});