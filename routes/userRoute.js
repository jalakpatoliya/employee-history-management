var express = require('express');
var router = express.Router();
var passport = require("passport"),
  LocalStrategy = require("passport-local"),
  passportLocalMongoose = require("passport-local-mongoose"),
  mongoose = require("mongoose"),
  User = require("../models/user"),
  expressSession = require("express-session");

//====================================================
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser()); // it reades, decodes information in session,encodes it
passport.deserializeUser(User.deserializeUser());

// Authorization ROUTES===============================
// Show sign up form
router.get("/register",
  // isLoggedIn, isAdmin,
  function (req, res) {
    res.render("register.ejs");
  })

// handling user sign up
router.post("/register", function (req, res) {
  User.register(new User({ username: req.body.username }), req.body.password, function (err, user) {
    if (err) { // password is hashed by resiter and then saved in DB
      res.send(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function () { // local can be replaced by twitter or fb
        res.redirect("/secret");      //but here we are authenticating locally
      })
    }
  })
})

// LOGIN ROUTES=====================================
// Render login form
router.get("/login", function (req, res) {
  res.render("login.ejs")
})

//login logic
//MIDDLEWARE
router.post("/login", passport.authenticate("local", {
  successRedirect: "/company/all",
  failureRedirect: "/login"
}), function (req, res) { console.log(req.body.username); });

//=========================================================
//================== isAdmin function =====================
//=========================================================
function isAdmin(req, res, next) {
  console.log(req.user.username);
  if (req.isAuthenticated()) {
    console.log("isAdmin: user is logged in");
    User.findOne({ 'username': req.user.username }, function (err, data) {
      if (err) {
        console.log("findOne error");
        console.log(err);
      } else if (data.role == 'admin') {
        console.log(data.role);
        return next();
      } else { res.redirect("/login"); }
    })
  } else {
    console.log("isAdmin: is authenticated is false");
    res.redirect("/login");
  }
}

//=========================================================
//=============== isLoggedIn function======================
//=========================================================
//authenticating if user is loggedin or not
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    console.log("user is logged in");
    return next();
  }
  console.log("user is not logged in");
  res.redirect("/login");
}


module.exports = router;
