import User from "../models/User";
import { hashPassword, comparePassword } from "../middlewares/hashPassword.js";

export const getAllUser = async (req, res, next) => {
  try {
    res.status(201).json(await User.find());
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const _id = req.body._id;
    const user = await User.findById(_id)

    if(!user){
      return res.status(404).json({ message: "User not found" });
    }

    res.status(201).json({message: "user found!", user: user});
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const username = req.body.username.trim().toLowerCase();
    const email = req.body.email.trim().toLowerCase();
    const password = req.body.password.trim();

    if (await User.findOne({ email: email })) {
      return res.status(404).json({ message: "Email already exist!" });
    }

    if (await User.findOne({ username: username })) {
      return res.status(409).json({ message: "Username already exist!" });
    }

    const missingFields = [];
    if (username.length < 8) missingFields.push("username is to short");
    if (password.length < 8) missingFields.push("password is to short");
    if (!email) missingFields.push("email");

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `The following informations are missing: ${missingFields.join(
          ", "
        )}`,
      });
    }

    req.body.password = await hashPassword(req.body.password);

    const user = await User.create({
      username: username,
      email: email,
      password: req.body.password,
    });

    res.status(201).json({ message: "User successfully created", user: user });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const searchedUser = await User.findById({_id: req.body._id});

    const checkPassword = await comparePassword(
      req.body.password,
      searchedUser.password
    );

    if (!checkPassword) {
      return res.status(404).json({ message: "Wrong password" });
    }

    if (!searchedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.findByIdAndDelete({ _id: searchedUser._id });

    res.status(200).json({ message: "User successfully deleted" });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const updatedUser = await User.findById({_id: req.body.id});
    const username = req.body.username.trim().toLowerCase();
    const email = req.body.email.trim().toLowerCase();
    const password = req.body.password.trim();

    const checkPassword = await comparePassword(
      req.body.password,
      updateUser.password
    );

    if (!checkPassword) {
      return res.status(404).json({ message: "Wrong password" });
    }

    if (username.length > 8) {
      updatedUser.username = username;
    }

    if (password.length > 8) {
      updatedUser.password = password;
    }

    if (email) {
      updatedUser.email = email;
    }

    await User.findByIdAndUpdate({ _id: updatedUser._id });

    res
      .status(200)
      .json({ message: "User successfully updated", updatedUser: updatedUser });
  } catch (error) {
    next(error);
  }
};
