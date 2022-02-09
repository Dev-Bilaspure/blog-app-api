const router = require("express").Router();
const User = require("../models/User");
const Post = require("../models/Post");
const mongoose = require('mongoose');
const { findByIdAndUpdate } = require("../models/User");

// create new post as published post
router.post("/publish", async (req, res) => {
  try {
    const newPost = new Post(req.body);
    newPost.isPublished = true;
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    res.status(500).json(err);
  }
});

// create new post as draft post
router.post("/draft", async (req, res) => {
  try {
    const newPost = new Post(req.body);
    newPost.isPublished = false;
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    res.status(500).json(err);
  }
});

// update and publish
router.put("/:id/publish", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      try {
        const updatedPost = await Post.findByIdAndUpdate(
          req.params.id,
          {
            $set: req.body,
            isPublished: true
          },
          { new: true }
        );
        res.status(200).json(updatedPost);
      } catch (err) {
        res.status(500).json(err);
      }
    } else {
      res.status(401).json("You can update only your post!");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// update and draft
router.put("/:id/draft", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      try {
        const updatedPost = await Post.findByIdAndUpdate(
          req.params.id,
          {
            $set: req.body,
            isPublished: false
          },
          { new: true }
        );
        res.status(200).json(updatedPost);
      } catch (err) {
        res.status(500).json(err);
      }
    } else {
      res.status(401).json("You can update only your post!");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});


//DELETE POST
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if(post) {
      if (post.username === req.body.username) {
        try {
          await post.delete();
          res.status(200).json("Post has been deleted...");
        } catch (err) {
          res.status(500).json(err);
        }
      } else {
        res.status(401).json("You can delete only your post!");
      }
    }
    else {
      res.status(403).json("Post already does not exist");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//like / unlike a post
router.put("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if(post) {
      if (!post.likes.includes(req.body.userId)) {
        const updatedPost = await Post.findByIdAndUpdate(
          req.params.id, 
          {$push: {likes: req.body.userId}}
        );
        res.status(200).json("The post has been liked");
      } else {
        const updatedPosts = await Post.findByIdAndUpdate(
          req.params.id, 
          {$pull: {likes: req.body.userId}}
        );
        res.status(200).json("The post has been unliked");
      }
    } 
    else {
      res.status(403).json("Post does not exist");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// add/remove a post to/from bookmark for a user
router.put("/:id/bookmark", async (req, res) => {   // post id in params

  try {
    const user = await User.findById(req.body.userId);
    const isPostAlreadyBookmarked = user.bookmarks.indexOf(req.params.id)>-1;
    if(!isPostAlreadyBookmarked) {
      const updatedUser = await User.findByIdAndUpdate(
        req.body.userId, 
        {$push: {bookmarks: req.params.id}}, 
        {new: true}
      )
      res.status(200).json(updatedUser);
    } else {
      const updatedUser = await User.findByIdAndUpdate(
        req.body.userId,
        {$pull: {bookmarks: req.params.id}}, 
        {new: true}
      )
      res.status(200).json(updatedUser);
    }
  } catch(error) {
    res.status(500).json(error);
  }


  // try {
  //   const user = await User.findById(req.body.userId);
  //   if(user) {
  //     const post = await Post.findById(req.params.id);
  //     if(post) {
  //       const postFound = user.bookmarks.some(el => el._id.toString() === req.params.id);
  //       if(!postFound) {
  //         await user.updateOne({ $push: { bookmarks: post } }, {new: true});
  //         res.status(200).json(user);
  //       }
  //       else {
  //         await user.updateOne({ $pull: { bookmarks: { _id: mongoose.Types.ObjectId(req.params.id) } } }, {new: true});
  //         res.status(200).json(user);
  //       }
  //     } else {
  //       res.status(403).json("Post does not exist");
  //     }
  //   } else {
  //     res.status(403).json("User does not exist");
  //   }
  // } catch (err) {
  //   res.status(500).json(err);
  // }
});

// get posts with particular tag
router.get('/:tag/tag', async (req,res) => {
  try {
    const tagRelatedPosts = await Post.find({$and: [{tags: { $elemMatch:  {$eq: req.params.tag}}}, {isPublished: true}]});
    res.status(200).json(tagRelatedPosts);
  } catch(err) {
    res.status(500).json(err);
  }
})

// get all posts of the users to whom all a user is following
router.get('/:id/following', async (req,res) => {  
  try {
    const user = await User.findById(req.params.id);
    const posts = await Post.find({$and: [{userId: {$in: user.followings}}, {isPublished: true}]});
    res.status(200).json(posts);
  } catch(err) {
    res.status(500).json(err);
  }
})

// to get post by id
router.get('/:id', async (req,res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch(err) {
    res.status(500).json(err);
  }
})

// to get all published posts from every user
router.get('/', async (req,res) => {
  try {
    const posts = await Post.find({isPublished: true});
    res.status(200).json(posts);
  } catch(err) {
    res.status(500).json(err);
  }
})

// all posts which have atleast one tag present in the given tag array
router.post('/tagsarray/withgiventags', async (req, res) => {
  try {
    // console.log(JSON.parse(req.body.tagsArray));
    const posts = await Post.find({$and: [{tags: {$elemMatch: {$in: req.body.tagsArray}}}, {isPublished: true}]})
    // const posts = await Post.find();
    res.status(200).json(posts);
  } catch(error) {
    res.status(500).json(error);
  }
})



module.exports = router;

