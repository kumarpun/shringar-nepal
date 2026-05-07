import { query } from "@/lib/db";
import Order from "@/models/Order";
import { requireAuth } from "@/lib/auth";

export async function GET(request, { params }) {
  try {
    const { user, error } = requireAuth(request);
    if (error) return error;

    const { id } = await params;
    await Order.sync();

    const orders = await query(
      `SELECT * FROM orders WHERE id = ? AND userId = ?`,
      [id, user.id]
    );

    if (orders.length === 0) {
      return Response.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    const items = await query(
      `SELECT order_items.*, products.name as productName, products.images
       FROM order_items
       JOIN products ON order_items.productId = products.id
       WHERE order_items.orderId = ?`,
      [id]
    );

    return Response.json({ success: true, order: orders[0], items });
  } catch (error) {
    return Response.json(
      { success: false, message: "Failed to fetch order", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { user, error } = requireAuth(request);
    if (error) return error;

    const { id } = await params;
    const order = await Order.findById(id);

    if (!order || order.userId !== user.id) {
      return Response.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    if (order.status !== "pending") {
      return Response.json(
        { success: false, message: "Only pending orders can be cancelled" },
        { status: 400 }
      );
    }

    const items = await query(
      "SELECT productId, quantity FROM order_items WHERE orderId = ?",
      [id]
    );

    for (const item of items) {
      await query(
        "UPDATE products SET stock = stock + ? WHERE id = ?",
        [item.quantity, item.productId]
      );
    }

    await query("DELETE FROM order_items WHERE orderId = ?", [id]);
    await query("DELETE FROM orders WHERE id = ?", [id]);

    return Response.json({ success: true, message: "Order cancelled" });
  } catch (error) {
    return Response.json(
      { success: false, message: "Failed to cancel order", error: error.message },
      { status: 500 }
    );
  }
}
