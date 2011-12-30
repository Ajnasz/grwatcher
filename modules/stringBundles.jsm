var bundles = Components.classes["@mozilla.org/intl/stringbundle;1"]
                  .getService(Components.interfaces.nsIStringBundleService);
var strings = bundles.createBundle("chrome://grwatcher/locale/grwatcher.properties");

var scope = {};
Components.utils.import("resource://grwmodules/grwlog.jsm", scope);

var grwBundles = {
    getFormattedString: function (id, args) {
        scope.grwlog('formatted string: ', strings.formatStringFromName(id, args, args.length));
        return strings.formatStringFromName(id, args, args.length);
    }
}

let EXPORTED_SYMBOLS = ['grwBundles'];
