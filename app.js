import express from "express";
import staticRouter from "./routes/staticRoute.js";
import userRouter from "./routes/user.js";
import postRouter from "./routes/post.js";
import cookieParser from "cookie-parser";
import { connectMongoDb } from "./connection.js";
import { checkForAuthenticationCookie } from "./middlewares/auth.js";
import { errorMiddleware } from "./middlewares/error.js";
import dotenv from "dotenv";
const app = express();
dotenv.config();

// view engine setup
app.set('view engine', 'ejs');

// MongoDB connection
connectMongoDb(process.env.MONGODB_URL)
.then(() => console.log("Connected to mongoDB"))
.catch((err) => console.log(err))

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static('public'));

// Routes
app.use('/', staticRouter);
app.use('/user', checkForAuthenticationCookie("accessToken"), userRouter);
app.use('/post', checkForAuthenticationCookie("accessToken"), postRouter);

// Error middleware
app.use(errorMiddleware);

// Listen
app.listen(process.env.PORT, () => {
  console.log(`Server at http://localhost:${process.env.PORT}`);
});