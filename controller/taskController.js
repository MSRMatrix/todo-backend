import List from "../models/List";
import Task from "../models/Task";

export const allTasks = async (req, res, next) => {
  try {
    res.status(200).json(await Task.find());
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const task = req.body.task;
    const listId = req.body.listId
    
    if (!task) {
      return res.status(400).json({ message: "A task need a name!" });
    }

    const newTask = await Task.create({ task: task, listId: listId });

console.log(newTask);
    const populatedTask = await Task.findById(newTask._id).populate('listId');
    await List.findByIdAndUpdate(listId, { $push: { task: newTask._id } });

    res.status(200).json({ message: "Task created!", name: populatedTask });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const id = req.body._id;
    const name = req.body.name.trim();
    const updatedList = await Task.findByIdAndUpdate({ _id: id, name: name });
    res.status(200).json({ message: "List-name updated!", name: updatedList });
  } catch (error) {
    next(error);
  }
};

export const checkTask = async (req, res, next) => {
  try {
    const { _id } = req.body;

    if (!_id) {
      return res.status(400).json({ message: "Task ID is required!" });
    }

    const task = await Task.findById(_id);
    if (!task) {
      return res.status(404).json({ message: "Task not found!" });
    }

    task.done = !task.done;

    await task.save();

    res.status(200).json({ message: `Task status is now ${task.done}!` });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const id = req.body._id;
    const deletedList = await Task.findByIdAndDelete({ _id: id });

    if (!(await Task.findById({ _id: id }))) {
      return res.status(404).json({ message: "Task not found!" });
    }
    res.status(200).json({ message: "Task deleted!", name: deletedList });
  } catch (error) {
    next(error);
  }
};