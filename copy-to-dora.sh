#!/bin/bash
cd `dirname $0`
rm ../dora-engine/public/wave-analyzer/index.html
rm ../dora-engine/public/static/js/main-wave-analyzer.*.js
rm ../dora-engine/public/static/css/main-wave-analyzer.*.css
cp ./build/index.html ../dora-engine/public/wave-analyzer/
cp ./build/static/js/main-*.js ../dora-engine/public/static/js/
cp ./build/static/css/main-*.css ../dora-engine/public/static/css/
