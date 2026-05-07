import Setting from "@/models/Setting";
import { requireAdmin } from "@/lib/auth";

export async function GET(request) {
  try {
    const { error } = requireAdmin(request);
    if (error) return error;

    await Setting.sync();
    const settings = await Setting.findAll();

    const map = {};
    for (const s of settings) {
      map[s.settingKey] = s.value;
    }

    return Response.json({
      success: true,
      codEnabled: map.codEnabled !== "false",
      onlineEnabled: map.onlineEnabled !== "false",
      deliveryCharge: map.deliveryCharge || "0",
    });
  } catch (error) {
    return Response.json(
      { success: false, message: "Failed to fetch settings", error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const { error } = requireAdmin(request);
    if (error) return error;

    await Setting.sync();
    const { codEnabled, onlineEnabled, deliveryCharge } = await request.json();

    const updates = [];
    if (codEnabled !== undefined) updates.push(["codEnabled", String(codEnabled)]);
    if (onlineEnabled !== undefined) updates.push(["onlineEnabled", String(onlineEnabled)]);
    if (deliveryCharge !== undefined && deliveryCharge !== null) {
      if (isNaN(Number(deliveryCharge)) || Number(deliveryCharge) < 0) {
        return Response.json(
          { success: false, message: "Valid delivery charge is required" },
          { status: 400 }
        );
      }
      updates.push(["deliveryCharge", String(Number(deliveryCharge).toFixed(2))]);
    }

    for (const [key, value] of updates) {
      const existing = await Setting.findOne({ settingKey: key });
      if (existing) {
        await Setting.update(existing.id, { value });
      } else {
        await Setting.create({ settingKey: key, value });
      }
    }

    return Response.json({ success: true, message: "Settings updated" });
  } catch (error) {
    return Response.json(
      { success: false, message: "Failed to update settings", error: error.message },
      { status: 500 }
    );
  }
}
