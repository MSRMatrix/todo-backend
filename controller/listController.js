import { comparePassword } from "../middlewares/hashPassword.js";
import List from "../models/List.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import he from "he"

const secretKey = process.env.JWT_SECRET;

export const createList = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      const error = new Error("Token not found");
      error.statusCode = 401;
      throw error;
    }
    const decodedToken = jwt.verify(token, secretKey);

    const testId = decodedToken.id;
    const data = await User.findOne({ _id: testId });

    if (!data) {
      const error = new Error("Account not found");
      error.statusCode = 404;
      throw error;
    }

    const name = he.decode(req.body.name).trim();
    const description = req.body.description;
    const userId = data._id;

    const user = await User.findById(userId);
    const listLength = await List.find({ _id: { $in: user.list } });

    if (listLength.length >= 4) {
      return res
        .status(518)
        .json({ message: "A maximum of 4 lists is allowed!" });
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

    // const populatedList = await List.findById(newList._id).populate("userId");
    
    await User.findByIdAndUpdate(userId, { $push: { list: newList._id } });

    res
      .status(200)
      .json({ message: "List created!" });
  } catch (error) {
    next(error);
  }
};


export const updateList = async (req, res, next) => {
  try {
    const { name, _id, description, oldList } = req.body;

    const updateList = await List.findById(_id); 

    const newList = he.decode(name).trim();


    if (newList === oldList) {
      return res.status(200).json({ message: "Name is equal!" });
    }

    if (!updateList) {
      return res.status(404).json({ message: "List not found!" });
    }

    if (description.trim().length > 0 || description !== updateList.description) {
      updateList.description = description.trim();
    }

    if(description.trim().length <= 0 && updateList.description !== "No description"){
      updateList.description = "No description"
    }

    if (name) {
      updateList.name = newList;
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

    const token = req.cookies.jwt;

    if (!token) {
      const error = new Error("Token not found");
      error.statusCode = 401;
      throw error;
    }
    const decodedToken = jwt.verify(token, secretKey);

    const testId = decodedToken.id;
    const data = await User.findOne({ _id: testId });

    if (!data) {
      const error = new Error("Account not found");
      error.statusCode = 404;
      throw error;
    }

    const _id = req.body._id;
    const userId = data._id;
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

export const resetData = async (req, res, next) => {
  try {
    console.log("Deleting list...");

    const token = req.cookies.jwt;

    if (!token) {
      const error = new Error("Token not found");
      error.statusCode = 401;
      throw error;
    }
    const decodedToken = jwt.verify(token, secretKey);

    const testId = decodedToken.id;
    const data = await User.findOne({ _id: testId });

    if (!data) {
      const error = new Error("Account not found");
      error.statusCode = 404;
      throw error;
    }

    const userId = data._id;
    const password = req.body.password;

    const user = await User.findById(userId);

    const checkPassword = await comparePassword(password, user.password);

    if (!checkPassword) {
      return res.status(401).json({ message: "Invalid password!" });
    }

    const lists = await List.find({ _id: { $in: user.list } });

    const taskIds = lists.flatMap((list) => list.task);

    await Task.deleteMany({ _id: { $in: taskIds } });

    await List.deleteMany({ _id: { $in: user.list } });

    user.list = [];

    await user.save();

    res.status(200).json({ message: "List deleted!" });
  } catch (error) {
    console.error("Error deleting list:", error);
    next(error);
  }
};

export const emptyList = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      const error = new Error("Token not found");
      error.statusCode = 401;
      throw error;
    }
    const decodedToken = jwt.verify(token, secretKey);

    const testId = decodedToken.id;
    const data = await User.findOne({ _id: testId });

    if (!data) {
      const error = new Error("Account not found");
      error.statusCode = 404;
      throw error;
    }

    const user = data;
    const { _id, password } = req.body;

    if (!_id) {
      return res.status(401).json({ message: "List not found!" });
    }

    const checkPassword = await comparePassword(password, user.password);

    if (!checkPassword) {
      return res.status(401).json({ message: "Invalid password!" });
    }

    const list = await List.findById({ _id: _id });

    await Task.deleteMany({ _id: { $in: list.task } });

    list.task = [];

    await list.save();

    return res.status(200).json({ message: "List has been emptied." });
  } catch (error) {
    console.error("Error deleting list:", error);
    next(error);
  }
};
