function GraphData($rootScope,$http,$location) {
    $http.get('/data.json', {
        'responseType': 'json'
    })
        .success(function (graph, error) {
            this.data = graph;
            this.emit('select.node', '341');
        }.bind(this));
    this.events = {};
    this.data = {nodes:{},links:{}};
    this.$location = $location;
    $rootScope.$on('$locationChangeSuccess',function(){
        var id = this.$location.search().id;
        if(id && this.node(id) && this.selected !== id)
            this.emit('select.node',id,true);
    }.bind(this));
}
   

GraphData.prototype.node = function (id) {
    return this.data.nodes[id];
}

GraphData.prototype.links = function (id) {
    return this.data.links[id];
}

GraphData.prototype.emit = function (event) {
    var args = Array.prototype.slice.call(arguments, 1);
    if (event == 'select.node') {
        if(!args[0])
            return;
        args = [args[0], this.node(args[0]), this.links(args[0])];
        this.selected = args[0];
        this.$location.search('id',args[0]);
    }
    if (!this.events[event])
        return;
    this.events[event].forEach(function (cb) {
        cb.apply(null,[event].concat(args))
    });
}

GraphData.prototype.on = function (event, handler) {
    if (!this.events[event])
        this.events[event] = [];
    this.events[event].push(handler);
}