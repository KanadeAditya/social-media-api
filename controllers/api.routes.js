const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const {UserModel} = require('../models/user.model.js');
const {PostModel} = require('../models/post.model.js');
const {authenticator} = require('../middlewares/authenticate.js')

const APIRouter = express.Router();

APIRouter.get('/',(req,res)=>{
    try {
        res.send(`<h1>APIRouter is running fine</h1><h2>Port No. :- ${process.env.PORT}</h2>`)
    } catch (error) {
        console.log(error)
        res.status(500).send({msg:error.message})
    }
})

APIRouter.post('/register',async (req,res)=>{
    try {
        let {name, email, password, dob, bio } = req.body;
        if(!name || !email || !password || !dob || !bio){
            res.status(400).send({msg:"Please Provide all the details"});
        }else{
            let ifexists = await UserModel.find({email});

            if(ifexists.length){
                res.status(400).send({msg:"This email is already registered"});
            }else{
                bcrypt.hash(password, 8,async (err, hash)=>{
                    // Store hash in your password DB.
                    if(err){
                        console.log(err)
                        res.status(500).send({msg:"Something went wrong",err});
                    }else{
                        const newuser = new UserModel({name, email, password: hash, dob : new Date(dob).toISOString(), bio })
                        await newuser.save();
                        res.status(200).send({msg:"User Registered Successfully"})
                    }
                });
            }
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({msg:error.message})
    }
})

APIRouter.post('/login',async (req,res)=>{
    try {
        let { email, password } = req.body;
        if(!email || !password ){
            res.status(400).send({msg:"Please Provide all the details"});
        }else{
            let ifexists = await UserModel.find({email});

            if(ifexists.length){
                bcrypt.compare(password, ifexists[0].password, (err, result)=>{
                    // result == true
                    if(err){
                        console.log(err)
                        res.status(500).send({msg:"Something went wrong",err});
                    }else{
                       if(result){
                            let token = jwt.sign({userId: ifexists[0]._id , email: ifexists[0].email}, process.env.secret, { expiresIn: '1h' });
                            res.status(200).send({msg:"User Logged In Successfully",token});
                       }else{
                            res.status(403).send({msg:"Wrong Credentials"});
                       }
                    }
                });
            }else{
                res.status(403).send({msg:"Wrong Credentials"});
            }
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({msg:error.message})
    }
})

APIRouter.get('/users' ,async (req,res)=>{
    try {
        let allusers = await UserModel.find({},{password:0});
        res.status(200).send(allusers)
    } catch (error) {
        console.log(error)
        res.status(500).send({msg:error.message})
    }
})

APIRouter.get('/users/:id/friends' ,async (req,res)=>{
    try {
        let id = req.params.id
        let users = await UserModel.findById(id);
        res.status(200).send(users.friends)
    } catch (error) {
        console.log(error)
        res.status(500).send({msg:error.message})
    }
})

APIRouter.post('/users/:id/friends' ,authenticator,async (req,res)=>{
    try {
        let id = req.params.id
        let {userId,email} = req.body
        let user = await UserModel.findById(id);
        if(user.friends.includes(userId) || user.friendRequests.includes(userId)){
            res.status(400).send({msg:"User already a friend or User already has sent a request"})
        }else if(userId == id){
            res.status(400).send({msg:"Self request cant be sent"})
        }
        else{
            user.friendRequests.push(userId)
            await user.save();
            res.status(201).send({msg:"Friend request Sent"})
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({msg:error.message})
    }
})

APIRouter.patch('/users/:id/friends' ,authenticator,async (req,res)=>{
    try {
        let id = req.params.id
        let {userId,email} = req.body
        let user = await UserModel.findById(userId);
        let sender = await UserModel.findById(id);
        let ind = user.friendRequests.indexOf(id);
        if(ind !== -1){
            let friend = user.friendRequests[ind];
            user.friendRequests.splice(ind,1);
            user.friends.push(friend);
            sender.friends.push(userId);
            await sender.save();
            await user.save();
            
            res.status(204).send({msg:`Friend request Accepted for ${id}`})
        }else{
            res.status(400).send({msg:"Friend request Not Found"})
        }
        
    } catch (error) {
        console.log(error)
        res.status(500).send({msg:error.message})
    }
})

APIRouter.get('/posts',async (req,res)=>{
    try {
        let allposts = await PostModel.find();
        res.status(200).send(allposts)
    } catch (error) {
        console.log(error)
        res.status(500).send({msg:error.message})
    }
})

APIRouter.get('/posts/:id',async (req,res)=>{
    try {
        let id = req.params.id
        let allposts = await PostModel.findById(id);
        res.status(200).send(allposts)
    } catch (error) {
        console.log(error)
        res.status(500).send({msg:error.message})
    }
})

APIRouter.post('/posts',authenticator,async (req,res)=>{
    try {
        const {userId,email , text ,  image } = req.body;
        if(!text || !image){
            res.status(400).send({msg:"please provide all the details"})
        }else{
            let newpost = new PostModel({user : userId , text , image})
            await newpost.save();

            res.status(201).send({msg:"Post has been created",newpost})
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({msg:error.message})
    }
})

APIRouter.patch('/posts/:id',authenticator,async (req,res)=>{
    try {
        const {userId,email , text ,  image } = req.body;
        const id = req.params.id
        if(!text && !image){
            res.status(400).send({msg:"please provide the details"})
        }else{
            let post = await PostModel.findById(id)
            // console.log(post.user.toString() , userId)
            if(post.user.toString()  === userId){
                if(text){
                    post.text = text
                }
                if(image){
                    post.image = image
                }

                await post.save();
                res.status(204).send({msg:"Post has been updated"})
            }else{
                res.status(403).send({msg:"Post can only be updated by its author"})
            }
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({msg:error.message})
    }
})

APIRouter.delete('/posts/:id',authenticator,async (req,res)=>{
    try {
        const {userId,email} = req.body;
        const id = req.params.id
        let post = await PostModel.findById(id)
        if(post.user.toString()  === userId){
            await PostModel.findByIdAndDelete(id);
            res.status(202).send({msg:"Post has been deleted"})
        }else{
            res.status(403).send({msg:"Post can only be deleted by its author"})
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({msg:error.message})
    }
})

APIRouter.post('/posts/:id/like',authenticator,async (req,res)=>{
    try {
        const {userId,email} = req.body;
        const id = req.params.id
        let post = await PostModel.findById(id);
        if(post.likes.includes(userId)){
            res.status(400).send({msg:"You have already liked this post"})
        }else{
            post.likes.push(userId);
            await post.save();

            res.status(201).send({msg:"You have liked this post"});
        }

    } catch (error) {
        console.log(error)
        res.status(500).send({msg:error.message})
    }
})

APIRouter.post('/posts/:id/comment',authenticator,async (req,res)=>{
    try {
        const {userId,email,text} = req.body;
        const id = req.params.id
        let post = await PostModel.findById(id);
        if(!text){
            res.status(400).send({msg:"please provide all the details"})
        }else{
            post.comments.push({
                text,
                user : userId,
                createdAt : new Date(Date.now()).toISOString()
            })
            await post.save();

            res.status(201).send({msg:"You just commented on this post"});
        }

    } catch (error) {
        console.log(error)
        res.status(500).send({msg:error.message})
    }
})

module.exports = {APIRouter}
