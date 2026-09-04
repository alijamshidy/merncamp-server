const { expressjwt } = require("express-jwt");
const postModel = require("../models/postModel");
const userModel = require("../models/userModel");
const requireSignIn = expressjwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
});
const canEditDeletePost = async (req, res, next) => {
  try {
    const post = await postModel.findById(req.params._id);

    if (req.auth._id != post.postedBy.toString()) {
      return res.status(400).send("Unauthorized");
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
  }
};
const checkAdmin = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.auth._id);
    if (user.role !== "Admin") {
      return res.status(400).send("Unauthorized");
    } else next();
  } catch (error) {
    console.log(error);
  }
};
module.exports = { requireSignIn, canEditDeletePost, checkAdmin };
