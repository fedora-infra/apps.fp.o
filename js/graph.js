var DARK_BLUE = "#294172";
var LIGHT_BLUE = "#4872c7";
var BLACK = "#03060a";

function init() {
    var name2hash = function(name) {
        return $("<p>" + name + "</p>").text().replace(/\s+/g, '');
    }

    var rgraph = new $jit.RGraph({
        //Where to append the visualization
        injectInto: 'mainvis',

        //Set Node and Edge styles.
        Node: {
            color: DARK_BLUE,
        },

        Edge: {
            color: LIGHT_BLUE,
            lineWidth:2.5
        },

        onBeforeCompute: function(node){
            var header = "<h4>" + node.name + "</h4>";
            var body = "<p>" + node.data.description + "</p>";
            var button = "";
            if ( node.data.url != undefined ) {
                button += "<a href='" + node.data.url + "' target='_blank' class='btn btn-primary'>";
                button += "Check it out!";
                button += "</a>";
            }
            $jit.id('details').innerHTML = header + body + button;
        },

        Events: {
            enable: true,
            // Put the name of the node in the #hash of the url when clicking
            onClick: function(node, eventInfo, e) {
                window.location.hash = name2hash(node.name);
            },
        },

        //Add the name of the node in the correponding label
        //and a click handler to move the graph.
        //This method is called once, on label creation.
        onCreateLabel: function(domElement, node){
            domElement.innerHTML = node.name;
            domElement.onclick = function(){
                rgraph.onClick(node.id, {
                    onComplete: function() {
                        // awesome
                    }
                });
            };
        },
        //Change some label dom properties.
        //This method is called each time a label is plotted.
        onPlaceLabel: function(domElement, node){
            var style = domElement.style;
            style.display = '';
            style.cursor = 'pointer';
            style.color = BLACK;

            if (node._depth == 0) {
                style.fontSize = "1.5em";
            } else if (node._depth <= 1) {
                style.fontSize = "1.1em";
            } else if(node._depth >= 2){
                style.fontSize = "0.8em";
            }

            var left = parseInt(style.left);
            var w = domElement.offsetWidth;
            style.left = (left - w / 2) + 'px';
        }
    });
    //load JSON data
    rgraph.loadJSON(json);

    //trigger small animation
    rgraph.graph.eachNode(function(n) {
        var pos = n.getPos();
        pos.setc(0, 0);
    });
    rgraph.compute('end');
    rgraph.fx.animate({
        modes:['polar'],
        duration: 2000
    });

    // A hack to get the graph to write data to the left-most pane before it
    // otherwise would.
    rgraph.config.onBeforeCompute(json);

    $(document).ready(function() {
        // Last thing, click on a node if the user is deep-linking
        var name = window.location.hash.replace('#', '');

        // Find the node with this name:
        $.each(rgraph.graph.nodes, function(i, node) {
            if (name2hash(node.name) == name) {
                rgraph.onClick(node.id);
            }
        });
    });
}
