fg.viz.appgraph = function(options){

	var self = {};

    for (var key in options) {
        self[key] = options[key];
    }
    
    self.parentSelect = "#" + self.parentId;

	self.init = function(){

		self.svg = d3.select(self.parentSelect).append("svg")
            .attr("id", "appgraph")
            .attr("width", self.width)
            .attr("height", self.width)
            .style("border","1px solid black");

        self.g = self.svg.append("g").attr("transform","translate(10,10)");

	};
	self.prerender = function(){

	console.log(self.data);

	var root = self.data;

	var pack = d3.pack()
	.size([self.width - 20, self.width - 20]);

	root = d3.hierarchy(root)
		.sum(function(d) { return 2; }) // any value is fine
		.sort(function(a, b) { return b.value - a.value; });

	var node = self.g.selectAll(".node")
		.data(pack(root).descendants())
		.enter().append("g")
		.attr("class", function(d) { return d.children ? "node" : "leaf node"; })
		.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

	node.append("circle")
	.attr("r", function(d) { return d.r; });

	node.filter(function(d) { return !d.children; }).append("text")
	.attr("dy", "0.3em")
	.text(function(d) { return d.data.name; });
	};

	self.render = function(){};

	self.init();
	return self;
};

var fedoraviz = fg.viz.appgraph({
	parentId : "new-graph",
	data: json,
	width : $('#new-graph').width()
});

fedoraviz.prerender();