var express = require('express');
var router = express.Router();
var formidable = require('formidable');
var PrivateInfoModel = require('../models/PrivateInfoModels');
var Msg = require('../models/MsgModel');
var Users= require('../models/userModels');
var sequelize =require('../models/ModelHeader')();
var ShopModel= require('../models/ShopModel');
var GoodsModel= require('../models/GoodsModel');
/* GET home page. */
router.get('/', function(req, res, next) {
  
   loginbean=req.session.loginbean;
    res.locals.loginbean=loginbean;
   if(loginbean.role>0){
    cpage=1;
    if (req.query.cpage) {
        cpage=req.query.cpage;
    }  
    pageItem=3;//每页显示的条数
    startPoint=(cpage-1)*pageItem;
     sqlcount='select  count(*)  as count  from msgs where toid=?';
    rowCount = 0;
    sumPage = 0;
sequelize.query(sqlcount,{replacements: [loginbean.id],type:sequelize.QueryTypes.QUERY}).then(function(rs){
    resjson=JSON.parse(JSON.stringify(rs[0]));//rowdatapacke转  json
    
    rowCount=resjson[0].count;
    
    sumPage=Math.ceil(rowCount/pageItem);//向上取整  Math.floor  向下取整   Math.round
    })
sql='select m.*,u.nicheng from msgs m,users u where m.toid=?  and m.sendid=u.id  limit ?,?';

    sequelize.query(sql,{replacements: [loginbean.id,startPoint,pageItem],type:sequelize.QueryTypes.QUERY}).then(function(rs){
    res.locals.loginbean.msgnum=0;
   //  //-------消息-----

   //Msg.findAll({where:{toid:loginbean.id}}).then(function(rs){
  res.render('home/home', {rs:rs[0],cpage:cpage,rowCount:rowCount,sumPage:sumPage});
})
  }else{
   res.send('<script> alert("非法操作");location.href='/'</script>');

}
});

router.post('/privateAuth', function(req, res, next) {
  var form = new formidable.IncomingForm();   //创建上传表单 
    form.encoding = 'utf-8';        //设置编辑 
    form.uploadDir = './public/images/privateauth/';     //设置上传目录 文件会自动保存在这里 
    form.keepExtensions = true;     //保留后缀 
    form.maxFieldsSize = 5 * 1024 * 1024 ;   //文件大小5M 
    form.parse(req, function (err, fields, files) { 
        if(err){ 
            console.log(err); 
            return;
        } 
       //res.send('rname='+fields.realname);
       //-----------入库------------
       loginbean = req.session.loginbean;
       fields.id = loginbean.id;
       fields.idphoto=files.idphoto.path.replace('public','');
       fields.userphoto=files.userphoto.path.replace('public','');
       fields.updtime=new Date();
       //------------启动事物----------------------------------
       sequelize.transaction().then(function (t) {
           return PrivateInfoModel.create(fields).then(function(rs){
            //------修改User表中的role为2------
            return Users.update({role:2},{where:{'id':loginbean.id}}).then(function(rs){
              //console.log(rs);
              loginbean.role=2;
              req.session.loginbean=loginbean;
              res.send('身份认证已提交,请耐心等待审核');
            });
          }).then(t.commit.bind(t)).catch(function(err){
            t.rollback.bind(t);
            console.log(err);
            if(err.errors[0].path=='PRIMARY'){
              res.send('你已经申请过');
            }else if(err.errors[0].path=='idcodeuniq')
            {
              res.send('身份证号已用过');
            }else if(err.errors[0].path=='prphoneuniq'){
              res.send('电话号码已用过');
            }else if(err.errors[0].path=='emailuniq'){
              res.send('此email已用过');
            }else{
              res.send('数据库错误,稍后再试');
            }
          })
          
        });
      //-----------------结束事物---------------------------------------
    })
})

  router.get('/pubShop', function(req, res, next) {

       sql='select * from  shoptypes ';
    sequelize.query(sql).then(function(rs){
       res.render('home/pubShop',{rs:rs[0]});
    });
    /*
      sql='select * from shopinfors where shopid=?';
      sequelize.query(sql,{replacements: [loginbean.id]}).then(function(rs){
       //console.log(rs);
      

      });*/
  });

    router.post('/pubshop', function(req, res, next) {
    var form = new formidable.IncomingForm();   //创建上传表单 
        form.encoding = 'utf-8';        //设置编辑 
        form.uploadDir = './public/images/shop/';     //设置上传目录 文件会自动保存在这里 
        form.keepExtensions = true;     //保留后缀 
        form.maxFieldsSize = 5 * 1024 * 1024 ;   //文件大小5M 
        form.parse(req, function (err, fields, files) { 
            if(err){ 
                console.log(err); 
                return;
            } 
       //res.send('rname='+fields.realname);
       //-----------入库------------
       loginbean = req.session.loginbean;
       fields.uid = loginbean.id;
       fields.photourl=files.photour1.path.replace('public','');
       //------------启动事物----------------------------------
       sequelize.transaction().then(function (t) {
           return ShopModel.create(fields).then(function(rs){
            //------修改User表中的role为2------
            return Users.update({role:4},{where:{'id':loginbean.id}}).then(function(rs){
              //console.log(rs);
              loginbean.role=4;
              req.session.loginbean=loginbean;
              res.redirect('./shopmanage');
              res.send('身份认证已提交,请耐心等待审核');
            });
          }).then(t.commit.bind(t)).catch(function(err){
            t.rollback.bind(t);
            console.log(err);
          })
          
        });
      //-----------------结束事物---------------------------------------
    })
})
    /*
      sql='select * from shopinfors where shopid=?';
      sequelize.query(sql,{replacements: [loginbean.id]}).then(function(rs){
       //console.log(rs);
      

      });*/
  
  router.post('/shopInfo', function(req, res, next) {
      loginbean=req.session.loginbean;
      res.locals.loginbean=loginbean;

     if(loginbean.role==3){

      shopname=req.body.shangNa;
      shopintro=req.body.detail;
      shopposi=req.body.place;
    sqlmsg='insert into shopinfors set shopid=?,shopname=?,shopintro=?,shopposi=?';
    sequelize.query(sqlmsg,{replacements:[loginbean.id,shopname,shopintro,shopposi]}).then(function(rs){
    console.log(rs);
        res.redirect('./pubShop');
        //res.render('admin/authList',{rs:rs[0]});
        })
     //res.send('成功');
      }else{
    res.send('<script>alert("非法操作");location.href='/'</script>');
    
    }
    });



     router.get('/shopmanage', function(req, res, next) {

    

           res.redirect('/home');
         })



      router.get('/managebusiness', function(req, res, next) {
        //首先判定权限
        //查询店铺位置
        //用店铺信息渲染地图界面
          sql='select * from  shoptypes ';
          sequelize.query(sql).then(function(rsm){
            sqlshop='select * from  shops ';
            console.log(rsm);
          sequelize.query(sqlshop).then(function(shoprs){
         loginbean=req.session.loginbean;
        res.locals.loginbean=loginbean;
        if(loginbean.role==4){

        sql='select * from shops where uid=?';
        sequelize.query(sql,{replacements:[loginbean.id]}).then(function(rs){
          //sqlgoods='select * from goods where  uid=?';

             return  GoodsModel.findAll({where:{uid:loginbean.id}}).then(function(goodsrs){
                res.render('home/businesspoint', {rsm:rsm[0],shoprs:shoprs[0],rs:rs[0],goodsrs:goodsrs});
             })
       });

      }else{
         res.send('<script>alert("你无权访问此页面");location.href="/";</script>');

      }
    });
    });

           });



          router.post('/updateshop', function(req, res, next) {
          var form = new formidable.IncomingForm();   //创建上传表单 
                  form.encoding = 'utf-8';        //设置编辑 
                  form.uploadDir = './public/images/shop/';     //设置上传目录 文件会自动保存在这里 
                  form.keepExtensions = true;     //保留后缀 
                  form.maxFieldsSize = 5 * 1024 * 1024 ;   //文件大小5M 
                  form.parse(req, function (err, fields, files) { 
                      if(err){ 
                          console.log(err); 
                          return;
                      } 
                 //res.send('rname='+fields.realname);
                 //-----------入库------------
                 loginbean = req.session.loginbean;
                 fields.uid = loginbean.id;
                 fields.photourl=files.photour1.path.replace('public','');
                 //------------启动事物----------------------------------
                     return ShopModel.update(fields,{where:{'uid':loginbean.id}}).then(function(rs){
                      res.redirect('/home/managebusiness');
      })
               })
                })

             router.post('/stopshop', function(req, res, next) {
                loginbean=req.session.loginbean;
                res.locals.loginbean=loginbean;
                
              console.log('----------------------------------------------------');
                sql='update shops set liveflag=1,opinion=? where uid=?';
                   console.log('----------------------------------------------------');
                sequelize.query(sql,{replacements:[req.body.stopdd,loginbean.id]}).then(function(rs){
                     console.log('----------------------------------------------------');
                
                     console.log('----------------------------------------------------');
                  res.redirect('/home/managebusiness');
                })
             });

        
        router.post('/pubgoods', function(req, res, next) {
            var form = new formidable.IncomingForm();   //创建上传表单 
            form.encoding = 'utf-8';        //设置编辑 
            form.uploadDir = './public/images/goods/';     //设置上传目录 文件会自动保存在这里 
            form.keepExtensions = true;     //保留后缀 
            form.maxFieldsSize = 5 * 1024 * 1024 ;   //文件大小5M 
            form.parse(req, function (err, fields, files) { 
                if(err){ 
                    console.log(err); 
                    return;
                } 
               //-----------入库------------
               loginbean = req.session.loginbean;
               fields.uid = loginbean.id;
               fields.goodsimg=files.goodsimg.path.replace('public','');
               console.log('----------------------');
               console.log(fields.editorValue);
               console.log('----------------------');
               fields.goodsintro=fields.editorValue;
               fields.createtime=new Date();
               //------------启动事物----------------------------------
               GoodsModel.create(fields).then(function(rs){
                  console.log(rs);
                  res.redirect('/home/managebusiness');
               }).catch(function(err){
                  console.log(err);
                  res.send('创建失败');
               })
               
              //-----------------结束事物---------------------------------------
            })
        })
        router.post('/updgoods', function(req, res, next) {
             var form = new formidable.IncomingForm();   //创建上传表单 
            form.encoding = 'utf-8';        //设置编辑 
            form.uploadDir = './public/images/goods/';     //设置上传目录 文件会自动保存在这里 
            form.keepExtensions = true;     //保留后缀 
            form.maxFieldsSize = 5 * 1024 * 1024 ;   //文件大小5M 
            form.parse(req, function (err, fields, files) { 
                if(err){ 
                    console.log(err); 
                    return;
                } 
               //-----------入库------------
               loginbean = req.session.loginbean;
               fields.uid = loginbean.id;
                if(files.goodsimg.name){
                    fields.goodsimg=files.goodsimg.path.replace('public','');
                 }else{
                    fields.goodsimg=fields.oldGoodsImg;
                   }
               console.log('----------------------');
               console.log(fields.editorValue);
               console.log('----------------------');
               fields.goodsintro=fields.editorValue;
               fields.createtime=new Date();


               //------------启动事物----------------------------------

             return  GoodsModel.update(fields,{where:{'id':req.query.id}}).then(function(rs){
                  console.log(rs);
                  res.redirect('/home/managebusiness');
               }).catch(function(err){
                  console.log(err);
                  res.send('修改失败');
               })
               
              //-----------------结束事物---------------------------------------
            })
        })

            router.get('/getgoodsinfo', function(req, res, next) {
            goodsid=req.query.id;

             GoodsModel.findOne({where:{id:goodsid}}).then(function(goodsrs){
               
             res.send(goodsrs);
             })
      });

             router.get('/buildnew', function(req, res, next) {
              lnglat=req.query.lnglat;
              console.log(lnglat);
              var arr=lnglat.split(',');
              console.log(arr[0]);
              console.log(arr[1]);
              loginbean=req.session.loginbean;
                res.locals.loginbean=loginbean;
                lng=arr[0];
                lat=arr[1];
            sql ='update shops set lng=?,lat=? where uid=?';
             sequelize.query(sql,{replacements:[lng,lat,loginbean.id]}).then(function(rs){

                res.redirect('/home/managebusiness');
             })

          })
module.exports = router;