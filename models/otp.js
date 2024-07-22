import { Schema, model } from "mongoose";
import { passwordHasing, matchPassword } from "../services/hashing.js";

const otpSchema = new Schema({
  otp: {
    type: String,
    required: true,
  },
  emailAddress: {
    type: String,
    required: true,
  },
  timestamps: {
    type: Date,
    default: Date.now(),
    index: {
      expireAfterSeconds: 60,
    },
  },
});

otpSchema.pre("save", async function (next) {
  this.otp = await passwordHasing(this.otp);
  next();
});

otpSchema.methods.matchOtp = async function (otp) {
  const isValidOtp = await matchPassword(otp, this.otp);
  return isValidOtp;
};

const Otp = model("otp", otpSchema);
export default Otp;
