#!/bin/bash
########################## Configuration ################################
if [ -z $1 ];then
  GRWVER='0.0.15a';
else
  GRWVER=$1;
fi

START_DIR=`pwd`;
TMP_DIR=/tmp;
BUILD_DIR=$TMP_DIR/grwatcher_$GRWVER;
######################## Configuration END ##############################

function cleanBuild {
  if [ -d $BUILD_DIR ];then
    echo "Delete build dir";
    rm -rf $BUILD_DIR;
  fi
}
function buildXPI {
  echo "Creating Hupper installation package";
  cd chrome;
  if [ -f grwatcher.jar ];then
    echo "Delete grwatcher.jar";
    rm grwatcher.jar;
  fi;
  zip -r grwatcher.jar content/* -x \*.svn/\*;
  zip -r grwatcher.jar locale/* -x \*.svn/*;
  zip -r grwatcher.jar skin/* -x \*.svn/\*;

  cd ..;
  echo "Build package grwatcher.xpi";
  rm grwatcher.xpi;
  zip grwatcher.xpi chrome.manifest install.rdf chrome/grwatcher.jar defaults/preferences/grwatcher.js license.txt -x \*.svn/\*

  echo "Replace old XPIs with the new one";
  if [ -f $START_DIR/grwatcher.xpi ];then
    rm $START_DIR/grwatcher.xpi;
  fi;
  cp grwatcher.xpi $START_DIR/;
  echo "Build finished!";
}
function setVersion {
  if [ `pwd` != $BUILD_DIR ];then
    cd $BUILD_DIR;
  fi
  echo "Set version to $GRWVER";
  sed "s/###VERSION###/$GRWVER/g" install.rdf > install.rdf.tmp;
  mv install.rdf.tmp install.rdf;
  sed "s/###VERSION###/$GRWVER/g" chrome/content/ajax.js > chrome/content/ajax.js.tmp;
  mv chrome/content/ajax.js.tmp chrome/content/ajax.js;
}

if [ -d $TMP_DIR ];then
  cleanBuild;
  echo "Copy current files from $START_DIR to $BUILD_DIR dir to build package";
  cp -R $START_DIR $BUILD_DIR;
  cd $BUILD_DIR;
  setVersion;
  buildXPI;
  cleanBuild;
  exit 0;
else
  echo "Temp dir not found, exit";
  exit 1;
fi
