import Setting from "@/models/Setting";

export async function GET() {
  try {
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
      deliveryCharge: Number(map.deliveryCharge || 0),
    });
  } catch (error) {
    return Response.json(
      { success: false, message: "Failed to fetch settings", error: error.message },
      { status: 500 }
    );
  }
}
