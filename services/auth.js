import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Create Token
export function createTokenForUser(user) {
  const payload = {
    _id: user._id,
    email: user.email,
    username: user.username,
  };
  const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET);
  return token;
}

// Validate Token
export function validateToken(token) {
  const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  return payload;
}
