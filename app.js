'use strict';
const RealmController = require('./src/realm/RealmController.js');

let realmController = new RealmController("./DataRealm", function(newOrder) {
	console.log("New order: " + JSON.stringify(newOrder));
});
