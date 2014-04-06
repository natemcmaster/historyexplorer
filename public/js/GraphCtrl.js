function Link(a,b) {
    this.a=a;
    this.b=b;
}

function GraphCtrl($scope, $http, $element, GraphData) {
    this.w = 500;
    this.h = 500;
    this.MAX_LEVEL = 2;
    this.maxNodeRadius = 40;
    this.minNodeRadius = 15;
    this.GraphData = GraphData;
    
    this.svg = d3.select($element[0])
        .append('svg')
        .attr('viewBox', [0, 0, this.w, this.h].join(' '))
        .attr('preserveAspectRatio', 'xMidYMid meet');

    this.links = this.svg.selectAll('.link');
    this.nodes = this.svg.selectAll('.node');
    
    GraphData.on('select.node',function(event,id){
        this.centerOnNode(id);
    }.bind(this));
}

GraphCtrl.prototype.selectNode = function(id){
    this.GraphData.emit('select.node',id);
}

GraphCtrl.prototype.centerOnNode = function (ctr) {
    this.svg.selectAll('.link,.node,.node-label').data([]).exit().remove();
    var center = this.GraphData.node(ctr);
    if (!center)
        throw new Error('Could not find that node');
    delete center.toX;
    delete center.toY;
    center.tilt = 0;
    center.level = 0;
    center.arc = 2 * Math.PI;
    this.resetQueue();
    this.queue(center);
    this.drawChildren(ctr, 1);
    this.draw();
    return;
}

GraphCtrl.prototype.drawChildren = function (pid, level) {
    level = level || 0;
    if (level > this.MAX_LEVEL)
        return;
    var children = this.GraphData.links(pid);
    var parent = this.GraphData.node(pid);
    if (!children)
        return;
    children = children.filter(function (id) {
        var node = this.GraphData.node(id);
        return node && !node.queued;
    }.bind(this));
    if (!children.length)
        return;
    var d = levelDistance(level);
    var radius = d - levelDistance(level - 1);
    var pie = maxChildArc(levelDistance(level - 1), d, parent.arc);
    var c = level == 1 ? children.length : children.length + 1;
    var subArc = pie / c;
    var baseTilt = parent.tilt - pie / 2;
    children.forEach(function (id, i) {
        var s = this.GraphData.node(id);
        s.level = level;
        s.arc = subArc;
        s.tilt = (i + 1) * subArc + baseTilt;
        s.toX = radius * Math.cos(s.tilt) + parent.toX;
        s.toY = radius * Math.sin(s.tilt) + parent.toY;
        var link = new Link(parent,s);
        this.queue(link);
        this.queue(s);
        return s;
    }.bind(this));
    for (var i in children)
        this.drawChildren(children[i], level + 1);
}

GraphCtrl.prototype.resetQueue = function () {
    if (this._queue)
        this._queue.forEach(function (s) {
            s.queued = false;
        })
    this._queue = [];
}

GraphCtrl.prototype.queue = function (node) {
    ['x', 'y', 'toX', 'toY'].forEach(function (p) {
        this[p] = this[p] || 0;
    }.bind(node));
    node.queued = true;
    this._queue.push(node);
}

/**
for now, it makes concentric circles
**/
function levelDistance(level) {
    if (level < 0)
        return 0;
    return level;
}

function maxChildArc(distFromParent, childRadius, parentArcAngle) {
    if (distFromParent == 0)
        return 2 * Math.PI;
    var theta = parentArcAngle / 2;
    if (theta >= Math.atan(childRadius / distFromParent)) {
        return Math.PI;
    }
    var cos = Math.cos(theta);
    var d1 = distFromParent;
    var r2 = childRadius;
    return 2 * Math.acos(d1 / r2 * (1 - cos) / (cos - 1));
}

GraphCtrl.prototype.draw = function () {
    var links = [];
    var nodes = [];
    for (var x = this._queue.length - 1; x >= 0; x--) {
        var s = this._queue[x];
        if (s instanceof Link) {
            links.push(s);
        } else {
            nodes.push(s);
        }
    }
    var scale = 100;
    var radius = function(d){
        var flex = this.maxNodeRadius-this.minNodeRadius;
        return flex/(d.level+1) + this.minNodeRadius;
    }.bind(this);
    var normToX = function (n) {
        return n.toX * scale + this.w / 2;
    }.bind(this);
    var normToY = function (n) {
        return n.toY * scale + this.h / 2;
    }.bind(this);

    this.links.data(links)
        .enter()
        .append('line')
        .attr('class', 'link')
        .attr('x1', function(l){
            return normToX(l.a);
        }).attr('y1',function(l){
            return normToY(l.a);
        })
        .attr('x2', function(l){
            return normToX(l.b);
        }).attr('y2', function(l){
            return normToY(l.b);
        });

    var d = this.nodes.data(nodes);
    d.enter()
        .append('circle')
        .on('click',function(d){
            this.selectNode(d.id);
        }.bind(this))
        .attr('class', function (n) {
            return 'node level-' + n.level;
        })
        .attr('cx', normToX)
        .attr('cy', normToY)
        .attr('name', function (d) {
            return d.id
        })
        .attr('r', radius);
    
    d.enter().append('text')
        .on('click',function(d){
            this.selectNode(d.id);
        }.bind(this))
        .text(function (d) {
            return d.id
        })
        .attr('class', 'node-label')
        .attr('x', normToX)
        .attr('y', normToY)
}