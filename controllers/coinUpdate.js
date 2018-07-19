var User = require('../models/user.js');

function coinUpdate(io, socket)
{
  for (let socketID in io.nsps['/'].adapter.rooms[socket.room].sockets) {
    console.log('earnedTest',io.nsps['/'].connected[socketID].earned);
    User.findOne({username : io.nsps['/'].connected[socketID].user},function(err, result){
      if(err) throw err;
      console.log(result);
      result.coin += (Number(io.nsps['/'].connected[socketID].earned) - Number(io.nsps['/'].connected[socketID].spend));
      io.nsps['/'].connected[socketID].coin = result.coin;
      console.log('test', io.nsps['/'].connected[socketID].coin);
      result.save();
    });

  }
}











module.exports = coinUpdate;
