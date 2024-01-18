const express = require('express');
const router = express.Router();
const errorHandler = require('../../middleware/errorHandler');
const session = require('express-session');


const signUp = async (req, res, next) => {
    try {
        const googleToken = req.body.googleToken;
        const user = await authService.signUp(googleToken);
        session.userName = user.userName;
        session.userEmail = user.userEmail;
        session.userId = user.userId;
        res.status(201).json(session);
    } catch (error) {
      next(error);
    }
};

const logIn = async (req, res, next) => {
    try {
        const session = req.session;
        const user = await authService.logIn(session.userId);
        if (session.cookie.expires instanceof Date && new Date() > session.cookie.expires) {
            // session expire
            res.status(401).json({ error: 'Unauthorized' });
          } else {
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