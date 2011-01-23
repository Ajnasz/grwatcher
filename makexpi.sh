#!/bin/bash
########################## Configuration ################################
if [ -z $1 ];then
  VER='1.4'`date '+%Y%m%d%H%M%S'`'-'`./getver.pl`;
else
  VER=$1;
fi

PROJECT_NAME='grwatcher';
START_DIR=`pwd`;
DOWNLOAD_DIR='/var/www/grwatcher/cvs/downloads';
TMP_DIR=/tmp;
BUILD_DIR=$TMP_DIR/$PROJECT_NAME'_'$VER;
######################## Configuration END ##############################

function cleanBuild {
  if [ -d $BUILD_DIR ];then
    echo "Delete build dir";
    rm -rf $BUILD_DIR;
  fi
}
function buildXPI {
  echo "Creating $PROJECT_NAME installation package";
  cd chrome;
  if [ -f $PROJECT_NAME.jar ];then
    echo "Delete $PROJECT_NAME.jar";
    rm $PROJECT_NAME.jar;
  fi;
  zip -r $PROJECT_NAME.jar content/*;
  zip -r $PROJECT_NAME.jar locale/*;
  zip -r $PROJECT_NAME.jar skin/* -x -x \*.svg -x \*.xcf;

  cd ..;
  echo "Build package $PROJECT_NAME.xpi";
  rm $PROJECT_NAME*.xpi;
  zip $PROJECT_NAME.xpi chrome.manifest install.rdf \
    modules/tooltip.jsm \
    modules/JSON.jsm \
    modules/Augment.jsm \
    modules/EventProvider.jsm \
    modules/CustomEvent.jsm \
    modules/GridProvider.jsm \
    chrome/$PROJECT_NAME.jar \
    defaults/preferences/$PROJECT_NAME.js \
    license.txt;

  echo "Replace old XPIs with the new one";
  if [ -d $DOWNLOAD_DIR ]; then
    if [ -f $DOWNLOAD_DIR/$PROJECT_NAME'_'$VER.xpi ];then
      rm $DOWNLOAD_DIR/$PROJECT_NAME'_'$VER.xpi;
    fi;
    cp $PROJECT_NAME.xpi $DOWNLOAD_DIR/$PROJECT_NAME'_'$VER.xpi;
  else
    echo "Warning: Download dir does not exists!";
  fi;
  #if [ -f $START_DIR/$PROJECT_NAME.xpi ];then
    rm $START_DIR/$PROJECT_NAME*.xpi;
  #fi;
  cp $PROJECT_NAME.xpi $START_DIR/$PROJECT_NAME$VER.xpi;
  echo "Build finished!";
}
function setVersion {
  if [ `pwd` != $BUILD_DIR ];then
    cd $BUILD_DIR;
  fi
  echo "Set version to $VER";

  sed "s/###VERSION###/$VER/g" install.rdf > install.rdf.tmp;
  mv install.rdf.tmp install.rdf;

  sed "s/###VERSION###/$VER/g" chrome/content/ajax.js > chrome/content/ajax.js.tmp;
  mv chrome/content/ajax.js.tmp chrome/content/ajax.js;

  sed "s/###VERSION###/$VER/g" chrome/content/grwatcher.js > chrome/content/grwatcher.js.tmp;
  mv chrome/content/grwatcher.js.tmp chrome/content/grwatcher.js;
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
