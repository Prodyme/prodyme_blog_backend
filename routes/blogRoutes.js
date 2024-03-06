const express = require('express')
const { getBlogs, getBlog } = require('../controllers/blogController')
const routes= express.Router()

routes.get('/',getBlogs)
routes.get('/blog',getBlog)

module.exports=routes