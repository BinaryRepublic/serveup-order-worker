const io = require('socket.io-client');

var restID = process.argv[2];

const socket = io('http://localhost:9000');
socket.on('connect', function(){
	socket.emit("restaurantId", restID);
});
socket.on('neworder', function(order){
	console.log(order);
});
