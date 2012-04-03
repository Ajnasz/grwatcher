PROJECT_NAME = 'grwatcher'

# Variables to generate version string
DATESTR = $(shell date '+%g%m%d%H%M%S')
GIT_BRANCH = $(shell git branch | awk '/\*/ {print $$2}')
GIT_SHA = $(shell git log --pretty=%h -n 1)
VERSION = 1.7-$(DATESTR)-$(GIT_BRANCH).$(GIT_SHA)

REPLACE_VERSION_STRING = ___VERSION___
REPLACE_VERSION_FILES = install.rdf
REPLACE_VERSION_FILES += modules/getter.jsm


build-release: clean build-localizations-release setversion xpi restore
build-babelzilla: clean build-localizations-babelzilla setversion xpi restore

all: build-release

clean:
	@echo Clean
	@-rm $(PROJECT_NAME)*.xpi
	@-rm -rf chrome/locale

build-localizations-release:
	cd tools && ./dtdparser.pl release

build-localizations-babelzilla:
	cd tools && ./dtdparser.pl babelzilla

setversion:
	@echo Set version to $(VERSION)
	@for file in $(REPLACE_VERSION_FILES); do \
		cp $${file} $${file}.orig; \
		sed "s/$(REPLACE_VERSION_STRING)/$(VERSION)/g" $${file} > $${file}.tmp; \
		mv $${file}.tmp $${file}; \
	done

xpi:
	@echo Compress files
	@zip -r -q -MM $(PROJECT_NAME)_$(VERSION).xpi \
		chrome.manifest \
		install.rdf \
		modules/JSON.jsm \
		modules/augment.jsm \
		modules/generateUri.jsm \
		modules/prefs.jsm \
		modules/grwlog.jsm \
		modules/timer.jsm \
		modules/getter.jsm \
		modules/mapwindows.jsm \
		modules/passManager.jsm \
		modules/MenuClick.jsm \
		modules/EventProvider.jsm \
		modules/CustomEvent.jsm \
		modules/GridProvider.jsm \
		modules/OpenReader.jsm \
		modules/addToolbarButton.jsm \
		modules/getter.jsm \
		modules/request.jsm \
		modules/Requester.jsm \
		modules/getList.jsm \
		modules/Notifier.jsm \
		modules/userinfo.jsm \
		modules/MarkAllAsRead.jsm \
		modules/loginmanager.jsm \
		modules/grwMenu.jsm \
		modules/GrwTooltipGrid.jsm \
		modules/httpConnect.jsm \
		modules/siteLogin.jsm \
		modules/GRWWindow.jsm \
		modules/GRWWindows.jsm \
		modules/Oauth2.jsm \
		modules/ClientLogin.jsm \
		modules/stringBundles.jsm \
		defaults/preferences/grwatcher.js \
		chrome/skin/classic/grwatcher/tooltip.css \
		chrome/skin/classic/grwatcher/toolbar.css \
		chrome/skin/classic/grwatcher/statusbar.css \
		chrome/skin/classic/grwatcher/menu.css \
		chrome/skin/classic/grwatcher/preferences.css \
		chrome/skin/classic/grwatcher/images/active-toolbar-15.png \
		chrome/skin/classic/grwatcher/images/inactive-toolbar-15.png \
		chrome/skin/classic/grwatcher/images/error-toolbar-15.png \
		chrome/skin/classic/grwatcher/images/loading-toolbar-15.png \
		chrome/skin/classic/grwatcher/icons-sprite.png \
		chrome/skin/classic/grwatcher/loading-small.gif \
		chrome/skin/classic/grwatcher/grwatcher.png \
		chrome/locale \
		chrome/content/grwatcher.xul \
		chrome/content/grwatcher-old.xul \
		chrome/content/grwatcher.js \
		chrome/content/grprefs.js \
		chrome/content/grprefs.xul \
		license.txt;

restore:
	@echo Restore orignal files
	@for file in $(REPLACE_VERSION_FILES); do mv $${file}.orig $${file}; done

.PHONY: clean setversion restore
