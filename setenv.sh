#!/usr/bin/env bash

set -e

################################################
# Declare associative arrays for configuration #
################################################

declare -A EnvMap
EnvMap["master"]=dev
EnvMap["beta"]=staging
EnvMap["prod"]=production


declare -A TargetMap
TargetMap["master"]=trustedTesters
TargetMap["beta"]=trustedTesters

export ENV=${EnvMap[$TRAVIS_BRANCH]}

if  [ -z "$ENV"  ]; then
    IS_KNOWN_ENV=false
else
    IS_KNOWN_ENV=true
fi

export IS_KNOWN_ENV

export PUBLISH_TARGET=${TargetMap[$TRAVIS_BRANCH]}

echo "Is this a know environment ?  $IS_KNOWN_ENV"

echo "Publish traget is : $PUBLISH_TARGET"

echo "Build branch: $TRAVIS_BRANCH"