const express = require('express')
const { getBlogs, getBlog, searchBlogs, getCategories } = require('../controllers/blogController')
const routes= express.Router()

routes.get('/',getBlogs)
routes.get('/blog',getBlog)
routes.get('/search', searchBlogs)
routes.get('/categories',getCategories)

module.exports=routes