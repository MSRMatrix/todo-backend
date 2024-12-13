import mongoose, { Schema, model } from "mongoose";

const UserSchema = new Schema({
    username: {type: String, required: true, unique: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    role: {type: String, enum: ["User"], default: "User" },
    list: [{ type: mongoose.Schema.Types.ObjectId, ref: "List"}]
}, {versionKey: false, strictQuery: true})

UserSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;
    delete user._id;
    delete user.role;
    return user;
  }

const User = model("User", UserSchema)

export default User;