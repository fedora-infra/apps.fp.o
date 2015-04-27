apps.fp.o
=========

A dynamic landing page for http://apps.fedoraproject.org

Idea
----

Right now, the apps side of Fedora Infrastructure feels scattered and all over
the place.  It seems like I learn that a new thing exists every couple weeks and
it seems like there's not a single easy place where you can stumble into
everything.

That's what this page is for.  I'm kind of barging ahead with it without
consulting anyone else yet but I fully intend to take in criticism (and patches,
really!) to make it more awesome and reflective of the community's desires.

You can see a demo version up at https://apps.stg.fedoraproject.org/ right
now.

Setup
-----

To deploy, configure in data/apps.yaml, and run bin/compile-templates.py
and redirect the output from bin/yaml2json.js to js/data.js

IPv6-only
---------

Sometimes you may have services that are only available over IPv6.
In such situations, you can mark those as ipv6_only: true in the yaml
and making your webserver serve a different version of is_ipv6.js for IPv6
and IPv4.

One way to do this is by redirecting the requests to this file to another vhost,
and have that vhost serve a different root directory for IPv4 vs IPv6.


Help?
-----

If you want to help, please patch and enhance the ``data/apps.yaml`` file.  You
probably know more about :sparkles: Fedora :sparkles: than I do.

Fork?
-----

If you want to use this for another community site, feel free.
Fork, tweak, and run the following to regenerate some of the static
pieces from ``data/apps.yaml``::

    python bin/yaml2html.py > apps-yaml.html
    python bin/yaml2json.py > js/data.js

Contact
-------

Stop into ``#fedora-apps`` on freenode and say "hello".
