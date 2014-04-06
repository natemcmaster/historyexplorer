function SearchCtrl($scope, GraphData) {
    var maxResults = 5;
    var bloodhound;

    $scope.matches = [];

    GraphData.on('load', function(event) {
        bloodhound = new Bloodhound({
            limit: maxResults,
            local: GraphData.nodes(),
            datumTokenizer: function(d) {
                return Bloodhound.tokenizers.whitespace(d.title);
            },
            queryTokenizer: Bloodhound.tokenizers.whitespace
        });
        bloodhound.initialize()
        .done(function(){
            $scope.ready=true;
        });
    })

    $scope.$watch('searchQuery',function(query){
        if(!$scope.ready)
            return;
        bloodhound.get(query,function(suggestions){
            $scope.matches = suggestions;
        });
    })

    GraphData.on('select.node', function(event, id, node, links) {
        $scope.matches = [];
        $scope.$apply();
    });

    $scope.clear = function(){
        $scope.matches=[]
        $scope.searchQuery='';
    }

    $scope.goTo = function(id) {
        $scope.clear();
        GraphData.emit('select.node', id);
    }

    $scope.searchKey = function(){
        debugger;
    }
}