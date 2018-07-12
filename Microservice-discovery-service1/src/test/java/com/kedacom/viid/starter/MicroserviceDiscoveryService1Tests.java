package com.kedacom.viid.starter;

import com.sun.jersey.core.header.MediaTypes;

import org.junit.Test;
import org.junit.Before;
import org.junit.runner.RunWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.sun.jersey.core.header.MediaTypes;

import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

@RunWith(SpringRunner.class)
@SpringBootTest
public class MicroserviceDiscoveryService1Tests {

	private MockMvc mock;
	
	@Before
	public void setUp() throws Exception
	{
		mock = MockMvcBuilders.standaloneSetup(new MicroserviceDiscoveryService1.ServiceInstanceRestController()).build();
		assert(mock != null);
	}
	
	@Test
	public void contextLoads() {
		//mock.perform(MockMvcRequestBuilders.get("/service-instances/a-bootiful-client"));
	}

}
