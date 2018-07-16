
package com.kedacom.viid.starter;

import java.lang.reflect.Method;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.forwardedUrl;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.Map;
import java.util.HashMap;
import java.util.Iterator;

import javax.servlet.ServletInputStream;
import javax.servlet.http.HttpServletRequest;
//import javax.servlet.ServletContext;

import org.apache.log4j.Logger;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * @author zhangkai
 * 
 */
public class HttpServletUtil {

	private static Logger log = Logger.getLogger(HttpServletUtil.class);

	/**
	 * 获取提交的消息体
	 * 
	 * @Title: getPostBody @Description: TODO @param @param
	 *         request @param @return @return String @throws
	 */
	public static String getPostBody(HttpServletRequest request) {
		/*char[] buf = new char[1000];
		byte[] bytebuf = new byte[2000];
		StringBuffer sb = new StringBuffer();*/
		String ret=null, line=null;
		try {
			ServletInputStream is = request.getInputStream();
			InputStreamReader isreader = new InputStreamReader(is, "utf-8");
			BufferedReader bfreader = new BufferedReader(isreader);
			/*
			 * InputStreamReader isreader = new InputStreamReader(is, "utf-8");
			 * BufferedReader bfreader = new BufferedReader(isreader); while
			 * ((len = bfreader.read(buf)) > 0) { if (len == buf.length) {
			 * sb.append(buf); } else { for (int i = 0; i < len; i++) {
			 * sb.append(buf[i]); } } }
			 */

			while (null != (line = bfreader.readLine())) {
				if (null == ret) {
					ret = line;
				} else {
					ret += line;
				}
			}
		}

		catch (Exception e) {
			log.error("getPostBody fail!");
			e.printStackTrace();
		}
		return ret;
	}

	/**
	 * 将javaBean转换为HashMap @Title: jB2Map @Description: TODO @param @param
	 * javaBean @param @return @return Map @throws
	 */
	public static Map jB2Map(Object javaBean) {

		Map result = new HashMap();
		Method[] methods = javaBean.getClass().getDeclaredMethods();

		for (Method method : methods) {
			try {
				if (method.getName().startsWith("get")) {
					String field = method.getName();
					field = field.substring(field.indexOf("get") + 3);
					field = field.toLowerCase().charAt(0) + field.substring(1);

					Object value = method.invoke(javaBean, (Object[]) null);
					result.put(field, null == value ? "" : value.toString());
				}

			} catch (Exception e) {
				log.error(e);
			}
		}
		return result;
	}

	/**
	 * 将json字符串解析后转换到一个HashMap中 @Title: json2Map @Description:
	 * TODO @param @param jsonString @param @return @param @throws
	 * JSONException @return Map @throws
	 */
	public static Map json2Map(String jsonString) throws JSONException {

		JSONObject jsonObject = new JSONObject(jsonString);

		Map result = new HashMap();
		Iterator iterator = jsonObject.keys();
		String key = null;
		Object value = null;

		while (iterator.hasNext()) {
			key = (String) iterator.next();
			value = jsonObject.get(key);
			result.put(key, value);
		}
		return result;
	}

}
