#!/bin/bash

set -e

TARGET_WEB_URL="http://localhost:4444/widget"
PARALLEL_TEST_CONNECTIONS=10

NPM_LOCAL_REGISTRY_URL_NO_PROTOCOL="localhost:4873"
NPM_LOCAL_REGISTRY_URL="http://${NPM_LOCAL_REGISTRY_URL_NO_PROTOCOL}/"

ROOT_DIR=`pwd`
CREATE_MERKUR_WIDGET_DIR="$ROOT_DIR/packages/create-widget"
PACKAGE_VERSION=`node -e "console.log(require('./lerna.json').version)"`-next
PACKAGES="cli core create-widget integration integration-react integration-custom-element plugin-component plugin-css-scrambler plugin-error plugin-event-emitter plugin-http-client plugin-router tools tool-storybook tool-webpack preact"

# Install dependencies
npm i verdaccio@4.8.1 autocannon@6.5.0 --no-save

# Setup local registry
node_modules/.bin/verdaccio -l "$NPM_LOCAL_REGISTRY_URL_NO_PROTOCOL" -c utils/verdaccioConfig.yml >/dev/null &
NPM_LOCAL_REGISTRY_PID=$!

echo "Local verdaccio running"

echo "$PWD"
npm config set "//$NPM_LOCAL_REGISTRY_URL_NO_PROTOCOL/:_authToken" "0"

# Release @merkur packages to local registry
for PACKAGE in $PACKAGES ; do
    cd "$ROOT_DIR/packages/$PACKAGE"
    echo "Working on $PACKAGE@$PACKAGE_VERSION"
    sed -i "s#\"version\":\s\".*\"#\"version\": \"$PACKAGE_VERSION\"#" package.json

    for PACKAGE_UPDATE in $PACKAGES ; do
        sed -i "s#\"@merkur/$PACKAGE_UPDATE\":\s\".*\"#\"@merkur/$PACKAGE_UPDATE\": \"$PACKAGE_VERSION\"#" package.json
    done

    sed -i "s#https://registry.npmjs.org/#${NPM_LOCAL_REGISTRY_URL}#" package.json
    npm publish --registry $NPM_LOCAL_REGISTRY_URL
done

# Install @merkur scoped packages from local registry
echo "set scoped packages"
echo "$PWD"
cd "$ROOT_DIR"
npm config set @merkur:registry=$NPM_LOCAL_REGISTRY_URL

echo "bump version"
# Bump @merkur versions
cd "$ROOT_DIR"
node utils/bumpVersion.js

# Link current @merkur/create-widget version to global scope
#cd "$CREATE_MERKUR_WIDGET_DIR"
# npm link

# Setup app from example feed
cd "$ROOT_DIR"
node packages/create-widget/bin/createWidget.mjs my-widget --view $1
#npx @merkur/create-widget my-widget --view preact
cd my-widget

npm run build
npm run test -- -- --u

# start widget
npm start &
MERKUR_WIDGET_PID=$!

sleep 5

# Run test
cd "$ROOT_DIR"
node_modules/.bin/autocannon -c $PARALLEL_TEST_CONNECTIONS --no-progress "$TARGET_WEB_URL"

# Cleanup
npm config delete @merkur:registry
kill $NPM_LOCAL_REGISTRY_PID
kill $MERKUR_WIDGET_PID
