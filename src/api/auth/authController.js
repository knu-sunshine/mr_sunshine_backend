const express = require('express');
const router = express.Router();
const errorHandler = require('../../middleware/errorHandler');
const session = require('express-session');
const authService = require('./authService');
const { GoogleTokenError } = require('../error/auth');

const signUp = async (req, res, next) => {
  try {
        console.log("signup require...");
        const googleToken = req.body.googleToken;
        console.log("googleToken = ",googleToken);
        const user = await authService.signUp(googleToken);
        if(!user){
          throw GoogleTokenError
        }
        session.user = user;
        console.log("session = ",session);
        res.status(201).json(session);
    } catch (GoogleTokenError) {
      next(GoogleTokenError);
    } 
};

const logIn = async (req, res, next) => {
    try {
        const session = req.session;
        
        if (session.cookie.expires instanceof Date && new Date() > session.cookie.expires) {
            // session expire
            res.status(401).json({ result: "fail", error: 'Unauthorized' });
        }
        else if(session.cookie.expires instanceof Date &&  session.cookie.expires - new Date() < 3600000) {
            session.regenerate();
            res.status(201).json(session);
        } 
        else {
            // session valid
            res.status(201).json(session);
          }
        }catch (error) {
      next(error);
    }
  };

// URL MAPPING
router.post('/signup', signUp);
router.get('/login',logIn);

// 세션 미들웨어 설정
router.use(
    session({
      secret: 'secretkey', // 세션을 서명하기 위한 키, 보안 상의 이유로 랜덤한 문자열 사용 권장
      resave: false, // 변경사항이 없어도 세션을 다시 저장할지 여부
      saveUninitialized: true, // 초기화되지 않은 세션을 저장소에 저장할지 여부
      rolling: true,
      cookie: {
        secure: false, // HTTPS를 통해서만 세션을 전송할지 여부 (운영 환경에서는 true로 설정하는 것이 좋음)
        maxAge: 60000, // 세션의 유효 시간 (밀리초 단위)
      },
    })
);

router.use(errorHandler);

module.exports = router;