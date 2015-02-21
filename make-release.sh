#!/bin/bash

# Enable negative glob
shopt -s extglob

VERSION=1.2

rm -rf build
mkdir -p build/apps-fp-o-$VERSION
mkdir -p dist
cp -r !(build|dist) build/apps-fp-o-$VERSION/.
rm -rf build/apps-fp-o-$VERSION/{build,dist}
pushd build
tar -czvf ../dist/apps-fp-o-$VERSION.tar.gz apps-fp-o-$VERSION
popd

echo Wrote dist/apps-fp-o-$VERSION.tar.gz
