// animate: http://stackoverflow.com/questions/11007640/fit-text-into-svg-element-using-d3-js

function Link(a, b) {
    this.a = a;
    this.b = b;
}

function GraphCtrl($scope, $http, $element, GraphData) {
    this.w = 500;
    this.h = 500;
    this.MAX_LEVEL = 2;
    this.maxNodeRadius = 14;
    this.minNodeRadius = 5;
    this.lineSpacing = function(l) {
        return 15 - 2 * l;
    }
    this.GraphData = GraphData;

    this.svg = d3.select($element[0])
        .append('svg')
        .attr('viewBox', [0, 0, this.w, this.h].join(' '))
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .append('g')
        .attr('transform', 'translate(' + this.w / 2 + ',' + this.h / 2 + ')');

    this.svg.append('g').attr('id', 'lines');
    this.svg.append('g').attr('id', 'nodes');

    GraphData.on('select.node', function(event, id) {
        this.centerOnNode(id);
    }.bind(this));
}

GraphCtrl.prototype.selectNode = function(id) {
    this.GraphData.emit('select.node', id);
}

GraphCtrl.prototype.centerOnNode = function(ctr) {
    var center = this.GraphData.node(ctr);
    if (!center)
        throw new Error('Could not find that node');
    center.tilt = 0;
    center.level = 0;
    center.x = 0;
    center.y = 0;
    center.parent = null;
    center.arc = 2 * Math.PI;
    this.resetQueue();
    this.queueNode(center);
    this.drawChildren(ctr, 1);
    this.draw();
    return;
}

GraphCtrl.prototype.drawChildren = function(pid, level) {
    level = level || 0;
    if (level > this.MAX_LEVEL)
        return;
    var children = this.GraphData.links(pid);
    var parent = this.GraphData.node(pid);
    if (!children)
        return;
    children = children.filter(function(id) {
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
    children.forEach(function(id, i) {
        var s = this.GraphData.node(id);
        s.level = level;
        s.arc = subArc;
        s.tilt = (i + 1) * subArc + baseTilt;
        s.x = radius * Math.cos(s.tilt) + parent.x;
        s.y = radius * Math.sin(s.tilt) + parent.y;
        s.parent = parent;
        var link = new Link(parent, s);
        this.queueLink(link);
        this.queueNode(s);
        return s;
    }.bind(this));
    for (var i in children)
        this.drawChildren(children[i], level + 1);
}

GraphCtrl.prototype.resetQueue = function() {
    if (this._nodes)
        this._nodes.forEach(function(s) {
            s.queued = false;
        });
    if (this._links)
        this._links.forEach(function(s) {
            s.queued = false;
        })
    this._nodes = [];
    this._links = [];
}

GraphCtrl.prototype.queueNode = function(node) {
    node.queued = true;
    this._nodes.push(node);
}

GraphCtrl.prototype.queueLink = function(link) {
    link.queued = true;
    this._links.push(link);
}

// for now, it makes concentric circles
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
    var narrowing = 1.5
    return narrowing * Math.acos(d1 / r2 * (1 - cos) / (cos - 1));
}

GraphCtrl.prototype.draw = function() {
    var transitionDuration = 500;
    var scale = 100;

    var radius = function(d) {
        var flex = this.maxNodeRadius - this.minNodeRadius;
        return flex / (d.level + 1) + this.minNodeRadius;
    }.bind(this);
    var normx = function(n) {
        return n.x * scale;
    };
    var normy = function(n) {
        return n.y * scale;
    };

    var lines = this.svg.select('#lines').selectAll('.link')
        .data(this._links, function(d) {
            return (d.a.id > d.b.id) ? d.a.id * 1000 + d.b.id : d.a.id + d.b.id * 1000;
        });

    lines.enter()
        .append('line')
        .attr('class', 'link')
        .attr('x1', function(d) {
            var pt = d.a.parent ? d.a.parent : d.a;
            return normx(pt);
        }).attr('y1', function(d) {
            var pt = d.a.parent ? d.a.parent : d.a;
            return normy(pt);
        })
        .attr('x2', function(d) {
            var pt = d.b.parent ? d.b.parent : d.b;
            return normx(pt);
        }).attr('y2', function(d) {
            var pt = d.b.parent ? d.b.parent : d.b;
            return normy(pt);
        })
        .transition()
        .delay(500)
        .duration(500)
        .attr('x1', function(l) {
            return normx(l.a);
        }).attr('y1', function(l) {
            return normy(l.a);
        })
        .attr('x2', function(l) {
            return normx(l.b);
        }).attr('y2', function(l) {
            return normy(l.b);
        });


    lines.transition()
        .duration(500)
        .attr('x1', function(l) {
            return normx(l.a);
        }).attr('y1', function(l) {
            return normy(l.a);
        })
        .attr('x2', function(l) {
            return normx(l.b);
        }).attr('y2', function(l) {
            return normy(l.b);
        });

    lines.exit().remove();

    var ls = this.lineSpacing;
    var goToNode = function(d) {
        this.selectNode(d.id);
    }.bind(this);

    var items = this.svg.select('#nodes').selectAll('.item')
        .data(this._nodes, function(d) {
            return d.id;
        });

    //enter
    var group = items.enter()
        .append('g')
        // .style('opacity',0)
        .on('click', goToNode)
        .attr('class', function(d) {
            return 'item level-' + d.level;
        })
        .attr('transform', function(d) {
            var pt = d.parent ? d.parent : d;
            return 'translate(' + pt.x * scale + ',' + pt.y * scale + ')'
        });

    group.transition()
        .delay(500)
        .duration(500)
        // .style('opacity',100)
        .attr('transform', function(d) {
            return 'translate(' + d.x * scale + ',' + d.y * scale + ')'
        })
        ;

    group.append('text')
        .attr('class', 'node-label')
        .each(function(d) {
            var el = d3.select(this);
            var words = d.title.split(' ');
            el.text('');

            for (var i = 0; i < words.length; i++) {
                var content = words[i];
                //handle short words
                if (words[i + 1] && words[i + 1].length <= 3) {
                    content += ' ' + words[i + 1];
                    i++;
                }
                var tspan = el.append('tspan').text(content);
                tspan.attr('x', 0).attr('dy', ls(d.level));
            }
        })
        .attr('x', 0)
        .attr('y', radius);

    group.append('circle')
        .attr('r', radius)
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('class', 'node');

    //update
    var updatedGroup = items.attr('class', function(d) {
        return 'item level-' + d.level;
    })
        .attr('x', 0)
        .attr('y', 0)
        .transition()
        .duration(500)
        .attr('transform', function(d) {
            return 'translate(' + d.x * scale + ',' + d.y * scale + ')'
        });
    updatedGroup.select('circle')
        .attr('r',radius);
    updatedGroup.select('text')
        .attr('y',radius)


    //exit
    items.exit().remove();



}