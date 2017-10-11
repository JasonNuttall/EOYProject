var mongoose = require('mongoose').set('debug',true);
mongoose.connect('mongodb://localhost/Counselling');
var db = mongoose.connection;
//var post = require("../post");
var bcrypt = require('bcryptjs');

// User Schema
var UserSchema = mongoose.Schema({
		email: {
		type: String
	},
	username: {
		type: String,
		index:true
	},
	password: {
		type: String
	},
	role: {
		type:String ,default: 'patient'
	},
	biography: {
		type: String, default: 'Tell us about yourself'
	},
	conditions :{
		type:String, default: 'What problems do you struggle with e.g Depression,Anxiety, PTSD '
	},
	joindate : {
		type:Date, default: Date.now()
	},
	dob: {
		type:Date,default: Date.now()
	},
	address: {
		type: String, default: 'Buckingham Palace, Westminster, London SW1A 1AA'
	},
	gender : {
		type: String, default: 'Not Specified'
	},
	contactno: {
		type: String, default: '0844 588 6690'
	},
		altcontactno: {
		type: String, default: '01234 400 400'
	},
	appointment: {
		type:Date, default: Date.now()
	},
	counsellor :{ 
		type: String, default: 'Counsellor'}

});



var User = module.exports = mongoose.model('User', UserSchema);
var users = { "user": [
		{"email": "admin@admin.com","username": "Admin","password": "admin","role": "admin"},
		{"email": "Counsellor@Counsellor.com","username": "Counsellor","password": "counsellor","role": "counsellor"},
		{"email": "Counsellor2@Counsellor.com","username": "Counsellor2","password": "counsellor2","role": "counsellor"},
		{"email": "JohnSmith@Patient.com","username": "johnsmith","password": "john1234","role": "patient"}
	]};




for (i in users.user) {
var salt = bcrypt.genSaltSync(10);
var hash = bcrypt.hashSync(users.user[i].password, salt);
users.user[i].password = hash;
var newUser =  new User(users.user[i]);
newUser.save();
}