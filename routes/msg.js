var express = require('express');
var router = express.Router();
var sequelize =require('../models/ModelHeader')();
var Msg = require('../models/MsgModel');
var Users = require('../models/userModels');
/* GET home page. */

router.post('/sendnew', function(req, res, next) {
	loginbean=req.session.loginbean;
	res.locals.loginbean=loginbean;
	 
	 nicheng = req.body.nicheng;
	 arr=nicheng.split(';');
	 len=arr.length;
	 message = req.body.message;
	  sql='select id from  users  where nicheng=?';
	   sqlmsg='insert into msgs set sendid=?,toid=?,message=?';
	  sqluser='update users set  msgnum=msgnum+1  where id=?';
	  flag=0;
	  var exec=function(i){
	  		return function(){
	  			toids={};

	 //for(i=0;i<len;i++){
	  sequelize.query(sql,{replacements: [arr[i]]}).then(function(rs){
  	console.log(rs);
  	resjson=JSON.parse(JSON.stringify(rs[0]));//rowdatapacke转  json
  		if (resjson.length==0) {
  			flag++;
  			return;
  		}
  	toids[i]=resjson[0].id;

  	
	  sequelize.query(sqlmsg,{replacements: [loginbean.id,toids[i],message]}).then(function(rs){
	  	console.log(rs);
	  	 
	  sequelize.query(sqluser,{replacements: [toids[i]]}).then(function(rs){
	  	console.log(rs);
	  	flag++;
	  	if(flag==len){
	  	  res.send('1'); //发送数据
	  	}
	  });
	  });

	
});
	   		//}
	 }}
	  for (i = 0; i < len; i++) {
	  fun=exec(i);
	  fun();
	  }
	
 // res.render('index', {});
});

router.post('/replynew', function(req, res, next) {
	loginbean=req.session.loginbean;
	res.locals.loginbean=loginbean;
	 nicheng = req.body.replyname;
	 message = req.body.rmessage;
	  //console.log('qQefqeee'+message);
	 sql='select id from  users  where nicheng=?';
	  sequelize.query(sql,{replacements: [nicheng]}).then(function(rs){
  	console.log(rs);
  	resjson=JSON.parse(JSON.stringify(rs[0]));//rowdatapacke转  json
  	toid=resjson[0].id;

  	 sqlmsg='insert into msgs set sendid=?,toid=?,message=?';
	  sequelize.query(sqlmsg,{replacements: [loginbean.id,toid,message]}).then(function(rs){
	  	console.log(rs);
	  	 sqluser='update users set  msgnum=msgnum+1  where id=?';
	  sequelize.query(sqluser,{replacements: [toid]}).then(function(rs){
	  	console.log(rs);
	  		    res.send('1');//发送数据
	  });
	  });
	
});

 // res.render('index', {});
});


router.get('/dele', function(req, res, next) {
	
	 res.locals.loginbean = req.session.loginbean;
	 id=req.query.id;
	  return Msg.destroy({where:{'id':id}}).then(function(rs){
	  	return Users.update({msgnum:sequelize.literal('msgnum-1')},{where:{'id':loginbean.id}}).then(function(rs){
	  		res.redirect('/home');
	  	});
	  });
  
});

module.exports = router;