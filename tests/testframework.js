var Components = {
    utils: {
        import: function (file, context) {
            "use strict";
            var fn = file.replace('resource://grwmodules', '../modules'),
                sandbox = evalcx('');

            sandbox.Components = Components;
            evalcx(read(fn), sandbox);
            if (typeof context !== 'object') {
                throw new Error('Context must be an object');
            }

            sandbox.EXPORTED_SYMBOLS.forEach(function (name) {
                context[name] = sandbox[name];
            });
        }
    }
};

var testSuites = [];
var lastSuite;
function log(text, level) {
    "use strict";
    var s = '',
        l = level || 0;

    while (l--) {
        s += '  ';
    }

    print(s + text);
}
function suite(description, suiteStuff) {
    "use strict";

    var context = {
        description: description,
        tests: [],
        setup: null,
        teardown: null,
        setupDone: false,
        level: 0,
        suites: []
    };


    if (lastSuite && !lastSuite.setupDone) {
        context.level = lastSuite.level + 1;
        lastSuite.suites.push(context);
    } else {
        testSuites.push(context);
    }


    context.parent = lastSuite;
    lastSuite = context;

    suiteStuff();

    lastSuite = context.parent;

    context.setupDone = true;
}

function test(description, testStuff) {
    "use strict";

    var suite = lastSuite;

    suite.tests.push({
        description: description,
        test: testStuff,
        async: testStuff.length > 0
    });
}
function setup(setupStuff) {
    "use strict";
    var suite = lastSuite;

    if (suite.setup !== null) {
        throw new Error('Redefining suite setup');
    }
    suite.setup = setupStuff;
}

function teardown(teardownStuff) {
    "use strict";

    var suite = lastSuite;

    if (suite.teardown !== null) {
        throw new Error('Redefining suite teardown');
    }
    suite.teardown = teardownStuff;
}

function callSuite(testSuite) {
    "use strict";
    log(testSuite.description, testSuite.level);
    if (typeof testSuite.setup === 'function') {
        testSuite.setup();
    }

    testSuite.suites.forEach(callSuite);

    testSuite.tests.forEach(function (test) {
        log(test.description, testSuite.level + 1);
        try {
            /*
            if (test.async) {
                // print('this test would be async');
            }
            */
            test.test();
        } catch (er) {
            er.message += '\n' + test.description;
            er.test = test.test;
            throw er;
        }
    });
    if (typeof testSuite.teardown === 'function') {
        testSuite.teardown();
    }
}

function run() {
    "use strict";
    var testSuite;
    testSuites.forEach(callSuite);
}

