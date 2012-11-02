#!/usr/bin/env python
""" Convert our apps.yaml file to raw HTMl, to stdout. """

import yaml

if __name__ == '__main__':
    with open("apps.yaml", "r") as f:
        raw = f.read()
        print """<html><body>

<!--
Don't edit this html file, edit data/apps.yaml
instead and regenerate this file with yaml2html.py
-->

<pre>
%s
</pre>
</body></html>""" % raw
