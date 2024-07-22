import { Router } from "express";
import Post from "../models/posts.js";
import User from "../models/user.js";
import upload from "./multer.js";
import ErrorHandler from "../middlewares/error.js";
import Login from "../models/login.js";

const router = Router();

router.get("/feed", async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const posts = await Post.find().populate("user");

    return res.render("feed", { posts, user });
  } catch (error) {
    next(error);
  }
});

router.get("/profile", async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate("posts");
    return res.render("profile", { user });
  } catch (error) {
    next(error);
  }
});

router.get("/edit", async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) throw new ErrorHandler("User Not Found", 404);

    return res.render("edit", { user });
  } catch (error) {
    next(error);
  }
});

router.get("/search", (req, res) => {
  return res.render("search", { user: req.user });
});

router.get("/logout", async (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  const user = await Login.findOneAndDelete({ userID: req.user._id });

  return res.status(200).redirect("/login");
});

router.get("/saved", async(req, res, next) => {
  const user = await User.findById(req.user._id).populate("saved"); 
  return res.render("saves.ejs", { user });
});

router.get("/username/:username", async (req, res, next) => {
  try {
    const regex = new RegExp(`^${req.params.username}`, "i");
    const users = await User.find({ username: regex }).select("-password");

    return res.status(200).json({ users });
  } catch (error) {
    next(error);
  }
});

router.get("/profile/:username", async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username }).populate(
      "posts"
    );

    if (!user) throw new ErrorHandler("User Not Found", 404);

    return res.render("profile", { user });
  } catch (error) {
    next(error);
  }
});

router.get("/view/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).populate(
      "posts"
    );
    if (!user) throw new ErrorHandler("User Not Found", 404);
    return res.render("veiwProfile", { user });
  } catch (error) {
    next(error);
  }
});

router.get("/follow/:userId", async (req, res, next) => {
  try {
    const logInUser = await User.findById(req.user._id);
    const userToFollow = await User.findById(req.params.userId);

    userToFollow.followers.push(req.user._id);
    await userToFollow.save();

    logInUser.following.push(userToFollow._id);
    await logInUser.save();

    return res.redirect("/user/feed");
  } catch (error) {
    next(error);
  }
});

router.get("/unfollow/:userId", async (req, res, next) => {
  try {
    const logInUser = await User.findById(req.user._id);
    const userToFollow = await User.findById(req.params.userId);

    userToFollow.followers.pull(req.user._id);
    await userToFollow.save();

    logInUser.following.pull(userToFollow._id);
    await logInUser.save();

    return res.redirect("/user/feed");
  } catch (error) {
    next(error);
  }
});

router.get("/:username/delete", async (req, res, next) => {
  try {
    const user = await User.findOneAndDelete({ username: req.params.username });
    await Post.findOneAndDelete({ user: user._id });
    if (!user) throw new Error(404, "User not exist");
    return res.status(200).json({
      sucess: true,
      msg: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

router.post("/upload", upload.single("image"), async (req, res, next) => {
  try {
    if (!req.file) throw new ErrorHandler("Invalid input", 400);
    await User.findByIdAndUpdate(req.user._id, {
      profileImage: `/images/uploads/${req.file.filename}`,
    });
    return res.redirect("/user/edit");
  } catch (error) {
    next(error);
  }
});

router.post("/update", async (req, res, next) => {
  const { username, name, bio } = req.body;
  try {
    if (!(username || name || bio))
      throw new ErrorHandler("You are not valid user", 401);
    await User.findByIdAndUpdate(req.user._id, {
      username,
      name,
      bio,
    });
    return res.redirect("/user/profile");
  } catch (error) {
    next(error);
  }
});

export default router;
