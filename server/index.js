import 'dotenv/config';
import express from "express";
import passport from "passport";
import session from "express-session";
import cors from "cors";
//My import
import google from './strategy/google-strategy.js';
import strategy from './strategy/local-strategy.js';
import getRouter from './routes/getRoutes.js';
import postRouter from './routes/postRoutes.js';
import db from "../server/database/database.js"
import path from 'path';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = 3001;
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors({
    origin: "http://localhost:3000", // allow to server to accept request from different origin
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, // allow session cookie from browser to pass through
}));

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(strategy);
passport.use(google);

// Serialize and deserialize user
passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser((id, done) => {
    db.oneOrNone('SELECT * FROM users WHERE id = $1', [id])
        .then(user => done(null, user))
        .catch(err => done(err));
});


//app.use("/", getRouter);
//app.use("/", postRouter);

app.post('/user', (req, res) => {
    const user=req.body;
    console.log(user);
    res.send(user);
    //res.redirect("/blog");
});

// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname + '/public/index.html'));
// });

app.post("/login", passport.authenticate('local', {
    successRedirect: "/blog",
    failureRedirect: "/",
}));

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});