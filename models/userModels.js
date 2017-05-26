var Sequelize = require('sequelize'); 
var sequelize= new Sequelize('huasheng','root','root',{
	host:'127.0.0.1',
		dialect:'mysql'
});
var Users =sequelize.define('users',{
	id: {type:Sequelize.BIGINT,primaryKey: true},
	email:Sequelize.STRING,
	pwd:Sequelize.STRING,
	nicheng:Sequelize.STRING,
	createtime:Sequelize.DATE,
	updtime:Sequelize.DATE,
	role:Sequelize.INTEGER,
	msgnum:Sequelize.INTEGER
},{
		timestamps: false,

});
module.exports= Users;