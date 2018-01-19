const OrderItemSchema = {
	name: "OrderItem",
	properties: {
		orderItemId:  "string",
		name: "string",
		size: "int",
		count: "int"
	}
}
module.exports = OrderItemSchema