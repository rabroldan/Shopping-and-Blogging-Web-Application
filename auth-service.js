/*********************************************************************************
*  WEB322 – Assignment 06
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part of this
*  assignment has been copied manually or electronically from any other source (including web sites) or 
*  distributed to other students.
* 
*  Name: Ronald Roldan Student ID:121813224 Date: 2023/08/14
*
*  Cyclic Web App URL: https://vast-plum-cockroach-slip.cyclic.app/ 
*
*  GitHub Repository URL: GitHub Repository URL: https://github.com/rroldan1106/-web322-app
*
********************************************************************************/ 
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');



var userSchema = new Schema({
    "userName": {
        "type": String,
        "unique": true
    },
    "password":String,
    "email": String,
    "loginHistory": [{
        "dateTime": {
            "type": Date,
        },
        "userAgent": String
    }],
});



let User;


function initialize() {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection("mongodb+srv://rroldan:DZ5xO5zqs6I61RBX@senecaweb.zcaktyg.mongodb.net/?retryWrites=true&w=majority");

        db.on('error', (err) => {
            reject(err); // reject the promise with the provided error
        });
        db.once('open', () => {
            User = db.model("users", userSchema);
            resolve();
        });
    });
};


function registerUser(userData) {
    return new Promise((resolve, reject) => {
      if (userData.password !== userData.password2) {
        reject(new Error('Passwords do not match'));
      } else {
        bcrypt.hash(userData.password, 10)
          .then(hash => {
            // Create a new User object and set its properties
            const newUser = new User({
            userName: userData.userName,
            email: userData.email,
              password: hash // Store the hash in the password field

            
          
             
            });
  
            newUser
              .save()
              .then(() => {
                resolve();
              })
              .catch(error => {
                if (error.code === 11000) {
                  reject(new Error('User Name already taken'));
                } else {
                  reject(new Error('There was an error creating the user: ' + error));
                }
              });
          })
          .catch(err => {
            reject(new Error('Error hashing password: ' + err));
          });
      }
    });
  }
  

function checkUser(userData) {
    return new Promise((resolve, reject) => {
      User.find({ userName: userData.userName })
      .then((users) => {
       
        bcrypt.compare(userData.password, users[0].password).then((result) => {
            if (result === true) {
              users[0].loginHistory.push({
                dateTime: new Date().toString(),
                userAgent: userData.userAgent,
              });
  
              User.updateOne(
                { userName: users[0].userName },
                { $set: { loginHistory: users[0].loginHistory } }
              )
                .then(() => {
                  resolve(users[0]);
                })
                .catch((error) => {
                  reject(`There was an error verifying the user: ${error}`);
                });
            }
          });
        
      })
            .catch((error) => {
                reject(('Unable to find user: ' + userData.userName));
            });
    });
}



module.exports = {
    registerUser,
    checkUser,
    initialize
};


