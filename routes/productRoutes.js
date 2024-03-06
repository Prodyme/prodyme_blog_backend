const express = require('express')
const { getCategoryProducts } = require('../controllers/productController')
const routes= express.Router()

routes.get('/',getCategoryProducts)

module.exports=routes