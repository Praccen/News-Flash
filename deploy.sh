#!/usr/bin/env sh
npm install
echo "Compiling typescript..."
npm run build
echo " Hacky copy of extra files..."
cp code/libs out/ -r
cp Assets out/ -r
cp index.css out/
echo "Recreate deploy dir..."
rm -r /home/shaggy/public
mkdir /home/shaggy/public
echo "Copying files..."
cp out/* /home/shaggy/public/ -r
