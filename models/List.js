import { Schema, model } from "mongoose";

const ListSchema = new Schema({
    name: {type: String, required: true, unique: true},
    task: [{type: String}]
}, {versionKey: false, strictQuery: true})

ListSchema.methods.toJSON = function() {
    const list = this.toObject();
    delete list._id;
    return list;
  }

const List = model("List", ListSchema)

export default List;