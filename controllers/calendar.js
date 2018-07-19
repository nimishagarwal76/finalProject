var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var User = require('../models/user.js');
var LocalStrategy = require('passport-local').Strategy;
var bodyParser =  require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var user_controller = require("../controllers/user.js");
var passport = require('passport');
var sanitize = require('mongo-sanitize');


exports.dashboard = function(req, res){
  if(req.params.user==req.user.username)
  {
    let year = Number(req.query.year);
    let month = Number(req.query.month);
    let days = daysInMonth(month, year);
    let date = Number(req.query.date);
    function daysInMonth (month, year) {
      return new Date(Number(year), Number(month)+1, 0).getDate();
    }

    var init = new Date(year, month, 1).getDay();
    var m;
    console.log('mo',month);
    switch (month) {
      case 0:
        m = 'JANUARY';
        break;
      case 1:
        m = 'FEBRUARY'
      break;
      case 2:
        m = 'MARCH';
        break;
      case 3:
        m = 'APRIL';
      break;
      case 4:
        m = 'MAY';
        break;
      case 5:
        m = 'JUNE';
      break;
      case 6:
        m = 'JULY';
        break;
      case 7:
        m = 'AUGUST';
      break;
      case 8:
        m = 'SEPTEMBER';
        break;
      case 9:
        m = 'OCTOBER';
      break;
      case 10:
        m = 'NOVEMBER';
        break;
      case 11:
        m = 'DECEMBER';
      break;

    }
    var nmonth = month + 1;
    var pmonth = month - 1;
    var nyear = year;
    var pyear =  year;
    if(nmonth > 11)
    {
      nmonth=0;
      nyear++;
    }
    if(pmonth < 0)
    {
      pmonth = 11;
      pyear--;
    }

    res.render('dashboard',{days: days, init: init, year: year, nmonth:nmonth,pmonth:pmonth, user:req.user.username, mname: m, month: month, nyear: nyear, pyear: pyear, date: date});
  }
  else
  {
    res.status(404).send("Invalid User");
  }

};
