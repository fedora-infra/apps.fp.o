#!/bin/bash

mkdir -p build
cp -r {index.html,favicon.ico,css,img,js,data} build
python ./yaml2json.py > ./build/data/data.json
python ./yaml2js.py > ./build/js/data.js