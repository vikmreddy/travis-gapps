#!/usr/bin/env bash

set -e

npm i @google/clasp -g
grunt clasp_cred --env=$ENV --clasp_refresh_token=$CLASP_REFRESH_TOKEN
cp .clasprc.json ~/.clasprc.json
grunt publishAddon --env=$ENV --ws_client_id=$CLIENT_ID --ws_client_secret=$CLIENT_SECRET --ws_refresh_token=$REFRESH_TOKEN --last_commit=$TRAVIS_COMMIT --webstore_target=$PUBLISH_TARGET
