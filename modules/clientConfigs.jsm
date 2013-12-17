var clientConfigs = {
	google: {
		userinfoURI: ['www.google.com/reader/api/0/user-info'],
        clientID: '18154408674.apps.googleusercontent.com',
        clientSecret: '7uN4ujGfnbItwS6NbqWgbEJ5',
        oAuthURL: 'https://accounts.google.com/o/oauth2/auth',
        oAuthTokenURL: 'https://accounts.google.com/o/oauth2/token',
        scope: 'https://www.google.com/reader/api/0',
        windowName: 'GRWatcher Auth request',
        windowParams: 'location=yes,status=yes,width=500,height=410',
        redirectUri: 'urn:ietf:wg:oauth:2.0:oob',
        readerURL: 'www.google.com/reader/view',
        markAsReadUrl: 'www.google.com/reader/api/0/mark-all-as-read?client=scroll',
        subscriptionPrefix: '#stream',
        minCheckFreq: 1
	},
	feedlySandbox: {
		userinfoURI: ['sandbox.feedly.com/v3/profile'],
        clientID: 'sandbox',
        clientSecret: 'Z5ZSFRASVWCV3EFATRUY', // expires 12/1/2013
        oAuthURL: 'https://sandbox.feedly.com/v3/auth/auth',
        oAuthTokenURL: 'http://sandbox.feedly.com/v3/auth/token',
        scope: 'https://cloud.feedly.com/subscriptions',
        windowName: 'Feedly Auth request',
        windowParams: 'location=yes,status=yes,width=500,height=410',
        // redirectUri: 'http://localhost',
        redirectUri: 'urn:ietf:wg:oauth:2.0:oob',
        readerURL: 'sandbox.feedly.com/',
        markAsReadUrl: 'sandbox.feedly.com/v3/markers',
        categoriesUrl: 'sandbox.feedly.com/v3/categories',
        subscriptionsUrl: 'sandbox.feedly.com/v3/subscriptions',
        streamEntryUrl: 'sandbox.feedly.com/v3/streams/xSTREAMIDx/ids',
        markAsReadParams: {
            action: 'markAsRead'
            // lastReadEntryId: 'xUSERIDx'
        },
        subscriptionPrefix: '#subscription',
        minCheckFreq: 30
	}
};
var clientConfig = clientConfigs.feedlySandbox;


var EXPORTED_SYMBOLS = ['clientConfig'];
