
const {nanoid} = require("nanoid");
const URL = require('../models/url');

// Define the anonymous link limit
const ANONYMOUS_LIMIT = 2;

async function handleGenerateNewShortURL(req,res){

    const body= req.body;
    if(!body.url) return res.status(400).json({error:'url is required'});
    
    let anonUrls = req.cookies.anon_urls ? JSON.parse(req.cookies.anon_urls) : [];
    
    // Logic 1: Check if the user is anonymous AND has reached the limit
    if (!req.user && anonUrls.length >= ANONYMOUS_LIMIT) {
        // Send a specific JSON response to be handled by the frontend JS/EJS
        return res.status(403).json({ error: 'Limit reached', needAuth: true }); 
    }
    
    const shortID = nanoid(8);

    const urlEntry = await URL.create({
        shortId: shortID,
        redirectURL: body.url,
        visitHistory: [],
        // If user is logged in, store their ID. Otherwise, null.
        createdBy: req.user ? req.user._id : null, 
    });
    
    // Logic 2: If the user is anonymous, update the cookie with the new shortId
    if (!req.user) {
        anonUrls.push(urlEntry._id.toString());
        // Set the cookie for 7 days. Use httpOnly: false so client JS can read it.
        res.cookie('anon_urls', JSON.stringify(anonUrls), { maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: false }); 
    }

    // Since this is a POST route and you want to show the list, we redirect 
    // to the home route to re-fetch the list with the checkAuth middleware.
    // We pass the new shortID via a query parameter or session (or rely on EJS re-render, 
    // but the original code uses res.render, so we'll stick to that but use the redirect logic later).
    
    //return res.render("home", { id: shortID, urls: <fetch here>, user: req.user });
    // To properly redirect and display the list:
    return res.json({ id: shortID });
    
}
// ... (handleGetAnalytics remains the same)

// async function handleGenerateNewShortURL(req,res){

//     const body= req.body;
//     if(!body.url) return res.status(400).json({error:'url is required'});
//     const shortID= nanoid(8);

//     await URL.create({
//         shortId:shortID,
//         redirectURL:body.url,
//         visitHistory:[],
//         createdBy:req.user._id,        
    
//     });
//     return res.render("home",{
//         id:shortID,
//     });
//     //return res.json({id:shortID});
// }

async function handleGetAnalytics(req,res){
    const shortId=req.params.shortId;
    const result = await URL.findOne({shortId});
    return res.json({
        totalClicks: result.visitHistory.length,
        analytics: result.visitHistory,
    });
}


async function handleDeleteURL(req, res) {
    const { shortId } = req.params;
    
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const result = await URL.findOneAndDelete({
            shortId: shortId,
            createdBy: req.user._id, // Ensure only the creator can delete it
        });

        if (!result) {
            return res.status(404).render("profile", { 
                user: req.user, 
                error: "Link not found or you don't have permission to delete it."
            });
        }

        // Successfully deleted. Redirect back to the profile page.
        return res.redirect("/profile");

    } catch (error) {
        console.error("Error deleting URL:", error);
        return res.status(500).render("profile", { 
            user: req.user, 
            error: "An error occurred during deletion." 
        });
    }
}

module.exports={
    handleGenerateNewShortURL, 
    handleGetAnalytics,
    handleDeleteURL, // 👈 Export the new function
}
