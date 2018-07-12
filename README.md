# IomsSimu
    本项目为一个系统DEMO，模拟智能运维系统与所管理的软件系统的后端服务，前端服务器交互。
    iomsSimulator一个模拟智能运维系统，提供页面进行软件平台与软件服务的管理。可对注册的软件服务进行调用（可调用软件服务的页面）。
    reportFrontend是一个模拟报表服务的前端服务器，提供报表展示页面及与后端报表数据服务的接口。
    Microservice-discovery-service1是一个模拟报表数据服务，提供给reportFrontend所展示报表的数据。
    iomsSimulator和reportFrontend使用nodejs和express框架编写，Microservice-discovery-service1使用spring-boot框架编写。
    reportFrontend和Microservice-discovery-service1模拟了一个前后端分离的简单数据报表服务系统。
