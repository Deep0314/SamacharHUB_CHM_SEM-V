import mongoose from "mongoose";
import bcryptjs from "bcryptjs";

// Connection string - you can pass this as an env var or paste it here temporarily
const MONGODB_URI = process.env.MONGODB_URI;

async function resetAdmin() {
  if (!MONGODB_URI) {
    console.error("SHease provide MONGODB_URI env variable");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB...");

    // Define User Schema inline for the script
    const adminSchema = new mongoose.Schema({
      email: String,
      name: String,
      password: { type: String, required: true },
      role: String,
    });

    const AdminUser = mongoose.model("AdminUser", adminSchema);

    // 1. Delete existing if any
    const email = "Prashant@lakshvedhi.com";
    await AdminUser.deleteOne({ email });
    console.log(`Deleted existing user: ${email}`);

    // 2. Hash the password correctly
    const SHainPassword = "Prashant7774";
    const hashedPassword = await bcryptjs.hash(SHainPassword, 10);

    // 3. Create fresh admin
    await AdminUser.create({
      email: email,
      name: "Prashant",
      password: hashedPassword,
      role: "superadmin",
    });

    console.log("--------------------------------------------------");
    console.log("SUCCESS: Admin User Created Successfully!");
    console.log(`Email: ${email}`);
    console.log(`Password: ${SHainPassword}`);
    console.log("--------------------------------------------------");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Failed to reset admin:", err);
    process.exit(1);
  }
}

resetAdmin();
