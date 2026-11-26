import mongoose from "mongoose";

import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    user_name: {
      type: String,
      required: true,
      minlength: [2, "UserName must be at least 2 characters long"],
    },
    user_password: {
      type: String,
      required: true,
      select: false,
      minlength: [8, "Password must be at least 8 characters long"],
    },
    user_email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/, "Please provide a valid email address"],
    },
    verified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (!this.isModified("user_password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.user_password = await bcrypt.hash(this.user_password, salt);
});

userSchema.methods.comparePassword = async function (providedPassword) {
  return await bcrypt.compare(providedPassword, this.user_password);
};

userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.user_password;
    delete ret.__v;
    return ret;
  },
});

const userModel = mongoose.model("Customer", userSchema);

export default userModel;
