const mongoose = require('mongoose');


const postschema = mongoose.Schema({
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'user' ,required:true},
    text: {type : String , required : true},
    image: {type : String },
    likes: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'user' }],
    comments: [{
      user: { type: mongoose.SchemaTypes.ObjectId, ref: 'user' },
      text: String,
      createdAt: Date
    }]
},{
    timestamps : true,
    versionKey : false
})

const PostModel = mongoose.model('post',postschema);

module.exports = {PostModel}
