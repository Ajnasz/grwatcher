/*global BrowserToolboxCustomizeDone: true, window: true */
(function () {
    /**
    * initialization function
    */
    var scope = {},
        init;
    init = function () {
        Components.utils.import("resource://grwmodules/GRWWindows.jsm", scope);
        scope.grwWindows.add(window);

        Components.utils.import("resource://grwmodules/addToolbarButton.jsm", scope);
        scope.addToolbarButton(document, navigator, BrowserToolboxCustomizeDone);
    };
    window.addEventListener('load', init, false);
    window.addEventListener('unload', function (event) {
        Components.utils.import("resource://grwmodules/GRWWindows.jsm", scope);
        scope.grwWindows.remove(window);
        this.removeEventListener('load', init, false);
    }, false);
}());
