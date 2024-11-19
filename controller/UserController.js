import User from "../models/User"
import { hashPassword, comparePassword } from "../middlewares/hashPassword.js";


export const getAllUser = async (req, res, next) => {
    try{
        res.json(await User.find())
    }catch (error){
        next(error)
    }
}

export const createUser = async (req, res, next) => {
    try {
      req.body.password = await hashPassword(req.body.password);


      res.status(200).json(await User.create(req.body));
    } catch (error) {
      next(error);
    }
  };