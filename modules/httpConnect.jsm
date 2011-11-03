/*global Components: true*/
var request = function (method, urlString, postData, onFinish) {
    try {
        var StreamListener, uri, channel, httpChannel, upl, uplChannel, stream,
            data, ioService;

        httpChannel = null;

        method = method || 'GET';

        ioService = Components.classes["@mozilla.org/network/io-service;1"]
            .getService(Components.interfaces.nsIIOService);

        data = '';
        StreamListener = function (aChannel) {
            var channel = aChannel,
                redirChannel;
            var scope = {}
            Components.utils.import('resource://grwmodules/grwlog.jsm', scope);
            return {
                onStatus: function (aRequest, aContext, aStatus, aStatusArg) {},
                onProgress: function (aRequest, aContext, aProgress, aProgressMax) {},
                onStartRequest: function (request, context) {},
                onStopRequest: function (request, context, statusCode) {
                    if (statusCode === Components.results.NS_BINDING_ABORTED) {
                        return;
                    }
                    onFinish(channel.responseStatus, data, redirChannel ? redirChannel.name : null);
                    // dump("Stream end: " + statusCode);
                },
                onRedirect: function (oldChannel, newChannel, flags) {
                },
                onChannelRedirect: function (oldChannel, newChannel, flags) {
                },
                asyncOnChannelRedirect: function (oldChannel, newChannel, flags, cb) {
                    redirChannel = newChannel;
                    // var listener = StreamListener(newChannel);
                    // newChannel.notificationCallbacks = StreamListener(newChannel);
                    // newChannel.asyncOpen(listener, null);
                    cb.onRedirectVerifyCallback(0);
                },
                onDataAvailable: function (request, context, inputStream, offset, length) {
                    var scriptableInputStream = Components
                      .classes["@mozilla.org/scriptableinputstream;1"]
                        .createInstance(Components.interfaces.nsIScriptableInputStream);
                    scriptableInputStream.init(inputStream);
                    data += scriptableInputStream.read(length);
                },
                // nsIInterfaceRequestor
                getInterface: function (aIID) {
                    try {
                        return this.QueryInterface(aIID);
                    } catch (e) {
                        throw Components.results.NS_NOINTERFACE;
                    }
                },

                QueryInterface: function (aIID) {
                    var Ci = Components.interfaces;
                    if (aIID.equals(Ci.nsISupports) ||
                        aIID.equals(Ci.nsIInterfaceRequestor) ||
                        aIID.equals(Ci.nsIChannelEventSink) ||
                        aIID.equals(Ci.nsIProgressEventSink) ||
                        aIID.equals(Ci.nsIHttpEventSink) ||
                        aIID.equals(Ci.nsIStreamListener) ||
                        aIID.equals(Ci.nsIAuthPromptProvider) ||
                        aIID.equals(Ci.nsIPrompt) || //not used but required in ff 2.0
                        aIID.equals(Ci.nsIDocShell) || //required in ff 3.0
                        aIID.equals(Ci.nsIAuthPrompt)) {
                        return this;
                    }
                //dout("QueryInterface "+aIID);
                    throw Components.results.NS_NOINTERFACE;
                }
            }
        };

        uri = ioService.newURI(urlString, null, null);
        channel = ioService.newChannelFromURI(uri);
        if (postData) {
            httpChannel = channel.QueryInterface(Components.interfaces.nsIHttpChannel);
            upl = Components.classes["@mozilla.org/io/string-input-stream;1"]
                            .createInstance(Components.interfaces.nsIStringInputStream);
            upl.setData(postData, postData.length);
            uplChannel = channel.QueryInterface(Components.interfaces.nsIUploadChannel);
            uplChannel.setUploadStream(upl, "application/x-www-form-urlencoded", -1);
            method = 'POST';
            httpChannel.requestMethod = method;
        }
        var listener = StreamListener(channel);
        channel.notificationCallbacks = listener;
        channel.asyncOpen(listener, httpChannel);
    } catch (e) {
        Components.utils.reportError(e);
    }
};
var httpPost = function (urlString, postData, onFinish) {
  request('POST', urlString, postData, onFinish);
};
var httpGet = function (urlString, onFinish) {
  request('GET', urlString, null, onFinish);
};

let EXPORTED_SYMBOLS = ['httpPost', 'httpGet'];
