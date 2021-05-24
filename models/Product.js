const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  weight: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  animal_type: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Products", productSchema);
