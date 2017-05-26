	var express= require('express');
	var router = express.Router();

	var Users = require('../models/userModels');
/* GET users listing. */
	router.get('/', function(req, res, next) {
  		res.send('respond with a resource');
			});
		/*router.post('/zhuce', function(req, res, next) {
  		Users.create(req.body).then(function(rs){
		rs.redirect(307,'./login');
			console.log('插入成功');
			console.log(rs);
			res.send('注册成功');
		}).catch (function(err){
		console.log(err);
	if(err.msg[0].path=='emailunique'){
		res.send('email重复');
	}else if(err.msg[0].path=='nicheng'){
		res.send('昵称重复');
	}else{
		res.send('错误');
	}
	})
	});*/
	router.post('/zhuce', function(req, res, next) {
	Users.create(req.body).then(function(rs){
		res.redirect(307,'./login');
	}).catch(function(err){
		// console.log('失败');
		// console.log(err);
		if(err.errors[0].path=='emailuniq')
		{
			res.send('email重复');
		}else if(err.errors[0].path=='nichenguniq'){
			res.send('昵称重复');
		}else{
			res.send('数据库错误,稍后再试');
		}
		
	})
});
	router.post('/login', function(req, res, next) {

 	 Users.findOne({where:{nicheng:req.body.nicheng,pwd:req.body.pwd}}).then(function(rs){
  		
  		if(rs!=null){
  			//rs.redirect('/');
  			loginbean=new Object();
  			loginbean.id=rs.id;
  			loginbean.nicheng=rs.nicheng;
  			loginbean.msgnum=rs.msgnum;
  			loginbean.role=rs.role;
  			req.session['loginbean']=loginbean;
  			res.redirect('/');
  		}else{
	rs.send("<script>alert('密码错误');location.href='/'</script>");

  		}

	router.get('/logout', function(req, res, next) {
 		delete req.session.loginbean;
 	res.redirect('/');
		});

 		// consele.log(rs);
  		//res.send(rs);
 		 });


		});

module.exports = router;
