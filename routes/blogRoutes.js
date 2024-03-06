const express = require('express')
const { getBlogs, getsBlog, searchBlogs } = require('../controllers/blogController')
const routes= express.Router()

routes.get('/',getBlogs)
routes.get('/blog',getsBlog)
routes.get('/search', searchBlogs)

module.exports=routes