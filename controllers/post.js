const postModel = require("../models/postModel");
const userModel = require("../models/userModel");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});
class auth {
  create_post = async (req, res) => {
    const { content, image } = req.body;
    if (!content.length) {
      return res.json({ error: "Content is required" });
    }
    try {
      const post = new postModel({ content, image, postedBy: req.auth._id });
      await post.save();
      const result = await postModel
        .findById(post._id)
        .populate("postedBy", "-password -secret");
      res.json(result);
    } catch (error) {
      console.log(error);
      res.sendStatus(400);
    }
  };
  // end method
  upload_image = async (req, res) => {
    // console.log(req.files);
    try {
      const result = await cloudinary.uploader.upload(req.files.image.path, {
        folder: "nextJs",
      });

      res.json({
        url: result.secure_url,
        public_id: result.public_id,
      });
    } catch (error) {
      console.log(error);
    }
  };
  // end method
  get_posts = async (req, res) => {
    try {
      const posts = await postModel
        // .find({ postedBy: req.auth._id })
        .find()
        .populate("postedBy", "_id name image")
        .sort({ createdAt: -1 })
        .limit(10);

      res.json(posts);
    } catch (error) {
      console.log(error);
    }
  };
  // end method
  get_my_post = async (req, res) => {
    try {
      const post = await postModel
        .findById(req.params._id)
        .populate("postedBy", "_id name image")
        .populate("comments.postedBy", "_id name image");
      res.json(post);
    } catch (error) {
      console.log(error);
    }
  };
  // end method
  update_post = async (req, res) => {
    try {
      const post = await postModel.findByIdAndUpdate(req.params._id, req.body, {
        new: true,
      });
      res.json(post);
    } catch (error) {
      console.log(error);
    }
  };
  // end method
  delete_post = async (req, res) => {
    try {
      const post = await postModel.findByIdAndDelete(req.params._id);
      if (post.image && post.image.public_id) {
        const image = await cloudinary.uploader.destroy(post.image.public_id);
      }
      res.json({ ok: true });
    } catch (error) {
      console.log(error);
    }
  };
  // end method
  news_feed = async (req, res) => {
    try {
      const user = await userModel.findById(req.auth._id);
      let following = user.following;
      following.push(req.auth._id);

      const currentPage = req.params.page || 1;
      const parpage = 3;

      const posts = await postModel
        .find({ postedBy: { $in: following } })
        .skip((currentPage - 1) * parpage)
        .populate("postedBy", "_id name image")
        .populate("comments.postedBy", "_id name image")
        .sort({ createdAt: -1 })
        .limit(parpage);
      res.json(posts);
    } catch (error) {
      console.log(error);
    }
  };
  // end method
  like_post = async (req, res) => {
    try {
      const post = await postModel.findByIdAndUpdate(
        req.body._id,
        {
          $addToSet: { likes: req.auth._id },
        },
        { new: true }
      );
      res.json(post);
    } catch (error) {
      console.log(error);
    }
  };
  // end method
  unlike_post = async (req, res) => {
    try {
      const post = await postModel.findByIdAndUpdate(
        req.body._id,
        {
          $pull: { likes: req.auth._id },
        },
        { new: true }
      );
      res.json(post);
    } catch (error) {
      console.log(error);
    }
  };
  // end method
  add_comment = async (req, res) => {
    try {
      const { postId, comment } = req.body;
      const post = await postModel
        .findByIdAndUpdate(
          postId,
          {
            $push: { comments: { text: comment, postedBy: req.auth._id } },
          },
          { new: true }
        )
        .populate("postedBy", "_id name image")
        .populate("comments.postedBy", "_id name image");

      res.json(post);
    } catch (error) {
      console.log(error);
    }
  };
  // end method
  remove_comment = async (req, res) => {
    try {
      const { postId, comment } = req.body;
      const post = await postModel.findByIdAndUpdate(
        postId,
        {
          $pull: { comments: { _id: comment._id } },
        },
        { new: true }
      );

      res.json(post);
    } catch (error) {
      console.log(error);
    }
  };
  // end method
  total_post_count = async (req, res) => {
    try {
      const total = await postModel.find().estimatedDocumentCount();
      res.json(total);
    } catch (error) {
      console.log(error);
    }
  };
  // end method
  total_posts = async (req, res) => {
    try {
      const posts = await postModel
        .find()
        .populate("postedBy", "_id name image")
        .populate("comments.postedBy", "_id name image")
        .sort({ createdAt: -1 });

      res.json(posts);
    } catch (error) {
      console.log(error);
    }
  };
  // end method
  get_post_details = async (req, res) => {
    try {
      const post = await postModel
        .findById(req.params._id)
        .populate("postedBy", "_id name image")
        .populate("comments.postedBy", "_id name image");
      res.json(post);
    } catch (error) {
      console.log(error);
    }
  };
}
module.exports = new auth();
