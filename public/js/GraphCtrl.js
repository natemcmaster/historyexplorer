function GraphCtrl($scope, $http, $element) {
    this.w = 500;
    this.h = 500;
    this.levels = 2;
    this.svg = d3.select($element[0])
        .append('svg')
        .attr('viewBox', [0, 0, this.w, this.h].join(' '))
        .attr('preserveAspectRatio', 'xMidYMid meet');

    this.links = this.svg.selectAll('.link');
    this.nodes = this.svg.selectAll('.node');

    $http.get('/data.json', {
        'responseType': 'json'
    })
        .success(function (graph, error) {
            this.graphData = graph;
            this.centerOnNode('A');
        }.bind(this));
}

GraphCtrl.prototype.centerOnNode = function (node) {
    var lnks = this.graphData.links[node];
    var center = this.graphData.nodes[node];
    center.piece = 0;
    center.level = 0;

    var i = 0;
    var level = 1;
    var d = _(lnks).reduce(function (coll, item) {
        var node = this.graphData.nodes[item];
        node.piece = i++ / lnks.length;
        node.level = level;
        coll.push(node);
        return coll;
    }.bind(this), [])
    this.show(center, d);
}

GraphCtrl.prototype.show = function (center, nodes, angle, offset) {
    angle = angle || 2 * Math.PI;
    offset = offset || 0;
    var d = [center].concat(nodes);
    var scale = 100;
    var radius = 25;
    var normX = function (n) {
        return n.level * (Math.cos(n.piece * angle + offset)) * scale + this.w / 2;
    }.bind(this);
    var normY = function (n) {
        return n.level * (Math.sin(n.piece * angle + offset)) * scale + this.h / 2;
    }.bind(this);
    this.links.data(d)
        .enter()
        .append('line')
        .attr('class', 'link')
        .attr('x1', normX(center)).attr('y1', normY(center))
        .attr('x2', normX).attr('y2', normY);

    this.nodes.data(d)
        .enter()
        .append('circle')
        .attr('class', function (n) {
            return 'node level-' + n.level;
        })
        .attr('cx', normX)
        .attr('cy', normY)
        .attr('r', radius);
}