const bodyParser = require("body-parser");
var express = require('express');
var router = express.Router();
var passport = require("passport"),
    LocalStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    mongoose = require("mongoose"),
    User = require("../models/user"),
    expressSession = require("express-session");
const Company = require('../models/company');
const middleware = require('../middlewares/index.js');


router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
//====================================================
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser()); // it reades, decodes information in session,encodes it
passport.deserializeUser(User.deserializeUser());

// Company ROUTES===============================
/**
 * Join a company form
 */
router.get("/company/join/:id",
    middleware.isLoggedin,
    async function (req, res) {
        // get all companies with id in link and send to show.ejs page
        const companyId = req.params.id;
        return res.render('./Company/companyJoin.ejs', { companyId });
    });

/**
 * Join a company Post
 */
router.post("/company/join/:id",
    middleware.isLoggedin,
    async function (req, res) {
        // get all companies with id in link and send to show.ejs page
        const companyId = req.params.id;
        /**
         * Create employee object to push
         */
        const { from, to } = req.body;
        const employee = {
            // status: String,
            id: req.user._id,
            name: req.user.username,
            from,
            to
        }

        /**
         * Push employee to company's employee list
         */
        const company = await Company.findOneAndUpdate({ _id: companyId }, { $push: { employees: employee } });

        return res.send(company);

        // return res.redirect('/company/all');
    });

/**
 * Get all companies
 */
router.get("/company/all", async function (req, res) {
    // get all companies with id in link and send to show.ejs page
    const data = await Company.find().populate("users").exec();

    return res.render('companyAll.ejs', { data });
});

/**
 * Create a new company form
 */
router.get('/company/create',
    middleware.isLoggedin,
    async function (req, res) {
        return res.render('./Company/createCompany.ejs');
    });

/**
 * Create a new company
 */
router.post('/company/create',
    middleware.isLoggedin,
    async function (req, res) {
        /**
         * create a compnay
         */
        const companyDetails = req.body;
        let companyData = new Company(companyDetails);

        // add craetor of company
        companyData.creator.id = req.user._id;
        companyData.creator.name = req.user.username;

        await companyData.save()

        return res.redirect('/company/all')
        // return res.json(companyData);
    });

/**
 * Get all the companies of user
 */
router.get('/employee/history',
    middleware.isLoggedin,
    async function (req, res) {
        /**
         * Get history of employee
         */
        const companies = await Company.find().populate("users").exec();

        return res.render('./Employee/employee.ejs', { companies });
    });

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
