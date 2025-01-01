// routes/auth.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, validationResult } = require("express-validator");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");

// Middleware to validate user input
// const validateUserInput = (req, res, next) => {
//     const { name, email, password } = req.body;
    
//     if (!name || !email || !password) {
//         return res.status(400).json({
//             status: 'error',
//             message: 'All fields are required'
//         });
//     }

//     // Basic email validation
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//         return res.status(400).json({
//             status: 'error',
//             message: 'Invalid email format'
//         });
//     }

//     // Basic password validation (minimum 6 characters)
//     if (password.length < 6) {
//         return res.status(400).json({
//             status: 'error',
//             message: 'Password must be at least 6 characters long'
//         });
//     }

//     next();
// };

// Register new user

router.post('/signup', [
    body("roomId").isLength({ min: 3 }).withMessage("Enter a valid roomId with minimum 3 characters"),
    body("username").isLength({ min: 3 }).withMessage("Enter a valid username with minimum 3 characters"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
], async (req, res) => {
    try {
        // Validation check
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { roomId, username, password } = req.body;

        // Wrap database query in a Promise for better async handling
        const checkExistingUser = () => {
            return new Promise((resolve, reject) => {
                const checkUser = 'SELECT roomId FROM user WHERE roomId = ?';
                db.query(checkUser, [roomId], (error, results) => {
                    if (error) reject(error);
                    resolve(results);
                });
            });
        };

        // Check if user exists
        const existingUser = await checkExistingUser();
        if (existingUser.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'roomId already registered'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const createUser = () => {
            return new Promise((resolve, reject) => {
                const insertUser = 'INSERT INTO user (roomId, username, password) VALUES (?, ?, ?)';
                db.query(insertUser, [roomId, username, hashedPassword], (error, results) => {
                    if (error) reject(error);
                    resolve(results);
                });
            });
        };

        const newUser = await createUser();

        return res.status(201).json({
            success: true,
            message: 'User registered successfully',
            userId: newUser.insertId
        });

    } catch (error) {
        console.error('Signup error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

router.post('/login', async (req, res) => {
  const { roomId, password } = req.body;

  // Check if user exists
  const checkUser = 'SELECT roomId, username, password FROM user WHERE roomId = ?';
  db.query(checkUser, [roomId], async (error, results) => {
      if (error) {
          return res.status(500).json({
              status: 'error',
              message: 'Database error',
              error: error
          });
      }

      if (results.length === 0) {
          return res.status(400).json({
              status: 'error',
              message: 'Invalid email or password'
          });
      }

      const user = results[0];
      try {
          // Compare the provided password with the hashed password in the database
          const isMatch = await bcrypt.compare(password, user.password);

          if (!isMatch) {
              return res.status(400).json({
                  status: 'roomId',
                  message: 'Invalid roomId or password'
              });
          }

          // Create JWT token
          const data = { roomId: user.roomId, username: user.username }; // Adjust the payload as needed
          const token = jwt.sign(data, "shhhhh", { expiresIn: '1h' });

          res.status(200).json({
              status: 'success',
              message: 'User logged in successfully',
              user: { username: user.username, roomId: user.roomId },
              token: token
          });
      } catch (error) {
          return res.status(500).json({
              status: 'error',
              message: 'Error comparing passwords',
              error: error.message
          });
      }
  });
});

router.get('/users', (req, res) => {
  const query = 'SELECT * FROM users';  // Note: excluding password for security
  
  db.query(query, (error, results) => {
      if (error) {
          return res.status(500).json({
              status: 'error',
              message: 'Error fetching users',
              error: error
          });
      }

      // If no users found
      if (results.length === 0) {
          return res.status(200).json({
              status: 'success',
              message: 'No users found',
              data: []
          });
      }

      // Return users
      res.status(200).json({
          status: 'success',
          message: 'Users retrieved successfully',
          data: results
      });
  });
});



router.put('/updateuser/:id', (req, res) => {
  const id = req.params.id;
  const { name, email } = req.body;
  const query = 'UPDATE users SET name = ?, email = ? WHERE id = ?';
  
  db.query(query, [name, email, id], (error, results) => {
      if (error) {
          return res.status(500).json({
              status: 'error',
              message: 'Error updating user',
              error: error
          });
      }

      // If no user found
      if (results.affectedRows === 0) {
          return res.status(404).json({
              status: 'error',
              message: 'User not found'
          });
      }

      // Return success
      res.status(200).json({
          status: 'success',
          message: 'User updated successfully'
      });
  });
});


router.delete('/deleteuser/:id', (req, res) => {
  const id = req.params.id;
  const query = 'DELETE FROM users WHERE id = ?';
  
  db.query(query, [id], (error, results) => {
      if (error) {
          return res.status(500).json({
              status: 'error',
              message: 'Error deleting user',
              error: error
          });
      }

      // If no user found
      if (results.affectedRows === 0) {
          return res.status(404).json({
              status: 'error',
              message: 'User not found'
          });
      }

      // Return success
      res.status(200).json({
          status: 'success',
          message: 'User deleted successfully'
      });
  });
});
module.exports = router;