#!/usr/bin/env python
""" Convert our apps.yaml file to JSON, to stdout. """

import yaml
import json

next_id = 0

def mangle(d):
    global next_id
    d['id'] = next_id
    next_id = next_id + 1

    if 'icon' in d:
        prefix = "<img class='icon' src='img/icons/%s' />" % d['icon']
        d['name'] = "%s %s" % (prefix, d['name'])

    if 'children' in d:
        d['children'] = map(mangle, d['children'])

    return d

if __name__ == '__main__':
    with open("apps.yaml", "r") as f:
        d = yaml.load(f.read())
        d = mangle(d)
        print "var json = " + json.dumps(d, indent=2)
