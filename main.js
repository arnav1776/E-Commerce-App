const express = require('express')
const db = require("./database");
const app = express()
const port = 3000

// setting ejs as default templating engine
app.set('view engine','ejs');

// initiate database connection
db.init();


app.get('/', (req, res) => {
	res.render('home');
})


app.get('/login', (req, res) => {
	res.render('login');
})

app.get('/signup', (req, res) => {
	res.render('signup');
})

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`)
})
 