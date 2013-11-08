/*globals suite: true, test: true, setup: true, teardown: true, assertEq: true, print: true, run: true, Components: true, load: true*/
load('testframework.js');

var context = {};
Components.utils.import('../modules/ListReceiver.jsm', context);

suite("Test list receiver", function () {
    "use strict";
    var listReceiver = null;

    setup(function () {
        var listReceiver = new context.ListReceiver();
    });

    teardown(function () {
        listReceiver = null;
    });

    test('listReceiverEvents should be an object', function () {
        assertEq(typeof context.listReceiverEvents, 'object');
    });

    test('requestErrorEvent should be defined as a string which is longer then 0', function () {
        assertEq(typeof context.listReceiverEvents.requestErrorEvent, 'string');
        assertEq(context.listReceiverEvents.requestErrorEvent.length > 0, true);
    });

    test('requestStartEvent should be defined as a string which is longer then 0', function () {
        assertEq(typeof context.listReceiverEvents.requestStartEvent, 'string');
        assertEq(context.listReceiverEvents.requestStartEvent.length > 0, true);
    });

    test('listProcessDoneEvent should be defined as a string which is longer then 0', function () {
        assertEq(typeof context.listReceiverEvents.listProcessDoneEvent, 'string');
        assertEq(context.listReceiverEvents.listProcessDoneEvent.length > 0, true);
    });

    test('events should have different names', function () {
        assertEq(context.listReceiverEvents.listProcessDoneEvent !== context.listReceiverEvents.requestErrorEvent, true);
        assertEq(context.listReceiverEvents.requestStartEvent !== context.listReceiverEvents.requestErrorEvent, true);
        assertEq(context.listReceiverEvents.requestStartEvent !== context.listReceiverEvents.listProcessDoneEvent, true);
    });

    /*
    test('async test', function (done) {
        setTimeout(function () {
            print('joo');
        }, 100);
    });
    */
});

run();
