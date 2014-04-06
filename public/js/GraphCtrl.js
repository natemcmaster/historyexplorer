function GraphCtrl($scope, $http, $element) {
    this.w = 500;
    this.h = 500;
    this.levels = 2;
    this.MAX_LEVEL = 3;
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

function Link(x, y, toX, toY) {
    var args = arguments;
    ['x', 'y', 'toX', 'toY'].forEach(function (p, i) {
        this[p] = args[i] || 0;
    }.bind(this));
}

GraphCtrl.prototype.centerOnNode = function (ctr) {
    var center = this.graphData.nodes[ctr];
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
    var children = this.graphData.links[pid];
    var parent = this.graphData.nodes[pid];
    if (!children)
        return;
    children = children.filter(function (id) {
        var node = this.graphData.nodes[id];
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
        var s = this.graphData.nodes[id];
        s.level = level;
        s.arc = subArc;
        s.tilt = (i + 1) * subArc + baseTilt;
        s.toX = radius * Math.cos(s.tilt) + parent.toX;
        s.toY = radius * Math.sin(s.tilt) + parent.toY;
        var link = new Link(parent.toX, parent.toY, s.toX, s.toY);
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
    var radius = 25;
    var normToX = function (n) {
        return n.toX * scale + this.w / 2;
    }.bind(this);
    var normToY = function (n) {
        return n.toY * scale + this.h / 2;
    }.bind(this);
    var normX = function (n) {
        return n.x * scale + this.w / 2;
    }.bind(this);
    var normY = function (n) {
        return n.y * scale + this.h / 2;
    }.bind(this);

    this.links.data(links)
        .enter()
        .append('line')
        .attr('class', 'link')
        .attr('x1', normX).attr('y1', normY)
        .attr('x2', normToX).attr('y2', normToY);

    var d = this.nodes.data(nodes);
    d.enter()
        .append('circle')
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
        .text(function (d) {
            return d.id
        })
        .attr('class', 'node-label')
        .attr('x', normToX)
        .attr('y', normToY)
}

GraphCtrl.prototype.show = function (center, nodes, arc, startArc) {
    arc = arc || 2 * Math.PI;
    startArc = startArc || 0;
    var d = [center].concat(nodes);
    var scale = 100;
    var radius = 25;
    var normX = function (n) {
        return n.level * (Math.cos(n.piece * arc + startArc)) * scale + this.w / 2;
    }.bind(this);
    var normY = function (n) {
        return n.level * (Math.sin(n.piece * arc + startArc)) * scale + this.h / 2;
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