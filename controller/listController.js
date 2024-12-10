import List from "../models/List";
import Task from "../models/Task";
import User from "../models/User";

export const createList = async (req, res, next) => {
  try {
    const name = req.body.name.trim();
    const description = req.body.description;
    const userId = req.body.userId;

    const user = await User.findById(userId)
    const listLength = await List.find({_id : {$in: user.list}})

    if(listLength.length >= 4){
      return res.status(518).json({message: "A maximum of 4 lists is allowed!"})
    }

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (!name) {
      return res.status(400).json({ message: "A list need a name!" });
    }

    if (!description) {
      req.body.description = "No description";
    }

    const newList = await List.create({
      name: name,
      description: req.body.description,
      userId: userId,
    });

    const populatedList = await List.findById(newList._id).populate("userId");
    await User.findByIdAndUpdate(userId, { $push: { list: newList._id } });

    res
      .status(200)
      .json({ message: "List created!", populatedList: populatedList });
  } catch (error) {
    next(error);
  }
};

export const updateList = async (req, res, next) => {
  try {
    const { name, _id, description } = req.body;

    const updateList = await List.findById(_id);

    if (!updateList) {
      return res.status(404).json({ message: "List not found!" });
    }

    if (description) {
      updateList.description = description.trim();
    }

    if (name) {
      updateList.name = name;
    }

    await updateList.save();

    res.status(200).json({ message: "List updated!", name: updateList });
  } catch (error) {
    next(error);
  }
};

export const deleteList = async (req, res, next) => {
  try {
    console.log("Deleting list...");

    const _id = req.body._id;
    const userId = req.body.userId;
    const password = req.body.password;

    const list = await List.findById(_id);
    const user = await User.findById(userId);

    const checkPassword = await comparePassword(password, user.password);

    if (!checkPassword) {
      return res.status(401).json({ message: "Invalid password!" });
    }

    if (!list) {
      return res.status(404).json({ message: "List not found!" });
    }

    const deleteListInUser = user.list.filter(
      (item) => item.toString() !== _id
    );

    user.list = deleteListInUser;

    await user.save();

    const taskIds = list.task;
    await Promise.all(taskIds.map((taskId) => Task.findByIdAndDelete(taskId)));

    const deletedList = await List.findByIdAndDelete(_id);

    res.status(200).json({ message: "List deleted!", deletedList });
  } catch (error) {
    console.error("Error deleting list:", error);
    next(error);
  }
};