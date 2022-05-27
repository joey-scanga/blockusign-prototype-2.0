const express = require('express');
const mysql = require('mysql')
const Database = require('@replit/database')

const app = express();

app.set('view engine', 'ejs')

const userRouter = require('./routes/login')
app.use('/user', userRouter)

const devRouter = require('./routes/devView')
app.use('/devView', devRouter)

app.get('/', (req, res) => {
  res.render('home')
});

app.listen(3000, () => {
  console.log('server started');
});
