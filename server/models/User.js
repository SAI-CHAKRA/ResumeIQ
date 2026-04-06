import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false, // never returned in queries unless explicitly asked
    },
  },
  { timestamps: true }
);

// Hash password before saving — runs on create() and save()
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return; // skip if password unchanged
  this.password = await bcrypt.hash(this.password, 10); // 10 salt rounds for dev
}
);

// Compare entered password with hashed one in DB
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);