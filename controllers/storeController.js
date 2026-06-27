const Home = require("../models/home");
const User = require('../models/user');
const Booking = require('../models/booking');
const path = require('path');
const rootDir = require('../utils/pathUtil');

exports.getIndex = (req, res, next) => {
  console.log("Session Info:", req.session);
  Home.find().then((registeredHomes) => {
    res.render("store/index", {
      registeredHomes: registeredHomes,
      pageTitle: "airbnb Home",
      currentPage: "index",
      isLoggedIn: req.session.isLoggedIn,
      user: req.session.user,
      city: "",
    });
  });
};

exports.getHomes = async (req, res, next) => {
  try {
    const city = req.query.city?.trim() || ""; // get city and remove extra spaces

    let registeredHomes;

    // If city is provided → filter by city
    if (city) {
      registeredHomes = await Home.find({
        location: { $regex: city, $options: "i" }
      });
    } 
    // If no city → get all homes
    else {
      registeredHomes = await Home.find();
    }

    res.render("store/home-list", {
      registeredHomes: registeredHomes,
      pageTitle: "Home List",
      currentPage: "Home",
      city: city,
    });

  } catch (error) {
    console.log("Error fetching homes:", error);
    res.redirect("/");
  }
};


exports.getBookingsForm = async (req, res, next) => {
  const homeId = req.query.homeId;
  if (!homeId) return res.redirect("/homes");

  const home = await Home.findById(homeId);
  if (!home) return res.redirect("/homes");

  let errorMsg = "";
  if (req.query.error === "unavailable") {
    errorMsg = "These dates are not available for this home. Please choose different dates.";
  }

  res.render("store/bookings", {
    pageTitle: "Book Home",
    currentPage: "",
    home: home,
    errorMsg: errorMsg,
  });
};

exports.getBookings = async (req, res, next) => {
  const userId = req.session.user._id;
  const bookings = await Booking.find({ user: userId }).populate("home");
  res.render("store/bookings-list", {
    bookings: bookings,
    pageTitle: "My Bookings",
    currentPage: "bookings",
    isLoggedIn: req.session.isLoggedIn,
    user: req.session.user,
  })
};


exports.postAddBooking = async (req, res, next) => {
  try {
    const homeId = req.body.homeId;
    const userId = req.session.user._id;

    const home = await Home.findById(homeId);
    if (!home) return res.redirect("/homes");

    const checkInDate = req.body.checkInDate;
    const checkOutDate = req.body.checkOutDate;
    const guests = req.body.guests || 1;

    const inDate = new Date(checkInDate);
    const outDate = new Date(checkOutDate);

    if (outDate <= inDate) {
  return res.redirect("/book?homeId=" + homeId + "&error=invaliddates");
    }

    // NEW: check for overlapping confirmed bookings
    const conflictingBookings = await Booking.find({
      home: homeId,
      status: "confirmed",
      checkInDate: { $lt: outDate },
      checkOutDate: { $gt: inDate }
    });

    if (conflictingBookings.length > 0) {
      return res.redirect("/book?homeId=" + homeId + "&error=unavailable");
    }

    const timeDiff = outDate - inDate;
    const nights = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    const totalPrice = nights * home.price;

    const booking = new Booking({
      home: home._id,
      user: userId,
      owner: home.owner,
      checkInDate,
      checkOutDate,
      guests,
      totalPrice,
      status: "confirmed"
    });

    await booking.save();
    res.redirect("/bookings");

  } catch (err) {
    console.log("Error adding booking:", err);
    res.redirect("/homes");
  }
};

exports.getFavouriteList = async(req, res, next) => {
  const userId = req.session.user._id;
  const user = await User.findById(userId).populate('favourites');
  // console.log("this is my user :    ",user)
  res.render("store/favourite-list", {
      favouriteHomes: user.favourites || [],
      pageTitle: "My Favourites",
      currentPage: "favourites",
      isLoggedIn: req.session.isLoggedIn,
      user: req.session.user,
    });
};

exports.postAddToFavourite = async (req, res, next) => {
  // console.log("aim to add to favourite",req.body);
  const userId = req.session.user._id;
  const user = await User.findById(userId)
  const homeId = req.body.id;
  if(!user.favourites.includes(homeId)){
    user.favourites.push(homeId);
    await user.save();
  }
  res.redirect("/favourites");
};


exports.postRemoveFromFavourite = async (req, res, next) => {
  const homeId = req.params.homeId;
  const userId = req.session.user._id;
  const user = await User.findById(userId)
  if(user.favourites.includes(homeId)){
    user.favourites = user.favourites.filter(fav => fav != homeId);
    await user.save();
  }
  res.redirect("/favourites");
};



exports.getHomeDetails = (req, res, next) => {
  const homeId = req.params.homeId;
  Home.findById(homeId).then((home) => {
    // const home = homes[0];
    if (!home) {
      console.log("Home not found");
      res.redirect("/homes");
    } else {
      res.render("store/home-detail", {
        home: home,
        pageTitle: "Home Detail",
        currentPage: "Home",
        isLoggedIn: req.session.isLoggedIn,
        user: req.session.user,
      });
    }
  });
};

// exports.registeredHomes = registeredHomes;

// exports.getHouseRules = [(req,res,next) => {
//   if(!req.session.isLoggedIn){
//     return res.redirect('/login');
//   }
//   next();
// },
// (req,res,next) => {
//   const homeId = req.params.homeId;
//   const rulesFileName = path.join(rootDir, 'rules', 'rulesFileName');
//   const filePath = path.join(rootDir, 'rules', rulesFileName);
//   res.download(filePath, 'Rules.pdf');
// }
// ];
                                                                        