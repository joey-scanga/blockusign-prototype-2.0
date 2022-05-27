const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const Database = require('@replit/database')
const bcrypt = require('bcrypt')
const uuid = require('uuid')
const db = new Database()

const jsonParser = bodyParser.json()

router.use(express.urlencoded({ extended: true }))

router.get('/signup', (req, res) => {
  res.render('signup', {text: ""})
})

router.get('/login', (req, res) => {
  res.render('login', { text: ""})
})

router.post('/signup', async (req, res) => {
  const rounds = 10
  const salt = await bcrypt.genSalt(rounds)
  
  const username = req.body.username
  
  const password = req.body.password
  const confirmPassword = req.body.confirmpassword
  if(password !== confirmPassword){
    res.status(400).render('signup', {text: "Passwords don't match "})
  }
  const alreadyUsed = await db.get(username)
  if(alreadyUsed){
    res.render('signup', {text: "User already made" })
  }
  else{
    const passHash = await bcrypt.hash(password, salt)
    db.set(username, JSON.stringify({username: username, 
                     passHash: passHash}))
    res.status(200).render('home')
  }
})

router.post('/login', jsonParser, async (req, res) => {
  const username = req.body.username
  const password = req.body.password

  const value = await db.get(username)
    
  if(value.passHash){
    const isValid = await bcrypt.compare(password, value.passHash)
    if(isValid){
      console.log("Logged in successfully!")
      res.render('login', {text: 'logged in successfully!'})
    }
    else{
      res.render('login', {text: "incorrect username/password"})
    }
  }

  else{
    res.render('login', {text: "No user found"})
  }
})


module.exports = router