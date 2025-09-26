rm -rf node_modules
rm -rf dist
rm -rf build
rm -rf package-lock.json

cd app/backend || exit
rm -rf node_modules
rm -rf dist
rm -rf build

cd ../..
cd app/frontend || exit
rm -rf node_modules
rm -rf dist
rm -rf build