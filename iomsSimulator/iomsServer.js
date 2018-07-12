var fs = require("fs");
var http = require("http");
var path = require("path");
var qs = require('querystring')
var authen = require("./authen");
var sessionMgr = require("./sessionManager");
var dataMgr = require("./dataManager");

var loginauthen = new authen(); //用户登录鉴权对象
var sessionManager = new sessionMgr();
var dataManager = new dataMgr();

var port = process.env.PORT || 80;
if (process.argv.length == 3) {
    port = process.argv[2];
}

var serverDir = path.dirname(__filename);
var clientDir = path.join(serverDir, "pages/");

var contentTypeMap = {
    ".html": "text/html;charset=utf-8",
    ".js": "text/javascript",
    ".css": "text/css"
};

function logToConsole(message) {
    console.log("[" + new Date().toLocaleTimeString() + "] " + message);
}

var server = http.createServer(function (request, response) {
    var headers = {
        "Cache-Control": "no-cache, no-store",
        "Pragma": "no-cache",
        "Expires": "0"
    };

    /*post类型的请求都是AJAX命令，get类型的请求都是请求页面*/
    if (request.method == 'POST') {
        var parts = request.url.split("/");
        logToConsole("coming AJAX url:" + request.url);

        var command = null;
        var commandParams = null;
        var commandBody = ""; //从POST 请求中获取，为字符串
        if ((parts[1] != null) && (parts[1] != "")) { //获取URL中的命令并处理
            command = parts[1];
            request.on("data", function (data) {
                commandBody += data;
            });
            request.on("end", function () {
                switch (command) {
                    case 'login': //post,登录请求
                        commandParams = qs.parse(commandBody);
                        handleLoginReq(response, commandParams, loginauthen);
                        break;

                    case 'checkSession': //post,检查session是否合法
                        commandParams = JSON.parse(commandBody);
                        handlecheckSessionReq(response, commandParams);
                        break;

                    case 'syncPlatInfo': //post，前端向服务器同步平台信息请求
                        commandParams = JSON.parse(commandBody);
                        handlesyncPlatInfoReq(response, commandParams);
                        break;

                    case 'loadPlatInfo': //post，前端向服务器请求载入平台信息请求
                        handleloadPlatInfoReq(response);
                        break;

                    default:
                        logToConsole('unknown command:' + command);
                        response.writeHead(404);
                        response.end("404 Not found");
                        break;
                }
            });
        }
        return;
    }//endif post

    var url = request.url.split("?", 1)[0];
    var filePath = path.join(clientDir, url);
    if (filePath.indexOf(clientDir) != 0 || filePath == clientDir)
        filePath = path.join(clientDir, "/login.html");

    fs.stat(filePath, function (err, stats) {
        if (err || !stats.isFile()) {
            response.writeHead(404);
            response.end("404 Not found");
            return;
        }

        var contentType = contentTypeMap[path.extname(filePath)] || "text/plain";
        response.writeHead(200, {"Content-Type": contentType});

        var readStream = fs.createReadStream(filePath);
        readStream.on("error", function () {
            response.writeHead(500);
            response.end("500 Server error");
        });
        readStream.pipe(response);
    });
});

dataManager.initData();
logToConsole('The server is listening on port ' + port);
server.listen(port);


/*-------------------------------函数定义----------------------------*/

/*处理 login请求*/
function handleLoginReq(res, cp, la) {
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

}

/*处理checkSession请求*/
function handlecheckSessionReq(res, cp) {
    var data;

    res.writeHead(200, {"Content-Type": "application/json;charset=utf-8"});
    if ((cp.sId) && (data = sessionManager.getSession(cp.sId))) {
        res.write(JSON.stringify(data));
    } else {
        res.write(JSON.stringify({}));  //发送一个空对象
        logToConsole("sessionManager.getSession fail:" + cp.sId);
    }
    res.end();
}

/*处理syncPlatInfo请求*/
function handlesyncPlatInfoReq(res, cp) {
    res.writeHead(200, {"Content-Type": "application/json;charset=utf-8"});
    logToConsole("get syncPlat:" + JSON.stringify(cp));
    dataManager.savePlatInfo(cp);
    res.write(JSON.stringify({}));  //发送一个空对象
    res.end();
}

/*处理loadPlatInfo请求*/
function handleloadPlatInfoReq(res) {
    res.writeHead(200, {"Content-Type": "application/json;charset=utf-8"});
    logToConsole("load syncPlat!");
    var platInfoStr = dataManager.loadPlatInfo(res);
}






