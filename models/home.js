const mongoose = require("mongoose");
// const favourite = require("./favourite");

const homeSchema = mongoose.Schema({
  houseName: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  photo: String,
  description: String,
  
  owner: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "user",
  required: true
}
});

// homeSchema.pre("findOneAndDelete", async function(next) {
//   console.log("Home being deleted, remove from favourites too");
//   const homeID = this.getQuery()._id;
//   await favourite.deleteMany({ houseId: homeID });
//   // next();
// })

module.exports = mongoose.model("Home", homeSchema);
