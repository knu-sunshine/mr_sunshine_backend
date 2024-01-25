const express = require('express');
const router = express.Router();
const User = require('../../database/models/userModel');

/**
 * basic method
 */
const getUserByEmail = async(userEmail) => {
    try {
      // find User using Email
      const user = await User.findOne({ userEmail });
      return user; // return User(no -> null)

    } catch (error) {
      console.error(`Error finding user: ${error.message}`);
      throw error;
    }
  }

const getUserByUserId = async(userId) => {
    try{
        const user = await User.findOne({userId});
        return user;
    }catch(error) {
        console.error(`Error finding user: ${error.message}`);
        throw error;
    }
}

/**
 * 
 * @param {*} googleToken 
 * @returns 
 */
const signUp = async (googleToken,next) => {
    try{const OAuth_URL = `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${googleToken}`;

        const result = await fetch(OAuth_URL)
        .then((data)=>{
            switch(data.status){
                case 200: return data.json();
                case 401: throw error;
                case 500: throw error;
                default: throw error;
            }
        });
            

        let user = await getUserByEmail(result.email);
        console.log(user);
        if(!user){ //if there no user.. make it!
            const newUser = new User({   
                userName : result.name,
                userEmail : result.email
            });
            await newUser.save();
            console.log("new User!!!!!@@@@@@@@@@@");
            console.log("new User = ",newUser);
            return newUser;
        }
        console.log("already in...");
        console.log("user = ", user);
        return user;
    }
    catch{
        return null;
    }
};

const logIn = async (userId) => {
    const user = getUserByUserId(userId); 
    return user;s
}

module.exports = {
    signUp,
    logIn
  };


