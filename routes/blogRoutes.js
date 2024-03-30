const express = require('express')
const { getBlogs, getBlog, searchBlogs, getCategories, getTags, getLatestBlogs } = require('../controllers/blogController')
const routes= express.Router()

routes.get('/',getBlogs)
routes.get('/blog',getBlog)
routes.get('/search', searchBlogs)
routes.get('/categories',getCategories)
routes.get('/tags',getTags)
routes.get('/latest',getLatestBlogs)


module.exports=routes