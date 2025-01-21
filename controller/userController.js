import User from "../models/User.js";
import List from "../models/List.js";
import Task from "../models/Task.js";
import { hashPassword, comparePassword } from "../middlewares/hashPassword.js";
import { issueJwt } from "../helpers/jwt.js";
import jwt from "jsonwebtoken";
import { mailerFunction } from "../helpers/nodemailer.js";
import { dataFunction } from "../helpers/dataFunction.js";
import he from "he"

const secretKey = process.env.JWT_SECRET;

export const getUserData = async (req, res, next) => {
  try {
    const data = await dataFunction(req, res, next);

    if (!data) {
      return res.status(404).json({ message: "Data not found" });
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
    res.status(200).json({
      user: user,
      list: list,
      task: task.flat(),
      twoFactorAuthentication: user.twoFactorAuthentication,
    });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const username = he.decode(req.body.username).trim().toLowerCase();
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
      attempts: 0,
      code: Math.floor(Math.random() * 900000) + 100000,
    });
    const topic = `Profile created`;
    const message = `You created a profile! Use this code to verify your email: ${user.code}! You have 3 hours to verify your email adress!`;

    mailerFunction(user, topic, message);
    res.status(201).json({ message: "User successfully created", user: user });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const data = await dataFunction(req, res, next);

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

    const topic = `Profile deleted`;
    const message = `We deleted all of your data! Goodbye!`;

    mailerFunction(user, topic, message);

    res.status(200).json({ message: "User successfully deleted" });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const user = await dataFunction(req, res, next);
    const username = he.decode(req.body.username).trim().toLowerCase();
    const email = req.body.email.trim().toLowerCase();
    const password = req.body.password.trim();
    const confirmPassword = req.body.confirmPassword.trim();

    const checkPassword = await comparePassword(confirmPassword, user.password);

    if (!checkPassword) {
      return res.status(404).json({ message: "Wrong password" });
    }

    if (username.length >= 8) {
      user.username = username;
      const topic = `Profile update`;
      const message = `Your username was updated!`;
      mailerFunction(user, topic, message);
    }

    if (password.length >= 8) {
      user.password = await hashPassword(password);
      const topic = `Profile update`;
      const message = `Your password was updated!`;
      mailerFunction(user, topic, message);
    }

    if (email) {
      user.email = email;
      const topic = `Profile update`;
      const message = `Your email was updated!`;
      mailerFunction(user, topic, message);
    }

    await user.save();

    res.status(200).json({ message: "User successfully updated", user: user });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;

    const user =
      (await User.findOne({ email: email })) ||
      (await User.findOne({ username: username }));
    if (!user) {
      return res.status(404).json({
        code: "USER_NOT_FOUND",
        message: "User not found. Please check your credentials.",
      });
    }

    if (user.timeout && new Date() < new Date(user.timeout)) {
      return res.status(429).json({
        code: "LOGIN_TIMEOUT",
        message:
          "You have exceeded the maximum number of attempts. Please try again in 10 minutes.",
      });
    }

    if (!user.verified) {
      const timeLimit = new Date(Date.now() - 120 * 60 * 1000);
      if (timeLimit >= user.createdAt) {
        await User.findByIdAndDelete({ _id: user._id });
        return res.status(418).json({
          code: "ACCOUNT_DELETED",
          message:
            "Your account has been deleted due to not verifying your email address in time.",
        });
      } else {
        return res.status(403).json({
          code: "EMAIL_NOT_VERIFIED",
          message: "You need to verify your email address before logging in.",
        });
      }
    }

    const passwordIsValid = await comparePassword(password, user.password);
    if (!passwordIsValid) {
      return res.status(401).json({
        code: "INVALID_PASSWORD",
        message: "The password you entered is incorrect.",
      });
    }

    if (user.twoFactorAuthentication) {
      user.code = Math.floor(Math.random() * 900000) + 100000;
      user.attempts = 0;
      await user.save();
      const topic = `Two Factor Authentication Code`;
      const message = `This is your new two factor authentication code: ${user.code}`;

      mailerFunction(user, topic, message);
      return res.status(420).json({
        code: "TWO_FACTOR_REQUIRED",
        message: "Two-factor authentication is required to complete login.",
      });
    }

    await User.updateOne(
      { email: req.body.email },
      {
        $unset: { attempts: "", timeout: "", code: "" },
      }
    );

    const token = issueJwt(user);
    res.cookie("jwt", token, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });

    await user.save();
    res.status(200).json({
      code: "LOGIN_SUCCESS",
      message: "Login successful!",
      data: user,
      token,
    });
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
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).send("Access denied. No token provided.");
    }

    jwt.verify(token, secretKey, (error, decoded) => {
      if (error) return res.status(401).json({ error: "Invalid token." });

      const userRole = decoded.role;

      if (!roles.includes(userRole)) {
        return res
          .status(403)
          .json({ error: "Access denied. Insufficient permissions." });
      }

      req.user = decoded;
      next();
    });
  };
};

export const getData = async (req, res, next) => {
  try {
    const data = await dataFunction(req, res, next);

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
    const user = await User.findOne({
      $or: [{ email: req.body.email }, { username: req.body.username }],
    });

    if (!user) {
      return res.status(400).json({
        message: "User not found!",
      });
    }

    if(!user.verified){
      if (timeLimit >= user.createdAt) {
        await User.findByIdAndDelete({ _id: user._id });
        return res.status(418).json({
          code: "ACCOUNT_DELETED",
          message:
            "Your account has been deleted due to not verifying your email address in time.",
        });
      } 
    }

    if (user.verified) {
      return res.status(418).json({
        message: "Email already verified!",
      });
    }

    if (!user) {
      return res.status(404).json({ error: "User not found!" });
    }

    if (user.timeout && new Date() < new Date(user.timeout)) {
      return res.status(400).json({
        message:
          "You have exceeded the maximum number of attempts! Please try again in 10 minutes.",
      });
    }

    if (Number(req.body.code) !== user.code) {
      user.attempts++;

      if (user.attempts >= 3) {
        const userTimeout = new Date(Date.now() + 10 * 60 * 1000);
        user.timeout = userTimeout;
        user.code = Math.floor(Math.random() * 900000) + 100000;
        await user.save();

        const topic = `Email verification failed`;
        const message = `You have exceeded the maximum number of attempts! Please try again in 10 minutes. Your new code: ${user.code}`;

        mailerFunction(user, topic, message);

        return res.status(400).json({
          message:
            "You have exceeded the maximum number of attempts! Please try again in 10 minutes. You will receive a new code shortly.",
        });
      }

      await user.save();
      return res.status(400).json({ message: "Wrong Code! Please try again!" });
    }

    user.verified = true;

    await User.updateOne(
      { email: req.body.email },
      {
        $unset: { attempts: "", timeout: "", code: "" },
      }
    );

    await user.save();

    const token = issueJwt(user);
    res.cookie("jwt", token, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });

    res.status(200).json({
      code: "LOGIN_SUCCESS",
      message: "Login successful!",
      data: user,
      token,
    });

    res.status(200).json({ message: "Profile verified!" });
  } catch (error) {
    next(error);
  }
};

export const testTwoFactorAuthentication = async (req, res, next) => {
  try {
    const user = await User.findOne({
      $or: [{ email: req.body.email }, { username: req.body.username }],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    const { code } = req.body;

    if (user.timeout && new Date() < new Date(user.timeout)) {
      return res.status(400).json({
        message:
          "You have exceeded the maximum number of attempts! Please try again in 10 minutes.",
      });
    }

    if (user.attempts >= 3) {
      user.timeout = new Date(Date.now() + 10 * 60 * 1000);
      user.attempts = 0;
      user.code = Math.floor(Math.random() * 900000) + 100000;
      await user.save();

      const topic = `Profile created`;
      const message = `You have exceeded the maximum number of attempts! Please try again in 10 minutes. Your new code: ${user.code} `;

      mailerFunction(user, topic, message);

      return res.status(400).json({
        message:
          "You have exceeded the maximum number of attempts! Please try again in 10 minutes. You will receive a new code shortly.",
      });
    }

    if (user.code !== Number(code)) {
      user.attempts++;
      await user.save();
      return res.status(400).json({ message: "Wrong Code! Please try again!" });
    }

    await User.findByIdAndUpdate(
      { _id: user._id },
      { $unset: { attempts: "", timeout: "", code: "" } }
    );

    const token = issueJwt(user);
    res.cookie("jwt", token, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });

    await user.save();
    res.status(200).json({
      code: "LOGIN_SUCCESS",
      message: "Login successful!",
      data: user,
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleTwoFactorAuthentication = async (req, res, next) => {
  try {
    const user = await dataFunction(req, res, next);

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    const { password } = req.body;

    const passwordIsValid = await comparePassword(password, user.password);
    if (!passwordIsValid) {
      return res.status(401).json({
        code: "INVALID_PASSWORD",
        message: "The password you entered is incorrect.",
      });
    }

    user.twoFactorAuthentication = !user.twoFactorAuthentication;
    user.attempts = 0;
    await user.save();

    await User.findByIdAndUpdate({ _id: user._id }, { $unset: { code: "" } });

    const message = `Two Factor Authentication ${
      user.twoFactorAuthentication ? "activated" : "deactivated"
    }`;

    return res.status(200).json({
      message: message,
      twoFactorAuthentication: user.twoFactorAuthentication,
    });
  } catch (error) {
    next(error);
  }
};

export const TestEmailOrUsername = async(req, res, next) =>{
  try{
    const email = await User.findOne({ email: req.body.email });
    const username = await User.findOne({ username: req.body.username});
    if(!username){
      return res.status(420).json({message: "Username exists!"})
    }
    if(!email){
      return res.status(420).json({message: "Email exists!"})
    }
      return res.status(200).json({message: "Data is available!"})
  }catch(error){
    next(error);
  }
}