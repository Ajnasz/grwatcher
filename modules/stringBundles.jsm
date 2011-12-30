var bundles = Components.classes["@mozilla.org/intl/stringbundle;1"]
                  .getService(Components.interfaces.nsIStringBundleService);
var strings = bundles.createBundle("chrome://grwatcher/locale/grwatcher.properties");

var grwBundles = {
    getFormattedString: function (id, args) {
        return strings.formatStringFromName(id, args, args.length);
    }
}

let EXPORTED_SYMBOLS = ['grwBundles'];
