'use strict';
const socketIO = require('socket.io');
const AuthApiInterface = require('../ro-express-helper/library/AuthApiInterface');
const Authorization = require('../ro-express-helper/middleware/Authorization');
const Logger = require('../ro-express-helper/library/Logger');

class SocketController {
    constructor () {
        this.clients = [];
        this.accountId = null;
        this.authorization = new Authorization();
        this.logger = new Logger();
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
                    this.logger.error(400, 'SOCKET', 'CONNECT', error);
                    next(new Error(JSON.stringify(error)));
                });
            } else {
                let error = {
                    type: 'NO_ACCESS_TOKEN',
                    msg: 'Please send a valid access-token in the socket query'
                };
                this.logger.error(400, 'SOCKET', 'CONNECT', error);
                next(new Error(JSON.stringify(error)));
            }
        });
        this.socket.on('connect', this.onConnect.bind(this));
        this.socket.listen(9000);
    }
    onConnect (client) {
        console.log('client connected');
        // authorization
        client.on('restaurantId', this.onRestaurantId.bind(this, client));
        client.on('disconnect', this.onDisconnect.bind(this, client));
    }
    onRestaurantId (client, id) {
        console.log('client connected (restaurant-id: ' + id + ')');
        let authorization = this.authorization.request(this.accountId, 'Restaurant', id);
        if (authorization && !authorization.error) {
            client.restaurantId = id;
            this.clients.push(client);
        } else {
            let error = {
                type: 'NOT_AUTHORIZED',
                msg: 'Credentials do not fit to restaurantId'
            };
            client.emit('err', JSON.stringify({
                error: error
            }));
            this.logger.error(401, 'SOCKET', 'CONNECT', error);
        }
    }
    onDisconnect (client, reason) {
        console.log('client disconnected');
        this.clients.pop(client);
    }
    emitNewOrder (order) {
        var restaurantId = order.restaurantId;
        var client = this.clients.find(this.findClient.bind(null, restaurantId));
        if (client) {
            console.log('emit newOrder');
            console.log(order);
            client.emit('neworder', JSON.stringify(order));
        } else {
            let error = {
                type: 'RESTAURANT_NOT_FOUND',
                msg: 'emitNewOrder no client found for ' + restaurantId
            };
            this.logger.error(500, 'SOCKET', 'neworder', error);
        }
    }
    findClient (restaurantId, client) {
        if (client.restaurantId === restaurantId) {
            return client;
        }
    }
}
module.exports = SocketController;
