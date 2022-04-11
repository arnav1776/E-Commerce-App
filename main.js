const express = require('express');
const multer  = require('multer');
const db = require("./database");
const fs  = require('fs');
var session = require('express-session')
const app = express()
const port = 3000

const userModel = require("./database/models/user.js");

// setting ejs as default templating engine
app.set('view engine','ejs');

// initiate database connection
db.init();

// middlewares
app.use(express.static("public"));
app.use(express.static("uploads"));
app.use(express.urlencoded())

app.get('/', function(req, res) {
	res.render('home');
})

//multer
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
	  cb(null, 'uploads')
	},
	filename: function (req, file, cb) {
	  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
	  cb(null, file.fieldname + '-' + uniqueSuffix)
	}
  })
  
  const upload = multer({ storage: storage })
  
app.get('/', function(req, res)
  {
	  res.render('login');
  })

app.get('/login', function(req, res)
{
	res.render('login');
})

app.post("/login", function(req, res)
{
	const username = req.body.username;
	const password = req.body.password;

	userModel.findOne({ username: username, password: password })
	.then(function(user)
	{
		req.session.isLoggedIn = true;
		req.session.user = user;

		res.redirect("/home");
		
	})
})

app.route("/signup").get(function(req, res)
{
	res.render('signup',{ error: "" });

}).post(upload.single("profile_pic"), function(req, res)
{
	const username = req.body.username;
	const password = req.body.password;
	const file = req.file;

	if(!username)
	{
		res.render("signup",{ error: "Please enter username" });
		return
	}

	if(!password)
	{
		res.render("signup",{ error: "Please enter password" });
		return
	}

	if(!file)
	{
		res.render("signup",{ error: "sayad profile pic bhul gye app" });
		return
	}

	userModel.create({ 
		username: username ,
		password: password,
		profile_pic: file.filename
	})
	.then(function()
	{
		res.redirect("/login");
	})
	.catch(function(err)
	{	
		//console.log(err)
		res.render("signup",{ error: "something went terribly wrong" });
	})
})

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`)
})