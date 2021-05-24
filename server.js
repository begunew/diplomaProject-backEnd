const express = require("express");
const paypal = require("@paypal/checkout-server-sdk");
const app = express();
const port = 3000;
const session = require("express-session");
const MongoStore = require("connect-mongo");

//DATABASE CONFIG
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/diploma", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

// PAYPAL CONFIG
let clientId =
  "AUntlskGKhlHZK3SeZ_jn3qPsgMocLaiftYt9lVRWWDcFNs5Nd7-Dasfu_lyl8kyPBMybFZ7GMhA9kTo";
let clientSecret =
  "ELLCwZ6HINnDpim413cPQ-c6_0UaAle7A6CikTsSItjkM0gVzEA1XybEYzvEN1DifXp4x4mB17NWLLsC";
let environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
let client = new paypal.core.PayPalHttpClient(environment);

//MIDDLEWARE
app.use(express.json());
app.use(
  session({
    secret: "isa43",
    resave: true,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: "mongodb://localhost:27017/diploma" }),
    cookie: { maxAge: 60000 * 60 }, //1hr
  })
);

//IMPORT ROUTES
const productsRoute = require("./routes/products");
const cartRoute = require("./routes/cart");
// const paypalRoute = require("./routes/paypal");
app.use("/products", productsRoute);
app.use("/cart", cartRoute);
// app.use("/paypal", paypalRoute);

//DATABASE CONFIG
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection to Database: Error:"));
db.once("open", function () {
  console.log("Database on duty!");
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/data", (req, res) => {
  res.send("Send back data here from the Database");
});

app.get("/paypal", (req, res) => {
  try {
    let request = new paypal.orders.OrdersCreateRequest();
    request.requestBody({
      intent: "CAPTURE",
      application_context: {
        return_url: "http://10.0.2.2:3000/paypal/success",
        cancel_url: "http://10.0.2.2:3000/paypal/cancel",
      },
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: "100.00",
          },
        },
      ],
    });

    let createOrder = async () => {
      // REDIRECTS TO APPROVED
      let response = await client.execute(request);
      res.redirect(response.result.links[1].href);
    };
    createOrder();
  } catch (err) {
    console.log(err);
  }
});

app.get("/paypal/success", (req, res) => {
  try {
    let orderId = req.query.token;
    let captureOrder = async (orderId) => {
      request = new paypal.orders.OrdersCaptureRequest(orderId);
      request.requestBody({});

      let response = await client.execute(request);
      console.log(`Response: ${JSON.stringify(response)}`);
      // res.json({ status: "Success" });
      res.send(
        "<h1 style='text-align: center, font-size: 30px'>Payment successful</h1>"
      );
    };
    captureOrder(orderId);
  } catch (err) {
    console.log(err);
  }
});

app.get("/paypal/cancel", (req, res) => {
  res.send("Cancelled");
});

app.listen(port, () => {
  console.log(`Back-End listening at http://localhost:${port}`);
});
