const express = require("express");
const app = express();
const port = 5000;
const cors = require("cors");
require("dotenv").config();

app.use(express.json());  
app.use(cors());
const bodyParser = require('body-parser');

// Parse JSON and URL-encoded form data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

//Razorpay Route
const phonepeRoute = require('./PaymentGateway/phonepeRoute')
app.use("/api", phonepeRoute);

// Starting Server
app.listen(port, () => {
  console.log(`NETFLIX PAYMENT app listening on port ${port}`);
});
