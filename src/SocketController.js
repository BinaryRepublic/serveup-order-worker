"use_strict"
const socketIO = require('socket.io');

class SocketController {
	constructor() {
		this.clientRestaurantObjects = [];
		this.socket = socketIO();
		this.socket.on('connect', this.onConnect.bind(this));
		this.socket.listen(9000);
	}
	onConnect(client) {
		client.on("restaurantId", this.onRestaurantId.bind(this, client))
		client.on('disconnect', this.onDisconnect.bind(this, client));
	}
	onRestaurantId(client, id) {
		var obj = {
			client:client,
			restaurantId:id
		}
		console.log("PUSH -> " + client.id);
		this.clientRestaurantObjects.push(obj);
		console.log("+ " + this.clientRestaurantObjects.length + " clients connected");
	}
	onDisconnect(client, reason) {
		var crObj = this.clientRestaurantObjectFromClient(client);
		if(crObj) {
			console.log("POP -> " + crObj.client.id);
			this.clientRestaurantObjects.pop(crObj);
		}
		else {
			for(var i = 0; i < this.clientRestaurantObjects.length; i++) {
				var crObj = this.clientRestaurantObjects[i];
				console.log("###" + crObj.client.id + "###")
			}
			console.error("onDisconnect no crObject found -> " + client.id);
		}
		console.log("- " + this.clientRestaurantObjects.length + " clients connected")
	}
	emitNewOrder(order) {
		var restaurantId = "abc123";//order.restaurantId;
		var crObj = this.clientRestaurantObjectFromRestaurantId(restaurantId);
		if(crObj) {
			crObj.client.emit('neworder', JSON.stringify(order));
		}
		else {
			console.error("emitNewOrder no crObject found")
		}
	}
	clientRestaurantObjectFromClient(client) {
		for(var i = 0; i < this.clientRestaurantObjects.length; i++) {
			var crObj = this.clientRestaurantObjects[i];
			if(crObj.client === client) {
				return crObj;
			}
		}
	}
	clientRestaurantObjectFromRestaurantId(id) {
		for(var i = 0; i < this.clientRestaurantObjects.length; i++) {
			var crObj = this.clientRestaurantObjects[i];
			if(crObj.restaurantId === id) {
				return crObj;
			}
		}
	}
}
module.exports = SocketController;