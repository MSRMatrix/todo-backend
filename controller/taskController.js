import List from "../models/List.js";
import Task from "../models/Task.js";
import he from "he"

export const createTask = async (req, res, next) => {
  try {
    const task = he.decode(req.body.task).trim();
    const listId = req.body.listId;
    const list = await List.findById(listId);

    if (!task) {
      return res.status(400).json({ message: "A task need a name!" });
    }

    const taskLength = await Task.find({ _id: { $in: list.task } });
    if (taskLength.length >= 4) {
      return res
        .status(518)
        .json({ message: "A maximum of 4 tasks is allowed!" });
    }

    const newTask = await Task.create({ task: task, listId: listId });

    // const populatedTask = await Task.findById(newTask._id).populate("listId");

    await List.findByIdAndUpdate(listId, { $push: { task: newTask._id } });

    res.status(200).json({ message: "Task created!" });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const { _id, task, oldTask } = req.body;

    const newTask = he.decode(task).trim();

    if (!newTask) {
      return res.status(400).json({ message: "A task need a name!" });
    }

    if (newTask.trim() === oldTask) {
      return res.status(200).json({ message: "Task name can't be the same!" });
    }

    await Task.findByIdAndUpdate(
      {
        _id: _id,
      },
      { task: newTask }
    );

    res.status(200).json({ message: "Task-name updated!" });
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

    const task = await Task.findById({ _id: _id });

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
    const _id = req.body._id;
    const listId = req.body.listId;

    const list = await List.findById(listId);

    const deleteTaskInList = list.task.filter(
      (item) => item.toString() !== _id
    );
    if (!(await Task.findById({ _id: _id }))) {
      return res.status(404).json({ message: "Task not found!" });
    }
    const deletedList = await Task.findByIdAndDelete({ _id: _id });

    list.task = deleteTaskInList;
    await list.save();

    res.status(200).json({ message: "Task deleted!", name: deletedList });
  } catch (error) {
    next(error);
  }
};
export const toggleAllTasks = async (req, res, next) => {
  try {
    const _id = req.body._id;
const list = await List.findById(_id);

if (!list) {
  return res.status(404).json({ message: "List not found" });
}

const tasks = await Task.find({ _id: { $in: list.task } });

const hasIncompleteTask = tasks.some(task => task.done === false);

if (hasIncompleteTask) {
  await Task.updateMany(
    { _id: { $in: list.task } },
    { $set: { done: true } }
  );
  return res.status(200).json({ message: "All tasks have been marked as complete!" });
} else {
  await Task.updateMany(
    { _id: { $in: list.task } },
    { $set: { done: false } }
  );
  return res.status(200).json({ message: "All tasks have been marked as incomplete!" });
}

  } catch (error) {
    next(error);
  }
};
