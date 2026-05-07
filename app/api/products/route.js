import { query } from "@/lib/db";
import Product from "@/models/Product";

export async function GET(request) {
  try {
    await Product.sync();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const material = searchParams.get("material");

    let sql = "SELECT * FROM products WHERE isActive = true";
    const params = [];

    if (category) {
      sql += " AND category = ?";
      params.push(category);
    }

    if (material) {
      sql += " AND material = ?";
      params.push(material);
    }

    if (search) {
      sql += " AND (LOWER(name) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?) OR LOWER(category) LIKE LOWER(?))";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const priceRange = searchParams.get("priceRange");
    if (priceRange === "affordable") {
      sql += " AND price < 5000";
    } else if (priceRange === "premium") {
      sql += " AND price >= 5000";
    }

    const countSql = sql.replace("SELECT *", "SELECT COUNT(*) as total");
    const [{ total }] = await query(countSql, params);

    sql += " ORDER BY created_at DESC";

    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 0;
    if (limit > 0) {
      sql += ` LIMIT ${limit} OFFSET ${(page - 1) * limit}`;
    }

    const products = await query(sql, params);

    return Response.json({ success: true, products, total, page, limit });
  } catch (error) {
    return Response.json(
      { success: false, message: "Failed to fetch products", error: error.message },
      { status: 500 }
    );
  }
}
