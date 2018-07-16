var express = require('express');
var path = require("path");
var qs = require('querystring');
var fs = require("fs");
var authen = require("./authen");
var session = require("express-session");
var dataMgr = require("./dataManager");

var loginauthen = new authen(); //用户登录鉴权对象
var dataManager = new dataMgr();
var app = express();
var port = 80;

var serverDir = path.dirname(__filename);
var clientDir = path.join(serverDir, "pages/");
var indexpath = path.join(clientDir, "/index.html");

function logToConsole(message) {
    console.log("[" + new Date().toLocaleTimeString() + "] " + message);
}

app.use(session({
    secret: 'zhang kai',
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false}
}));

//路由设置

app.get('/mainContent.html', handleCheckSession);
app.use(express.static(path.join(__dirname, 'pages')));

app.use(logAjaxReqname);
app.post('/login', handleLoginReq);
app.post('/logout',handleLogoutReq);
app.post('/getLoginName', handlegetLoginName);
app.post('/syncPlatInfo', handlesyncPlatInfoReq);
app.post('/loadPlatInfo', handleloadPlatInfoReq);


app.listen(port, function () {
    logToConsole('The server is listening on port ' + port);
});
/*-------------------------------函数定义----------------------------*/

//打印post方法名称
function logAjaxReqname(request, response, next) {
    if (request.method == 'POST') {
        logToConsole("------coming AJAX url:" + request.url);
    }
    next();
}

/*处理 login请求*/
function handleLoginReq(request, response) {
    var res = response;
    var la = loginauthen;
    var cp = null;
    var commandBody = ""; //从POST 请求中获取，为字符串
    request.on("data", function (data) {
        commandBody += data;
    });
    request.on("end", function () {
        cp = qs.parse(commandBody);
        var result = false;
        if (('username' in cp) && ('password' in cp)) {
            la.username = cp.username;
            la.password = cp.password;
            result = la.loginAuthen();
        }

        if (result) {
            request.session.signin = true;
            request.session.username = cp.username;
            res.redirect('/mainContent.html');
        } else {
            res.redirect('/?error');
        }
    });
}

/*处理 logout请求*/
function handleLogoutReq(request, response) {
    if(request.session.signin){
        request.session.destroy();
    }
    response.redirect('/');
}

/*处理checkSession请求*/
function checkSession(request, response) {
    if (request.session) {
        if (request.session.signin) {
            return true;
        } else {
            return false;
        }
    } else {
        logToConsole("no session:" + request.url);
        return true;
    }
}

function handleCheckSession(request, response, next) {
    if (checkSession(request, response)) {
        logToConsole("succeed to check session:" + request.url);
        next();
    } else {
        logToConsole("fail to check session:" + request.url);
        response.redirect('/');
    }
}

//处理getLoginName请求
function handlegetLoginName(request, response, next) {
    if (request.session.signin) {
        var ret = {
            username: request.session.username
        }
        response.send(JSON.stringify(ret));
    } else {
        reponse.end();
    }
}

/*处理syncPlatInfo请求*/
function handlesyncPlatInfoReq(request, response) {
    var res = response;
    var cp = null;
    var commandBody = ""; //从POST 请求中获取，为字符串
    request.on("data", function (data) {
        commandBody += data;
    });
    request.on("end", function () {
        cp = JSON.parse(commandBody);
        res.writeHead(200, {"Content-Type": "application/json;charset=utf-8"});
        logToConsole("get syncPlat:" + JSON.stringify(cp));
        dataManager.savePlatInfo(cp);
        res.write(JSON.stringify({}));  //发送一个空对象
        res.end();
    })
}

/*处理loadPlatInfo请求*/
function handleloadPlatInfoReq(request, response) {
    var res = response;
    var commandBody = ""; //从POST 请求中获取，为字符串
    request.on("data", function (data) {
        commandBody += data;
    });
    request.on("end", function () {
        res.writeHead(200, {"Content-Type": "application/json;charset=utf-8"});
        logToConsole("load syncPlat!");
        var platInfoStr = dataManager.loadPlatInfo(res);
    });
}


