const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// MongoDB URI - same as lib/config.ts
// Password me @ character ko URL encode karna padta hai: @ = %40
const MONGODB_URI = "mongodb+srv://websevix:%40websevix541600@bhanu.ur1ftos.mongodb.net/?appName=bhanu";

// User Schema (same as models/User.ts)
const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    whatsapp: { type: String, trim: true },
    businessName: { type: String, trim: true },
    role: { type: String, enum: ["client", "admin"], default: "client", required: true, index: true },
    lastLogin: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function resetPassword() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Find admin user
    const admin = await User.findOne({ email: "admin@websevix.com", role: "admin" });
    if (!admin) {
      console.log("❌ Admin user not found!");
      await mongoose.disconnect();
      process.exit(1);
    }

    // Reset password to admin123
    const newPassword = "admin123";
    const passwordHash = await bcrypt.hash(newPassword, 10);
    admin.passwordHash = passwordHash;
    await admin.save();

    console.log("✅ Admin password reset successfully!");
    console.log("\n📧 Email: admin@websevix.com");
    console.log("🔑 New Password: admin123");
    console.log("\n⚠️  Please change the password after first login!");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error resetting password:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

resetPassword();
