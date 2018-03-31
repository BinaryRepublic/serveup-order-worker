'use strict';
const ParentRealmController = require('../ro-realm/ParentRealmController.js');

class RealmController extends ParentRealmController {
    constructor () {
        super();
    }
    setupListener (callback) {
        this.realm.objects('Order').addListener((orders, changes) => {
            changes.insertions.forEach((index) => {
                let newOrder = orders[index];
                callback(newOrder);
            });
        });
    }
}
module.exports = RealmController;
