const express = require('express');
const app = express();
const User = require('./models/user');
const ejs = require('ejs');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session')


// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/authdemo');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});


app.set('view engine', 'ejs');
app.set('views', 'views')
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'mysecret',
    resave: false,
    saveUninitialized: false
}));
app.get('/', (req,res)=>{
    res.send('homepage');
})

app.get('/login', (req,res)=>{
    res.render('login');
})

app.post('/login', async(req,res)=>{
    const { username, password} = req.body;
    const user = await User.findOne({username});
    const validPassword = await bcrypt.compare(password, user.password)
    if (validPassword){
        req.session.user_id = user._id;
        res.send('yaay')
    }else{
        res.send('try again')
    }
})

app.get('/secret', (req,res)=>{
    if(req.session.user_id ){
    res.send('you can only see me if you are logged in')
}else{
    res.redirect('login')
}
})

app.get('/register', (req, res)=>{
    res.render('register')
})
app.post('/register', async (req, res)=>{
    const {password, username} = req.body;
    const hash = await bcrypt.hash(password, 12);
    const user = new User({
        username,
        password:hash
    })
    await user.save()
    req.session.user_id = user._id; ;
    res.redirect('/')
})
app.listen('3000', ()=>{
    console.log('serving at 3000')
})