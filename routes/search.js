var express = require('express');
var router = express.Router();
SphinxClient = require ("sphinxapi");
var sequelize =require('../models/ModelHeader')();

/* GET home page. */
router.get('/goods', function(req, res, next) {
  //res.locals.loginbean = req.session.loginbean;
  keywords = req.query.keywords;
  kwArr = keywords.split(' ');//用空格将 | 分隔开
  len = kwArr.length;//取长度
  keyword = ' ';
  for(i=0;i<len;i++){
    if(kwArr[i]!=''){
      keyword += kwArr[i]+'|';
    }
  }
   var cl = new SphinxClient();
   cl.SetServer('localhost', 9312);
   cl.SetMatchMode(SphinxClient.SPH_MATCH_ANY);   //或运算
   cl.Query(keyword,'goods',function(err, result) {
        if(err){
          console.log(err);
          console.log('-------有错-----------');
          res.send(err);
          return;
        }
        console.log(result);
       total = result.total;
       rsGoods=[];
       ii=0;
        for(var key in result['matches']){ //循环查出的id
         
          goodsid=result['matches'][key].id;
          sql='select * from goods,shops  where goods.shopid = shops.id and  goods.id=?'
       sequelize.query(sql,{replacements: [goodsid]}).then(function(rs){
          rsjson = JSON.parse(JSON.stringify(rs[0]));
          rsGoods.push(rsjson[0]);
          ii++;
          if(ii>=total){
          
            res.locals.loginbean = req.session.loginbean;

            res.render('home/zhanshi',{rsGoods:rsGoods,keywords:keywords});


            
          }
       });
    }

    
    });

  });

    



module.exports = router;

