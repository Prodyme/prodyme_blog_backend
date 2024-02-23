const { generateToken } = require('../generateToken/generateToken')
const User = require('../models/loginModels')

module.exports.register = async (req, resp) => {
    const { firstname, lastname, email, password } = req.body

    if (!firstname || !lastname || !email || !password) {
        return resp.status(400).json({ message: "Please enter all fields" })
    }

    try {
        let user = await User.findOne({ email })

        if (user) {
            return resp.status(400).json({ message: "This account is already exists" })
        }

        const newUser = new User({
            firstname,
            lastname,
            email,
            password
        })

        await newUser.save()

        return resp.status(201).json({
            _id: newUser.id,
            firstname: newUser.firstname,
            lastname: newUser.lastname,
            email: newUser.email,
            message: "User created successfully"
        })
    } catch (err) {
        console.error(err.message)
        return resp.status(500).send('Server Error')
    }
}

module.exports.login = async (req, resp) => {
    const { email, password } = req.body

    try {
        const user = await user.findOne({ email })

        if (user && (await user.matchPassword(password))) {
            return resp.json({
                _id: user._id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                token: generateToken(user._id)
            })
        } else {
            return resp.status(401).json({ message: "Invalid Email or Password" })
        }
    } catch (err) {
        console.error(err.message)
        return resp.status(500).send("Server Error")
    }
}