const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const validateAll = require("../methods/validation");

// register
router.post('/register', async (req,res) => {
  try {
    if(req.body.password===req.body.confirmPassword && req.body.password.length>=8) {
      // generating hashed passoword
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);

      // generating new user
      const newUser = new User({
        name: req.body.name,
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword 
      })

      // saving the new user
      const user = await newUser.save();
      res.status(200).json(user);
    } else {  
      res.status(400).json("Passwords do not match or passowrd length is less than 8");
    }
  } catch(error) {
    res.status(500).json(error);
  }
})


// login
router.post("/login",  async (req, res) => {
  try {
    const user = await User.findOne({email: req.body.email});
    if(user) {
      const validPassword = await bcrypt.compare(req.body.password, user.password);
      if(validPassword) {
        res.status(200).json(user);
      } else {
        res.status(400).json('wrong password');
      }
    } else {
      res.status(404).json("user not found");
    }
    
  } catch(error) {
    res.status(500).json(error);
  }
})

module.exports = router;