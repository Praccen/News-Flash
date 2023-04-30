#!/usr/bin/env sh
npm install
echo "Compiling typescript..."
./node_modules/.bin/tsc -p tsconfig.json
echo "Recreate deploy dir..."
rm -r /home/shaggy/public
mkdir /home/shaggy/public
echo "Copying files..."
cp * /home/shaggy/public/ -r
