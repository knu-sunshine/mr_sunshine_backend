const express = require('express');
const router = express.Router();
const errorHandler = require('../../middleware/errorHandler');
const bodyParser = require('body-parser');
const session = require('express-session');
const authService = require('./authService');
const { GoogleTokenError } = require('../error/authError');

router.use(bodyParser.json());

/*// 세션 미들웨어 설정
router.use(
  session({
    secret: 'secretkey', // 세션을 서명하기 위한 키, 보안 상의 이유로 랜덤한 문자열 사용 권장
    resave: false, // 변경사항이 없어도 세션을 다시 저장할지 여부
    saveUninitialized: true, // 초기화되지 않은 세션을 저장소에 저장할지 여부
    rolling: true,
    cookie: {
      expires:  new Date(Date.now() + 2 * 60 * 60 * 1000), //2시간 만료
      secure: false, // HTTPS를 통해서만 세션을 전송할지 여부 (운영 환경에서는 true로 설정하는 것이 좋음)
      maxAge: 60000, // 세션의 유효 시간 (밀리초 단위)
    },
  })
);*/

const signUp = async (req, res, next) => {
  try {
        console.log("signup require...");
        const googleToken = req.body.googleToken;
        console.log("googleToken = ",googleToken);
        const user = await authService.signUp(googleToken);
        if(!user){
          throw GoogleTokenError
        }
        //session.user = user;
        //session.expires = new Date(Date.now() + 2 * 60 * 60 * 1000)
        //console.log("session = ",session);
        res.status(201).json(user);
    } catch (GoogleTokenError) {
      next(GoogleTokenError);
    } 
};

const logIn = async (req, res, next) => {
    try {
        console.log("logIn require.....");
        console.log("reqBody : ",req.body);
        const userId = req.body.userId;

        const user = await authService.logIn(userId)
        if(!user){
          res.status(401).json(user);
        }
        else{
          res.status(201).json(user);
        }

    }catch(error){
      next(error);
    }
        
        /*console.log("세션은!~ : ",session);
        if (session.cookie.expires instanceof Date && new Date(Date.now()) > session.cookie.expires) {
            console.log("session is unauthorized!");
            // session expire
            res.status(401).json({ result: "fail", error: 'Unauthorized' });
        }
        else if(session.cookie.expires instanceof Date &&  session.cookie.expires - new Date(Date.now()) < 3600000) {
            session.regenerate();
            console.log("session regenerate!");
            res.status(201).json(session);
        } 
        else {
            console.log("session is valid!");
            // session valid
            res.status(201).json(session);
          }
        }catch (error) {
      next(error);
    }*/
  };

// URL MAPPING
router.post('/signup', signUp);
router.post('/login',logIn);

router.use(errorHandler);

module.exports = router;