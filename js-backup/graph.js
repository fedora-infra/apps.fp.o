var DARK_BLUE = "#294172";
var LIGHT_BLUE = "#4872c7";
var BLACK = "#03060a";

// A mapping of status.fp.o status states to bootstrap css classes.
var status_classes = {
    good: "success",
    scheduled: "info",
    minor: "warning",
    major: "danger",
};


function init() {

    // First thing to do is to query status.fedoraproject.org.
    // We'll integrate that data into our presentation.
    var statuses = null;
    var url = 'https://status.fedoraproject.org/static/statuses.js';
    $.ajax(url,
        {
            dataType: 'jsonp',
            jsonpCallback: 'callback',
            async: false,
            success: function(data) { statuses = data.services; },
        }
    );
    // Done with status.fp.o

    // A utility to use later on
    var name2hash = function(name) {
        return $("<p>" + name + "</p>").text().replace(/\s+/g, '');
    }

    var node2html = function(node) {
        var html = node.name;
        if (node.data.icon != undefined) {
            html = "<img class='icon' src='img/icons/" +
                node.data.icon + "'/> " + html;
        }
        return html
    }

    // Now, set up our radial graph visualization
    var rgraph = new $jit.RGraph({
        //Where to append the visualization
        injectInto: 'mainvis',

        levelDistance: 175,  // Default is 100

        //Set Node and Edge styles.
        Node: {
            color: DARK_BLUE,
        },

        Edge: {
            color: LIGHT_BLUE,
            lineWidth: 2.5
        },

        onBeforeCompute: function(node){
            var header = "<h3>" + node2html(node) + "</h3>";
            var body = "<p>" + node.data.description + "</p>";

            var button = "";
            if ( node.data.url != undefined ) {
                if ( node.data.ipv6_only && (!ipv6) ) {
                    button += "<p class='btn btn-primary disabled'>";
                    button += "IPv6 Only!";
                    button += "</p>";
                } else {
                    button += "<a href='" + node.data.url + "' target='_blank' class='btn btn-default'>";
                    button += "Check it out!";
                    button += "</a>";
                }
            }

            var stats = "";
            if (node.data.status_mappings != undefined && statuses != null) {
                stats += "<hr style='margin-top: 32px;'/>";
                stats += "<p class='text-muted'>status from <a href='http://status.fedoraproject.org'>status.fp.o</a></p>";
                stats += "<table class='table'>";
                $.each(node.data.status_mappings, function(i, status_mapping) {
                    var status = statuses[status_mapping];
                    var cls = status_classes[status.status]
                    stats += "<tr class='" + cls + "'>" +
                        "<td>" + status.name + "</td>" +
                        "<td>" + status.message + "</td></tr>";
                });
                stats += "</table>";
            }

            $jit.id('details').innerHTML = header + body + button + stats;
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
            domElement.innerHTML = node2html(node);
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
                style.fontSize = "2.5em";
            } else if (node._depth <= 1) {
                style.fontSize = "1.7em";
            } else if(node._depth >= 2){
                style.fontSize = "1.2em";
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
