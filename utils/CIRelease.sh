#!/bin/bash

set -e

TARGET_WEB_URL="http://localhost:4444/"
PARALLEL_TEST_CONNECTIONS=10

NPM_LOCAL_REGISTRY_URL_NO_PROTOCOL="localhost:4873"
NPM_LOCAL_REGISTRY_URL="http://${NPM_LOCAL_REGISTRY_URL_NO_PROTOCOL}/"

ROOT_DIR=`pwd`
CREATE_MERKUR_WIDGET_DIR="$ROOT_DIR/packages/create-widget"
PACKAGE_VERSION=`node -e "console.log(require('./lerna.json').version)"`-next
PACKAGES="core integration integration-react plugin-component plugin-error plugin-event-emitter plugin-http-client plugin-router tools"

# Install dependencies
npm i verdaccio@4.8.1 autocannon@6.5.0 --no-save

# Setup local registry
node_modules/.bin/verdaccio -l "$NPM_LOCAL_REGISTRY_URL_NO_PROTOCOL" -c utils/verdaccioConfig.yml >/dev/null &
NPM_LOCAL_REGISTRY_PID=$!

npm config set "//$NPM_LOCAL_REGISTRY_URL_NO_PROTOCOL/:_authToken" "0"

# Release @merkur packages to local registry
for PACKAGE in $PACKAGES ; do
    cd "$ROOT_DIR/packages/$PACKAGE"
    echo "Working on $PACKAGE"

    sed -i "s#\"version\":\s\".*\"#\"version\": \"$PACKAGE_VERSION\"#" package.json

    for PACKAGE_UPDATE in $PACKAGES ; do
        sed -i "s#\"@merkur/$PACKAGE_UPDATE\":\s\".*\"#\"@merkur/$PACKAGE_UPDATE\": \"$PACKAGE_VERSION\"#" package.json
    done
    
    sed -i "s#https://registry.npmjs.org/#${NPM_LOCAL_REGISTRY_URL}#" package.json
    npm publish --registry $NPM_LOCAL_REGISTRY_URL
done

# Install @merkur scoped packages from local registry
npm config set @merkur:registry=$NPM_LOCAL_REGISTRY_URL

# Bump @merkur versions
cd "$ROOT_DIR"
node utils/bumpVersion.js

# Link current @merkur/create-widget version to global scope
cd "$CREATE_MERKUR_WIDGET_DIR"
npm link

# Setup app from example feed
cd "$ROOT_DIR"
npx @merkur/create-widget my-widget --view preact
cd my-widget

npm run build
npm run test

# start widget
npm start &
MERKUR_WIDGET_PID=$!

sleep 10

# Run test
cd "$ROOT_DIR"
node_modules/.bin/autocannon -c $PARALLEL_TEST_CONNECTIONS --no-progress "$TARGET_WEB_URL"

# Cleanup
npm config delete @merkur:registry
kill $NPM_LOCAL_REGISTRY_PID
kill $MERKUR_WIDGET_PID