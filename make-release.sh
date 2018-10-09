#!/bin/bash

# Enable negative glob
shopt -s extglob

VERSION=3.0

rm -rf build
rm -rf ./apps-fp-o-*.tar.gz
tar -czvf ./apps-fp-o-$VERSION.tar.gz ./
echo Wrote dist/apps-fp-o-$VERSION.tar.gz
