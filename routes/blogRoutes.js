const express = require('express')
const { getBlogs } = require('../controllers/blogController')
const routes= express.Router()

routes.get('/',getBlogs)

module.exports=routes