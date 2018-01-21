'use strict';
const RealmController = require('./src/RealmController.js');
const SocketController = require('./src/SocketController.js');

let socketController = new SocketController();
let realmController = new RealmController(function() {
	realmController.setupListener(function(newOrder){
		socketController.emitNewOrder(newOrder);
	});
});

