var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var gameSchema = {
  id : String,
  question: [String]
};

var gameChatSchema = {
  message : String,
  emiter : String
};

var chatSchema = [gameChatSchema];

var userSchema = new Schema({
    username:String,
    password: String,
    email : String,
    name : String,
    coin : {type:Number, default:0},
    game: [gameSchema],
    chat : [gameChatSchema]
});


var User = mongoose.model('users',userSchema);

module.exports = User;
