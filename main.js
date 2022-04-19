const express = require('express');
const multer  = require('multer');
var fs = require("fs");
var session = require('express-session');

const db = require("./database");
const userModelInstance = require("./database/models/user.js");
const userCartModel = require("./database/models/cart.js");

const userModel = userModelInstance.model;
const userTypeEnums = userModelInstance.userRoleEnums;

const sendMail = require("./utils/sendMail");

const app = express()
const port = 3000

// setting ejs as default templating engine

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }))

// initiate database connection

db.init();

//middlewares

app.use(express.static("uploads"))
app.use(express.static("js"))
app.use(express.static("asset"))
app.use(express.json());

app.use(session({
  secret: 'secert key',
  resave: false,
  saveUninitialized: true,

}))
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

app.get('/', (req, res) => {
	if(req.session.isLoggedIn){
		res.redirect("/home");
		return;
	}else{
		res.render("index", { 
				profile_pic: "#",
				userLogin : false,
			});
	}
})

app.post("/signup",upload.single("profile_pic"),(req,res)=>{
	var username = req.body.username;
	var password = req.body.password;
	var conPassword = req.body.conPassword
	var file = req.file;
	if(!username){
		res.render("logSign",{ error: "Please enter username" });
		return
	}
	if(!password){
		res.render("logSign",{ error: "Please enter password" });
		return
	}
	if(!file){
		res.render("logSign",{ error: "select profile pic" });
		return
	}	

	if(password !== conPassword){
		res.render("logSign",{ error: "Password doesn't match" });
		return
	}	
	userModel.findOne({username:req.body.username}).then(function(user){
		if(user===null){
			userModel.create({ 
			username: req.body.username ,
			password: req.body.password,
			profile_pic: req.file.filename,
			isVerifiedMail:false,
			userType : userTypeEnums.customer
    }
	).then(function(user){
				var html = '<h3>click here to verify your email</h3>'+
				'<a href="https://e-commerce-1-fork-fork-fork-3p34g8sptbl22rtbhh.codequotient.in/verifyUser/'+user._id+'">click here</a>'

				sendMail(
					username, 
					"welcome to code quotient e-commerce", 
					"Please click here to verify",
					html,
					function(error){
						if(error){
							res.render("logSign",{ error: "enable to send email" });
							
						}else{
							res.redirect("/");
						}
					})
			}).catch(function(err){	
				console.log(err)
				res.end("something went wrong");
			})
		}else{
			res.render("logSign",{error:"user already exists"})
		}
	})	
})

app.get("/home",(req,res)=>{
	if(req.session.isLoggedIn){
		userModel.findOne({username : req.session.user}).then(function(user){
			res.render("index",{  
				profile_pic: user.profile_pic,
				userLogin : true
			});
		})		
	}else{
		res.redirect("/");
	}	
})

app.get("/data",(req,res)=>{
	fs.readFile("products.js","utf-8", function(err, data)
	{
		res.json(data);
	})
})

app.get("/verifyUser/:id", function(req, res)
{
		const id = req.params.id;
		userModel.updateOne({_id:id}, { isVerifiedMail: true }).then(function(user){
			res.render("logSign",{error:"Now please login to explore"});
		}).catch(function(err){
			console.log(err)
			res.render("logSign",{error:"user is not verified yet please try again"})
		})
})

app.get('/login', (req, res) => {
	if(req.session.isLoggedIn){
		res.redirect("/home");
		return;
	}
	res.render("logSign",{error : ""});
})

app.post("/login",(req,res)=>{
	const username = req.body.username;
	const password = req.body.password;

	userModel.findOne({ username: username, password: password }).then(function(user){

		if(user===null){
			res.render("logSign",{error:"user credentials are wrong"})
		}else if(!user.isVerifiedMail){
			res.render("logSign",{error:"You have to verify your email as link is send to you as signup time"})
		}else{
			var id = user._id.valueOf()
			console.log(id);

			req.session.isLoggedIn = true;
			req.session.user = user.username;
			req.session.id = user._id.valueOf()
			console.log(req.session.id)
			res.redirect("/home");
		}		
	})
})

app.get("/islogin",(req,res)=>{
	if(req.session.isLoggedIn){
		res.status(200)
		res.end();
	}else{
		res.status(401)
		res.end()
	}
})

app.get("/forgotPass",(req,res)=>{
	res.render("forgotPassword",{error:""})
})

app.post("/temp",(req,res)=>{
	userModel.findOne(req.body).then(function(user){ 
		if(user===null){
			res.status(400);
			res.end();
			return;
		}
		var html = '<h3>click here to set your password</h3>'+
		'<a href="https://e-commerce-1-fork-fork-fork-3p34g8sptbl22rtbhh.codequotient.in/setPass/?id='+user._id+'">click here</a>'
		sendMail(
			user.username, 
			"welcome to code quotient e-commerce", 
			"Please click here to change set your password",
			html,
			function(error){
				if(error){
					res.status(400)	
					res.end();			
				}else{
					res.status("200");
					res.end();
				}
			})
	})
})
app.get("/setPass",(req,res)=>{
	res.render("setpass",{error:""});
})
app.post("/setPass/:id",(req,res)=>{

	if(req.body.password!==req.body.conPassword){
		res.status(400);
		res.end();
	}else{
		userModel.updateOne({_id:req.params.id}, { password: req.body.password }).then(function(user){
			res.status(200)
			res.end()
		}).catch(function(err){
			res.status(400);
			res.end();
		})		
	}
})

app.route("/updatePass").get((req,res)=>{
	res.render("changePassword",{error:""})
}).post((req,res)=>{
	if(req.body.password!==req.body.conPassword){
		res.render("changePassword",{error:"please match the password in both the feilds !!"})
		return;
	}

	userModel.updateOne({username:req.session.user},{password : req.body.password}).then(function(user){
		res.redirect("/home");
	})
})

app.get("/mycart",(req,res)=>{
	if(req.session.isLoggedIn){
		res.status(200).send(req.session.id);
	}else{
		res.redirect("/login");
	}
})
app.post("/mycart",(req,res)=>{
	console.log(req.body);
	var data = req.body
	data.user_id = req.session.user;
	userCartModel.create(
		data
	).then(function(cart){
		console.log(cart);
	}).catch(function(err){
		console.log(err);
	})
	console.log(data);
	res.end();
})

app.get("/cart",(req,res)=>{
	userCartModel.find({user_id : req.session.user}).then(function(data){

		res.json(data);
	}).catch(function(err){
		console.log(err)
		res.end();
	})
})

app.get("/viewmycart",(req,res)=>{

	if(req.session.isLoggedIn){
		res.render("viewCart")
	}else{
		res.redirect("/login")
	}
})
app.get("/logout", function(req, res)
{
  req.session.destroy();
  res.redirect("/");
})

app.post("/updatecart",(req,res)=>{
	var id = req.body.id;
	var quantity = req.body.quantity;

	userCartModel.updateOne({_id :id},{quantity:quantity}).then(function(pro){
		res.status(200).json({"message":"updated"});
	}).catch(function(err){
		res.status(400).json({"message":"not updated"});
	})
})

app.post("/removecart",(req,res)=>{
	userCartModel.deleteOne(req.body).then(function(pro){
		res.status(200).json({"message":"removed"});
	}).catch(function(err){
		res.status(400).json({"message":"not removed"})
	})
})

app.get("/admin/login",(req,res)=>{
	res.render("adminLogin",{error:""})
})

app.post("/admin/login",(req,res)=>{
	console.log(req.body);
	userModel.findOne({username:req.body.username,password:req.body.password}).then(function(user){
		if(user!==null&&user.userType===userTypeEnums.admin){
			req.session.isAdmin = true;
			req.session.isLoggedIn = true; 
			req.session.user = req.body.username
			res.redirect("/admin/createproduct");
		}else{
			res.redirect("/home")
		}
	}).catch(function(err){
		res.redirect("/")
	})
	;
})

app.route("/admin/updatePass").get((req,res)=>{
	res.render("adminUpdatePass",{error:""})
}).post((req,res)=>{
	if(req.body.password!==req.body.conPassword){
		res.render("updatePass",{error:"please match the password in both the feilds !!"})
		return;
	}

	userModel.updateOne({username:req.session.user},{password : req.body.password}).then(function(user){
		res.redirect("/admin/products");
	})
})

app.get("/admin/createproduct",(req,res)=>{
	if(req.session.isAdmin){
		res.render("adminCreate");
	}else{
		res.redirect("/home")
	}
		
})
app.post("/admin/createproduct",upload.single("src"),(req,res)=>{
	var file = req.file
	var data = req.body;
	data.src = file.filename;
	data.user_id = "arnav1776@gmail.com"

	productModel.create(data).then(function(pro){
		console.log(pro)
		res.status(200).redirect("/admin/products");
	}).catch(function(err){
		console.log(err)
		res.status(400).send("not created");
	})
})

app.get("/admin/products",(req,res)=>{
	if(req.session.isAdmin){
		res.render("viewproduct");
	}else{
		res.redirect("/")
	}	
})

app.get("/admin/viewmyproduct",(req,res)=>{
	if(req.session.isAdmin){
		productModel.find({user_id:req.session.user}).then(function(data){
			res.status(200).json(data);
		}).catch(function(err){
			console.log(err);
			res.status(400).send("not have any data");
		})
	}else{
		res.redirect("/")
	}	
})

app.get("/admin/forgotPass",(req,res)=>{
	res.render("forgotAdminEmailForm",{error:""})
})

app.post("/admin/temp",(req,res)=>{
	userModel.findOne(req.body).then(function(user){ 
		if(user===null || user.userType===userTypeEnums.customer){
			res.status(400);
			res.end();
			return;
		}
		var html = '<h3>click here to set your password</h3>'+
		'<a href="https://e-commerce-1-fork-fork-fork-3p34g8sptbl22rtbhh.codequotient.in/admin/setPass/?id='+user._id+'">click here</a>'
		sendMail(
			user.username, 
			"welcome to code quotient e-commerce", 
			"Please click here to change set your password",
			html,
			function(error){
				if(error){
					res.status(400)	
					res.end();			
				}else{
					res.status("200");
					res.end();
				}
			})
	})
})

app.get("/admin/setPass",(req,res)=>{
	res.render("setAdminPass",{error:""});
})
app.post("/admin/setPass/:id",(req,res)=>{

	if(req.body.password!==req.body.conPassword){
		res.status(400);
		res.end();
	}else{
		userModel.updateOne({_id:req.params.id}, { password: req.body.password }).then(function(user){
			res.status(200)
			res.end()
		}).catch(function(err){
			res.status(400);
			res.end();
		})		
	}
})

app.get("/admin/updateproduct/:id",(req,res)=>{
	if(req.session.isAdmin){
		id = req.params.id;
		productModel.findOne({_id : id}).then(function(data){
			res.render("updatepro",{data});
		})
	}else{
		res.redirect("/")
	}	
})

app.post("/admin/updateproduct/:id",upload.single("src"),(req,res)=>{
	var id = req.params.id;
	console.log(id)
	productModel.updateOne({_id:id},req.body).then(function(data){
		console.log(data);
		res.redirect("/admin/products")
	}).catch(function(err){
		res.redirect("/home");
	})	
})

app.post("/admin/deleteproduct",(req,res)=>{
	productModel.deleteOne({_id:req.body.id}).then(function(data){
		console.log(data)
		res.redirect("/admin/products")
	}).catch(function(err){
		res.redirect("/home");
	})
})

app.listen(port, () => {
	console.log(`App is live at http://localhost:${port}`)
})

