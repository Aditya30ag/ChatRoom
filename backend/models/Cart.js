const mongoose=require('mongoose');
const {Schema} =mongoose;

const Cartschema=new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    name:{
        type:String,
        required:true
    },
    img:{
        type:String,
        required:true
    },
    prices:{
        type:Number,
        required:true,
    },
    quantity: {
        type:Number,
        required:false,
        default: 1,
    },
})
const cart=mongoose.model("Cart",Cartschema);
module.exports=cart