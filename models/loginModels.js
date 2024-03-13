const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const loginSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: [true, "Please Provide your Full Name"]
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