		var express = require('express');
		var router = express.Router();
		var sequelize =require('../models/ModelHeader')();
		var PrivateInfoModel = require('../models/PrivateInfoModels');
		var Users = require('../models/userModels');
		var Msg = require('../models/MsgModel');

		/* GET home page. */
		router.get('/', function(req, res, next) {
			//console.log(req.session.loginbean);
			 
			res.locals.loginbean=loginbean;
			 loginbean=req.session.loginbean;
			 if(loginbean.role==0){
		  res.render('admin/adminHome', {});
		}else{
			res.send('<script>alert("非法操作");location.href='/'</script>');
		}
		});

		router.get('/authList', function(req, res, next) {
			
		 loginbean=req.session.loginbean;
		 res.locals.loginbean=loginbean;
		 if(loginbean.role==0){
		 	sql='select    p.*    from  privateinfos p, users u where u.role=2  and p.id=u.id';
		 	sequelize.query(sql).then(function(rs){
		 			//res.send(rs[0]);
		 				res.render('admin/authList',{rs:rs[0]});

		 	});

		 	}else{
		res.send('<script>alert("非法操作");location.href='/'</script>');
		}
		});


		router.get('/authInfo', function(req, res, next) {
			
			id=req.query.id;
			
		 	PrivateInfoModel.findOne({where:{id:id}}).then(function(rs){
		  		//console.log(rs);
		  	
		  		if(rs!=null){

		  			res.render('admin/authDate',{rs:rs});
		  		}else{
			rs.send("查无此信息");
		}
		})
		});


		router.get('/applypass', function(req, res, next) {
			loginbean=req.session.loginbean;
		 	res.locals.loginbean=loginbean;
		 if(loginbean.role==0){
		 	id=req.query.id;
		 	sql='update users set role=3,msgnum=msgnum+1  where id=?';
		 	
		 	sequelize.query(sql,{replacements:[parseInt(id)],type:sequelize.QueryTypes.UPDATE}).then(function(rs){//sequelize执行sql语句 ，id替换？
		 		sqlmsg='insert into msgs set sendid=?,toid=?,message="您的审核已通过，请进入空间发布审核信息"';
		 		sequelize.query(sqlmsg,{replacements:[loginbean.id,id]}).then(function(rs){
		 			//console.log(rs);
		 			res.redirect('./authList');
		 			//res.render('admin/authlist',{});
		 				//res.render('admin/authList',{rs:rs[0]});
		 					})
		 	});

		 	}else{
		res.send('<script>alert("非法操作");location.href='/'</script>');
		}
		});

		router.post('/applyRefuse', function(req, res, next) {

			loginbean=req.session.loginbean;
		 	res.locals.loginbean=loginbean;
		 if(loginbean.role==0){
		 	id=req.body.id;
		 	message=req.body.message;
		/*sql='update users set role=1,msgnum=msgnum+1  where id=?';
		 	
		 	sequelize.query(sql,{replacements:[parseInt(id)]}).then(function(rs){//sequelize执行sql语句 ，id替换？
		 		sqlmsg='insert into msgs set sendid=?,toid=?,message=?';
		 		sequelize.query(sqlmsg,{replacements:[loginbean.id,id,message]}).then(function(rs){
		 			res.redirect('./authList');
		 		})
		 	});*/
		 	//------------启动事物----------------------------------
       sequelize.transaction().then(function (t) {
            //------修改User表中的role为2------
            return Users.update({role:1,msgnum:sequelize.literal('msgnum+1')},{where:{'id':id}},{transaction:t}).then(function(rs){
            	msg={};
            	msg.sendid=loginbean.id;
            	msg.toid=id;
            	msg.message=message;
            return Msg.create(msg,{transaction:t}).then(function(rs){//插入语句
            	res.redirect('./authList');
            });
          }).then(t.commit.bind(t)).catch(function(err){
            t.rollback.bind(t);
            console.log(err);
            res.send(err);
        })
      })
      //-----------------结束事物---------------------------------------
		 	}else{
		res.send('<script>alert("非法操作");location.href='/'</script>');
		 }
		});

		
module.exports = router;
