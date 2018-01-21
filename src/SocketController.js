"use_strict"
const socketIO = require('socket.io');

class SocketController {
	constructor() {
		this.clients = [];
		this.socket = socketIO();
		this.socket.on('connect', this.onConnect.bind(this));
		this.socket.listen(9000);
	}
	onConnect(client) {
		client.on("restaurantId", this.onRestaurantId.bind(this, client))
		client.on('disconnect', this.onDisconnect.bind(this, client));
	}
	onRestaurantId(client, id) {
		client.restaurantId = id;
		this.clients.push(client);
		console.log("+ " + this.clients.length + " clients connected");
	}
	onDisconnect(client, reason) {
		this.clients.pop(client);
		console.log("- " + this.clients.length + " clients connected")
	}
	emitNewOrder(order) {
		var restaurantId = "abc123";//order.restaurantId;
		var client = this.clientFromRestaurantId(restaurantId);
		if(client) {
			client.emit('neworder', JSON.stringify(order));
		}
		else {
			console.error("emitNewOrder no client found for " + restaurantId);
		}
	}
	clientFromRestaurantId(id) {
		for(var i = 0; i < this.clients.length; i++) {
			var clientObj = this.clients[i];
			if(clientObj.restaurantId === id) {
				return clientObj;
			}
		}
	}
}
module.exports = SocketController;