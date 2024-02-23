const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const loginSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: [true, "Please Provide your First Name"]
    },
    lastname: {
        type: String,
        required: [true, "Please Provide your Last Name"]
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        required: [true, "Please Provide your Email Address"]
    },
    password: {
        type: String,
        required: true
    },
})

loginSchema.methods.matchPassword=async function(password){
    return await  bcrypt.compare(password,this.password)
}

loginSchema.pre('save',async function(next){
    if(!this.isModified){
        next()
    }
    const salt = await bcrypt.genSalt(10)
    this.password= await bcrypt.hash(this.password,salt)
})

const user= mongoose.model('user',loginSchema)
module.exports=user