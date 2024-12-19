import jwt from "jsonwebtoken";
import User from "../models/User";
const secretKey = process.env.JWT_SECRET;

export async function dataFunction(req, res, next){
    const token = req.cookies.jwt;
  
      if (!token) {
        const error = new Error("Token not found");
        error.statusCode = 401;
        throw error;
      }
      const decodedToken = jwt.verify(token, secretKey);
  
      const testId = decodedToken.id;
      const data = await User.findOne({ _id: testId });
  
      return data;
  }
  