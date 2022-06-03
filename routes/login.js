require('dotenv').config()
const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const Database = require('@replit/database')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const db = new Database()

//--------------------------Middleware Functions--------------------------------------
const jsonParser = bodyParser.json()
const urlParser = bodyParser.urlencoded({extended: true})

function validatePasswordParams(req, res, next) {
  const password = req.body.password

  const regex = /[ !@#$%^&*()_+\=\[\]{};':"\\|,.<>\/?]/g

  if (password.length < 8 || password.length > 100 || regex.test(password)){
    res.render('signup', {text: "Password must be at least 8 characters long, with only letters A-Za-z, numbers 0-9, and hyphens. "})
  }
    
  else{
    next()
  }
}

async function hashAndStoreNewUser(req, res) {
  const rounds = 10
  const salt = await bcrypt.genSalt(rounds)
  
  const username = req.body.username
  const password = req.body.password
  const confirmPassword = req.body.confirmpassword

  if(username === "" || password === "" || confirmPassword === ""){
    res.status(400).render('signup', {text: "Fill out all fields."})
  }
  else if(password !== confirmPassword){
    res.status(400).render('signup', {text: "Passwords don't match "})
  }
  const alreadyUsed = await db.get(username)
  if(alreadyUsed){
    res.render('signup', {text: "User already exists" })
  }
  else{
    const passHash = await bcrypt.hash(password, salt)
    db.set(username, JSON.stringify({username: username, 
                     passHash: passHash}))
    res.status(200).render('home')
  }
}

async function authenticateUser(req, res, next) {
  const username = req.body.username
  const password = req.body.password

  if(username === "" || password === ""){
    return res.status(400).render('login', {text: "Login failed"})
  }
  
  const dbResponse = await db.get(username)

  if(dbResponse === null){
    return res.status(400).render('login', {text: "Login failed"})
  }

  value = JSON.parse(dbResponse)
  console.log(value)

  const passHash = value.passHash
    
  if(passHash){
    const isValid = await bcrypt.compare(password, passHash)
    if(isValid){
      console.log(username, "logged in")
      return next()
    }
    else{
      return res.render('login', {text: "Login failed"})
    }
  }

  return res.render('login', {text: "Login failed"})
  
}

async function serializeUser(req, res) {
  const username = req.body.username
  const user = { name: username }
  
  const accessToken = jwt.sign(user, process.env['ACCESS_TOKEN_SECRET'])
  res.json({ accessToken: accessToken })
}

//----------------------Routes--------------------------------------------------------
router.get('/signup', (req, res) => {
  res.render('signup', {text: ""})
})

router.get('/login', (req, res) => {
  res.render('login', { text: ""})
})

router.post('/signup', urlParser, validatePasswordParams, hashAndStoreNewUser)

router.post('/login', urlParser, jsonParser, authenticateUser, serializeUser)

module.exports = router