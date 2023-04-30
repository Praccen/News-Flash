#!/usr/bin/env sh
npm install
./node_modules/.bin/tsc -p tsconfig.json
rm -r /home/shaggy/public
mkdir /home/shaggy/public
cp * /home/shaggy/public/ -r
