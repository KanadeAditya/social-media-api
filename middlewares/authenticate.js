const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticator = (req,res,next)=>{
    let token = req.headers.authorization;
    if(token){
        jwt.verify(token, process.env.secret, (err, decoded)=>{
            if(err){
                console.log(err)
                res.status(500).send({msg:"Something went wrong",err});
            }else{
                req.body.userId = decoded.userId
                req.body.email = decoded.email
                next()
            }
        });
    }else{
        res.status(401).send({msg:"Access Denied"})
    }
}

module.exports = {authenticator}