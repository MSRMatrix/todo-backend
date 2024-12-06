import mongoose, { Schema, model } from "mongoose";

const ListSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "No description" },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    task: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
  },
  { versionKey: false, strictQuery: true }
);

ListSchema.methods.toJSON = function () {
  const list = this.toObject();
  delete list.userId;
  return list;
};

const List = model("List", ListSchema);

export default List;