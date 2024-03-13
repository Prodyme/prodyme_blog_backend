const express = require('express')
const { register, login, getUser } = require('../controllers/loginController')

const routes= express.Router()

routes.post('/register',register)
routes.post('/login',login)
routes.get('/user',getUser)

module.exports=routes