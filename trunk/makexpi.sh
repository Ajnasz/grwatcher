#!/bin/bash

cd chrome;
zip -r grwatcher.jar content/* -x *.svn/*;
zip -r grwatcher.jar locale/* -x *.svn/*;
zip -r grwatcher.jar skin/* -x *.svn/*;
cd ..;
zip grwatcher.xpi chrome.manifest install.rdf chrome/grwatcher.jar defaults/preferences/grwatcher.js license.txt -x *.svn/*
