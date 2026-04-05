const express = require("express");
require('dotenv').config();
const mongoose= require("mongoose");

const app = express();
const PORT = 8080;


app.listen(PORT, ()=>{
  console.log(`server running on ${PORT}`)
  connectDB();
});

app.get("/", (req,res)=>{
    res.send("backend API is running");
});

const connectDB = async()=>{
    try{
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("db connected sucessful");
    }catch(err){
        console.log("mongo db connection failed __ : ", err);
    }
}

