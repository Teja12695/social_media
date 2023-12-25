//modules importing 
const express = require('express')
const hbs = require('hbs')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const {readPosts,readUsers,insertUsers,insertPosts,like,share,del} = require("./operations")
const jwt = require('jsonwebtoken')


mongoose.connect("mongodb://localhost:27017/cinema", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const screen1Model = mongoose.model('screen1', {
    seatno: { type: Number },
    status: { type: String }
})

const screen2Model = mongoose.model('screen2', {
    seatno: { type: Number },
    status: { type: String }
})

const screen3Model = mongoose.model('screen3', {
    seatno: { type: Number },
    status: { type: String }
})

const moviesModel = mongoose.model('movies', {
    name: { type: String },
    rate: { type: Number },
    screenNo: { type: Number }
})

var screen1Res
screen1Model.find()
    .then((output) => {
        screen1Res = output
    })
    .catch((err) => {
        console.log(err)
    })

var screen2Res
screen2Model.find()
    .then((output) => {
        screen2Res = output
    })
    .catch((err) => {
        console.log(err)
    })

var screen3Res
screen3Model.find()
    .then((output) => {
        screen3Res = output
    })
    .catch((err) => {
        console.log(err)
    })


var moviesRes
moviesModel.find()
    .then((output) => {
        moviesRes = output
    })
    .catch((err) => {
        console.log(err)
    })







//middlewares
const app = express()
app.use(bodyParser.json())
app.set('view engine','hbs')
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(cookieParser())




//to show login page
app.get("/",(req,res)=>{
    res.render("login")
})

//to show signup page
app.get("/signup",(req,res)=>{
    res.render("signup")
})


//to show posts with verifylogin and sending data from database and payload from login end point
app.get("/posts",verifylogin, async (req,res)=>{
    const output = await readPosts()
    res.render("posts",{
        data:output,
        userinfo : req.payload,
    })
})


//when login successfull , it payloads and creates a token and saves it browser cookies to avoid repeated logins
app.post("/login", async (req, res) => {

    const output = await readUsers(req.body.username)
    const password = output[0].password
    if (password === req.body.password) {
        const payload = { "username": output[0].username,"profile": output[0].profile, "fullname": output[0].fullname, "headline": output[0].headline }
        const secret = "abcalskdjf3oiuaisuflakjsdflsdkjflaksjfdlkjsfljk"
        const token = jwt.sign(payload, secret)
        res.cookie("token", token)
        res.redirect("/posts")
    } else {
        res.send("Invalid username or password")
    }
})


//to verifylogin it verify the token
function verifylogin(req,res,next){
    const secret = "abcalskdjf3oiuaisuflakjsdflsdkjflaksjfdlkjsfljk"
    const token = req.cookies.token
    jwt.verify(token,secret,(err,payload)=>{
        if (err)  return res.sendStatus(403)
         req.payload = payload
    })
    next()
}


// to add users from registration page and redirect to home page 
app.post('/addusers',async (req,res)=>{
    if (req.body.password === req.body.repassword){
        await insertUsers(req.body.fullname,req.body.username,req.body.email,req.body.profile,req.body.headline,req.body.password)
        res.redirect("/")
    }
    else{
        res.send("password did not match")
    }
})


//to increase likes
app.post('/likes', async (req,res)=>{
    await like(req.body.content)
    res.redirect('/posts')
}) 


//to increase shares
app.post('/shares', async (req,res)=>{
    await share(req.body.content)
    res.redirect('/posts')
})


//to add a post 
app.post('/addposts', async (req,res)=>{
    await insertPosts(req.body.username,req.body.profile,req.body.content)
    res.redirect('/posts')
})


//to delete a post
app.post('/delete', async(req,res)=>{
    await del(req.body.content)
    res.redirect('/posts')
})



app.get('/cinema',(req,res)=>{
    res.render('cinema',{movies:moviesRes,screen1:screen1Res,screen2:screen2Res,screen3:screen3Res})
})


//server
app.listen(3000,()=>{
    console.log("server is running")
}) 