const express = require("express");
const urlRoute = require("./routes/url");
const {connectToMongoDB} = require("./connect");
const path = require("path");
const URL=require("./models/url");

const app= express();
const PORT=8001;

connectToMongoDB("mongodb://127.0.0.1:27017/url_short")
.then (() =>
console.log("MongoDB connected!! ")
);

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));


app.use(express.json());

app.get("/test", async (req,res)=>{
    const allUrls= await URL.find({});

    return res.end(`
        <html>
        <head></head>
        <body>
        <ol>
            ${allUrls.map(url => `<li>${url.shortId} - ${url.redirectURL} - ${url.visitHistory.length}</li>`).join('')};
        </ol>
        </body>
        </html>
        
        `);
});
app.use("/url", urlRoute);

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


