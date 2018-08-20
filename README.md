# IomsSimu
# 一. 概述
  本项目模拟了平安城市运维管理软件软件架构中的部分组件。
  
  平安城市运维管理软件软件架构详见[《平安城市运维管理软件架构》](http://blog.51cto.com/solarboy/2161795)一文的描述，软件架构如下图所示。
![](http://i2.51cto.com/images/blog/201808/20/2c9a020cd3127e3597f5a7ad2f412aef.jpg?x-oss-process=image/watermark,size_16,text_QDUxQ1RP5Y2a5a6i,color_FFFFFF,t_100,g_se,x_10,y_10,shadow_90,type_ZmFuZ3poZW5naGVpdGk=)
# 二. 部件描述
  此DEMO中，分别模拟了一个运维管理系统、一个交通管控平台中的报表服务和一个针对该报表服务的Microgateway。
## iomsSimulator
  模拟运维管理系统使用Node.js和Express框架编写，该运维管理模块的运行方式：
```
	$ nodejs app.js
```
## reportMicrogateway
  报表服务的Microgateway使用Node.js和Express框架编写，使用“http-proxy-middleware”中间件定义了一个HTTP路由模板，处理来自运维管理系统的操作请求。路由模板的配置文件由gateway.json文件定义，内容示例如下：
```
{
  "gatewayList": [
    {
      "path": "/chart1",
      "method": "get",
      "proxy": {
        "target": "http://127.0.0.1:8082",
        "pathRewrite": {
          "^/reports/chart1": "/loadChart1"
        }
      }
    }
  ]
}
```
  报表服务的Microgateway的运行方式：
```
	$ nodejs  bin/www
```

## Microservice-discovery-service1
  模拟交通管控平台中的报表服务使用spring-boot框架编写，提供了一个Restful接口提供简单的报表数据（数据格式为JSON格式），使用maven编译。
	
# 三. 备注
  本项目未考虑系统安全部分的编码。
	
