const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart.js');
const { body, validationResult } = require('express-validator');
const fetchuser = require("../middleware/fetchuser.js");

router.get("/fetchallcart", fetchuser, async (req, res) => {
    try {
      const cart = await Cart.find({ user: req.user.id });
      res.json(cart);
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ error: "Some error occurred while fetching cart items" });
    }
});
  
router.post('/createcart', [
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('img', 'Enter a valid image URL').isLength({ min: 3 }),
], fetchuser, async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            success: false, 
            errors: errors.array() 
        });
    }

    try {
        // Check if cart item already exists for this user
        let cart = await Cart.findOne({ 
            name: req.body.name, 
            user: req.user.id 
        });

        if (cart) {
            return res.status(400).json({
                success: false,
                error: "Item already added to cart"
            });
        }

        // Create new cart item
        cart = new Cart({
            name: req.body.name,
            img: req.body.img,
            prices: req.body.prices,
            quantity:req.body.quantity,
            user: req.user.id
        });

        const savedCart = await cart.save();
        
        res.status(201).json({
            success: true,
            cart: savedCart
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ 
            success: false, 
            error: "Some error occurred while creating cart item" 
        });
    }
});
module.exports=router