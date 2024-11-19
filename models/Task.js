import { Schema, model } from "mongoose";

const TaskSchema = new Schema({
    task: [{type: String}]
}, {versionKey: false, strictQuery: true})

TaskSchema.methods.toJSON = function() {
    const task = this.toObject();
    delete task._id;
    return task;
  }

const Task = model("Task", TaskSchema)

export default Task;