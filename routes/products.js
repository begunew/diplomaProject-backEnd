const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const path = require("path");

//GETS PRODUCT
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.json({ message: err });
  }
});

//GET CAT FOOD DATA
router.get("/cat", async (req, res) => {
  try {
    const products = await Product.find({ animal_type: "cat" });
    res.json(products);
  } catch (err) {
    res.json({ message: err });
  }
});

//GET DOG FOOD DATA
router.get("/dog", async (req, res) => {
  try {
    const products = await Product.find({ animal_type: "dog" });
    res.json(products);
  } catch (err) {
    res.json({ message: err });
  }
});

// SEND IMAGE FILES FOR PRODUCTS TO FRONT-END
router.get("/image/:type/:name", function (req, res, next) {
  let fileName = req.params.name;
  let animalType = req.params.type;

  res.sendFile(
    "/images/" + animalType + "/" + fileName,
    {
      root: path.dirname(__dirname),
    },
    (err) => {
      if (err) {
        next(err);
      }
    }
  );
});

//SPECIFIC PRODUCT BY ID
router.get("/:productId", async (req, res) => {
  console.log(req.params);

  try {
    const product = await Product.findById(req.params.productId);
    res.json(product);
  } catch (err) {
    res.json({ message: err });
  }
});

// //SPECIFIC GET POST

// router.get("/:postId", async (req, res) => {
//   try {
//     const post = await await Post.findById(req.params.postId);
//     res.json(post);
//   } catch (err) {
//     res.json({ message: err });
//   }
// });

// //REMOVE POST
// router.delete("/:postId", async (req, res) => {
//   try {
//     const removedPost = await Post.deleteOne({
//       _id: req.params.postId,
//     });
//     res.json(removedPost);
//   } catch (err) {
//     res.json({ message: err });
//   }
// });
//SUBMITS POST
// router.post("/", async (req, res) => {
//   const post = new Post({
//     title: req.body.title,
//     description: req.body.description,
//   });

//   try {
//     const savedPost = await post.save();
//     res.status(200).json(savedPost);
//   } catch (err) {
//     res.json({ message: err });
//   }
// });

//UPDATE POST
// router.patch("/:postId", async (req, res) => {
//   try {
//     const updatedPost = await Post.updateOne(
//       { _id: req.params.postId },
//       { $set: { title: req.body.title, description: req.body.description } }
//     );
//     res.json(updatedPost);
//   } catch (err) {
//     res.json({ message: err });
//   }
// });

module.exports = router;
