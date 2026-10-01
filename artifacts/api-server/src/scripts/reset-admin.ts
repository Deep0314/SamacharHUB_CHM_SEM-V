/**
 * SamacharHUB — Reset Admin Script
 * Resets the admin user password or creates a new admin user.
 * Run this if you're locked out of the admin panel.
 *
 * Usage:
 *   NEW_ADMIN_EMAIL=you@example.com NEW_ADMIN_PASSWORD=yourpassword tsx src/scripts/reset-admin.ts
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is required");
}

const email = process.env.NEW_ADMIN_EMAIL || "admin@samacharhub.com";
const password = process.env.NEW_ADMIN_PASSWORD || "Admin@123";
const name = process.env.NEW_ADMIN_NAME || "SamacharHUB Admin";

await mongoose.connect(MONGODB_URI, { dbName: "samacharhub_enewspaper" });
console.log("✅ Connected to MongoDB");

const AdminUserSchema = new mongoose.Schema({
  email: String, name: String, password: String, role: String,
}, { timestamps: true });

const AdminUser = mongoose.models["AdminUser"] || mongoose.model("AdminUser", AdminUserSchema);

const hashedPassword = await bcrypt.hash(password, 12);

const result = await (AdminUser as any).findOneAndUpdate(
  { email },
  { email, name, password: hashedPassword, role: "admin" },
  { upsert: true, new: true }
);

console.log(`✅ Admin user upserted: ${result.email}`);
console.log(`   Name:     ${result.name}`);
console.log(`   Password: ${password}`);
console.log("\n⚠️  Please change your password after logging in!");

await mongoose.disconnect();
process.exit(0);
