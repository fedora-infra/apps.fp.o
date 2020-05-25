#!/usr/bin/env python
""" Convert our apps.yaml file to raw HTMl, to stdout. """


import os
import yaml


def find_data_file():
    name = "apps.yaml"
    locations = [
        os.path.abspath('./data'),
        '/usr/share/apps-fp-o',
    ]
    for location in locations:
        filename = location + '/' + name
        if os.path.exists(filename):
            return filename

    raise IOError("No config file found %r %r" % (locations, name))

if __name__ == '__main__':
    filename = find_data_file()
    with open(filename, "r") as f:
        raw = f.read()
        print("""<html><body>

<!--
Don't edit this html file, edit data/apps.yaml
instead and regenerate this file with yaml2html.py
-->

<pre>
%s
</pre>
</body></html>""" % raw)
