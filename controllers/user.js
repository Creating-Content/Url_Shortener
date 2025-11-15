const{v4:uuidv4} = require("uuid");
const User = require("../models/user");
const { setUser } = require("../service/auth1");

async function handleUserSignup(req, res){
    const {name, email, password} = req.body;
    const user= await User.create({
        name,
        email,
        password,
    });

    //return res.render("home");
    res.clearCookie("anon_urls");

    // 3. Auto-Login: Generate JWT and set the cookie
    const token = setUser(user); 
    // Set httpOnly for security, but ensure you also apply this in handleUserLogin
    res.cookie("uid", token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' }); 
    
    // 4. Redirect to the home page (where they will be recognized as logged in)
    return res.redirect("/");
}

async function handleUserLogin(req, res){
    const {email, password} = req.body;
    const user = await User.findOne({email,password});
    if(!user)
        return res.render("login",{
    error:"Invalid Username or Password",
});
    // statefull
    // const sessionId = uuidv4();
    // setUser(sessionId, user);
    // res.cookie("uid", sessionId);
    // return res.redirect("/");

    //stateless
    const token= setUser(user);
    res.cookie("uid", token);
    return res.redirect("/");
}


module.exports={
    handleUserSignup,
    handleUserLogin,
};