const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const port = process.env.PORT || 8000;

const app = express();

app.use(bodyParser.json());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb+srv://anilkumar2001:anil2001@userdata.wdht2zr.mongodb.net/');
const db = mongoose.connection;
db.on('error', () => console.log('error'));
db.once('open', () => console.log('connected'));

const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    mobile: String,
    email: String,
    street: String,
    city: String,
    state: String,
    country: String,
    login: String,
    password: String
});

const User = mongoose.model('User', userSchema);

app.get('/getUser', (req, res) => {
    User.find()
        .then(users => res.json(users)) 
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: 'Internal server error' }); 
        });
});

const mobileValid = /^\d{10}$/;
const loginIdValid = /^[a-zA-Z0-9]{8}$/;
const passwordValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

app.post("/sign_up", async (req, res) => {
    const { mobile, login, password } = req.body;

    if (!mobileValid.test(mobile)) {
        return res.status(400).send('Invalid mobile number');
    }

    if (!loginIdValid.test(login)) {
        return res.status(400).send('Invalid login ID');
    }

    if (!passwordValid.test(password)) {
        return res.status(400).send('Invalid password');
    }

    try {
        const existingUser = await User.findOne({ login });

        if (existingUser) {
            if (existingUser.password === password) {
                return res.status(400).send('User with the same login ID and password already exists');
            } else {
                return res.status(400).send('User with the same login ID already exists');
            }
        }

        const newUser = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            mobile: req.body.mobile,
            email: req.body.email,
            street: req.body.street,
            city: req.body.city,
            state: req.body.state,
            country: req.body.country,
            login: req.body.login,
            password: req.body.password
        });

        await newUser.save();
        console.log('Insertion successful');
        res.status(200).send('Submission successful!');
    } catch (error) {
        console.error('Error occurred during submission:', error);
        res.status(500).send('Error occurred during submission.');
    }
});

app.get('/', (req, res) => {
    res.set("Access-Control-Allow-Origin", "*"); 
    return res.redirect('index.html');
});

app.get('/user', (req, res) => {
    return res.redirect('user.html');
});

app.listen(port, () => {
    console.log('server started');
});
