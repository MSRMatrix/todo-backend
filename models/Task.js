import { Schema, model } from "mongoose";

const TaskSchema = new Schema({
    task: {type: String},
    listId: { type: Schema.Types.ObjectId, ref: "List", required: true },
    done: {type: Boolean, default: false}
}, {versionKey: false, strictQuery: true})

TaskSchema.methods.toJSON = function() {
    const task = this.toObject();
    return task;
  }

const Task = model("Task", TaskSchema)

export default Task;