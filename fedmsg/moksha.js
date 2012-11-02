/*
 * Moksha javascript library
 * Copyright (C) 2008-2010  Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Depends:
 *      jquery.js
 */

(function(){

True = true
False = false
// prevent double loading
if (!(typeof(moksha) === 'undefined'))
    return;

var _moksha_resource_cache = {'scripts':{},
                              'links':{}};

var _moksha_deferred = [];

var _moksha_init = false;
// preload cache

$(document).ready(function(){
  _moksha_init = true;
  var $s = $('script[src]');
  var $l = $('link[href]');

  $.each($s, function(i, a) {
                var $a = $(a);
                var src = $a.attr('src');
                // for right now just compare exact source values
                // later we will want to be a bit smarter
                if(!_moksha_resource_cache['scripts'][src]) {
                    _moksha_resource_cache['scripts'][src] = true;
                }
             }
         );

  $.each($l, function(i, a) {
                var $a = $(a);
                var href = $a.attr('href');
                // for right now just compare exact source values
                // later we will want to be a bit smarter
                if(!_moksha_resource_cache['links'][href]) {
                    _moksha_resource_cache['links'][href] = true;
                }
             }
         );
});

moksha = {
    /******************************************************************
     * Generic method for filtering out resources which have already
     * been loaded.
     *
     * fragment - fragment of HTML text to be filtered ,
     * tag - the HTML tag you are looking for
     * resource_attr - the attribute which holds the resource locater
     * cache_name - the name of the cache to lookup to see if the resource was
     *              loaded
     *
     * Since the browser loads the resources we don't actually cache
     * the contents.  We only cache the resource locater.  If the same
     * resource has been loaded already we remove the tag from the
     * HTML fragment so it is never loaded more than once.
     *
     * To work around browser incompatibilities, any resource found
     * inside the head tag is placed in the body tag to make sure
     * they are loaded.
     ******************************************************************/
    filter_and_cache_resource: function(fragment, tag, resource_attr, cache_name) {
        var head_pos = moksha.find_head_tags(fragment);
        var in_head = function(pos) {
            var i = -1;

            for(i in head_pos) {
                low = head_pos[i][0];
                high = head_pos[i][1];

                if ((pos > low) && (pos < high))
                    break;
            }

            // -1 = not inside of the head tag
            return i;
        }

        var offset_head = function(index, length) {
            head_pos[index][1] -= length;
            for(i=index + 1; i < head_pos.length; i++) {
                head_pos[index][0] -= length;
                head_pos[index][1] -= length;
            }
        }

        var find_tag = new RegExp("<(/)?\\s*" + tag +
                                  "((\\s+\\w+(\\s*=\\s*(?:\".*?\"|'.*?'|[^'\">\\s]+))?)+\\s*|\\s*)(/)?>","gmi");
        var find_attr = new RegExp("\\s*" +  resource_attr +
                                   "\\s*=(\"|')(.*)\\1", "i");

        var find_end_tag_state = null; // if !null then = start tag index
        var relocate_tag_state = false; // used for relocating resources
                                        // from the head to the body
        var relocate_tag_list = []; // list of tags to relocate

        while ((match = find_tag.exec(fragment))!=null) {
            var is_self_closing_tag = (match[match.length-1] == '/');
            var is_close_tag = (match[1] == '/') || is_self_closing_tag;

            if (is_close_tag && find_end_tag_state) {
                if (relocate_tag_state) {
                    relocate_tag_list.push(fragment.substring(find_end_tag_state,
                                                              find_tag.lastIndex)
                                          );
                    relocate_tag_state = false;
                 }

                var head_index = in_head(find_end_tag_state);
                if (head_index != -1)
                    offset_head(head_index, find_tag.lastIndex - find_end_tag_state);

                fragment = (fragment.substring(0, find_end_tag_state) +
                               fragment.substring(find_tag.lastIndex));

                find_tag.lastIndex = find_end_tag_state;
                find_end_tag_state = null;

                continue;
            }

            var attrs = match[2];
            var resource = attrs.match(find_attr);
            if (resource){
                //strip query string
                resource = resource[2].split('?')[0];

                if(!_moksha_resource_cache[cache_name][resource]) {
                    // we can add more attributes later
                    // right now just set to true
                    _moksha_resource_cache[cache_name][resource] = true;

                    var head_index = in_head(match.index);
                    if (head_index) {
                        relocate_tag_state = true;

                        if (is_self_closing_tag) {
                            offset_head(head_index, find_tag.lastIndex - match.index);
                            fragment = (fragment.substring(0, match.index) +
                               fragment.substring(find_tag.lastIndex));
                            find_tag.lastIndex = match.index;

                            relocate_tag_list.push(match[0]);
                        } else {
                            find_end_tag_state = match.index;
                        }
                    }
                } else {
                    if (is_self_closing_tag) {
                        var head_index = in_head(match.index);
                        if (head_index != -1)
                            offset_head(head_index, find_tag.lastIndex - match.index);

                        fragment = (fragment.substring(0, match.index) +
                               fragment.substring(find_tag.lastIndex));
                        find_tag.lastIndex = match.index;
                    } else {
                        find_end_tag_state = match.index;
                    }
                }
            }
        }

        fragment = moksha.relocate_tags_to_body(fragment, relocate_tag_list);
        return fragment;
    },

    /******************************************************************
     * Filter the script tags in a fragment of HTML so that they aren't
     * double loaded.
     ******************************************************************/
    filter_scripts: function(fragment) {
        return moksha.filter_and_cache_resource(fragment,
                                                'script',
                                                'src',
                                                'scripts');
    },

    /******************************************************************
     * Filter the link tags in a fragment of HTML so they aren't
     * double loaded.
     ******************************************************************/
    filter_links: function(fragment) {
        return moksha.filter_and_cache_resource(fragment,
                                                'link',
                                                'href',
                                                'links');
    },

    /******************************************************************
     * Filter anchors in a fragment of HTML or jQuery DOM marked with
     * a moksha_url attribute so that they have updated static links
     * (e.g. run moksha.url on them) and dynamic moksha.goto links
     *
     * Dynamic links will eventually be able to load the correct tabs
     * on click and static links are used when the user opens the link
     * in another browser window.
     *
     * moksha_url="dynamic" - make both a dynamic and static link
     * moksha_url="static" - only make a static link
     ******************************************************************/
    update_marked_anchors: function(fragment) {
        if (!fragment.jquery)
            fragment = $(fragment);

        // get all anchors with a moksha_url attr but not inside a rowtemplate
        var $a_list = $('a[moksha_url]:not(.rowtemplate *):not(.template *)', fragment);

        // run over all the toplevel arguments and add them to the list
        // if they match
        var $filtered_fragment = fragment.filter('a[moksha_url]');

        if (!($a_list.length + $filtered_fragment.length))
            return fragment;

        var _goto = function(e) {
           var href = $(this).data('dynamic_href.moksha');
           moksha.dynamic_goto(href);

           return false;
        }

        var transform = function(i, e) {
                            var $e = $(e)
                            var href = $e.attr('href');
                            var moksha_url = $e.attr('moksha_url');

                            if (moksha_url.toLowerCase() == 'dynamic') {
                                $e.data('dynamic_href.moksha', href);
                                $e.unbind('click.moksha').bind('click.moksha', _goto);
                            }

                            href = moksha.url(href);
                            e.href = href;
                        }

       $.each($a_list, transform);
       $.each($filtered_fragment, transform);

       return fragment;
    },

    /******************************************************************
     * Filter resources in a fragment of HTML so that they aren't double
     * loaded. You should send in HTML text since loading into a jQuery
     * DOM can cause them to load depending on browser
     ******************************************************************/
    filter_resources: function(fragment) {
        var f = moksha.filter_scripts(fragment);
        f = moksha.filter_links(f);

        // now we can convert this to a DOM
        $f =  $(f);
        $f = moksha.update_marked_anchors($f);

        return $f;
    },

    /********************************************************************
     * Find the body tag in a fragment and inject the tags in the tag
     * list there
     ********************************************************************/
    relocate_tags_to_body: function(fragment, tag_list) {
        if(!tag_list.length)
            return fragment;

        var body_re = /<\s*body.*?>/ig;
        var match = body_re.exec(fragment);
        var pos = body_re.lastIndex;

        var tag_string = "";
        for(i in tag_list)
            tag_string += tag_list[i]

        fragment = fragment.substring(0,pos) + tag_string + fragment.substring(pos);

        return fragment;
    },

    /********************************************************************
     * Find the position of all head tags and return them as a list of
     * two element tuples
     ********************************************************************/
    find_head_tags: function(fragment) {
        var head_re = /<(\/)?\s*head.*?>/ig
        var results = [];
        var index = null;

        while((match = head_re.exec(fragment)) != null) {
            is_closing_tag = (match[1]=='/');
            if (!is_closing_tag) {
                index = [match.index,0];
            } else {
                index[1] = match.index + match[0].length;
                results.push(index);
                index = null;
            }
        }

        return results;
    },

    /*********************************************************************
     * Take a form element and add or update a hidden field
     *
     * Example:
     *   <form action="/process_form/"
     *         onSubmit="moksha.add_hidden_form_field(this)">
     *
     * Params:
     *   form_element - the form being updated
     *   key - the name of the field we are adding
     *   value - the value to set it to
     *   override_existing - defaults to true, if set to false we only
     *                       add the field if it does not exist or is
     *                       set to an empty string
     *********************************************************************/
     add_hidden_form_field: function(form_element, key, value, override_existing) {
        if (typeof(override_existing) === 'undefined')
            override_existing = true;

        var $fe = $(form_element);
        var $field = $("input[name=" + key + "]", form_element);

        // create a field if it doens't already exist
        if ($field.length < 1) {
            $field = $("<input type='hidden'></input>").attr("name", key);

            $fe.append($field);
        }

        var v = $field.attr("value");
        if (!override_existing && v)
            return;

        $field.attr("value", value);
    },

    /********************************************************************
     * Take a url and target and load
     *
     * FIXME: target is ignored for now
     *
     * TODO: Fast loading where we just switch tabs
     ********************************************************************/
    goto: function(url, params, target) {
        if (typeof(params) != 'object')
            params = {}

        window.location.href = moksha.url(url, params);
    },


    // Applys a mask in the form of '/*/path' where the wild card inserts the
    // element from the source_url.
    //
    // example:
    //     source_url = '/foo/bar/baz';
    //     mask = '/alpha/*/beta';
    //     url_mask(source_url, mask);
    //     > '/alpha/bar/beta'
    url_mask: function (source_url, mask) {
       var result = '';
       var split_mask = mask.split('/');
       var split_source = source_url.split('/');
       for (var i=0; i < split_mask.length; i++) {
           if (i >= split_source.length)
               return result;

           if (split_mask[i] == '*')
               result += split_source[i];
           else
               result += split_mask[i];
           result += '/'
       }
       return result;
    },

    /********************************************************************
     * Dynamically load a portion of the page
     ********************************************************************/
    dynamic_goto: function(url, params, target, display_path) {
        if (typeof(params) != 'object')
            params = {}

        var current_path = location.pathname;
        display_path = moksha.url(display_path);

        var masked_url = moksha.url_mask(current_path, display_path);

        window.history.pushState({}, "", masked_url);
        function load_finish(html) {
            $(target).html(moksha.filter_resources(html));
        }
        moksha.html_load(moksha.url(url), params, load_finish);

        // prevent link from reloading entire page if attached to onClick handler
        return false;
    },

    /*
     * modified from parseUri 1.2.1 Steven Levithan <stevenlevithan.com>
     */
    parseUri: function (str) {
        var options = {
              strictMode: false,
            key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
            q:   {
                name:   "queryKey",
                parser: /(?:^|&)([^&=]*)=?([^&]*)/g
            },
            parser: {
                strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
                loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
            }
        };

        var uriClass = function(){};
        uriClass.prototype = {
            type: 'uri',

            _normalize_path: function(path) {
                // make sure we don't have multiple slashes
                var slashes = /\/+/g;
                path = path.replace(slashes, '/');

                return path;
            },

            prepend_base_url: function(base_url) {
                // make sure we haven't already prepended the base url
                // always remove leading slashes
                var leading_slashes = /^\/+/;

                var base_split = base_url.replace(leading_slashes, '').split('/');
                var dir_split = this.directory.replace(leading_slashes, '').split('/');

                var should_exit = true;
                for (i in base_split) {

                    try {
                        var b = base_split[i];
                        if (b == '')
                            break;

                        var d = dir_split[i];
                    } catch (e) {
                        should_exit = false;
                        break;
                    }

                    if (b != d) {
                        should_exit = false;
                        break;
                    }
                }

                if (should_exit)
                    return;

                this.directory = base_url + this.directory;
                this.directory = this._normalize_path(this.directory);

                this.relative = this.directory + this.file;
                this.path = this.relative;
            },

            update_query_string: function(params) {
                for (p in params)
                    this.queryKey[p] = params[p];
            },

            toString: function() {
                var proto = this.protocol;
                if (proto)
                    proto += '://';

                var url = proto + this.authority + this.path;
                var qlist = []

                for (q in this.queryKey) {
                    var value = this.queryKey[q]
                    if (typeof(value) == 'string') {
                        qlist.push(q + '=' + value);
                    } else {
                        // must be a list, break up into seperate query elements
                        for (i in value) {
                            qlist.push(q + '=' + value[i]);
                        }
                    }
                }

                var query = qlist.join('&')
                if(query)
                    url += '?'+ query;

                if (this.anchor)
                    url += '#' + this.anchor;

                return url;
           }
        };

        var o   = options,
            m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
            uri = new uriClass,
            i   = 14;

        while (i--) uri[o.key[i]] = m[i] || "";

        uri[o.q.name] = {};
        uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
            if ($1) {
                var value = uri[o.q.name][$1];
                if (value) {
                    if (typeof(value) === 'string')
                        value = [value];

                    value.push($2);
                    uri[o.q.name][$1] = value;
                } else {
                    uri[o.q.name][$1] = $2;
                }
            }
        });

        return uri;
    },


    json_load: function(path, params, callback, $overlay_div, loading_icon) {
       return moksha.ajax_load(path, params, callback, $overlay_div, 'json', loading_icon);
    },

    xml_load: function(path, params, callback, $overlay_div, loading_icon) {
       return moksha.ajax_load(path, params, callback, $overlay_div, 'xml', loading_icon);
    },

    html_load: function(path, params, callback, $overlay_div, loading_icon) {
       return moksha.ajax_load(path, params, callback, $overlay_div, 'html', loading_icon);
    },

    ajax_load: function(path, params, callback, $overlay_div, data_type, loading_icon) {
       if (typeof(params) == 'string') {
         params = $.secureEvalJSON(params);
       }

       var profile_start_time = 0;
       if (typeof(moksha_profile)!='undefined' && moksha_profile) {
           var date = new Date()
           profile_start_time = date.getTime();
       }
       var success = function(data, status) {
         var profile_callback_start_time = 0;

         if (profile_start_time) {
            var date = new Date();
            profile_callback_start_time = date.getTime();
         }

         if ($overlay_div != null && typeof($overlay_div) == 'object')
             $overlay_div.hide();

         callback(data);

         if (profile_start_time) {
            var date = new Date();
            var profile_end_time = date.getTime();
            var time_for_load = profile_callback_start_time - profile_start_time;
            var time_for_callback = profile_end_time - profile_callback_start_time;
            var total_time = profile_end_time - profile_start_time;

            moksha.info('loading "' + path + '" took ' + total_time + 'ms. (Load time: ' + time_for_load + 'ms, Processing time: ' + time_for_callback + 'ms)');
         }
       }

       var error = function(XMLHttpRequest, status, err) {
         // TODO: provide a reload link in the overlay
         if (typeof($overlay_div) == 'object') {
             var $msg = $('.message', $overlay_div);
             moksha.error(err);

             $msg.html('Error loading the data for this page element');
         }
       }

       // show loading
       if ($overlay_div != null && typeof($overlay_div) == 'object') {
           if (typeof(loading_icon) == 'undefined')
               loading_icon = '/images/spinner.gif';

           loading_icon = moksha.url(loading_icon);
           var $msg = $('.message', $overlay_div);
           // FIXME: make this globally configurable
           $msg.html('<img src="'+ loading_icon + '"></img>');

           var $parent = $overlay_div.parent();
           $overlay_div.css({'height': $parent.height(),
                             'width': $parent.width()})
           $overlay_div.show();
       }

       o = {
            'url': path,
            'data': params,
            'success': success,
            'error': error,
            'dataType': data_type
           }

       return $.ajax(o);
    },

    debug: function(msg) {
      if (typeof(console) != 'undefined' && typeof(console.log) != 'undefined' && typeof(moksha_debug) != 'undefined' && moksha_debug) {
          // TODO: make this configurable (or perhaps just overriding this
          //       method is enough

          console.log(msg);
      }
    },

    error: function(msg) {
         // TODO: Make this do something to indicate it is different from a
         //       warning or info message
         moksha.debug(msg);
    },

    warn: function(msg) {
         // TODO: Make this do something to indicate it is different from a
         //       error or info message
         moksha.debug(msg);
    },

    log: function(msg) {
         moksha.debug(msg);
    },

    info: function(msg) {
         // TODO: Make this do something to indicate it is different from a
         //       warning or error message
         moksha.debug(msg);
    },

    shallow_clone: function(obj) {
        var i;
        for (i in obj) {
            this[i] = obj[i];
        }
    },

    get_base_url: function(obj) {
        var burl = '/';

        if (typeof(moksha_base_url) != 'undefined')
            burl = moksha_base_url;

        return burl;
    },

    url: function(url, params) {
       if (typeof(params) == 'undefined')
            params = {};

       var purl = moksha.parseUri(url);

       if (!purl.protocol) {
           var burl = moksha.get_base_url();
           purl.prepend_base_url(burl);
           purl.update_query_string(params);

       }

       return purl.toString();
    },

    /***********************************************************
     * Defers execution of a function so we don't block the UI.
     * The function is placed in a stack and a timer is started
     * Every time the timer goes off a function is popped off the
     * stack and executed.
     *
     * scope - what the "this" variable evaluates to when the
     *         function is called
     * func - the function to be executed.  return values are
     *        ignored
     * args - a list of arguments to pass to the function
     ************************************************************/
    defer: function(scope, func, args) {
      var defer_time = 1; // ms
      var timeout = function () {
          var closure = _moksha_deferred.shift();
          var _self = closure[0];
          var f = closure[1];
          var args = closure[2];
          if (!args)
            args = [];

          f.apply(_self, args);
          if (_moksha_deferred.length > 0)
            setTimeout(timeout, defer_time);
      }

      _moksha_deferred.push([scope, func, args]);

      if (_moksha_deferred.length == 1)
        setTimeout(timeout, defer_time);
    },

    /*************************************************************
     * Updates a component of the title
     *
     * label - the text to add into the title
     * level - which component to update (e.g. if you have a two
     *         component title "Moksha" and "Updates" it will be
     *         displayed as "Updates - Moksha" if you then call
     *         moksha.update_title("Builds", 1) it will be rendered
     *         as "Builds - Moksha".  level is a 0 based index so
     *         level 0 == "Moksha"
     **************************************************************/

    title: [],
    update_title: function(label, level) {
        var title = moksha.title;
        var i;

        title.length = level + 1;
        title[level] = label;

        var title_str = '';
        for(i=title.length - 1; i > 0; i--) {
            title_str += title[i] + ' - ';
        }

        title_str += title[0];
        document.title = title_str;

        moksha.title = title;
    },

    view_source: function(widget) {
        $.ajax({
            url: '/widgets/code_widget?chrome=True&source='+widget,
            success: function(r, s) {
                $('body').append(moksha.filter_resources(r));
            }
        });
        return false;
    },

    view_module_source: function(widget) {
        $.ajax({
            url: '/widgets/code_widget?chrome=True&module=True&source='+widget,
            success: function(r, s) {
                $('body').append(moksha.filter_resources(r));
            }
        });
        return false;
    },

    send_message: function(topic, body) {
        if (typeof(moksha_amqp_session) != 'undefined') {
            moksha_amqp_session.Message('transfer', {
                accept_mode: 1,
                acquire_mode: 1,
                destination: 'amq.topic',
                _body: JSON.stringify(body),
                _header: {
                    delivery_properties: {
                        routing_key: topic
                    }
                }
            });
        } else {
            stomp.send(JSON.stringify(body), topic)
        }
    },

    on_enter: function(e, callback) {
        var key = e.keyCode || e.which;
        if (key == 13) {
            callback(e);
        }
    }

}

})();
