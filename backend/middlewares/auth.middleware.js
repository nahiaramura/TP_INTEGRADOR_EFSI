import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();


export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];


  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "No token provided."
    });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      success: false,
      message: "Token malformado."
    });
  }


  const token = parts[1];


  try {
    console.log(token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized."
    });
  }
};
