var connectorApp = angular.module('connectorApp', []);

connectorApp.controller('Connector', ['$scope', '$http',
	function($scope, $http) {

		$http.get('/api/edges', {
			'responseType': 'json'
		})
			.success(function(data,status) {
				$scope.edges = data.edges;
			})

		$scope.makePair = function(b) {
			$http.post('/api/pair', {
				a: $scope.first,
				b: b
			}).success(function(d){
				$scope.status=d;
			}).error(function(d,err){
				$scope.status=d.status;
			})
		}

		$scope.postImage = function(id,url) {
			$scope.show.image = url;
			$http.post('/api/add_image', {
				id:id,
				url:url
			}).success(function(d){
				$scope.status=d;
			}).error(function(d,err){
				$scope.status=d.status;
			})
		}

		$scope.needsReview = function(id) {
			$http.post('/api/review', {
				id:id
			}).success(function(d){
				$scope.status=d;
			}).error(function(d,err){
				$scope.status=d.status;
			})
		}

	}
]);