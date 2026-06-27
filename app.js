// changes are made in 3 files app.js, edit-home-ejs, hostController

require("dotenv").config();
// Core Module
const path = require("path");

// External Module
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const multer = require("multer")

//Local Module
const storeRouter = require("./routes/storeRouter.js");
const hostRouter = require("./routes/hostRouter.js");
const authRouter = require("./routes/authRouter.js");
const rootDir = require("./utils/pathUtil.js");
const errorsController = require("./controllers/errors.js");
// const {mongoConnect} = require("./utils/databaseUtil");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const DB_PATH = process.env.DB_PATH;


const randomString = (length) => {
  const characters = 'abcdefghijklmnopqrstuvwxyz';
  let result = '';
  for(let i = 0; i < length ; i++){
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    cb(null, randomString(10) + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'){
    cb(null, true);
  } 
  else {
    cb(null, false);
  }
  return;
}

const multerOptions = {
  storage, fileFilter
}

app.use(express.static(path.join(rootDir, "public")));
app.use(express.urlencoded({ extended: true }));
//use to handle multer
app.use(multer(multerOptions).single('photo'));
app.use("/uploads", express.static(path.join(rootDir, 'uploads')));
app.use("/host/uploads", express.static(path.join(rootDir, 'uploads')));
app.use("/homes/uploads", express.static(path.join(rootDir, 'uploads')));


const store = new MongoDBStore({
  uri: DB_PATH,
  collection: "sessions",
});

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use((req, res, next) => {
  if (req.session && req.session.user) {
    req.user = req.session.user;
  }
  next();
});

const isAuth = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect("/login");
  }
  next();
};

app.use((req, res, next) => {
  res.locals.isLoggedIn = req.session.isLoggedIn;
  res.locals.user = req.session.user;
  next();
});

app.use(authRouter);
app.use("/bookings", isAuth);
app.use("/book", isAuth);
app.use("/favourites", isAuth);
app.use(storeRouter);

app.use("/host", (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect("/login");
  }
  next();
});
app.use("/host", hostRouter);
app.use(errorsController.pageNotFound);

const PORT = process.env.PORT || 3002;

mongoose.connect(DB_PATH)
  .then(() => {
    console.log("Connected to MongoDB using Mongoose");
    app.listen(PORT, () => {
      console.log(`Server running on address http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Error while connecting to MongoDB using Mongoose", err);
  });
