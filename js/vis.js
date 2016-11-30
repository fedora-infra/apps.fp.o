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
        self.margin = 10;
        self.g = self.svg.append("g").attr("transform","translate("+self.width/2+","+self.width/2+")");

	};
	self.prerender = function(){

		var root = self.data,view,diameter= +self.width, zoomed = true;

		var pack = d3.pack()
			.size([self.width - 2*self.margin, self.width - 2*self.margin]);

		root = d3.hierarchy(root)
			.sum(function(d) { return 2; }) // any value is fine
			.sort(function(a, b) { return b.value - a.value; });

		var node = self.g.selectAll(".node")
			.data(pack(root).descendants())
			.enter().append("g")
			.attr("class", function(d) { return d.children ? "node" : "leaf node"; })
			.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

		var circle=node.append("circle")
			.attr("r", function(d) { return d.r; });

		var leafs = node.filter(function(d) { return !d.children; })
			.style("opacity",0.05)
			.style("pointer-events",'none');

		node.filter(function(d) { return d.data.id==0; })
			.style("opacity",0.2)
			.style("pointer-events",'none');

		var text = node.filter(function(d) {
			return d.data.id != 0})
			.append("text")
			.attr("dy", "0.3em")
			.style("opacity",function(d){
				return (d.children?1:0);
			})
			.style("text-transform",function(d){
				return (d.children?"uppercase":"none");
			})
			.text(function(d) { return d.data.name; });

		var events = function(d,i){
			if( d.children && d.data.id != 0 ){
				
				zoom(d);
				
				text.style("opacity",function(d0){
					return (d0.children?0:1);
				});
				
				leafs.transition()
				.duration(1500)
				.style("opacity",1)
				.style("pointer-events","auto");
				
				circle.style("stroke-width",function(d0,j) {
					if( i == j ) return "1.5px";
				});
			}
		};

		function zoom(d) {
			var focus0 = focus; focus = d;

			var transition = d3.transition()
				.duration(d3.event.altKey ? 7500 : 750)
				.tween("zoom", function(d) {

			var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + self.margin]);
			return function(t) { zoomTo(i(t)); };
			});

			transition.selectAll("text")
				.filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
				.style("fill-opacity", function(d) { return d.parent === focus ? 1 : 0; })
				.on("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
				.on("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
		}

		zoomTo([root.x, root.y, root.r * 2 + self.margin]);

		function zoomTo(v) {
			var k = diameter / v[2]; view = v;
			node.attr("transform", function(d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
			circle.attr("r", function(d) { return d.r * k; });
  		}

		node.on('click',events);

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