"use strict";
const Realm = require("realm");
const Order = require("./models/Order.js");
const OrderItem = require("./models/OrderItem.js");
const Table = require("./models/Table.js");
const Restaurant = require("./models/Restaurant.js");

class RealmController {
	constructor(path, newOrderCallback) {
		this.newOrderCallback = newOrderCallback;
		var that = this;
		Realm.open({
			path: path + "/default.realm",
			schema: [Order, OrderItem, Table, Restaurant],
		}).then(realm => {
			that.realm = realm;
    		realm.objects("Order").addListener(that.orderChanges);
		});
		this.orderChanges = this.orderChanges.bind(this);
	}
	orderChanges(orders, changes) {
		changes.insertions.forEach((index) => {
			let newOrder = orders[index];
			if(this.newOrderCallback) {
				this.newOrderCallback(newOrder);
			}
	  	});
	}
}
module.exports = RealmController;
