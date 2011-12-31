/*global BrowserToolboxCustomizeDone: true, window: true */
(function () {
    /**
    * initialization function
    */
    var scope = {},
        init;
    Components.utils.import("resource://grwmodules/GRWWindows.jsm", scope);
    init = function () {
        scope.grwWindows.add(window);

        Components.utils.import("resource://grwmodules/addToolbarButton.jsm", scope);
        scope.addToolbarButton(document, navigator, BrowserToolboxCustomizeDone);
    };
    window.addEventListener('load', init, false);
    window.addEventListener('unload', function (event) {
        scope.grwWindows.remove(window);
        this.removeEventListener('load', init, false);
    }, false);
}());
