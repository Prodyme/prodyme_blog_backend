const express= require('express')
const mongoose = require('mongoose');
const cors = require('cors');
require("dotenv").config()
const userRoutes= require('./routes/loginRoutes')
const blogRoutes= require('./routes/blogRoutes')
const productRoutes= require('./routes/productRoutes')

const app = express()
app.use(express.json())
app.use(cors())

const PORT= process.env.PORT || 5000

app.use('/auth',userRoutes)
app.use('/blogs',blogRoutes)
app.use('/products',productRoutes)

app.listen(PORT,()=>console.log("Server started at Port "+PORT))

mongoose.connect(process.env.MONGO_URI,{
    dbName:process.env.DB_NAME,
}).then(()=>console.log(`Connected to Mongo DB`))
.catch((err)=>console.error("Connection error:",err))

mongoose.connection.on("connected",()=>{
    console.log("Connected to DB")
})

mongoose.connection.on("error",(err)=>{
    console.error("Error connecting to database",err)
})