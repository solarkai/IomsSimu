//例子1
var fs = require("fs");
fs.readFile('platinfo.json',
    function(err, data) {
        if (err) return console.error(err);
        console.log(data.toString());
        console.log("end");
        console.log("***********************");
    });
//例子2
var events = require("events");
var eventEmitter = new events.EventEmitter();

var connectHandler = function connected() {
    var ct = Date.now();
    console.log("connnect successfully !"+ct);
    setTimeout(function () {
        eventEmitter.emit("after_connect",ct);
    },1000);
}
eventEmitter.on("connected", connectHandler);
eventEmitter.on('after_connect',
    function(ct) {
        console.log("after connect"+ct);
    });
eventEmitter.emit("connected");
eventEmitter.emit("connected");

console.log("event emitter end");
//var bytearray = new Array(6);
//var bytearray = [0xe5,0xbc,0xa0,0xe5,0x87,0xaf];
const buf = Buffer.alloc(10);
buf.write("张凯");//from(bytearray);//('张凯', 'utf-8');
console.log("hexstr:"+buf.toString("hex")+" buf string:"+buf);

var readstream = fs.createReadStream('platinfo.json');
//readstream.setEncoding('utf8');

readstream.on('data',function(chunk){
    console.log('get chunk:'+chunk.length);
});

var util = require('util');
//console.log(util.inspect(readstream));

function  base() {
    this.name = "base";
    this.sayhello = function(){
        console.log('hello '+this.name);
    }
}

base.prototype.test = function () {
    console.log('test '+this.name);
}

var baseins = new base();
baseins.test();
function sub(){};
util.inherits(sub,base);
//sub.prototype.test = base.test;
var subins = new sub();
subins.test();

var dns = require('dns');

dns.lookup('www.baidu.com', function onLookup(err, address, family) {
    console.log('ip 地址:', address);
    dns.reverse(address, function (err, hostnames) {
        if (err) {
            console.log(err.stack);
        }

        console.log('反向解析 ' + address + ': ' + JSON.stringify(hostnames));
    });
});

/*测试函数对象的函数属性*/
function test1(arg1){
    console.log("+++++:"+arguments.toString());
    test1.setName1(arg1);
    test1.route();
}

test1.name1 = "zhangkai";

test1.route = function(){
    console.log("------"+this.name1);
}

test1.setName1 = function(arg3){
    this.name1 = arg3;
}

test1("zy","zk");


