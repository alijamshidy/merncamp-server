const express = require("express");
const post = require("../controllers/post.js");
const formidable = require("express-formidable");
const {
  requireSignIn,
  canEditDeletePost,
  checkAdmin,
} = require("../middlewares/auth.js");
const router = express.Router();

router.post("/create-post", requireSignIn, post.create_post);
router.post(
  "/upload-image",
  requireSignIn,
  formidable({ maxFileSize: 5 * 1024 * 1024 }),
  post.upload_image
);
router.get("/get-posts", requireSignIn, post.get_posts);
router.get("/news-feed/:page", requireSignIn, post.news_feed);
router.get("/user-post/:_id", requireSignIn, post.get_my_post);
router.put(
  "/update-post/:_id",
  requireSignIn,
  canEditDeletePost,
  post.update_post
);
router.delete(
  "/delete-post/:_id",
  requireSignIn,
  canEditDeletePost,
  post.delete_post
);
router.put("/like-post", requireSignIn, post.like_post);
router.put("/unlike-post", requireSignIn, post.unlike_post);
router.put("/add-comment", requireSignIn, post.add_comment);
router.put("/remove-comment", requireSignIn, post.remove_comment);
router.get("/total-post-count", post.total_post_count);
router.get("/posts", post.total_posts);
router.get("/post/:_id", post.get_post_details);
//admin
router.delete(
  "/admin/delete-post/:_id",
  requireSignIn,
  checkAdmin,
  post.delete_post
);

module.exports = router;
