jspm bundle client/scripts/geography/main prod/geography.js --inject
uglifyjs prod/geography.js --mangle --output prod/geography.js
rm -rf prod/*.map