const userModel = require("../models/userModel.js");
const { hashPassword, comparePassword } = require("../helpers/auth.js");
const jwt = require("jsonwebtoken");
const { nanoid } = require("nanoid");
const mongoose = require("mongoose");
class auth {
  register = async (req, res) => {
    const { name, email, password, secret } = req.body;
    console.log(name, email, password, secret);
    //valdation
    if (!name) {
      return res.json({ error: "Name is required" });
    }
    if (!password || password.length < 6) {
      return res.json({
        error: "Password is required and should be 6 characters long",
      });
    }
    if (!secret) {
      return res.json({ error: "Answer is required" });
    }
    const exist = await userModel.findOne({ email });
    if (exist) {
      return res.json({ error: "Email is taken" });
    }
    const hashedPassword = await hashPassword(password);

    const user = new userModel({
      name,
      email,
      password: hashedPassword,
      secret,
      username: nanoid(6),
    });
    try {
      await user.save();
      console.log("user registered");
      return res.json({
        ok: true,
      });
    } catch (error) {
      console.log(error);
      return res.json({ error: "Error. Try again." });
    }
  };
  //end Method
  login = async (req, res) => {
    const { email, password } = req.body;
    //check if our db has user with that email

    try {
      const user = await userModel.findOne({ email });
      if (!user) {
        return res.json({ error: "No user found" });
      }
      //check password
      const match = await comparePassword(password, user.password);
      if (!match) {
        return res.json({ error: "Wrong password" });
      }
      // create singed token
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });
      user.password = undefined;
      user.secret = undefined;
      res.json({
        token,
        user,
      });
    } catch (error) {
      console.log(error);
      return res.json({ error: "Error. Try again." });
    }
  };
  //end Method
  current_user = async (req, res) => {
    try {
      const user = await userModel.findById(req.auth._id);
      if (user) {
        res.json({ ok: true });
      }
    } catch (error) {
      console.log(error);
      req.sendStatus(400);
    }
  };
  //end Method
  forgot_password = async (req, res) => {
    const { email, newPassword, secret } = req.body;
    if (!newPassword || !newPassword < 6) {
      return res.json({
        error: "New password is required and should be min 6 characters long",
      });
    }
    if (!secret) {
      return res.json({
        error: "Secret is required",
      });
    }
    const user = await userModel.findOne({ email, secret });
    if (!user) {
      return res.json({
        error: "We can verify you with those details",
      });
    }
    try {
      const hashed = await hashPassword(newPassword);
      await userModel.findByIdAndUpdate(user._id, { password: hashed });
      return res.json({
        success: "Congrats,Now you can login With your new password",
      });
    } catch (error) {
      console.log(error);
      return res.json({ error: "Something wrong. Try again" });
    }
  };
  update_profile = async (req, res) => {
    try {
      const data = {};

      if (req.body.userName) {
        data.username = req.body.userName;
      }
      if (req.body.about) {
        data.about = req.body.about;
      }
      if (req.body.name) {
        data.name = req.body.name;
      }
      if (req.body.password) {
        if (req.body.password.length < 6) {
          return res.json({
            error: "Password is required and should be min 6 characters long",
          });
        } else {
          data.password = await hashPassword(req.body.password);
        }
      }
      if (req.body.secret) {
        data.secret = req.body.secret;
      }
      if (req.body.image) {
        data.image = req.body.image;
      }
      let user = await userModel.findByIdAndUpdate(req.auth._id, data, {
        new: true,
      });
      user.password = undefined;
      user.secret = undefined;
      res.json(user);
    } catch (err) {
      if (err.code == 11000) {
        return res.json({ error: "Duplicate username" });
      }
      console.log(err);
    }
  };
  // end method
  find_people = async (req, res) => {
    try {
      const users = await userModel.findById(req.auth._id);
      let following = users.following;
      following.push(req.auth._id);
      const people = await userModel
        .find({
          _id: {
            $nin: following,
          },
        })
        .select("-password -secret")
        .limit(10);
      res.json(people);
    } catch (error) {
      console.log(error);
    }
  };
  // end method
  follow_user = async (req, res) => {
    try {
      const user = await userModel
        .findByIdAndUpdate(
          req.auth._id,
          {
            $addToSet: { following: req.body._id },
          },
          { new: true }
        )
        .select("-password -secret");
      res.json(user);
    } catch (error) {
      console.log(error);
    }
  };
  // end method
  add_follower = async (req, res, next) => {
    try {
      const user = await userModel.findByIdAndUpdate(req.body._id, {
        $addToSet: { followers: req.auth._id },
      });
      next();
    } catch (error) {
      console.log(error);
    }
  };
  // end method middleware
  user_following = async (req, res) => {
    try {
      const user = await userModel.findById(req.auth._id);
      const following = await userModel
        .find({ _id: user.following })
        .limit(100);
      res.json(following);
    } catch (error) {
      console.log(error);
    }
  };
  //end method

  remove_follower = async (req, res, next) => {
    try {
      const user = await userModel.findByIdAndUpdate(req.body._id, {
        $pull: { followers: req.auth._id },
      });
      next();
    } catch (err) {
      console.log(err);
    }
  };
  //end metod
  unfollow_user = async (req, res) => {
    try {
      const user = await userModel.findByIdAndUpdate(
        req.auth._id,
        {
          $pull: { following: req.body._id },
        },
        { new: true }
      );
      res.json(user);
    } catch (err) {
      console.log(err);
    }
  };
  //end method
  search_user = async (req, res) => {
    const { query } = req.params;
    if (!query) return;
    try {
      // $regex is special method from mongodb
      // the i modifier is used to preform case-insensitive matching
      const user = await userModel
        .find({
          $or: [
            { name: { $regex: query, $options: "i" } },
            { username: { $regex: query, $options: "i" } },
          ],
        })
        .select("-password -secret");
      res.json(user);
    } catch (err) {
      console.log(err);
    }
  };
  //end method
  get_user = async (req, res) => {
    try {
      const user = await userModel
        .findOne({ username: req.params.username })
        .select("-password -secret");
      res.json(user);
    } catch (err) {
      console.log(err);
    }
  };
}
module.exports = new auth();
