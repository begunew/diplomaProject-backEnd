const express = require("express");
const paypal = require("@paypal/checkout-server-sdk");
const app = express();
const port = 3000;
const session = require("express-session");
const MongoStore = require("connect-mongo");
const nodemailer = require("nodemailer");
const path = require("path");

//DOTENV
require("dotenv").config();

//DATABASE CONFIG
const mongoose = require("mongoose");
mongoose.connect(process.env.DB_NAME, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

// PAYPAL CONFIG
let clientId = process.env.CLIENT_ID;
let clientSecret = process.env.CLIENT_SECRET;
let environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
let client = new paypal.core.PayPalHttpClient(environment);

//MIDDLEWARE
app.use(express.json());
app.use(
  session({
    secret: process.env.DB_SECRET,
    resave: true,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DB_NAME }),
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

app.get("/paypal", (req, res) => {
  try {
    let total = req.session.total;
    let userData = req.session.user;
    console.log(userData);

    let request = new paypal.orders.OrdersCreateRequest();
    request.requestBody({
      intent: "CAPTURE",
      application_context: {
        return_url: "http://10.0.2.2:3000/paypal/success",
        cancel_url: "http://10.0.2.2:3000/paypal/cancel",
        brand_name: "UB Pet Store",
      },
      purchase_units: [
        {
          description: "Pet Food",
          amount: {
            currency_code: "USD",
            value: total.total,
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
// app.get("/asdf", (req, res) => {
//   res.sendFile("/back/index.html", { root: path.dirname(__dirname) });
// });

app.get("/paypal/success", (req, res) => {
  try {
    let orderId = req.query.token;
    let captureOrder = async (orderId) => {
      request = new paypal.orders.OrdersCaptureRequest(orderId);
      request.requestBody({});

      let response = await client.execute(request);
      console.log(`Response: ${JSON.stringify(response)}`);

      //EMAIL
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.MAIL_USERNAME,
          pass: process.env.MAIL_PASSWORD,
        },
      });
      const mailTarget = req.session.userDetails.email;

      const mailOptions = {
        from: process.env.MAIL_USERNAME,
        to: mailTarget,
        subject: "UB Pet Store: Delivery",
        text: "Thank you for purchasing from UB Pet Store. Your order has been received and will be delivered as soon as possible!",
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(`error: `, error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });

      res.sendFile(
        res.sendFile("/back/success.html", { root: path.dirname(__dirname) })
      );
    };
    captureOrder(orderId);
  } catch (err) {
    console.log(err);
  }
});
app.get("/paypal/cancel", (req, res) => {
  res.sendFile("/back/cancel.html", { root: path.dirname(__dirname) });
});

app.listen(port, () => {
  console.log(`Back-End listening at http://localhost:${port}`);
});
