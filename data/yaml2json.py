#!/usr/bin/env python
""" Convert our apps.yaml file to JSON, to stdout. """

import yaml
import json

next_id = 0

def recursively_assign_ids(d):
    global next_id
    d['id'] = next_id
    next_id = next_id + 1

    if 'children' in d:
        d['children'] = map(recursively_assign_ids, d['children'])

    return d

if __name__ == '__main__':
    with open("apps.yaml", "r") as f:
        d = yaml.load(f.read())
        d = recursively_assign_ids(d)
        print "var json = " + json.dumps(d, indent=2)
