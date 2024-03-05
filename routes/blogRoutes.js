const express = require('express')
const { getBlogs, getBlog, searchBlogs } = require('../controllers/blogController')
const routes= express.Router()

routes.get('/',getBlogs)
routes.get('/blog',getBlog)
routes.get('/search', searchBlogs)

module.exports=routes