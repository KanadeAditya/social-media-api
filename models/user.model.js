const mongoose = require('mongoose');


const userschema = mongoose.Schema({
    name: {type : String , required : true},
    email:  {type : String , required : true},
    password:  {type : String , required : true},
    dob: {type : Date , required : true},
    bio: {type : String , required : true},
    posts: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'post' }],
    friends: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'user'}],
    friendRequests: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'user' }]
})

const UserModel = mongoose.model('user',userschema);

module.exports = {UserModel}