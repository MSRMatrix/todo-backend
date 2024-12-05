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
    const name = req.body.task;
    if (!name) {
      return res.status(400).json({ message: "A task need a name!" });
    }

    const newList = await Task.create({ name });
    res.status(200).json({ message: "List created!", name: newList });
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
  console.log("test");
  try {
    const id = req.body._id;
    const deletedList = await Task.findByIdAndDelete({ _id: id });

    if(!await Task.findById({_id: id})){
        return res.status(404).json({ message: "Task not found!" });
    }
    res.status(200).json({ message: "Task deleted!", name: deletedList });
  } catch (error) {
    next(error);
  }
};
