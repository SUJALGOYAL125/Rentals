const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({

  home: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Home",
    required: true
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true
  },

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true
  },

  checkInDate: {
    type: Date,
    required: true
  },

  checkOutDate: {
    type: Date,
    required: true
  },

  guests: {
    type: Number,
    default: 1
  },

  totalPrice: {
    type: Number,
    required: true
  },

  status: {
    type: String,
    enum: ["confirmed", "cancelled"],
    default: "confirmed"
  },

  bookedAt: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("Booking", bookingSchema);
