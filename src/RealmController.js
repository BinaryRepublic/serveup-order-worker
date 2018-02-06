"use_strict"
const ParentRealmController = require("../ro-realm/ParentRealmController.js")

class RealmController extends ParentRealmController {
	constructor(setup) {
		super();
		this.realmCreated = setup;
	}
	setupListener(callback) {
	    console.log('setupListener');
		this.realm.objects('Order').addListener((orders, changes) => {
		    console.log(changes);
			changes.insertions.forEach((index) => {
				let newOrder = orders[index];
			  	callback(newOrder)
			});
		});
	}
}
module.exports = RealmController;