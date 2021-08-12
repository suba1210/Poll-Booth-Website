//requiring node modules
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const passport = require('passport');
const localStrategy = require('passport-local');
const Member = require('./src/models/membersModel');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');


//requiring routes
const teamRoutes = require('./src/Routes/teamRoutes');
const memberRoutes = require('./src/Routes/memberRoutes');
const pollRoutes = require('./src/Routes/pollRoutes');
const calenderRoutes = require('./src/Routes/calender');

// connecting to database
mongoose.connect('mongodb://localhost:27017/polling-app', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();
app.use(cookieParser())

app.engine('ejs',ejsMate);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

const sessionConfig = {
    secret : 'thisisasecret',
    resave : false,
    saveUninitialized:false
    // cookie : {
    //     httpOnly:true,
    //     expires : Date.now() + (1000*60*60*24*7),
    //     maxAge : 1000*60*60*24*7
    // }
}
app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());


app.use((req,res,next)=>{
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next()
})





passport.use(new localStrategy(Member.authenticate()));
passport.serializeUser(Member.serializeUser());
passport.deserializeUser(Member.deserializeUser());




//using Routes
app.use(teamRoutes);
app.use(memberRoutes);
app.use(pollRoutes);
app.use(calenderRoutes);


app.get('/', async(req,res)=>{
    res.redirect('/login');
})

app.listen(3000, () => {
    console.log('Serving on port 3000');
})

