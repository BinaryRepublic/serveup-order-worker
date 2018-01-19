'use strict';
const RealmController = require('./src/RealmController.js');
const socketIO = require('socket.io');

var socket = socketIO();
socket.on('connection', function(client){
	console.log("client on 9000");
});
socket.listen(9000);

let realmController = new RealmController(function() {
	realmController.setupListener(function(newOrder){
		socket.emit('neworder', JSON.stringify(newOrder));
	});
});

