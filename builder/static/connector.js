var connectorApp = angular.module('connectorApp', []);

connectorApp.controller('Connector', ['$scope', '$http',
	function($scope, $http) {
		$scope.imageSize = 'cover';
		$http.get('/api/edges', {
			'responseType': 'json'
		})
			.success(function(data,status) {
				$scope.edges = data.edges;
			})

		$scope.makePair = function(b) {
			$http.post('/api/pair', {
				a: $scope.first.id,
				b: b
			}).success(function(d){
				$scope.status=d;
			}).error(function(d,err){
				$scope.status=d.status;
			})
		}

		$scope.postImage = function(id,url) {
			$scope.show.image = url;
			$scope.show.image_size = $scope.imageSize;
			$http.post('/api/add_image', {
				id:id,
				url:url,
				size: $scope.show.image_size
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

		$scope.toggleImageSize = function(){
			$scope.imageSize = $scope.imageSize != 'cover' ? 'cover' : 'contain';
		}

	}
]).filter('cut', function () {
    return function (value, max, wordwise,tail) {
        if (!value) return '';
        max = parseInt(max, 10);
        if (!max) return value;
        if (value.length <= max) return value;

        value = value.substr(0, max);
        if (wordwise) {
            var lastspace = value.lastIndexOf('. ');
            if (lastspace != -1) {
                value = value.substr(0, lastspace);
            }
        }

        return value + (wordwise ? '.' : (tail ||' ...'));
    };
});