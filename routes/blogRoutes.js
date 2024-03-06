const express = require('express')
const { getBlogs, getsBlog } = require('../controllers/blogController')
const routes= express.Router()

routes.get('/',getBlogs)
routes.get('/blog',getsBlog)

module.exports=routes