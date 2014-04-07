function GraphData($rootScope,$http,$location) {
    $http.get('./data.json', {
        'responseType': 'json'
    })
        .success(function (graph, error) {
            this.__data = graph;
            this.emit('load');
            var id = this.$location.search().id;
            id = id || 341;
            this.emit('select.node', id);
        }.bind(this));
    this.events = {};
    this.__data = {nodes:{},links:{}};
    this.$location = $location;
    $rootScope.$on('$locationChangeSuccess',function(){
        var id = this.$location.search().id;
        if(id && this.node(id) && this.selected !== id)
            this.emit('select.node',id,true);
    }.bind(this));
}
   
GraphData.prototype.nodes = function () {
    if(this.__arr)
        return this.__arr
    this.__arr = [];
    for(var x in this.__data.nodes){
        this.__arr.push(this.__data.nodes[x]);
    }
    return this.__arr;
}

GraphData.prototype.node = function (id) {
    return this.__data.nodes[id];
}

GraphData.prototype.links = function (id) {
    return this.__data.links[id];
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