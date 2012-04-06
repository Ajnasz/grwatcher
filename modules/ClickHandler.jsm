var scope = {};
Components.utils.import("resource://grwmodules/prefs.jsm", scope);
Components.utils.import("resource://grwmodules/EventProvider.jsm", scope);
Components.utils.import("resource://grwmodules/augment.jsm", scope);
function ClickHandler(elements) {
    this.elements = elements;
}

ClickHandler.prototype = {
    handleClick: function (e) {
        var o = ClickHandler.handleMouseCommand(e);
        if (o !== null) {
            this.fireEvent('eventFound', o);
            return true;
        }
        return false;
    },
    onClick: function (e) {
        var targetId = e.target.id;
        if (this.elements.some(function (id) {
                return id === targetId;
            })) {
            if (this.handleClick(e)) {
                e.preventDefault();
            }
        }
    }
};
scope.augmentProto(ClickHandler, scope.EventProvider);
ClickHandler.fakeEvent = function fakeEvent(data) {
    var ev = {
        button: 0,
        shiftKey: false,
        altKey: false,
        ctrlKey: false,
        target: null
    };
    scope.augmentObject(ev, data || {});
    return ev;
};
ClickHandler.handleMouseCommand = function handleMouseCommand(e) {
    var browserLike,
        possibilities,
        name,
        getPref,
        output,
        url,
        how;
    getPref = scope.prefs.get;

    browserLike = getPref.browserlikeWindowOpen();

    function keyFilter(key) {
        return key.button === e.button &&
            key.shift === e.shiftKey &&
            key.alt === e.altKey &&
            key.ctrl === e.ctrlKey;
    }
    output = null;
    name = null;
    how = null;
    if (browserLike) {
        possibilities = [
            {
                name: 'newBackgroundTab',
                keys: [
                    {
                        button: 1,
                        shift: false,
                        ctrl: false,
                        alt: false
                    },
                    {
                        button: 0,
                        ctrl: true,
                        shift: false,
                        alt: false
                    }
                ]
            },
            {
                name: 'newForegroundTab',
                keys: [
                    {
                        button: 1,
                        shift: true,
                        ctrl: false,
                        alt: false
                    },
                    {
                        button: 0,
                        shift: true,
                        ctrl: true,
                        alt: false
                    }
                ]
            },
            {
                name: 'currentTab',
                keys: [
                    {
                        button: 0,
                        shift: false,
                        ctrl: false,
                        alt: false
                    }
                ]
            },
            {
                name: 'newWindow',
                keys: [
                    {
                        button: 0,
                        shift: true,
                        ctrl: false,
                        alt: false
                    }
                ]
            }
        ];
        possibilities.forEach(function (keyGroup) {
            if (how || keyGroup.keys.some(keyFilter)) {
                how = how || keyGroup.name;
            }
        });
        if (how) {
            name = 'windowOpenRequest';
        }
    } else {
        switch (e.button) {
        case 0:
            name = 'windowOpenRequest';
            if (getPref.openInNewTab()) {
                if (getPref.activateOpenedTab()) {
                    how = 'newForegroundTab';
                } else {
                    how = 'newBackgroundTab';
                }
            } else {
                how = 'currentTab';
            }
            break;
        case 1:
            name = 'updateRequest';
            break;
        }
    }
    if (name) {
        url = e.target ? e.target.getAttribute('url') : null;
        output = [name, url || null, how];
    }
    return output;
};

var EXPORTED_SYMBOLS = ['ClickHandler'];
