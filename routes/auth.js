const express = require("express");
const auth = require("../controllers/auth.js");
const { requireSignIn, checkAdmin } = require("../middlewares/auth.js");
const router = express.Router();

router.post("/register", auth.register);
router.post("/login", auth.login);
router.get("/current-user", requireSignIn, auth.current_user);
router.post("/forgot-password", auth.forgot_password);
router.put("/profile-update", requireSignIn, auth.update_profile);
router.get("/find-people", requireSignIn, auth.find_people);
router.get("/user-following", requireSignIn, auth.user_following);
router.put("/user-follow", requireSignIn, auth.add_follower, auth.follow_user);
router.put(
  "/user-unfollow",
  requireSignIn,
  auth.remove_follower,
  auth.unfollow_user
);
router.get("/search-user/:query", auth.search_user);
router.get("/user/:username", auth.get_user);
router.get("/current-admin", requireSignIn, checkAdmin, auth.current_user);
module.exports = router;
