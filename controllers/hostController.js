const Home = require("../models/home");
const User = require('../models/user');
const Booking = require('../models/booking');  
const cloudinary = require("cloudinary").v2;     
const fs = require('fs');

exports.getAddHome = (req, res, next) => {
  res.render("host/edit-home", {
    pageTitle: "Add Home to airbnb",
    currentPage: "addHome",
    editing: false,
    // isLoggedIn: req.session.isLoggedIn,
    // user: req.session.user,
  });
};

exports.getEditHome = (req, res, next) => {
  const homeId = req.params.homeId;
  const editing = req.query.editing === "true";
  Home.findById(homeId).then((home) => {
    // const home = homes[0];
    if (!home) {
      console.log("Home not found");
      return res.redirect("/host/host-home-list");
    }
    if (!home.owner.equals(req.user._id)) {
      return res.status(403).send("Not authorized");
    }
    // console.log(home);
    res.render("host/edit-home", {
      home: home,
      pageTitle: "Edit your Home",
      currentPage: "host-homes",
      editing: editing,
      isLoggedIn: req.session.isLoggedIn,
      user: req.session.user,
    });
  });
};

exports.getHostHomes = (req, res, next) => {
  Home.find({ owner: req.user._id }).then((registeredHomes) => {
    res.render("host/host-home-list", {
      registeredHomes: registeredHomes,
      pageTitle: "Host Home List",
      currentPage: "host-homes",
      isLoggedIn: req.session.isLoggedIn,
      user: req.session.user,
    });
  });
};

exports.postAddHome = (req, res, next) => {
  const { houseName, price, location, rating, description } =
    req.body;
  console.log(houseName,price,location,rating,description)
  console.log(req.file)

  if(!req.file){
    return res.status(422).send("No image provided");
  }
  const photo = req.file.path;
  const photoPublicId = req.file.filename;

  const home = new Home({
    houseName,
    price,
    location,
    rating,
    photo,
    photoPublicId,
    description,
    owner: req.user._id   
  });
  home.save().then(() => {
    console.log("Home Added Successfully");
    res.redirect("/host/host-home-list");
  });
};

exports.postEditHome = (req, res, next) => {
  const { id, houseName, price, location, rating, description} =
    req.body;
  Home.findById(id)
    .then((home) => {

      if (!home.owner.equals(req.user._id)) {
        return res.status(403).send("Not authorized");
      }

      home.houseName = houseName;
      home.price = price;
      home.location = location;
      home.rating = rating;
      home.description = description;

      if(req.file){
        if (home.photoPublicId) {
          cloudinary.uploader.destroy(home.photoPublicId, (err, result) => {
            if (err) {
              console.log("error while deleting old Cloudinary image", err);
            }
          });
        }
        home.photo = req.file.path;
        home.photoPublicId = req.file.filename;
      }

      home.save().then((result) => {
          console.log("Home Updated Successfully", result);
        })
        .catch((err) => {
          console.log("Error while uodating", err);
        });
      res.redirect("/host/host-home-list");
    })
    .catch((err) => {
      console.log("Error while finding home", err);
    });
};

exports.postDeleteHome = (req, res, next) => {
  const homeId = req.params.homeId;

  Home.findById(homeId)
    .then((home) => {

      if (!home.owner.equals(req.user._id)) {
        return res.status(403).send("Not authorized");
      }
      if (home.photoPublicId) {
        cloudinary.uploader.destroy(home.photoPublicId, (err, result) => {
          if (err) {
            console.log("error while deleting Cloudinary image on home delete", err);
          }
        });
      }
      return Home.findByIdAndDelete(homeId);
    })
    .then(() => {
      res.redirect("/host/host-home-list");
    })
    .catch((err) => console.log(err));
};





exports.getHostBookings = async (req, res, next) => {
  const userId = req.session.user._id;
  const bookings = await Booking.find({ owner: userId }).populate(['home','user']);
    res.render("host/host-bookings-list", {
    bookings: bookings,
    pageTitle: "Bookings on My Properties",
    currentPage: "host-bookings",
    isLoggedIn: req.session.isLoggedIn,
    user: req.session.user,
  })
};

