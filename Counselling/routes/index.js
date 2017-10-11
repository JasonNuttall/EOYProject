	var express = require('express');
	var router = express.Router();
	var passport = require('passport');
	var LocalStrategy = require('passport-local').Strategy;
	var Appointment = require('../models/appointment');
	var User = require('../models/user');
	var Post = require('../models/post');
	var moment = require('moment');

	var ConnectRoles = require('connect-roles');

	//creating the user permissions
	var user = new ConnectRoles({
		failureHandler: function (req, res, action) {
	    // optional function to customise code that runs when
	    // user fails authorisation
	    var accept = req.headers.accept || '';
	    res.status(403);
	    if (~accept.indexOf('html')) {
	    	res.render('error', {action: action});
	    } else {
	    	res.send('Access Denied - You don\'t have permission to: ' + action);
	    }
	}
});
	var isAdmin =false;
	var isCounsellor = false;
	var isPatient = false;

	//anonymous users can only access the home page
	//returning false stops any more rules from being
	//considered
	user.use(function (req, action) {
		if (!req.isAuthenticated()) return action === 'access home page';

	})

	//counsellor permission for counsellor pages only
	user.use('counsellor access', function (req) {
		if (req.user.role === 'counsellor') {
			return true;
		}
	})

	//admin users can access all pages
	user.use(function (req) {
		if (req.user.role === 'admin') {
			return true;
		} 

	});
	router.use(user.middleware());
	router.use(function(req,res,next) {
		if(req.isAuthenticated()) {
			if (req.user.role === 'admin') {
				isAdmin = true;
			}
			if(req.user.role === 'counsellor') {
				isCounsellor = true;
			}
			if(req.user.role === 'patient') {
				isPatient =true;
			}
		}

		next();
	});
	//peer to peer
	router.get('/session',function(req,res,next) {

		var config = require('config');
				var session_host = config.get('data.host');
		res.render('Session', {session_host:session_host})
	})
		router.get('/counsellorsession',function(req,res,next) {

		var config = require('config');
				var session_host = config.get('data.host');
		res.render('counsellorsession', {session_host:session_host})
	})
	//index page
	router.get('/', function(req, res, next) {
		res.render('index', { title: '-Index-',isAdmin:isAdmin,isCounsellor:isCounsellor });
	});

	//Admin page
	router.get('/admin',ensureAuthenticated,user.can('access admin page'),function(req,res,next) {
		User.find().then(function(account) {
			Appointment.find().then(function(doc) {
			var formattedDate = moment(doc).format('DD-MM-YYYY')
		res.render('admin', {isAdmin:isAdmin,isCounsellor:isCounsellor,account:account, appointments:doc});
	});
	});
	});
	//appointment page
	router.get('/appointment',ensureAuthenticated,user.can('counsellor access'),function(req,res,next) {
		Appointment.find().then(function(doc) {
			var formattedDate = moment(doc).format('DD-MM-YYYY')
		res.render('appointment', {appointments:doc,isAdmin:isAdmin,isCounsellor:isCounsellor,date:formattedDate});
	})
	});
	//blog page
	router.get('/blog',ensureAuthenticated,function(req,res,next) {
		Post.find().then(function(doc) {
			res.render('blog',{posts:doc,isAdmin:isAdmin,isCounsellor:isCounsellor})	
		})
	});
	//contact page
	router.get('/contact',function(req,res,next) {
		res.render('contact',{isAdmin:isAdmin,isCounsellor:isCounsellor});
	});
	//Generate blog --TODO add role perm to counsellor
	router.get('/generateblog',ensureAuthenticated,user.can('counsellor access'),function(req,res,next) {
		res.render('generateblog',{isAdmin:isAdmin,isCounsellor:isCounsellor});
	});

	//Login page
	router.get('/login',function(req,res) {
		res.render('login',{isAdmin:isAdmin,isCounsellor:isCounsellor});
	});

	router.get('/logout', function(req, res){
		req.logout();

		req.flash('success_msg', 'You are logged out');

		res.redirect('/login');
	});
	// profile page
	router.get('/profile',ensureAuthenticated,function(req, res, next) {
User.find({role:"counsellor"}).then(function(doc) {
		res.render('profile',{title: 'Profile',isAdmin:isAdmin,isCounsellor:isCounsellor,doc:doc})	
	});
	});
//test1

	//register page
	router.get('/register', function(req, res, next) {
		res.render('register', { title: 'Register here',isAdmin:isAdmin,isCounsellor:isCounsellor });
	});
		router.get('/adminregister',ensureAuthenticated,user.can('access admin page'),function(req, res, next) {
		res.render('adminregister', { title: 'Register here',isAdmin:isAdmin,isCounsellor:isCounsellor });
	});
	//rota page
	router.get('/rota', ensureAuthenticated,function(req, res, next) {
		User.find({role:"counsellor"},{username:1,_id:0}).then(function(doc) {
			Appointment.find().then(function(appointments) {
			var formattedDate = moment(doc).format('DD-MM-YYYY') 
		res.render('rota', { title: 'Rota',isAdmin:isAdmin,isCounsellor:isCounsellor,doc:doc,appointments:appointments});
	});
	});
	});
	router.get('/edituser',function(req, res, next) {
		res.render('editUserData', { title: 'Edit User Page' ,isAdmin: isAdmin,isCounsellor:isCounsellor,isPatient:isPatient});   
	});
	router.post('/editUserData',function(req,res,next) {
	console.log(req.body);
		var id = req.user.id;
		console.log(id)
		req.flash('success_msg','user changes made');
			
		res.redirect('/users')
		User.findById(id,function(err,doc) {
			if(err) {
				console.error('No User found to modify')
			}
			doc.biography = req.body.userBio;
			doc.gender = req.body.gender;
			doc.address = req.body.address;
			doc.email = req.body.email;
			doc.contactno = req.body.contactno;
			doc.altcontactno = req.body.altcontactno;
			doc.appointment = moment(req.body.appointment).format();
			doc.save();
	
		}) 
	});
	router.post('/updateblog',ensureAuthenticated,user.can('counsellor access'),function(req,res,next) {
		 	var id = req.body.postid;
		 	Post.getPostById(id,function(err,doc) {
		 		if(err) {
		 			console.error("no post to modify");
		 		}
		 		doc.content =req.body.content;
		 		doc.title = req.body.title;
		 		doc.save();

		 	});
		 	res.redirect(req.get('referer'));
		 });
router.post('/delblog',ensureAuthenticated,user.can('counsellor access'),function(req,res,next) {
var id = req.body.postid;
Post.findByIdAndRemove(id).exec();
res.redirect(req.get('referer'));
})
	//users profile page
	router.get('/users',function(req, res, next) {
		res.render('user', { title: 'User Page' ,isAdmin: isAdmin,isCounsellor:isCounsellor,isPatient:isPatient});   
	});


	router.get('/restorebackup',function(req,res,next) {
		var restore = require('mongodb-restore');
restore({
  uri: 'mongodb://localhost/Counselling',
  root: __dirname+ '/backup',
  drop: true, 
});
console.log("restoring db");
  res.redirect('/');
	});
	router.get('/backup',ensureAuthenticated,user.can('access admin page'),function(req,res,next) {
var backup = require('mongodb-backup');

backup({
  uri: 'mongodb://localhost/Counselling', 
  root:__dirname +'/backup'
});
console.log("dumping db");
  res.redirect('/');
	});
	
router.post('/register',function(req,res,next) {
	console.log('data recieved :' + JSON.stringify(req.body));
		var username = req.body.username;
		var email = req.body.email;
		var password = req.body.password;
		var password2 = req.body.password2;
		var role = req.body.role;
		var altcontactno = req.body.altcontactno;
		var recievedDate = new Date(req.body.dob);
		var momdate = moment(recievedDate);		

	// Validation
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('username', 'Username is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(password);
	var errors = req.validationErrors();
	if(errors){
		console.log("ERRORRROROROROR :" +JSON.stringify(errors))
		res.render('register',{
			errors:errors
		});
	} else {
		console.log("making new user");
		var newUser = new User({
			email:email,
		        username: username,
			password: password,
			role:role,
			joindate:Date.now(),
			dob:momdate,
		});
		User.createUser(newUser, function(err, user){
			if(err) {
				errors = 'user already exists';
				res.render('register',{errors:req.flash('error_msg','user already exists!')
});
                      } else{
		req.flash('success_msg', 'You are registered and can now login');
		res.redirect('/login');
}
});
}})
	//generate blog page
	router.get('/generateblog', ensureAuthenticated,user.can('counsellor access'),function(req, res, next) {
		res.render('generateblog', { title: 'Create a blog',isAdmin:isAdmin,isCounsellor:isCounsellor });
	});
		router.get('/generateAppointment',function(req, res, next) {
			
				User.find({role:"counsellor"},{username:1,_id:0}).then(function(doc) {
									User.find({role:"patient"},{username:1,_id:0}).then(function(doc2) {
					res.render('generateAppointment', { title: 'Create an appointment',isAdmin:isAdmin,isCounsellor:isCounsellor, doc:doc ,doc2:doc2});
			})
			})
	
	});
		router.post('/generateAppointment', function(req,res) {
	
		console.log("DATA RECIEVED: "+ JSON.stringify(req.body))
		var recievedDate = new Date(req.body.date);
		var momdate = moment(recievedDate)
		console.log("moment date is: " +momdate.format())

		console.log("New date is : "+recievedDate)
			var newAppointment = new Appointment( {
				appointment_date: momdate.format(),
				counsellor : req.body.counsellor,
				patient :req.body.patient_name
			});
			Appointment.createAppointment(newAppointment,function(err,appointments) {
				if(err) {throw err;}
				req.flash('success_msg','Appointment has been created');
				res.redirect('/appointment');
			})
		});
	// create blog
	router.post('/generateblog', ensureAuthenticated,function(req,res) {
		var newBlog = new Post( {
			title: req.body.postTitle,
			author:req.user.username,
			content:req.body.postContent
		});


		Post.createPost(newBlog,function(err,post) {
			if(err) {throw err;}
			req.flash('success_msg','Blog entry has been added');
			res.redirect('/blog');
		});
	});



	//login post
	router.post('/login',
		passport.authenticate('local', {successRedirect:'/users', failureRedirect:'/',failureFlash: true,successFlash: 'You are now logged in'}),
		function(req, res) {
			res.redirect('/users');
		});




	passport.use(new LocalStrategy(
		function(username, password, done) {
			User.getUserByUsername(username, function(err, user){
				if(err) throw err;
				if(!user){
					return done(null, false, {message: 'Unknown User'});
				}

				User.comparePassword(password, user.password, function(err, isMatch){
					if(err) throw err;
					if(isMatch){
						return done(null, user);
					} else {
						return done(null, false, {message: 'Invalid password'});
					}
				});
			});
		}));
	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
		User.getUserById(id, function(err, user) {
			done(err, user);
		});
	});
	function ensureAuthenticated(req, res, next){
		if(req.isAuthenticated()){
			return next();
		} else {
			req.flash('error_msg','You are not logged in');
			res.redirect('/login');
		}
	}
	module.exports = router;

