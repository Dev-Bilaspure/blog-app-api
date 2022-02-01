const router = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");
const Post = require("../models/Post");

// update user
router.put("/:id", async (req, res) => {
  if (req.body.userId === req.params.id) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (err) {
        return res.status(500).json(err);
      }
    }
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json("Account has been updated");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can update only your account!");
  }
});


// get a user
router.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    res.status(500).json(err);
  }
});


// follow a user
router.put("/:id/follow", async (req, res) => {  // params.id is user jisko follow karna hai
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      const currUserAlreadyFollowsUser = currentUser.followings.some(ele => ele._id.toString() === req.params.id);
      delete user.password;
      delete currentUser.password;
      console.log(currUserAlreadyFollowsUser);
      if (!currUserAlreadyFollowsUser) {
        await user.updateOne({ $push: { followers: {
          _id: currentUser._id, 
          name: currentUser.name, 
          username: currentUser.username,
          profilePicture: currentUser?.profilePicture
        }}});
        await currentUser.updateOne({ $push: { followings: {
          _id: user._id, 
          name: user.name, 
          username: user.username,
          profilePicture: user?.profilePicture
        }}});
        res.status(200).json("user has been followed");
      } else {
        res.status(403).json("you allready follow this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("you cant follow yourself");
  }
});


// unfollow a user
router.put("/:id/unfollow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      const currUserAlreadyFollowsUser = currentUser.followings.some(ele => ele._id.toString() === req.params.id);
      if(currUserAlreadyFollowsUser) {
        await user.updateOne({ $pull: { followers: {_id: currentUser._id} } });
        await currentUser.updateOne({ $pull: { followings: {_id: user._id} } });
        res.status(200).json("user has been unfollowed");
      } else {
        res.status(403).json("you dont follow this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("you cant unfollow yourself");
  }
});

// get all published posts by a user
router.get('/:id/published', async (req,res) => {
  try {
    const publishedPosts = await Post.find({$and: [{ userId: req.params.id }, {isPublished: true}]});
    res.status(200).json(publishedPosts);
  } catch(err) {
    res.status(500).json(err);
  }
})



// get all draft posts by a user
router.get('/:id/draft', async (req,res) => {
  try {
    const draftPosts = await Post.find({$and: [{ userId: req.params.id }, {isPublished: false}]});
    res.status(200).json(draftPosts);
  } catch(err) {
    res.status(500).json(err);
  }
})

// get bookmark posts
router.get('/:id/bookmark', async(req,res) => {
  try {
    const user = await User.findById(req.params.id);
    res.status(200).json(user.bookmarks)
  } catch(err) {
    res.status(500).json(err);
  }
}) 

// get all liked posts by a user
router.get('/:id/liked', async (req,res) => {
  try {
    const likedPosts = await Post.find({ likes: { $elemMatch:  {$eq: req.params.id} } })
    res.status(200).json(likedPosts);
  } catch(err) {
    res.status(500).json(err);
  }
})

// get all user sorted by their followers count
router.get('/ranked', async (req,res) => {
  try {
    const rankedUsers = await User.aggregate([
      {
        $addFields: {
          followersArrayLength: {
            $size: "$followers"
          }
        }
      },
      {
        $sort: {
          followersArrayLength: -1
        }
      }
    ])
    let arr = [];
    rankedUsers.forEach(rankedUser => {
      arr.push({
        _id: rankedUser._id,
        name: rankedUser.name,
        profilePicture: rankedUser?.profilePicture,
        followersCount: rankedUser.followers.length
      });
    })
    res.status(200).json(arr);
  } catch (error) {
    res.status(500).json(error);
  }
})

// get all followers of a user
router.get('/:id/followers', async (req,res) => {
  try {
    const user = await User.findById(req.params.id);
    res.status(200).json(user.followers);
  } catch(error) {
    res.status(500).json(error);
  }
})

// get all followings of a user
router.get('/:id/followings', async (req,res) => {
  try {
    const user = await User.findById(req.params.id);
    res.status(200).json(user.followings);
  } catch(error) {
    res.status(500).json(error);
  }
})
module.exports = router;




