// External Module
const express = require("express");
const storeRouter = express.Router();

//Local module
const storeController = require("../controllers/storeController.js");

storeRouter.get("/", storeController.getIndex);
storeRouter.get("/homes", storeController.getHomes);

storeRouter.get("/bookings", storeController.getBookings);  
storeRouter.get("/book", storeController.getBookingsForm);  // Show form
storeRouter.post("/bookings", storeController.postAddBooking);  // Save booking


storeRouter.get("/favourites", storeController.getFavouriteList);
storeRouter.get("/homes/:homeId", storeController.getHomeDetails);

storeRouter.post("/favourites", storeController.postAddToFavourite);
storeRouter.post("/favourites/delete/:homeId", storeController.postRemoveFromFavourite);

// storeRouter.get("/rules/:homeId", storeController.getHouseRules);

module.exports = storeRouter;

