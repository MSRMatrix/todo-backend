import mongoose, { Schema, model } from "mongoose";

const UserSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    verified: { type: Boolean, default: false },
    code: {
      type: Number,
      default: () => Math.floor(Math.random() * 900000) + 100000,
    },
    attempts: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    timeout: { type: Date },
    role: { type: String, enum: ["User"], default: "User" },
    list: [{ type: mongoose.Schema.Types.ObjectId, ref: "List" }],
  },
  { versionKey: false, strictQuery: true }
);

UserSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user._id;
  delete user.role;
  delete user.verified;
  delete user.code;
  delete user.attempts;
  delete user.timeout;
  return user;
};

const User = model("User", UserSchema);

export default User;
