$(document).ready(function() {
    if (typeof moksha_callbacks == 'undefined') { moksha_callbacks = {}; }

    var topic = "*";
    if (!moksha_callbacks[topic]) {
        re = new RegExp("^"+topic.replace('.', '\.').replace('*', '.*')+"$$");
        moksha_callbacks[topic] = {};
        moksha_callbacks[topic].re = re;
        moksha_callbacks[topic].callbacks = [];
    }
    moksha_callbacks[topic].callbacks.push(function(json, frame) {
        (function(json){
            // Make an ajax request to get the fedmsg.text metadata and use that
            // metadata to make the gritter popup.
            $.ajax("/__fedmsg.text__", {
                data: {json: JSON.stringify(json)},
                success: $.gritter.add,
            });
        })(json);
    });

    if (typeof raw_msg_callback == 'undefined') {
        raw_msg_callback = function(e) {
            var data, json, topic, body;

            data = e.data;
            json = JSON.parse(data);
            topic = json.topic;
            body = json.body;

            $.each(moksha_callbacks, function(_topic, obj) {
                if (obj.re.test(topic)) {
                    $.each(obj.callbacks, function(i, callback) {
                        callback(body);
                    });
                }
            });
        }
    }

    if (typeof WebSocket == 'undefined') { WebSocket = MozWebSocket; }

    function setup_moksha_socket() {
        $(function() { $.gritter.add({"text": "Attempting to connect Moksha Live Socket", "title": "WebSocket"}); });

        var ws_scheme = "wss://";
        moksha_websocket = new WebSocket(
            ws_scheme + 'hub.fedoraproject.org:9939'
        );

        moksha_websocket.onopen = function(e){
            $.gritter.add({"text": "Moksha Live socket connected", "title": "WebSocket"});
            moksha.topic_subscribe('*');
        }
        moksha_websocket.onerror = function(e){
            $.gritter.add({"text": "Error with Moksha Live socket", "title": "WebSocket"});
        }
        moksha_websocket.onclose = function(e){
            $.gritter.add({"text": "Moksha Live socket closed", "title": "WebSocket"});
        }

        moksha_websocket.onmessage = raw_msg_callback;
    }

    if (typeof moksha_websocket == 'undefined') {
        setup_moksha_socket();
    } else {
        $(function() { $.gritter.add({"text": "Moksha Live socket connected", "title": "WebSocket"}); });
        moksha.topic_subscribe('*');
    }

    if (typeof moksha == 'undefined') {moksha = {};}

    moksha.send_message = function(topic, body) {
        moksha_websocket.send(
            JSON.stringify({topic: topic, body: body})
        );
    }

    moksha.topic_subscribe = function(topic) {
        moksha.send_message('__topic_subscribe__', topic);
    }
});
