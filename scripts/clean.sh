rm -rf node_modules
rm -rf dist
rm -rf build

cd app/backend || exit
rm -rf node_modules
rm -rf dist
rm -rf build

cd ../..
cd app/frontend || exit
rm -rf node_modules
rm -rf dist
rm -rf build