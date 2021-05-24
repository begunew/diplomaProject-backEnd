const express = require("express");
const router = express.Router();

//GET REQ
router.get("/", async (req, res) => {
  res.json(req.session.user);
});

router.post("/address", async (req, res) => {
  const { fullName, email, phone, address, details } = req.body;
  console.log(req.body); //testing input req\
  req.session.userDetails = {
    fullName,
    email,
    phone,
    address,
    details,
  };
});

// POST
router.post("/addToCart", async (req, res) => {
  const { id, qty, price, image, cartItemName } = req.body;
  if (!req.session.user) {
    req.session.user = [
      {
        id,
        qty,
        price,
        cartItemName,
        image,
      },
    ];
  }

  if (req.session.user) {
    let idFromReq = id;

    try {
      const result = req.session.user.find(({ id }) => id === idFromReq);
      if (result == null) {
        // push new user object into the array
        req.session.user.push({
          id,
          qty,
          price,
          cartItemName,
          image,
        });
      } else {
        // qty ++
        const itemIndex = req.session.user.findIndex(
          ({ id }) => id === idFromReq
        );

        req.session.user[itemIndex].qty++;
      }
    } catch (err) {
      console.log(err);
    }
  }

  res.status(200).send(req.session.user);
});

router.delete("/remove", async (req, res) => {
  const idFromReq = req.body.id;

  const result = req.session.user.find(({ id }) => id === idFromReq);

  if (result) {
    const itemIndex = req.session.user.findIndex(({ id }) => id === idFromReq);
    req.session.user.splice(itemIndex, 1);
    console.log("Index", itemIndex + " removed from the array");
  }
  res.send("ok");
});

// Update quantity
router.put("/updateInCart", async (req, res) => {});

module.exports = router;
