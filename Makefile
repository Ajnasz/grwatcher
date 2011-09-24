PROJECT_NAME = 'grwatcher'

# Variables to generate version string
DATESTR = $(shell date '+%g%m%d%H%M%S')
GIT_BRANCH = $(shell git branch | awk '/\*/ {print $$2}')
GIT_SHA = $(shell git log --pretty=%h -n 1)
VERSION = 1.6-$(DATESTR)-$(GIT_BRANCH).$(GIT_SHA)

REPLACE_VERSION_STRING = ___VERSION___
REPLACE_VERSION_FILES = install.rdf
REPLACE_VERSION_FILES += modules/getter.jsm

all: clean setversion xpi restore

clean:
	@echo Clean
	@-rm $(PROJECT_NAME)*.xpi

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
		modules/tooltip.jsm \
		modules/JSON.jsm \
		modules/augment.jsm \
		modules/generateUri.jsm \
		modules/prefs.jsm \
		modules/grwlog.jsm \
		modules/timer.jsm \
		modules/getter.jsm \
		modules/mapwindows.jsm \
		modules/getactivegrw.jsm \
		modules/StatusIcon.jsm \
		modules/GrwCookie.jsm \
		modules/IconClick.jsm \
		modules/TooltipHandler.jsm \
		modules/passManager.jsm \
		modules/MenuClick.jsm \
		modules/EventProvider.jsm \
		modules/CustomEvent.jsm \
		modules/GridProvider.jsm \
		modules/OpenReader.jsm \
		modules/addToolbarButton.jsm \
		modules/getter.jsm \
		modules/getToken.jsm \
		modules/request.jsm \
		modules/Requester.jsm \
		modules/getList.jsm \
		modules/Notifier.jsm \
		modules/userinfo.jsm \
		modules/MarkAllAsRead.jsm \
		modules/loginmanager.jsm \
		modules/grwMenu.jsm \
		modules/GrwTooltipGrid.jsm \
		modules/iconCounter.jsm \
		defaults/preferences/grwatcher.js \
		chrome/ \
		license.txt;

restore:
	@echo Restore orignal files
	@for file in $(REPLACE_VERSION_FILES); do mv $${file}.orig $${file}; done

.PHONY: clean setversion restore
