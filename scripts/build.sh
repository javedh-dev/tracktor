#!/bin/sh
set -e

rm -rf build/
mkdir -p build/frontend/ build/backend/

npm install
npm run build --workspaces --if-present

cp -r app/frontend/build/* build/frontend/
cp -r app/backend/build/* build/backend/
cp -r app/backend/migrations build/backend
cp -r scripts/start.sh build/

cp package.json build/
cp app/backend/package.json build/backend/package.json

cd build/backend 
npm install --omit=dev --ignore-scripts