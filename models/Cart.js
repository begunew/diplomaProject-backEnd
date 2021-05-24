const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  user: [
    {
      fullName: {
        type: String,
        required: false,
      },
      email: {
        type: String,
        required: false,
      },
      phoneNumber: {
        type: Number,
        required: false,
      },
      address: {
        type: String,
        required: false,
      },
      additionalDetails: {
        required: false,
        type: String,
      },
    },
  ],
  products: [
    {
      productId: String,
      quantity: Number,
      price: Number,
    },
  ],
  status: String,

  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Cart", cartSchema);
