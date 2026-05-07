import User from "@/models/User";
import { requireAuth } from "@/lib/auth";

export async function GET(request) {
  try {
    const { user, error } = requireAuth(request);
    if (error) return error;

    await User.sync();
    const profile = await User.findById(user.id);

    if (!profile) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      profile: {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        address: profile.address,
        city: profile.city,
        state: profile.state,
        zip: profile.zip,
      },
    });
  } catch (error) {
    return Response.json(
      { success: false, message: "Failed to fetch profile", error: error.message },
      { status: 500 }
    );
  }
}
