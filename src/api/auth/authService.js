const express = require('express');
const router = express.Router();
const User = require('../../database/models/userModel');


const getUserByEmail = async(userEmail) => {
    try {
      // User 모델을 사용하여 UserEmail과 일치하는 사용자를 찾음
      const user = await User.findOne({ userEmail });
      
      return user; // 찾은 사용자를 반환 (존재하지 않을 경우 null)

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


const signUp = async (googleToken) => {
    const OAuth_URL = `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${googleToken}`;
    console.log("oAuth_URL = ",OAuth_URL);  

    const result = await fetch(OAuth_URL)
    .then((data)=>{
        switch(data.status){
            case 200: return data.json();
            case 401: throw error;
        }
    });
    console.log("result = ", result);

    let user = await getUserByEmail(result.email);

    if(!user){ //if there no user.. make it!
        user = {}
        user.userName = result.name;
        user.userEmail = result.email;
        await user.save();
        console.log("new User!!!!!@@@@@@@@@@@");
    }
    
    console.log("user = ", user);
    return user;
};

const logIn = async (userId) => {
    const user = getUserByUserId(userId);
    return user;
}

module.exports = {
    signUp,
    logIn
  };


