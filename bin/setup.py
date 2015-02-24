#!/usr/bin/env python
""" Create files from templates. """

from yaml2data import get_data


if __name__ == '__main__':
    d = get_data()
    with open('index.html.in', 'r') as f:
        index_tmpl = f.read()
    index = index_tmpl
    index = index.replace('{{ NAME }}', d['name'])
    index = index.replace('{{ LOGO }}', d['logo'])
    with open('index.html', 'w') as f:
        f.write(index)
