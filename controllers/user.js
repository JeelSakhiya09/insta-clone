import ErrorHandler from "../middlewares/error.js";
import User from "../models/user.js";
import Otp from "../models/otp.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { generateOtp } from "../services/otp.js";
import Login from "../models/login.js";

dotenv.config();

const generateAccessAndRefereshToken = async (user_id) => {
  const user = await User.findById(user_id);
  if (!user) throw new ErrorHandler("Invalid refresh token", 401);

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save();
  return { accessToken, refreshToken };
};

export async function handleUserRegister(req, res, next) {
  const { username, email, name, password } = req.body;
  const regex = /@.{4,7}\.com/;

  try {
    if (!(username || email || name || password))
      throw new ErrorHandler("All feilds are required", 400);

    if (!regex.test(email))
      throw new ErrorHandler("Please enter valid Email", 401);

    const user = await User.findOne({ email });

    if (user) throw new ErrorHandler("User already exist", 409);

    await User.create({
      username,
      name,
      email,
      password,
    });
    return res.status(201).redirect("/login");
  } catch (error) {
    next(error);
  }
}

// 1 - single user login
// 2 - laptop ma login hoy and mobile ma login ok but 2 - laptop ma nai
// 3 - only 3 device login
export async function handleUserLogIn(req, res, next) {
  const { email, password } = req.body;
  try {
    if (!(email || password))
      throw new ErrorHandler("All feilds are required", 400);

    const userAgent = req.headers["user-agent"];
    const user = await User.findOne({ email });

    if (!user) throw new ErrorHandler("User not exist", 401);
    const loggedin = await Login.find({
      userID: user._id,
    });

    if (loggedin.length > 3)
      throw new ErrorHandler(
        `You can login only 3 device for ${process.env.ACCESS_TOKEN_EXPIRY}`,
        400
      );

    const isValidPassword = user.matchPassword(password);

    if (!isValidPassword) throw new ErrorHandler("Incorrect Password", 400);

    const { accessToken, refreshToken } = await generateAccessAndRefereshToken(
      user._id
    );

    const login = new Login({
      userID: user._id,
      token: accessToken,
      userAgent,
    });
    await login.save();

    const options = {
      httpOnly: true,
      secure: true,
    };

    return (
      res
        .status(200)
        // .json({Headers: req.headers})
        .cookie("accessToken", accessToken, {
          ...options,
          expires: new Date(Date.now() + (60 * 60 * 1000)),
        })
        .cookie("refreshToken", refreshToken, {
          ...options,
          expires: new Date(Date.now() + (3 *60 * 60 * 1000)),
        })
        .redirect("/user/feed")
    );
  } catch (error) {
    next(error);
  }
}

export async function refreshAccessToken(req, res, next) {
  const incomingResfreshToken = req.cookies.refreshToken;

  if (!incomingResfreshToken)
    throw new ErrorHandler("Unauthorized request", 401);

  try {
    const decodedToken = jwt.verify(
      incomingResfreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken._id);

    if (!user) throw new ErrorHandler("Invalid refresh token", 401);

    if (incomingResfreshToken != user?.refreshToken)
      throw new ErrorHandler("Refresh token is expired or used", 401);

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, refreshToken } = await generateAccessAndRefereshToken(
      user._id
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .redirect("/user/feed");
  } catch (error) {
    next(error);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;

    if (!email) throw new ErrorHandler("Email is required", 400);

    const user = await User.findOne({ email });
    if (!user) throw new ErrorHandler("Invalid email address", 404);

    const otp = generateOtp();
    await Otp.create({
      otp,
      emailAddress: email,
    });
    return res.status(200).cookie("email", email).set("X-email", email).json({
      sucess: true,
      otp,
    });
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { otp } = req.body;
    const email = req.cookies?.email;

    const otpSchema = await Otp.find({ emailAddress: email })
      .sort({ timestamps: -1 })
      .exec();

    if (otpSchema.length === 0)
      throw new ErrorHandler("OTP expiered please try again", 404);

    const isValid = await otpSchema[0].matchOtp(otp);

    if (!isValid) throw new ErrorHandler("Invalid otp", 400);

    return res.status(200).json({
      success: true,
      otp: isValid,
    });
  } catch (error) {
    next(error);
  }
}
