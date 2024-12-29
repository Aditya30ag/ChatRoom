const mongoose=require('mongoose');
const {Schema} =mongoose;

const Userschema=new Schema({
    name:{
        type:String,
        required:true
    },
    name1:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    number:{
        type:Number,
        required:true
    },
    aadharnumber:{
        type:Number,
        required:true
    },
    cropsname:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
})
const user=mongoose.model("User",Userschema);
user.createIndexes();
module.exports=user