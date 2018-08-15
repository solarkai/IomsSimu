var express = require('express');
var router = express.Router();
var proxy = require('http-proxy-middleware');
var mysql = require('mysql');
var fs = require("fs");

/*加入切面函数，记录每次调用的时间*/
router.use(function timelog(req,res,next){
    console.log("receive report request time is:",Date.now());
    next();
});

var gateway = readGatawayFromFile("gateway.json");
/*router.get('/chart1', proxy({
    target: 'http://127.0.0.1:8082',
    changeOrigin: true,
    pathRewrite: {
        '^/reports/chart1': '/loadChart1'
    }
}));*/

/*从文件中读取proxy数据*/
function readGatawayFromFile(filename) {
    fs.stat(filename,function(err,stats){
            if(err){//文件不存在
                console.log(err);
                return null;

            }else{
                var data = fs.readFileSync(filename);
                console.log("read data from "+filename+".");
                var jo = JSON.parse(data.toString());
                if(jo){
                    fillRouterProxy(jo);
                }
                return jo;
            }
        }
    );
}

/*将配置文件中的路由代理信息加入到route中*/
function fillRouterProxy(jsonObj) {
    if(jsonObj){
        for(i in jsonObj.gatewayList){
            var proxyObj = jsonObj.gatewayList[i];
            if(proxyObj.method) {
                router[proxyObj.method](proxyObj.path, proxy(proxyObj.proxy));
            }
        }
    }
}

var dbpool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'zkdb'
});

router.get('/querymysql/:id', queryMysqlData, handleQueryData);

//查询mysql表中的数据
function queryMysqlData(req, res, next) {
    if ("id" in req.params) {
        dbpool.query(" select * from articles where id=?" ,[req.params.id], function (err, rows, fields) {
            if (err) {
                res.send(err.stack);
            } else {
                if (rows && rows.length > 0) {
                    console.log('The queried rows is: ', rows.length);
                    res.articles = rows;
                    next();
                } else {
                    res.send("no query results!");
                }
            }
        });
    } else {
        res.send("invalid query params!");
    }
}

//处理查询mysql后得到的数据
function handleQueryData(req, res) {
    if ("articles" in res) {
        res.send("id:" + req.params.id + ";title:" + res.articles[0].title);
    }else{
        res.send("no query data handled!");
    }
}

module.exports = router;
