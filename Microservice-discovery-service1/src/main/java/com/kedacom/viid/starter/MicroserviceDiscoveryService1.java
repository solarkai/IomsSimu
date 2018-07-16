package com.kedacom.viid.starter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.ServletInputStream;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.Date;
import java.text.SimpleDateFormat;

import org.json.JSONException;
import org.json.JSONObject;

import org.springframework.context.annotation.Bean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;


import java.util.List;

//@EnableDiscoveryClient
@SpringBootApplication
public class MicroserviceDiscoveryService1 {

	public static void main(String[] args) {
		SpringApplication.run(MicroserviceDiscoveryService1.class, args);
	}

	@RestController
	static class ServiceInstanceRestController {

		@Autowired
		private DiscoveryClient discoveryClient;
		
		/*@Bean
		JSONObject jsonobject()
		{
			return new JSONObject();
		}*/

		@RequestMapping(value = "/service-instances/{applicationName}", method = RequestMethod.GET)
		public List<ServiceInstance> serviceInstancesByApplicationName(@PathVariable String applicationName) {
			return this.discoveryClient.getInstances(applicationName);
		}

		@RequestMapping(value = "/serviceinfo", method = RequestMethod.GET)
		public String serviceInfoGet() {
			System.out.println(" get /serviceinfo");
			SimpleDateFormat formatter = new SimpleDateFormat("yyyy.MM.dd HH:mm:ss");
			String datastr = formatter.format(new Date());
			ServiceInstance svrins = this.discoveryClient.getLocalServiceInstance();
			String strsvrinfo = svrins.getHost() + "$$" + svrins.getServiceId() + "$$" + datastr;
			return strsvrinfo;
		}

		@RequestMapping(value = "/serviceinfo", method = RequestMethod.POST)
		public String serviceInfoPost(HttpServletRequest request/*,@RequestBody JSONObject jo*//*,@RequestBody String strbody*/) {
			String strbody = HttpServletUtil.getPostBody(request);
			System.out.println(" body is:" +strbody);
			return strbody;
		}
		
		@RequestMapping(value = "/loadChart1", method = RequestMethod.GET)
		public String  getChart1Data(){
			String jsonstr ;
			char x = '\'';
			jsonstr ="{"+
					"'title':{'text':'日过车平均数量'}, "+
					"'subtitle':{'text':'XX省: XX市'},"+
					"'xAxis':{'categories':['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月']},"+
					"'yAxis':{'title':{'text':'过车数量(单位:千)'},'plotLines':[{'value':0,'width':1,'color':'#808080'}]},"+
					"'tooltip':{'valueSuffix':'千'},"+
					"'legend':{'layout':'vertical','align':'right','verticalAlign':'middle','borderWidth':0},"+
					"'series':[{'name':'卡口1','data':[7,6.9,9.5,14.5,18.2,21.5,25.2,26.5,23.3,18.3,13.9,9.6]},"+
					          "{'name':'卡口2','data':[2,0.8,5.7,11.3,17,22,24.8,24.1,20.1,14.1,8.6,2.5]},"+
					          "{'name':'卡口3','data':[1.9,0.6,3.5,8.4,13.5,17,18.6,17.9,14.3,9,3.9,1]},"+
					          "{'name':'卡口4','data':[3.9,4.2,5.7,8.5,11.9,15.2,17,16.6,14.2,10.3,6.6,4.8]}"+
					         "]"+
					"}";
			jsonstr = jsonstr.replace('\'', '\"');
			return jsonstr;
		}
		
		
	}

}
