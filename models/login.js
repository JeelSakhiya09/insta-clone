import { model, Schema } from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const loginSchema = new Schema ({
    userID: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    token: {
        type: String,
        required: true,
    },
    userAgent: {
        type: String,
        required: true,
    },
    loginAt: {
        type: Date,
        default: Date.now(),
        index: {
            expireAfterSeconds: 60*60*1000,
        }
    }
});

const Login = model("login", loginSchema);
export default Login;