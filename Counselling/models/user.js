var mongoose = require('mongoose').set('debug',true);
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



module.exports.createUser = function(newUser, callback){
User.find({username:newUser.username}).exec(function(err,docs) {
		if(docs.length) {
			callback("User exists already!",null);
		} else {
     bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(newUser.password, salt, function(err, hash) {
	        newUser.password = hash;
	       newUser.save(callback);
});
});
}
});
}

module.exports.getUserByUsername = function(username, callback){
	var query = {username: username};
	User.findOne(query, callback);
}

module.exports.getUserById = function(id, callback){
	User.findById(id, callback);
}
module.exports.getRole = function(id,callback) {
	User.find({_id:id},{role:role},callback);

}
module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    	if(err) throw err;
    	console.log('o no : ' +isMatch)
    	callback(null, isMatch);
	});
}