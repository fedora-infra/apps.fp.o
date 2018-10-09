#!/usr/bin/env python
""" Convert our apps.yaml file to JSON, to stdout. """

import os
import yaml
import json

next_id = 0


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


def mangle(d):
    global next_id
    d['id'] = next_id
    next_id = next_id + 1
    if not 'ipv6_only' in d:
        d['ipv6_only'] = False

    if 'children' in d:
        d['children'] = map(mangle, d['children'])

    return d

if __name__ == '__main__':
    filename = find_data_file()
    with open(filename, "r") as f:
        d = yaml.load(f.read())
        d = mangle(d)
        print json.dumps(d, indent=2)
