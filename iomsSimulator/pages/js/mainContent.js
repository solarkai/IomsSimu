//全局变量定义
//var wsuri = 'ws://'+document.location.host+':80';
var wsuri = '/stoc/browser/';
var wsocket;
var errorOccured = false;
var sessionId; // 登录该页面的sessionId
var sessionData; // 从服务器返回的sessionData
var platList;  //存放软件平台的列表，对象属性为软件平台名称
var serviceList; //存放软件服务的列表，对象属性为软件平台名称


/* 页面元素定义 */
var imgExit; // 用户退出按钮

function trace(text) {
    console.log((performance.now() / 1000).toFixed(3) + ": " + text);
}

function ajaxError(xhr, state) {
    alert("ajax invoke error:" + state);
    closeWindow();
}

/* 页面初始化函数 */
function init() {

    // 初始有效性检验
    checkSession(); // 从服务端校验

    // 获取页面元素变量
    imgExit = document.getElementById("exit");

    // 增加元素的事件
    $("#exit").click(redirectLogin);
    $('#return2map').click(return2map);
    $("#syncServer").click(syncData2Server);
    $("#serviceManagement").click(serviceManagement);
    $(":button[name='btnPlatSubmit']").click(onPlatSubmit); //平台信息提交
    $(":button[name='btnPlatDel']").click(onPlatDelete); //平台信息删除
    $(":button[name='btnPlatClear']").click(onPlatClear); //平台信息清空
    $(":button[name='btnServiceSubmit']").click(onServiceSubmit); //服务信息提交
    $(":button[name='btnServiceDel']").click(onServiceDelete); //服务信息删除
    $(":button[name='btnServiceClear']").click(onServiceClear); //服务信息清空

    //$("#platSelect").change(onSelectPlat);
    $("#platSelect").click(onSelectPlat);
    $("#serviceplatSelect").change(onSelectServicePlat);
    //$("#serviceSelect").change(onSelectService);
    $("#serviceSelect").click(onSelectService);

    //初始化显示化状态
    $('#svrContent').hide();
    $('#magContent').hide();

    //初始化数据
    loadPlatinfoFromSvr();
    initmap();
}


//从服务器获取平台数据
function loadPlatinfoFromSvr() {

    $.ajax({
        type: "POST",
        url: "/loadPlatInfo",
        contentType:"application/json;charset=utf-8",
        headers: {
            Accept: "application/json;charset=utf-8"
        },
        dataType: "json",
        success: loadPlatInfoResult,
        error: ajaxError
    });
}

//platSelect中选择项改变事件
function onSelectPlat() {
    var curritem = this.value;
    if (platList[curritem]) {
        $(":text[name='platName']").val(curritem);
        $(":text[name='platPos']").val(platList[curritem].platpos);
        $(":text[name='longitude']").val(platList[curritem].longitude);
        $(":text[name='latitude']").val(platList[curritem].latitude);
    }
}

//serviceplatSelect中选择改变事件
function onSelectServicePlat() {
    var currPlat = this.value;
    var platservice = serviceList[currPlat];
    if (null == platservice) { //该平台不存在了，清空下面的服务列表
        trace("onSelectServicePlat not find " + currPlat);
        $("#serviceSelect").empty();
        return;
    }
    $("#serviceSelect").empty();
    if (Object.getOwnPropertyNames(platservice).length > 0) { //有多于一个属性，取第一个属性
        var filltext = false;
        for (var key in platservice) {
            $("#serviceSelect").append("<option value=\"" + key + "\">" + key + "</option>");
            var service = platservice[key];
            if ((null != service) && (!filltext)) {
                $(":text[name='serviceName']").val(key);
                $(":text[name='serviceURL']").val(service.serviceURL);
                $(":text[name='accessToken']").val(service.accessToken);
                $("#serviceSelect").val(key);
                filltext = true;
            }
        }
    }
}

//serviceSelect中选择改变事件
function onSelectService() {
    var currPlat = $("#serviceplatSelect").val();
    var currService = this.value;
    var platservice = serviceList[currPlat];
    if (null == platservice) {
        trace("error, onSelectService() not find " + currPlat);
        return;
    }
    var service = platservice[currService]
    if (service) {
        $(":text[name='serviceName']").val(currService);
        $(":text[name='serviceURL']").val(service.serviceURL);
        $(":text[name='accessToken']").val(service.accessToken);
    }

}

//清空服务信息
function onServiceClear() {
    $(":text[name='serviceName']").val("");
    $(":text[name='serviceURL']").val("");
    $(":text[name='accessToken']").val("");
}

//清空平台信息
function onPlatClear() {
    $(":text[name='platName']").val("");
    $(":text[name='platPos']").val("");
    $(":text[name='longitude']").val("");
    $(":text[name='latitude']").val("");
}


//提交平台信息
function onPlatSubmit() {
    //获取输入项
    var pname = $(":text[name='platName']").val().trim();
    var ppos = $(":text[name='platPos']").val().trim();
    var longitude = $(":text[name='longitude']").val().trim();
    var latitude = $(":text[name='latitude']").val().trim();
    //输入有效性检验
    if (pname != "" && ppos != "") {
        if ((longitude != "" && isNaN(longitude)) || (latitude != "" && isNaN(latitude))) {
            alert("提交失败：经纬度应为数字！");
            return;
        } else {
            longitude = (longitude != "") ? Number(longitude) : null;
            latitude = (latitude != "") ? Number(latitude) : null;
        }
        //alert(pname+ppos+longitude+latitude);
    } else {
        alert("提交失败：必填字段不可为空！");
        return;
    }
    //修改相关控件状态
    if (platList[pname] == null)//新建一个软件平台
    {
        $("#platSelect").append("<option value=\"" + pname + "\">" + pname + "</option>");
        $("#platSelect").val(pname); //设为当前值

        $("#serviceplatSelect").append("<option value=\"" + pname + "\">" + pname + "</option>");

        $("#svrSideBar").append("<h3 value='" + pname + "'>" + pname + "</h3>");
        $("#svrSideBar").append("<ul value='" + pname + "'></ul>");
        $("#svrSideBar").accordion("refresh");

        serviceList[pname] = {}; //初始化平台服务对象
    }
    //将修改存入全局变量platList
    platList[pname] = {
        platpos: ppos,
        longitude: longitude,
        latitude: latitude
    }
    //数据提交到服务器
    alert(pname + "提交成功！");
}

//提交服务信息
function onServiceSubmit() {
    //获取输入项
    var platName = $("#serviceplatSelect").val();
    var sname = $(":text[name='serviceName']").val().trim();
    var url = $(":text[name='serviceURL']").val().trim();
    var token = $(":text[name='accessToken']").val().trim();
    //输入有效性检验
    if (!platName) {
        alert("提交失败: 请先选择软件平台！");
        return;
    }
    if (sname == "" || url == "" || token == "") {
        alert("提交失败：必填字段不可为空！");
        return;
    }
    //数据提交到服务器,在ajax回应成功后修改状态，就是下面的代码

    //从全局变量中获取平台服务对象，修改相关控件状态
    serviceplat = serviceList[platName];
    if (serviceplat[sname] == null) {
        $("#serviceSelect").append("<option value=\"" + sname + "\">" + sname + "</option>");
        $("#serviceSelect").val(sname); //设为当前值

        $("ul[value='" + platName + "']").append("<li style='cursor:pointer' onClick='onServiceClick(this)' title='" + url +
            "' value='" + sname + "'><a href='#'>" + sname + "</li>");
    } else {
        $("li[value='" + sname + "']").attr("title", url);
    }
    $("#svrSideBar").accordion("refresh");

    //将修改存入全局变量platList
    serviceplat[sname] = {
        serviceName: sname,
        serviceURL: url,
        accessToken: token
    }

    alert(sname + "提交成功！");
}

//删除平台信息
function onPlatDelete() {
    var currVal = $("#platSelect").val();
    if (null == currVal) {
        alert("请先选择一个软件平台！");
        return;
    }

    delete platList[currVal]; //删除平台
    delete serviceList[currVal]; //删除对应服务

    //platSelect与serviceplatSelect下拉框删除
    $("#platSelect " + "option[value=\"" + currVal + "\"]").remove();
    //$("#platSelect").change();
    $("#serviceplatSelect " + "option[value=\"" + currVal + "\"]").remove();
    $("#serviceplatSelect").change();

    //sidebar删除
    $("h3[value='" + currVal + "']").remove();
    $("ul[value='" + currVal + "']").remove();
    $("#svrSideBar").accordion("refresh");

    alert(currVal + "已被删除！");
}

//删除服务信息
function onServiceDelete() {
    var currPlat = $("#serviceplatSelect").val();
    var currService = $("#serviceSelect").val();
    if (null == currService) {
        alert("请先选择一个软件服务！");
        return;
    }

    var platservice = serviceList[currPlat];
    delete platservice[currService]; //删除对应服务

    //serviceSelect下拉列表删除
    $("#serviceSelect " + "option[value=\"" + currService + "\"]").remove();
    //$("#serviceSelect ").change();

    //sidebar删除
    $("ul[value='" + currPlat + "']" + " li[value='" + currService + "']").remove();
    $("#svrSideBar").accordion("refresh");
}

//点击sidebar中的服务
function onServiceClick(ele) {
    var serviceUrl = ele.getAttribute("title");
    $('#mapContent').hide();
    $('#magContent').hide();
    $('#svrContent').show();
    $('#svrContent').attr("src", serviceUrl);

}

/* 窗口关闭事件 */
function closeWindow() {
    trace('close window!');
    var userAgent = navigator.userAgent;

    if (userAgent.indexOf("Firefox") != -1 || userAgent.indexOf("Chrome") != -1) {
        window.location.href = "about:blank";
        document.title = "about:blank";
    } else {
        window.opener = null;
        window.open('', '_self');
        window.close();
    }
}

//主容器中显示地图
function return2map() {
    $('#svrContent').hide();
    $('#magContent').hide();
    $('#mapContent').show();
}

//同步数据到服务器
function syncData2Server() {

    trace("sync PlatInfo from platList;");
    $.ajax({
        type: "POST",
        url: "/syncPlatInfo",
        contentType:"application/json;charset=utf-8",
        headers: {
            //Accept: "application/json;charset=utf-8",
            //contentType: "application/json;charset=utf-8"
            //Content-Type: "text/plain;charset=utf-8"
        },
        data: JSON.stringify(
            {
                PlatList: platList,
                ServiceList: serviceList
            }),
        //dataType: "json",
        success: syncPlatInfoResult,
        error: ajaxError
    });
}

//进行注册服务的管理
function serviceManagement() {
    $('#mapContent').hide();
    $('#svrContent').hide();
    $('#magContent').show();
    $('#tabs').tabs();
}

/* 重定向到登录窗口 */
function redirectLogin() {
    window.location = '../';
}

/* 修改EXIT按钮的提示信息 */
function updatePageStatus(info) {
    textnodeId = document.createTextNode(info);
    imgExit.parentNode.insertBefore(textnodeId, imgExit);
}

/* 请求页面失败 */
function validPageFail() {
    alert("用户尚未登录，请先登录！");
    redirectLogin();
    // closeWindow();
}

/* 检查此页面携带的sessionId是否合法 */
function checkSession() {

    var result = false;
    var query = document.location.search;

    // if (query) {
    sessionId = query.substring(1); // 获取URL中问号之后的字符串
    trace("get sessionId from url:" + sessionId);
    $.ajax({
        type: "POST",
        url: "/checkSession",
        contentType:"application/json;charset=utf-8",
        data: JSON.stringify({
            sId: sessionId
        }),
        dataType: "json",
        success: checkSessionResult,
        error: ajaxError
    });
    /*
     * } else { validPageFail(); }
     */
}

// 设置cookie
function setCookie(name, value) {
    var Days = 30;
    var exp = new Date();
    exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
    document.cookie = name + "=" + escape(value) + ";expires="
        + exp.toGMTString();
}

// 读取cookie
function getCookie(name) {
    var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
    if (arr = document.cookie.match(reg))
        return unescape(arr[2]);
    else
        return null;
}

/* 根据当前cookie的状态判断是否成功 */
function checkCookie() {

    var user = getCookie("loginname");
    if (null != user) {
        checkSessionResult({
            username: user
        });
    } else {
        validPageFail();
    }
}

// ************************************************命令响应函数************************************
/* checkSession操作的response处理 */
function checkSessionResult(data, state) {
    if ((data) && (data.username)) {
        updatePageStatus("登录用户:" + data.username + " ");
    } else {
        validPageFail();
    }
}

/*loadPlatInfoResult 操作的response处理*/
function loadPlatInfoResult(data, state) {
    platList = data.PlatList;
    serviceList = data.ServiceList;

    //将从服务器获取的数据载入到控件中
    for (var pname in platList) { //初始化控件
        $("#platSelect").append("<option  value=\"" + pname + "\">" + pname + "</option>");
        $("#serviceplatSelect").append("<option value=\"" + pname + "\">" + pname + "</option>");

        $("#svrSideBar").append("<h3 value='" + pname + "'>" + pname + "</h3>");
        $("#svrSideBar").append("<ul value='" + pname + "'></ul>");
        for (var sname in serviceList[pname]) {
            if (serviceList[pname][sname]) {
                $("ul[value='" + pname + "']").append("<li style='cursor:pointer' onClick='onServiceClick(this)' title='" +
                    serviceList[pname][sname].serviceURL + "' value='" + sname + "'><a href='#'>" + sname + "</li>");
            }
        }
        $("#serviceplatSelect").change();
    }

    //渲染mgmTabs和svrSideBar
    $('#mgmTabs').tabs({
        classes: {'ui-tabs': "highlight"},
        heightStyle: "fill"
    });

    $("#svrSideBar").accordion({
        navigation: true,
        event: 'mouseover',
        fillSpace: true,
    });

}

/* syncPlatInfo操作的response处理 */
function syncPlatInfoResult(data, state) {
    trace("syncPlatInfo succeed!");
}

window.addEventListener('load', init, false);
window.addEventListener('unload', closeWindow, false);
// window.onunload = closeWindow;
