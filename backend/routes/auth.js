const express=require('express');
const router=express.Router();
const User=require('../models/User.js');
const {body,validationResult}=require('express-validator');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const fetchuser=require('../middleware/fetchuser.js');

router.post('/createuser',[
    body('name','enter the valid name').isLength({min:3}),
    body('name1','enter the valid name').isLength({min:3}),
    body('email','enter the valid email').isEmail(),
    body('number','enter the valid number').isLength({min:3}),
    body('aadharnumber','enter the valid aadharnumber').isLength({min:3}),
    body('cropsname','enter the valid cropsname').isLength({min:3}),
    body('password','enter the valid password').isLength({min:3}),

],async(req,res)=>{
    const result = validationResult(req);
    if (!result.isEmpty()) {
      success=false;
        return res.json({success,errors: result.array()});
    }
    try{
    let user=await User.findOne({email:req.body.email});
    if (user){
      return res.json({success:false,error:"please enter a unique value for email"});
    }

    const salt = await bcrypt.genSaltSync(10);
    const secPass=await bcrypt.hash(req.body.password,salt);

    user =await User.create({
        name:req.body.name,
        name1:req.body.name1,
        email:req.body.email,
        number:req.body.number,
        aadharnumber:req.body.aadharnumber,
        cropsname:req.body.cropsname,
        password:secPass
      })
      /*.then(res.send(req.body))
      .catch(err=>{console.log(err)
        res.json({error:"please enter a unique value for email",message:err.message})
      })*/
      console.log(req.bogy);
     const data={
      user:{
        id:user.id
      }
     }
     console.log(req.body);
      var token = jwt.sign(data, 'shhhhh');
      success=true;
      res.json({success,token});

    }catch(error){
      console.error(error.message)
      success=false;
      res.status(500).send(success,"some error occured")
    }
})

router.post('/login',[
  body('email','enter the valid email').isEmail(),
  body('password','password cannot be blank').exists()
],async(req,res)=>{
  const result = validationResult(req);
    if (!result.isEmpty()) {
      success=false;
        return res.status(400).json({success,errors: result.array()});
    }
    const {email,password}=req.body;
    try {
      let user=await User.findOne({email:email});
      if (!user){
        success=false;
        return res.json({success,error:"please try to login with correct credentials"});
      }
      const passwordCompare=await bcrypt.compare(password,user.password)
      if(!passwordCompare){
        success=false;
        return res.json({success,error:"please try to login with correct credentials"});
      }
      const data={
        user:{
          id:user.id
        }
       }
        var token = jwt.sign(data, 'shhhhh');
        success=true;
        res.json({success,token});
      

    } catch (error) {
        console.error(error.message)
        res.status(500).send("some error occured")
    }
})
router.post('/getuser',fetchuser,async(req,res)=>{

  try {
    userId=req.user.id;
    const user=await User.findById(userId).select("-password");
    res.send(user)
  } catch (error) {
      console.error(error.message)
      res.status(500).send("some error occured")
  }
  
})

module.exports=router