const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require('cors');
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");

dotenv.config();

const URL = process.env.MONGODB_URL;
mongoose.connect(URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}, err => {
  if(err) 
      throw err;
  console.log('Connected to mongodb')
})


//middleware
app.use(express.json());
app.use(cors())
app.use(helmet());
app.use(morgan("common"));

app.get('/', (req,res) => {
  res.send("Welcome of home page");
})

app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);

app.listen(5000, () => {
  console.log("Server running on port 5000...");
});