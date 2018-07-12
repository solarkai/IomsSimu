var express = require('express');
var router = express.Router();
var proxy = require('http-proxy-middleware');
var mysql = require('mysql');

var dbpool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'zkdb'
});

router.use(function timelog(req,res,next){
    console.log("receive report request time is:",Date.now());
    next();
});

router.get('/chart1', proxy({
    target: 'http://127.0.0.1:8082',
    changeOrigin: true,
    pathRewrite: {
        '^/reports/chart1': '/loadChart1'
    }
}));

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

/*router.get('/chart1', function(req, res, next) {
  res.send(JSON.stringify(getChart1Data()));
});

//返回chart1的数据对象
function getChart1Data(){
    var title = {
        text: '日过车平均数量'
    };
    var subtitle = {
        text: 'XX省: XX市'
    };
    var xAxis = {
        categories: ['一月', '二月', '三月', '四月', '五月', '六月'
            ,'七月', '八月', '九月', '十月', '十一月', '十二月']
    };
    var yAxis = {
        title: {
            text: '过车数量(单位:千)'
        },
        plotLines: [{
            value: 0,
            width: 1,
            color: '#808080'
        }]
    };

    var tooltip = {
        valueSuffix: '千'
    }

    var legend = {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle',
        borderWidth: 0
    };

    var series =  [
        {
            name: '卡口1',
            data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2,
                26.5, 23.3, 18.3, 13.9, 9.6]
        },
        {
            name: '卡口2',
            data: [-0.2, 0.8, 5.7, 11.3, 17.0, 22.0, 24.8,
                24.1, 20.1, 14.1, 8.6, 2.5]
        },
        {
            name: '卡口3',
            data: [-0.9, 0.6, 3.5, 8.4, 13.5, 17.0, 18.6,
                17.9, 14.3, 9.0, 3.9, 1.0]
        },
        {
            name: '卡口4',
            data: [3.9, 4.2, 5.7, 8.5, 11.9, 15.2, 17.0,
                16.6, 14.2, 10.3, 6.6, 4.8]
        }
    ];

    var json = {};

    json.title = title;
    json.subtitle = subtitle;
    json.xAxis = xAxis;
    json.yAxis = yAxis;
    json.tooltip = tooltip;
    json.legend = legend;
    json.series = series;

    return json;
}*/

module.exports = router;
