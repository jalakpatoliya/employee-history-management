const express = require("express");
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const app = express();
const bodyParser = require("body-parser");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const passportLocalMongoose = require("passport-local-mongoose");
const mongoose = require("mongoose");
const expressSession = require("express-session");
const flash = require('connect-flash');

// mongoose.connect("mongodb://localhost/auth_demo",{
//   useMongoClient:true
// })
mongoose.connect(`${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@ds217208.mlab.com:17208/inkredo-project`, (err, data) => {
  if (err) { console.log('connection error', err); } else {
    console.log('DB connected sucessfully');
  }
});


mongoose.Promise = global.Promise;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
const User = require("./models/user");
const userRoute = require('./routes/userRoute');
const Company = require('./models/company');
const companyRoute = require('./routes/companyRoute');
//=========================================================
//=============Initializing Session & Passport=============
//=========================================================
app.use(expressSession({
  secret: "Rusty is the best dog in the world", // is used to enco-deco information in the session
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize()); // always needed to use the passport methods
app.use(passport.session());
//===========================================================
//== This function will run in all the routes as middleware =
//== The currentUser will be available in all the templates =
//===========================================================
app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  next();
});
app.use(flash());
//=========================================================
//=============Importing routes=======================
//=========================================================
app.use(userRoute);
app.use(companyRoute);

//=========================================================
//=============Normal Routes===============================
//=========================================================
app.get("/", function (req, res) {
  res.render("home.ejs");
})

app.get("/secret", isLoggedIn, function (req, res) { //
  console.log("user is logged in so,secret page is accessed");
  res.render("secret.ejs");
})
//=========================================================
//=============Authenticating function=====================
//=========================================================
// authenticating if user is loggedin or not
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    console.log("user is logged in");
    return next();
  }
  console.log("user is not logged in");
  res.redirect("/login");
}
//=========================================================
//=============Logout route================================
//=========================================================
app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
})
//=========================================================
//============= To create Admin ===========================
//=========================================================

User.register(new User({ username: "jalak", role: "admin" }), "pass", function (err, user) { })


//=========================================================
//=============Listening to port===========================
//=========================================================
app.listen(PORT, function () {
  console.log("server connected");
})
