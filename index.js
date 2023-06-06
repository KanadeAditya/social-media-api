const express = require('express');
require('dotenv').config();
const cors = require('cors');

const {connection} = require('./config.js')
const {APIRouter} = require('./controllers/api.routes.js')

const app = express();

app.use(cors());
app.use(express.json());

app.get('/',(req,res)=>{
    try {
        res.send(`<h1>Server is running fine</h1><h2>Port No. :- ${process.env.PORT}</h2>`)
    } catch (error) {
        console.log(error)
        res.send({msg:error.message})
    }
})

app.use('/api',APIRouter)

app.listen(process.env.PORT , async ()=>{
    try {
        await connection
        console.log('Server connected to Mongo DB Atlas');
    } catch (error) {
        console.log(error)
    }
})