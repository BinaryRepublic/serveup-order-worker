const OrderSchema = {
	name: "Order",
	properties: {
	  	orderId:  "string",
		timestamp: "date",
		items: "OrderItem",
		amount: "double",
		table: "Table",
		status: "int"
	}
}
module.exports = OrderSchema