require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const urlRoute = require("./routes/url");
const staticRoute=require("./routes/staticRouter");
const userRoute = require("./routes/user");
const {connectToMongoDB} = require("./connect");
const { restrictToLoggedinUserOnly, checkAuth } = require("./middlewares/auth");
const path = require("path");

const URL=require("./models/url");

const app = express();
const PORT = process.env.PORT || 8002;

connectToMongoDB(process.env.MONGODB_URI)
.then (() =>
console.log("MongoDB connected!! ")
);

// Expose a public base URL for templates and client-side code.
// Set BASE_URL in your environment to the public domain (e.g. https://s-link.giize.com)
app.locals.BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieParser());

app.use("/url", checkAuth, urlRoute);

app.use("/user", userRoute);
app.use("/", checkAuth, staticRoute);
//app.use("/", staticRoute);

app.get("/test", async (req,res)=>{
    const allUrls= await URL.find({});
    return res.render('home',{
        urls:allUrls,
    });
});


app.get('/url/:shortId',async (req,res) =>{

    const shortId= req.params.shortId;
    const entry= await URL.findOneAndUpdate(
        {
            shortId,
        },
        {
            
            $push:{
                visitHistory:{
                    timestamp:Date.now(),
                },
                },
        }
    );
    res.redirect(entry.redirectURL);
});

app.listen(PORT, () => console.log(`Server in active on PORT: ${PORT}`));


