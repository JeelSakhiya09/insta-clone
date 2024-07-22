import { Router } from "express";
import upload from "./multer.js";
import Post from "../models/posts.js";
import User from "../models/user.js";
import ErrorHandler from "../middlewares/error.js";

const router = Router();

router.get("/upload", (req, res) => {
  res.render("upload", { user: req.user });
});

router.get("/like/:postid", async (req, res, next) => {
  try {
    if (!req.params.postid) throw new ErrorHandler("Post not found", 404);
    const post = await Post.findById(req.params.postid);

    if (post.like.indexOf(req.user._id) === -1) {
      await post.like.push(req.user._id);
    } else {
      await post.like.pull(req.user._id);
    }

    await post.save();

    return res.status(200).redirect("/user/feed");
  } catch (error) {
    next(error);
  }
});

router.post("/comment/:postid", async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postid);

    post.comments.push({
      comment: req.body.comment,
      username: req.user.username,
    });

    await post.save();
    return res.status(200).redirect("/user/feed");
  } catch (error) {
    next(error);
  }
});

router.get("/comment/:postid/:username", async(req, res, next) => {
  try {
    const post = await Post.findById(req.params.postid);
    const commentIndex = post.comments.findIndex(comment => comment.username === req.params.username);
    
    if (commentIndex === -1) {
      return res.status(404).send('Comment not found');
      }
    post.comments.splice(commentIndex, 1);
    await post.save();
    return res.status(200).redirect("/user/feed");
  } catch (error) {
    next(error);
  }
})

router.get("/post/:postid", (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
});

router.get("/save/:postid", async(req, res, next)=> {
  try { 
    await User.findByIdAndUpdate(req.user._id, {$push: {
      saved: req.params.postid,
    }});
    return res.status(200).redirect("/user/feed");
  } catch (error) {
    next(error);
  }
});

router.get("/unsave/:postid", async(req, res, next)=> {
  try { 
    await User.findByIdAndUpdate(req.user._id, {$pull: {
      saved: req.params.postid,
    }});
    return res.status(200).redirect("/user/feed");
  } catch (error) {
    next(error);
  }
});

router.post("/upload", upload.single("image"), async (req, res) => {
  const { caption } = req.body;

  try {
    const image = req.file?.path;
    if (!image) throw new Error("Image is required");

    const post = await Post.create({
      user: req.user._id,
      caption,
      picture: req.file.filename,
    });
    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        posts: post._id,
      },
    });
    return res.redirect("/user/profile");
  } catch (error) {
    return res.status(400).json({
      error,
    });
  }
});

export default router;
