const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// MongoDB URI - same as lib/config.ts
const MONGODB_URI = "mongodb+srv://websevix:@websevix541600@bhanu.ur1ftos.mongodb.net/?appName=bhanu";

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

async function seed() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@websevix.com" });
    if (existingAdmin) {
      console.log("⚠️  Admin user already exists!");
      console.log("📧 Email: admin@websevix.com");
      console.log("🔑 Password: (check database or reset)");
      await mongoose.disconnect();
      process.exit(0);
    }

    // Create admin user
    const passwordHash = await bcrypt.hash("admin123", 10);
    const admin = new User({
      email: "admin@websevix.com",
      passwordHash: passwordHash,
      fullName: "Admin User",
      phone: "9999999999",
      role: "admin",
    });

    await admin.save();
    console.log("✅ Admin user created successfully!");
    console.log("\n📧 Email: admin@websevix.com");
    console.log("🔑 Password: admin123");
    console.log("\n⚠️  Please change the password after first login!");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
