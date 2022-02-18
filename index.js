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
const multer = require("multer");
const path = require("path");
const { cloudinary } = require("./utils/cloudinary");

dotenv.config();

//middleware
app.use(helmet());
app.use(morgan("common"));
app.use(express.static('public'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors())

const PORT = process.env.PORT || 5000;

const URL = process.env.MONGODB_URL;
mongoose.connect(URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}, err => {
  if(err) 
      throw err;
  console.log('Connected to mongodb')
})

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "images");
//   },
//   filename: (req, file, cb) => {
//     cb(null, req.body.name);
//   },
// });

// const upload = multer({ storage: storage });
// app.post("/api/upload", upload.single("file"), (req, res) => {
//   res.status(200).json("File has been uploaded");
// });

app.post('/api/upload', async (req, res) => {
  try {
      const fileStr = req.body.base64EncodedImage;
      // console.log(fileStr)
      const uploadResponse = await cloudinary.uploader.upload(fileStr, {
          upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
      });
      console.log(uploadResponse);
      res.status(200).json({ imageURL: uploadResponse.secure_url});
  } catch (err) {
      console.error(err);
      res.status(500).json({ err: 'Something went wrong' });
  }
});


app.get('/', (req,res) => {
  res.send("Melcome of home page");
})


app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);

app.listen(PORT, () => {
  console.log("Server running on port 5000...");
});