// var socket = io.connect();

// Initialize angular application
var app = angular.module('app', ['ngAnimate', 'datatables', 'ngRoute']);
// initlalize routes
var menuItems = {
	servers: { icon: 'fa fa-server', title: 'Servers', path: '/', templateUrl: '/partials/management/servers.html', controller: 'manageServers' },
	services: { icon: 'fa fa-cloud', title: 'Services', path: '/services', templateUrl: '/partials/management/services.html', controller: 'manageServices' },
};

// Initally load menu items
app.controller('sub-navbar', function ($scope, $location) {
	$scope.isActive = function isActive(path) {
		return path == $location.path();
	};

	$scope.menuItems = menuItems;
});

app.config(['$routeProvider', function ($routeProvider) {
	var menuItemsKeys = Object.keys(menuItems),
		rp = $routeProvider;
	for (var i = 0, l = menuItemsKeys.length; i < l; ++i) {
		var key = menuItemsKeys[i],
			item = menuItems[key];
		rp = rp.when(item.path, {
			templateUrl: item.templateUrl,
			controller: item.controller
		});
	}
	rp = rp.otherwise({ redirectTo: menuItems.servers.path });
}]);

app.factory('Services', function ($http) {
    return {
        list: function list() {
            return $http({
                method: 'GET',
                url: '/api/management/service'
            });
        }
    };
});

app.factory('Servers', function ($http) {
    return {
        list: function list() {
            return $http({
                method: 'GET',
                url: '/api/management/server'
            });
        },
        getById: function list(id) {
            return $http({
                method: 'GET',
                url: '/api/management/server/' + id
            });
        },
        add: function add(data) {
            return $http({
                method: 'PUT',
                url: '/api/management/server',
                data: data
            });
        },
        update: function update(id, data) {
            return $http({
                method: 'POST',
                url: '/api/management/server/' + id,
                data: data
            });
        },
        delete: function del(id) {
            return $http({
                method: 'DELETE',
                url: '/api/management/server/' + id
            });
        }
    };
});

app.controller('manageServers', function ($scope, $compile, DTOptionsBuilder, DTColumnBuilder, Servers) {
	function onError(data) {
		$scope.error = JSON.stringify(data);
	}
	function onSuccess(message) {
		return function (data) {
			data = data.data;
			if (!data.success) { return onError(data); }
			$scope.success = message;
			$("#serverModal").modal('hide');
			setTimeout(function () {
				location.reload();
			}, 600);
		}
	}
	$scope.error = null;
	$scope.success = null;
	$scope.showCase = {};
	$scope.showCase.dtColumns = [
		DTColumnBuilder.newColumn('name').withTitle('Name'),
		DTColumnBuilder.newColumn('host').withTitle('Host'),
		DTColumnBuilder.newColumn('port').withTitle('Port'),
	    DTColumnBuilder.newColumn('id').withTitle('Actions').renderWith(function (id) {
	    	var html = '';
	    	html += '<button ng-click="edit(\'' + id + '\')" style="margin: 2px;" class="btn btn-sm btn-success"><i class="fa fa-edit">&nbsp;</i> Edit</button>';
	    	html += '<button ng-click="delete(\'' + id + '\')" style="margin: 2px;" class="btn btn-sm btn-success"><i class="fa fa-times">&nbsp;</i> Delete</button>';
	    	return html;
	    }),
	];
	$scope.showCase.dtOptions = DTOptionsBuilder
	    .fromSource('/api/management/server')
	    .withDataProp('data')
	    .withPaginationType('full_numbers')
	    .withOption('createdRow', function(row) {
	        $compile(angular.element(row).contents())($scope);
	    });
	setTimeout(function () {
		if ($scope.hadAddButton) { return; } // prevent run twice
		var fcLeft = $('.dataTables_filter');
		fcLeft.append($compile('<a style="margin-left: 20px;" ng-click="add()" class="btn btn-sm btn-success"><i class="fa fa-plus"></i> Add</a>')($scope));
		$scope.hadAddButton = true;
	}, 0);

	$scope.add = function add() {
		$scope.error = null;
		$scope.success = null;
		$scope.server = {};
		$("#serverModal").modal('show');
	};

	$scope.edit = function edit(id) {
		$scope.error = null;
		$scope.success = null;
		Servers.getById(id).then(function (data) {
			data = data.data;
			if (!data.success) { return onError(data); }
			$scope.server = data.data;
			$("#serverModal").modal('show');
		});
	};

	$scope.save = function save(data) {
		$scope.error = null;
		$scope.success = null;
		if (data.id) {
			return Servers.update(data.id, data).then(onSuccess('Server Updated'), onError);
		}
		return Servers.add(data).then(onSuccess('Server Added'), onError);
	};

	$scope.delete = function del(id) {
		$scope.error = null;
		$scope.success = null;
		Servers.delete(id).then(onSuccess('Server Deleted'), onError);
	}
});


app.controller('manageServices', function ($scope, $compile, DTOptionsBuilder, DTColumnBuilder, Services) {
	function onError(data) {
		$scope.error = JSON.stringify(data);
	}
	function onSuccess(message) {
		return function (data) {
			data = data.data;
			if (!data.success) { return onError(data); }
			$scope.success = message;
			$("#serverModal").modal('hide');
			setTimeout(function () {
				location.reload();
			}, 600);
		}
	}
	$scope.error = null;
	$scope.success = null;
	$scope.showCase = {};
	$scope.showCase.dtColumns = [
		DTColumnBuilder.newColumn('name').withTitle('Application Name'),
		DTColumnBuilder.newColumn('user_id').withTitle('User ID'),
		// DTColumnBuilder.newColumn('containerId').withTitle('containerId'),
		DTColumnBuilder.newColumn('port').withTitle('Port'),
		DTColumnBuilder.newColumn('hosts').withTitle('Host'),
		DTColumnBuilder.newColumn('Server.name').withTitle('Server'),
		DTColumnBuilder.newColumn('status').withTitle('Status'),
	    DTColumnBuilder.newColumn(null).withTitle('Actions').renderWith(function (data) {
	    	var html = '';
	    	html += '<a href="http://' + data.hosts + ':' + data.port + '/">View</a>';
	    	return html;
	    }),
	];
	$scope.showCase.dtOptions = DTOptionsBuilder
	    .fromSource('/api/management/service')
	    .withDataProp('data')
	    .withPaginationType('full_numbers')
	    .withOption('createdRow', function(row) {
	        $compile(angular.element(row).contents())($scope);
	    });
});
