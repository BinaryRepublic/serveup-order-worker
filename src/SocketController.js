'use strict';
const socketIO = require('socket.io');
const AuthApiInterface = require('./AuthApiInterface');
const Authorization = require('./Authorization');

class SocketController {
    constructor () {
        this.clients = [];
        this.accountId = null;
        this.authorization = new Authorization();
        // authentication middleware
        let authApi = new AuthApiInterface();
        this.socket = socketIO();
        this.socket.use((socket, next) => {
            let token = socket.handshake.query.token;
            if (token) {
                authApi.access(token).then(resp => {
                    this.accountId = resp.clientId;
                    next();
                }).catch(() => {
                    let error = {
                        type: 'ACCESS_TOKEN_INVALID',
                        msg: 'Please send a valid access-token in the socket query'
                    };
                    console.log(error)
                    next(new Error(JSON.stringify(error)));
                });
            } else {
                let error = {
                    type: 'NO_ACCESS_TOKEN',
                    msg: 'Please send a valid access-token in the socket query'
                };
                console.log(error)
                next(new Error(JSON.stringify(error)));
            }
        });
        this.socket.on('connect', this.onConnect.bind(this));
        this.socket.listen(9000);
    }
    onConnect (client) {
        // authorization
        client.on('restaurantId', this.onRestaurantId.bind(this, client));
        client.on('disconnect', this.onDisconnect.bind(this, client));
    }
    onRestaurantId (client, id) {
        let authorization = this.authorization.request(this.accountId, 'Restaurant', id);
        if (authorization && !authorization.error) {
            client.restaurantId = id;
            this.clients.push(client);
            console.log('+ ' + this.clients.length + ' clients connected');
        } else {
            console.log('client not authorized');
            client.emit('err', JSON.stringify({
                error: {
                    type: 'NOT_AUTHORIZED',
                    msg: 'Credentials do not fit to restaurantId'
                }
            }));
        }
    }
    onDisconnect (client, reason) {
        this.clients.pop(client);
        console.log('- ' + this.clients.length + ' clients connected');
    }
    emitNewOrder (order) {
        var restaurantId = order.restaurantId;
        var client = this.clients.find(this.findClient.bind(null, restaurantId));
        if (client) {
            client.emit('neworder', JSON.stringify(order));
        } else {
            console.error('emitNewOrder no client found for ' + restaurantId);
        }
    }
    findClient (restaurantId, client) {
        if (client.restaurantId === restaurantId) {
            return client;
        }
    }
}
module.exports = SocketController;
