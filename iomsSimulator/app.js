var express = require('express');
var path = require("path");
var qs = require('querystring');
var proxy = require('http-proxy-middleware');
var authen = require("./authen");
var sessionMgr = require("./sessionManager");
var dataMgr = require("./dataManager");

var loginauthen = new authen(); //用户登录鉴权对象
var sessionManager = new sessionMgr();
var dataManager = new dataMgr();
var app = express();
var port = 80;

function logToConsole(message) {
    console.log("[" + new Date().toLocaleTimeString() + "] " + message);
}

function getHtmlPage(request, response) {
    var serverDir = path.dirname(__filename)
    var clientDir = path.join(serverDir, "pages/");
    var url = request.url.split("?", 1)[0];
    var filePath = path.join(clientDir, url);
    if (filePath.indexOf(clientDir) != 0 || filePath == clientDir)
        filePath = path.join(clientDir, "/login.html");
    response.sendFile(filePath);
}

//路由设置
app.get('*', getHtmlPage);
app.post('/login', handleLoginReq);
app.post('/checkSession', handlecheckSessionReq);
app.post('/syncPlatInfo', handlesyncPlatInfoReq);
app.post('/loadPlatInfo', handleloadPlatInfoReq);


app.listen(port, function () {
    logToConsole('The server is listening on port ' + port);
});
/*-------------------------------函数定义----------------------------*/

/*处理 login请求*/
function handleLoginReq(request, response) {
    logToConsole("coming AJAX url:" + request.url);
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
        //res.writeHead(200, { "Content-Type": "text/plain" });
        if (('username' in cp) && ('password' in cp)) {
            la.username = cp.username;
            la.password = cp.password;
            result = la.loginAuthen();
        }

        if (result) {
            var currdate = new Date();
            var sessionid = currdate.toLocaleTimeString() + ":" + currdate.getMilliseconds();
            res.writeHead(302, {
                'Location': '/mainContent.html?' + sessionid
                //add other headers here...
            });
            //登录成功将currdate.toLocaleTimeString()作为sessionId放入到session管理器中
            if (!sessionManager.addSession(sessionid, {
                    username: cp.username
                })) {
                logToConsole("sessionManager.addSession fail:" + sessionid);
            }
        } else {
            res.writeHead(302, {
                'Location': '/login.html?error'
                //add other headers here...
            });
        }
        res.end();
    });
}

/*处理checkSession请求*/
function handlecheckSessionReq(request,response) {
    logToConsole("coming AJAX url:" + request.url);
    var res = response;
    var cp = null;
    var commandBody = ""; //从POST 请求中获取，为字符串
    request.on("data", function (data) {
        commandBody += data;
    });
    request.on("end", function () {
        var data;
        cp = JSON.parse(commandBody);
        res.writeHead(200, {"Content-Type": "application/json;charset=utf-8"});
        if ((cp.sId) && (data = sessionManager.getSession(cp.sId))) {
            res.write(JSON.stringify(data));
        } else {
            res.write(JSON.stringify({}));  //发送一个空对象
            logToConsole("sessionManager.getSession fail:" + cp.sId);
        }
        res.end();
    });
}

/*处理syncPlatInfo请求*/
function handlesyncPlatInfoReq(request,response) {
    logToConsole("coming AJAX url:" + request.url);
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
function handleloadPlatInfoReq(request,response) {
    logToConsole("coming AJAX url:" + request.url);
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


