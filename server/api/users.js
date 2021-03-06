/* use strict */
var express = require('express')
var router = express.Router()
var User = require('../models/user')
var mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const config = require('../config')
const passport = require('passport')

require('../passport')(passport);

// 注册账户
router.post('/signup', (req, res) => {
  let username = req.body.username
  let password = req.body.password

  if (!username || !password) {
    res.json({
      code: 202,
      msg: '请输入您的账号密码',
      data: ''
    })
  } else {
    // 实例化一个User
    var newUser = new User({
      username: username,
      password: password
    })
    // 保存用户账号
    newUser.save((err) => {
      if (err) {
        console.log(err)
        return res.json({
          code: 201,
          msg: '注册失败',
          data: ''
        })
      }
      res.json({
        code: 200,
        msg: '成功创建新用户',
        data: ''
      })
    })
  }
})

// 登录: 检查用户名与密码并生成一个accesstoken如果验证通过
router.post('/accesstoken', (req, res) => {
  let sess = req.session
  let password = req.body.password
  let username = req.body.username

  User.findOne({
    username: username
  }, (err, user) => {
    if (err) {
      throw err
    }
    if (!user) {
      res.json({
        code: 202,
        msg: '认证失败,用户不存在',
        data: ''
      })
    } else if (user) {
      // 检查密码是否正确
      user.comparePassword(password, (err, isMatch) => {
        if (isMatch && !err) {
          var token = jwt.sign({ username: user.username }, config.secret, {
            expiresIn: 7200000  // token到期时间设置
          })
          user.token = token
          user.save(function (err) {
            if (err) {
              res.send(err)
            }
          })
          // username存session
          req.session.YYJ_userId = user._id
          res.json({
            code: 200,
            msg: '验证成功!',
            data: {
              token: 'Bearer ' + token,
              username: user.username
            }
          })
        } else {
          res.send({
            code: 201,
            msg: '认证失败,密码错误',
            data: ''
          })
        }
      })
    }
  })
})

// 登出
router.post('/logout', passport.authenticate('bearer', { session: false }), (req, res) => {
  var conditions = { username: req.body.username }
  var updates = {$set: {token: ''}}
  User.update(conditions, updates, err => {
    if (err) {
      throw err
    } else {
      // 清空session
      req.session.YYJ_username = null
      res.json({
        code: 200,
        msg: '登出成功',
        data: ''
      })
    }
  })
})

// passport-http-bearer token 中间件验证
// 通过 header 发送 Authorization -> Bearer  + token
// 或者通过 ?access_token = token
router.get('/info'/* , passport.authenticate('bearer', { session: false }) */, function (req, res) {
  User.find({}, (err, doc) => {
    if (err) {
      res.json({
        code: 201,
        msg: err.message,
        data: ''
      });
    } else {
      if (doc) {
        res.json({
          code: 200,
          msg: '',
          data: doc
        });
      }
    }
  })
});

module.exports = router;
