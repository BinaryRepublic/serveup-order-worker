'use strict';
const socketIO = require('socket.io');
const AuthApiInterface = require('./AuthApiInterface');

class SocketController {
    constructor () {
        this.clients = [];
        let authApi = new AuthApiInterface();
        this.socket = socketIO();
        this.socket.use((socket, next) => {
            let token = socket.handshake.query.token;
            if (token) {
                authApi.access(token).then(resp => {
                    next();
                }).catch((err) => {
                    let error = {
                        type: 'ACCESS_TOKEN_INVALID',
                        msg: 'Please send a valid access-token in the socket query'
                    };
                    next(new Error(JSON.stringify(error)));
                });
            } else {
                let error = {
                    type: 'NO_ACCESS_TOKEN',
                    msg: 'Please send a valid access-token in the socket query'
                };
                next(new Error(JSON.stringify(error)));
            }
        });
        this.socket.on('connect', this.onConnect.bind(this));
        this.socket.listen(9000);
    }
	onConnect(client) {
		client.on('restaurantId', this.onRestaurantId.bind(this, client))
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
		var restaurantId = order.restaurantId;
		var client = this.clients.find(this.findClient.bind(null, restaurantId));
		if(client) {
			client.emit('neworder', JSON.stringify(order));
		}
		else {
			console.error("emitNewOrder no client found for " + restaurantId);
		}
	}
	findClient(restaurantId, client) {
		if(client.restaurantId === restaurantId) {
			return client;
		}
	}
}
module.exports = SocketController;
