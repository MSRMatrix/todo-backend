import User from "../models/User.js";
import List from "../models/List.js";
import Task from "../models/Task.js";
import { hashPassword, comparePassword } from "../middlewares/hashPassword.js";
import { issueJwt } from "../helpers/jwt.js";
import jwt from "jsonwebtoken";
import {
  emailUpdate,
  emailWelcome,
  userDelete,
} from "../helpers/nodemailer.js";

const secretKey = process.env.JWT_SECRET;

export const getUserData = async (req, res, next) => {
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

    const user = await User.findById(data._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const list = await List.find({ _id: { $in: user.list } });

    const task = await Promise.all(
      list.map(async (list) => {
        return Task.find({ _id: { $in: list.task } });
      })
    );
    console.log(task[0]);
    res.status(200).json({ user: user, list: list, task: task[0] });
  } catch (error) {
    console.error("Error in getUser:", error);
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
    emailWelcome(user);
    res.status(201).json({ message: "User successfully created", user: user });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
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

    const user = await User.findById(data._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const checkPassword = await comparePassword(
      req.body.password,
      user.password
    );
    if (!checkPassword) {
      return res.status(401).json({ message: "Wrong password" });
    }

    const lists = await List.find({ _id: { $in: user.list } });

    const taskIds = lists.flatMap((list) => list.task);

    await Task.deleteMany({ _id: { $in: taskIds } });

    await List.deleteMany({ _id: { $in: user.list } });

    await User.findByIdAndDelete(user._id);

    userDelete(user.email);

    res.status(200).json({ message: "User successfully deleted" });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const updatedUser = await User.findById({ _id: req.body.id });
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
      emailUpdate(email);
    }

    await User.findByIdAndUpdate({ _id: updatedUser._id });

    res
      .status(200)
      .json({ message: "User successfully updated", updatedUser: updatedUser });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const email = await User.findOne({ email: req.body.email });

    if (!email) {
      return res.status(404).json({ message: "User not found" });
    }

    if (email.timeout && new Date() < new Date(email.timeout)) {
      return res.status(400).json({
        message: "Maximum of attempts reached! Please try again in 1 hour!",
      });
    }

    if (!email.verified) {
      const timeLimit = new Date(Date.now() - 120 * 120 * 1000);
      if (timeLimit >= email.createdAt) {
        await User.findByIdAndDelete({ _id: email._id });
        return res.status(401).json({
          message:
            "Account was deleted because you didnt verified your email adresse!",
        });
      } else {
        return res
          .status(410)
          .json({ message: "You need to verify your email adresse!" });
      }
    }

    const username = await User.findOne({ username: req.body.username });
    const password = req.body.password;

    if (!email && !username) {
      return res
        .status(400)
        .json({ message: "Email or username is required!" });
    }
    const passwordCompare = await comparePassword(
      password,
      email.password || username.password
    );

    if (!passwordCompare) {
      const message = "Passwort stimmt nicht!";
      res.status(404).json({ message });
    }

    const data = email || username;
    const token = issueJwt(data);
    res.cookie("jwt", token, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });

    res.status(200).json({ data, token });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    res
      .clearCookie("jwt", {
        httpOnly: true,
        sameSite: "none",
        secure: true,
      })
      .status(200)
      .send("User logged out");
  } catch (error) {
    next(error);
  }
};

export const authorize = (roles = []) => {
  return (req, res, next) => {
    const role = req.headers["authorization"];

    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).send("Access denied. No token provided.");
    }
    jwt.verify(token, secretKey, (error, decoded) => {
      if (error) return res.status(401).json({ error: "Invalid token." });

      if (!roles.includes(role))
        return res.status(404).json({ error: "Role is missing!" });

      req.user = decoded;
      next();
    });
  };
};

export const getData = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      const error = new Error("Token not found");
      error.statusCode = 401;
      throw error;
    }
    const decodedToken = jwt.verify(token, secretKey);

    const userId = decodedToken.id;
    const data = await User.findOne({ _id: userId });

    if (!data) {
      const error = new Error("Account not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).send(data);
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const email = await User.findOne({ email: req.body.email });

    if (!email) {
      return res.status(404).json({ error: "User not found!" });
    }

    if (email.timeout && new Date() < new Date(email.timeout)) {
      return res.status(400).json({
        message:
          "You have exceeded the maximum number of attempts! Please try again in 1 hour.",
      });
    }

    if (Number(req.body.code) !== email.code) {
      email.attempts++;

      if (email.attempts >= 3) {
        const userTimeout = new Date(Date.now() + 60 * 60 * 1000);
        email.timeout = userTimeout;
        email.code = Math.floor(Math.random() * 900000) + 100000;
        await email.save();
        return res.status(400).json({
          message:
            "You have exceeded the maximum number of attempts! Please try again later.",
        });
      }

      await email.save();
      return res.status(400).json({ message: "Wrong Code! Please try again!" });
    }

    email.verified = true;

    await User.updateOne(
      { email: req.body.email },
      {
        $unset: { attempts: "", timeout: "", code: "" },
      }
    );

    await email.save();

    res.status(200).json({ message: "Profile verified!" });
  } catch (error) {
    next(error);
  }
};
