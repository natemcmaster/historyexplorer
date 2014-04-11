// animate: http://stackoverflow.com/questions/11007640/fit-text-into-svg-element-using-d3-js
var TreeCtrl = (function _treeCtrl(d3) {


    var diameter, tree, svg;

    var tree;

    var linkPath = d3.svg.diagonal.radial()
        .projection(function(d) {
            return [d.y, d.x / 180 * Math.PI];
        });

    var nodeRadius = function(d) {
        return Math.max(4, 4 + (3 - d.level));
    }

        function makeTree(root, action) {

            var nodes = tree.nodes(root),
                links = tree.links(nodes);

            // link creation
            var link = svg.select('#lines').selectAll(".link")
                .data(links, function(l) {
                    var x = l.source.id;
                    var y = l.target.id;
                    return (x > y) ? x * 1000 + y : x + y * 1000;
                });
            link.enter().append("path")
                .attr("class", "link")
                .attr('d', linkPath);
            //update
            link.transition().duration(500).attr('d', linkPath);
            // removal
            link.exit().remove();

            var node = svg.select('#nodes').selectAll(".node")
                .data(nodes, function(d) {
                    return d.id;
                });
            // node creation
            var group = node.enter().append("g")
                .on('click', function(d) {
                    action(d.id);
                })
                .attr("transform", function(d) {
                    return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")";
                })
                .attr('class', function(d) {
                    return 'level-' + d.level;
                })

            group.append("circle")
                .attr("r", nodeRadius)
                .attr("class", 'node');

            group.append("text")
                .attr('class', 'node-label')
                .attr("dy", ".31em")
                .attr("text-anchor", function(d) {
                    return d.x < 180 ? "start" : "end";
                })
                .attr("transform", function(d) {
                    return d.x < 180 ? "translate(8)" : "rotate(180)translate(-8)";
                })
                .text(function(d) {
                    return d.name;
                });
            // update
            node.transition().duration(500).attr("transform", function(d) {
                return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")";
            }).select('text').attr("text-anchor", function(d) {
                return d.x < 180 ? "start" : "end";
            })
                .attr("transform", function(d) {
                    return d.x < 180 ? "translate(8)" : "rotate(180)translate(-8)";
                })
                .attr('class', function(d) {
                    return 'level-' + d.level;
                })
                .attr("r", nodeRadius);
            // removal
            node.exit().remove();

        };

    function TreeCtrl($scope, $http, $element, GraphData) {

        svg = d3.select($element[0]).append("svg")
            .attr('preserveAspectRatio', 'xMidYMid meet')
            .append("g")
        svg.append('g').attr('id', 'lines');
        svg.append('g').attr('id', 'nodes');

        this.resize($element);

        GraphData.on('select.node', function(event, id) {
            makeTree(GraphData.tree(id), function(id) {
                GraphData.emit('select.node', id);
            });
        });
    }

    TreeCtrl.prototype.resize = function($element) {
        diameter = Math.min($element.height(), $element.width());
        tree = d3.layout.tree()
            .size([360, diameter / 2 - 120])
            .separation(function(a, b) {
                return (a.parent == b.parent ? 1 : 2) / a.depth;
            })

        d3.select($element[0]).select('svg g')
            .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

    }

    return TreeCtrl;

})(d3);