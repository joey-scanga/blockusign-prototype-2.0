const express = require('express')
const Database = require('@replit/database')
const router = express.Router()
const bodyParser = require('body-parser')
const db = new Database()

router.use(express.urlencoded({ extended: true }))
router.use(express.json())

router.get('/', (req, res) => {
  res.render('devView')
})

router.get('/listDatabaseKeys', async (req, res) => {
  let list = await db.list()
  list = JSON.stringify(list)
  res.json(list)
})

router.get('/listKeyValues', async (req, res) => {
  const key = req.query.key

  let value = await db.get(key)
  value = JSON.stringify(value)
  
  if(value) res.render('devView', { keyValues: value })
    
  else{
    console.log("Value undefined :(")
    res.render('devView', {keyValues: ""})
  } 
})


module.exports = router