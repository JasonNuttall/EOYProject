var mongoose = require('mongoose');

var postSchema = mongoose.Schema({
title: {
	type:String,
	required: true
		},
author: {
 type:String,
 required:true
},
content: {
	type:String,
	required:true
}
});

var Post =module.exports = mongoose.model('Post',postSchema);
module.exports.createPost = function(post, callback){
	        post.save(callback);
	    };

module.exports.getPostById = function(id, callback){
	Post.findById(id, callback);
}
