import { Router } from "express";
import {
  handleUserLogIn,
  handleUserRegister,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
} from "../controllers/user.js";
import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";

const router = Router();

// Limit for OTP
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 5,
  message: "Too many request please try after 5 minutes",
});

const slowDownRequest = slowDown({
  windowMs: 5 * 60 * 1000,
  delayAfter: 3,
  delayMs: (hits) => hits*1000,
});

router.get("/", function (req, res) {
  res.render("index");
});

router.get("/login", function (req, res) {
  res.render("login");
});

router.post("/register", handleUserRegister);

router.post("/login", handleUserLogIn);

router.route("/refresh-token").get(refreshAccessToken).post(refreshAccessToken);

router.post("/forgot-password", slowDownRequest, limiter, forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
