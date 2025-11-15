
const express = require("express");
const URL = require("../models/url");
const router=express.Router();
const mongoose = require('mongoose');

router.get("/",async (req, res) =>{
    let allUrls = [];
    let generatedId = req.query.id || null;

    if (req.user) {
        // Logged-in user: fetch only their URLs
        allUrls = await URL.find({ createdBy: req.user._id });
    } else {
        // Anonymous user: fetch links stored in the cookie
        const anonUrlIds = req.cookies.anon_urls ? JSON.parse(req.cookies.anon_urls) : [];
        if (anonUrlIds.length > 0) {
            // Convert string IDs from cookie back to MongoDB ObjectIds
            const objectIds = anonUrlIds.map(id => new mongoose.Types.ObjectId(id));
            // Fetch anonymous URLs only if they were created anonymously (createdBy: null)
            allUrls = await URL.find({ 
                _id: { $in: objectIds },
                createdBy: null 
            });
        }
    }

    // Set `locals.user` to handle the conditional header in home.ejs
    return res.render("home",{
        urls: allUrls,
        user: req.user,
        id: generatedId, // Pass the newly generated ID for display
    });
});


// ADD LOGOUT ROUTE
router.get("/logout", (req, res) => {
    // Clear cookies for JWT and anonymous URLs
    res.clearCookie("uid");
    res.clearCookie("anon_urls"); 
    return res.redirect("/");
});

router.get("/signup", (req, res) =>{
    return res.render("signup");
});

router.get("/login", (req, res) =>{
    return res.render("login");
});

// Add a placeholder for a profile route
router.get("/profile", async (req, res) => {
    // Ensure only logged-in users can access this page
    if (!req.user) return res.redirect("/login"); 

    // Fetch all URLs created by the logged-in user
    const userUrls = await URL.find({ createdBy: req.user._id });

    // Render the new profile view, passing user info and their URLs
    return res.render("profile", {
        user: req.user,
        urls: userUrls,
    });
});

module.exports=router;