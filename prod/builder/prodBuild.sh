jspm bundle-sfx client/scripts/geography/main + client/scripts/plugins/facebook + client/scripts/plugins/socialLinks + client/scripts/plugins/twitter prod/app.js
uglifyjs prod/app.js --mangle --output prod/app.js
rm -rf prod/*.map