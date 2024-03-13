const { generateToken } = require('../generateToken/generateToken');
const User = require('../models/loginModels');
const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports.register = async (req, res) => {
    const { fullname, email, password } = req.body;

    if (!fullname || !email || !password) {
        return res.status(400).json({ message: "Please enter all fields" });
    }

    try {
        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ message: "This account already exists" });
        }

        const newUser = new User({
            fullname,
            email,
            password
        });

        await newUser.save();

        return res.status(201).json({
            _id: newUser.id,
            fullname: newUser.fullname,
            email: newUser.email,
            message: "User created successfully"
        });
    } catch (error) {
        console.error(error.message);
        return res.status(500).send('Server Error');
    }
};

module.exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: "Invalid Email or Password" });
        }

        const token = generateToken(user._id);

        res.json({
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            token
        });
    } catch (error) {
        console.error(error.message);
        return res.status(500).send("Server Error");
    }
};

module.exports.getUser = async (req, res) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ fullname: user.fullname, email: user.email });
    } catch (error) {
        console.error(error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        return res.status(401).json({ error: 'Please authenticate.' });
    }
};