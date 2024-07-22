import { Schema, model } from "mongoose";
import { passwordHasing, matchPassword } from "../services/hashing.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  bio: String,
  salt: {
    type: String,
  },
  saved: [
    {
      type: Schema.Types.ObjectId,
      ref: "post",
    },
  ],
  password: {
    type: String,
    required: true,
  },
  refreshToken: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  profileImage: {
    type: String,
    default: "/images/user-avatar.jpg",
  },
  posts: [
    {
      type: Schema.Types.ObjectId,
      ref: "post",
    },
  ],
  followers: [
    {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  following: [
    {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
  ],
});

userSchema.pre("save", async function (next) {
  const user = this;
  if (!user.isModified("password")) return next();

  user.password = await passwordHasing(this.password);
  next();
});

userSchema.methods.matchPassword = async function (password) {
  const isValidPassword = await matchPassword(password, this.password);
  return isValidPassword;
};

userSchema.methods.generateAccessToken = function () {
  const payload = {
    _id: this._id,
    email: this.email,
    username: this.username,
  };
  
  return jwt.sign(
    payload,
    process.env.ACCESS_TOKEN_SECRET,
    {expiresIn: process.env.ACCESS_TOKEN_EXPIRY}
  );
};

userSchema.methods.generateRefreshToken = function () {
  const payload = {
    _id: this._id,
  };
  return jwt.sign(
    payload,
    process.env.REFRESH_TOKEN_SECRET,
    {expiresIn: process.env.REFRESH_TOKEN_EXPIRY}
  );
};

const User = model("user", userSchema);

export default User;
