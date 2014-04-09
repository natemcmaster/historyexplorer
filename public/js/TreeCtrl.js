// animate: http://stackoverflow.com/questions/11007640/fit-text-into-svg-element-using-d3-js
var TreeCtrl = (function _treeCtrl(d3) {


    var diameter = 960;

    var tree = d3.layout.tree()
        .size([360, diameter / 2 - 120])
        .separation(function(a, b) {
            return (a.parent == b.parent ? 1 : 2) / a.depth;
        });

    var diagonal = d3.svg.diagonal.radial()
        .projection(function(d) {
            return [d.y, d.x / 180 * Math.PI];
        });

    var svg;

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
            .attr("d", diagonal);
        //update
        link.transition().duration(500).attr('d', diagonal);
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
            .attr("class", "node")
            .attr("transform", function(d) {
                return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")";
            })

        group.append("circle")
            .attr("r", 4.5);

        group.append("text")
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
            });
        // removal
        node.exit().remove();

    };

    d3.select(self.frameElement).style("height", diameter - 150 + "px");



    function TreeCtrl($scope, $http, $element, GraphData) {

        svg = d3.select($element[0]).append("svg")
            .attr("width", diameter)
            .attr("height", diameter - 150)
            .append("g")
            .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");
        svg.append('g').attr('id','lines');
        svg.append('g').attr('id','nodes');

        GraphData.on('select.node', function(event, id) {
            makeTree(GraphData.tree(id), function(id) {
                GraphData.emit('select.node', id);
            });
        });
    }

    return TreeCtrl;

})(d3);