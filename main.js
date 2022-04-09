const express = require('express');
const multer  = require('multer');
const db = require("./database");
const app = express()
const port = 3000

// setting ejs as default templating engine
app.set('view engine','ejs');

// initiate database connection
db.init();

// middlewares
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
  

app.get('/login', function(req, res) {
	res.render('login');
})

app.route("/signup").get(function(req, res) 
{
	res.render('signup');

}).post(upload.single("profile_pic"), (function(req, res){
const username = req.body;
const password = req.body;
const file = req.file;

console.log(username, password, file);
})

)


app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`)
})