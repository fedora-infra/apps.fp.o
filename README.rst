apps.fp.o
=========

A dynamic landing page for http://apps.fedoraproject.org

Build
-----

Run ``build.sh``. Requires PyYAML to be installed.

Help?
-----

If you want to help, please patch and enhance the ``data/apps.yaml`` file.  You
probably know more about :sparkles: Fedora :sparkles: than I do.

Fork?
-----

If you want to use this for another community site, feel free.
Fork, tweak, and run the following to regenerate some of the static
pieces from ``data/apps.yaml``::

    python yaml2json.py > data/data.json
    python yaml2js.py > js/data.js

Contact
-------

Stop into ``#fedora-apps`` on freenode and say "hello".
