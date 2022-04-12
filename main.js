const express = require('express');
const multer  = require('multer');
const fs  = require('fs');
const db = require("./database");
var session = require('express-session');

const app = express()
const port = 3000
var count = 0;

const userModel = require("./database/models/user.js");


// setting ejs as default templating engine

app.set('view engine', 'ejs');

// initiate database connection

db.init();

//middlewares

app.use(express.static("asset"));
app.use(express.static("uploads"))
app.use(express.urlencoded())

app.use(session({
  secret: 'bahut badhiya wala secert spice',
  resave: false,
  saveUninitialized: true,

}))


// multer

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
		res.render("signup",{ error: "Please enter profile pic" });
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

app.get("/home", function(req, res)
{
	// only logged in user should come here

	const user = req.session.user;


	fs.readFile("products.js","utf-8", function(err, data)
	{
		res.render("index", 
		{ 
			name: user.username,
			pic: user.profile_pic,
			products: JSON.parse(data),
			proNum : count
		})
	})
})


app.get("/getproduct", function(req,res){

   count = count + 5;

})

app.listen(port, () => {
	console.log(`App is live at http://localhost:${port}`)
})
