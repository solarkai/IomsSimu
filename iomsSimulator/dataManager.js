//var PAGE_COUNT = 10; //分页的记录数
var fs = require("fs")
var path = require("path")

var dataMgr = function(){
	/*this.PAGECOUNT = PAGE_COUNT;
	this.redisContext = require('./redisAccess'); 
	this.onvif = require('./onvifWsManager');*/
}

var platinfofile = path.join(__dirname,'platinfo.json');

//初始化数据
dataMgr.prototype.initData = function()
{
	
}

//保存平台信息
dataMgr.prototype.savePlatInfo = function(pi)
{
	fs.writeFile(platinfofile,JSON.stringify(pi),function(err) 
	  {
         if (err) {
           return console.error(err);
          }
         console.log("wirte file platinfo.json succeed!");     
      }
     );
}

//载入平台信息
dataMgr.prototype.loadPlatInfo = function(res)
{
	console.log("current datafile is:",platinfofile);
	fs.stat(platinfofile,function(err){
	      if(err){//文件不存在
			 console.log(err);
			 res.write(JSON.stringify({
			                         PlatList:{},
			                         ServiceList:{}
				                    })
					   );
			return res.end();
									
		  }else{
			 var data = fs.readFileSync(platinfofile); 
			 console.log("read data from platinfo.json.");
			 res.write(data.toString());
			 return res.end();
		  }	
	 }
	);
}

module.exports = dataMgr;