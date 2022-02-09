const router = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");
const Post = require("../models/Post");

// update user
router.put("/:id", async (req, res) => {
  if (req.body.userId === req.params.id) {
    if(req.body.password) {
      if(req.body.password===req.body.confirmPassword && req.body.password.length>=8) {
        try {
          const salt = await bcrypt.genSalt(10);
          req.body.password = await bcrypt.hash(req.body.password, salt);
        } catch (err) {
          return res.status(500).json(err);
        }
      } 
      else {
        res.status(400).json("Passwords do not match or password length is less than 8.")
      }
    }
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      }, {new: true});
      res.status(200).json(user);
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can update only your account!");
  }
});


// get a user by id
router.get("/userbyid/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, updatedAt, followers, followings, ...other } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get user by username
router.get("/userbyusername/:username", async(req,res) => {
  try {
    const user = await User.findOne({username: req.params.username});
    const { password, updatedAt, bookmarks, ...other } = user._doc;
    res.status(200).json(other);
  } catch(error) {
    console.log(error);
  }
})

// follow/ unfollow a user
router.put("/:id/follow", async (req, res) => {  // params.id is user jisko follow karna hai
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      const currUserAlreadyFollowsUser = currentUser.followings.indexOf(user._id)>-1;
      console.log(currUserAlreadyFollowsUser);
      if(!currUserAlreadyFollowsUser) {
        const updatedUser = await User.findByIdAndUpdate(
          req.params.id,
          {$push: {followers: req.body.userId}}, 
          {new: true}
        )
        const updatedCurrentUser = await User.findByIdAndUpdate(
          req.body.userId,
          {$push: {followings: req.params.id}},
          {new: true}
        )
        res.status(200).json(updatedCurrentUser);
      } 
      else {
        const updatedUser = await User.findByIdAndUpdate(
          req.params.id,
          {$pull: {followers: req.body.userId}}, 
          {new: true}
        )
        const updatedCurrentUser = await User.findByIdAndUpdate(
          req.body.userId,
          {$pull: {followings: req.params.id}},
          {new: true}
        )
        res.status(200).json(updatedCurrentUser);
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("you cant follow yourself");
  }
});


// unfollow a user
// router.put("/:id/unfollow", async (req, res) => {
//   if (req.body.userId !== req.params.id) {
//     try {
//       const user = await User.findById(req.params.id);
//       const currentUser = await User.findById(req.body.userId);
//       const currUserAlreadyFollowsUser = currentUser.followings.some(ele => ele._id.toString() === req.params.id);
//       if(currUserAlreadyFollowsUser) {
//         await user.updateOne({ $pull: { followers: {_id: currentUser._id} } });
//         await currentUser.updateOne({ $pull: { followings: {_id: user._id} } });
//         res.status(200).json("user has been unfollowed");
//       } else {
//         res.status(403).json("you dont follow this user");
//       }
//     } catch (err) {
//       res.status(500).json(err);
//     }
//   } else {
//     res.status(403).json("you cant unfollow yourself");
//   }
// });

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
    const posts = await Post.find({$and: [{_id: {$in: user.bookmarks}}, {isPublished: true}]});
    res.status(200).json(posts)
  } catch(err) {
    res.status(500).json(err);
  }
}) 

// get all liked posts by a user
router.get('/:id/liked', async (req,res) => {
  try {
    const likedPosts = await Post.find({$and: [{likes: {$elemMatch:  {$eq: req.params.id}}}, {isPublished: true}]})
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
    ]).limit(5);
    res.status(200).json(rankedUsers);
  } catch (error) {
    res.status(500).json(error);
  }
})

// get all followers of a user
router.get('/:id/followers', async (req,res) => {
  try {
    const user = await User.findById(req.params.id);
    const followers = await User.find({_id: {$in: user.followers}})
    res.status(200).json(followers);
  } catch(error) {
    res.status(500).json(error);
  }
})

// get all followings of a user
router.get('/:id/followings', async (req,res) => {
  try {
    const user = await User.findById(req.params.id);
    const followings = await User.find({_id: {$in: user.followings}});
    res.status(200).json(followings);
  } catch(error) {
    res.status(500).json(error);
  }
})
module.exports = router;




