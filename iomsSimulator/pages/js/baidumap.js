//全局变量
var map; // 百度地图对象
var sidebar;
var initpoint = null;// 客户端定位点

// 地图操作
var navigationControl;
var ifTraffic = false;
var traffic;

/* 页面初始化函数 */
function initmap() {

	/*sidebar = $("sidebar")[0];
	if (sidebar) {
		sidebar.hidden = true;
	}*/
	initBaiduMap(null);// 初始化百度地图
}

/**
 * 初始化百度地图
 */
function initBaiduMap(currPos) {

	var geolocation = new BMap.Geolocation();

	if (!currPos) {
		// point = new BMap.Point(116.404, 39.915);
		geolocation.getCurrentPosition(function(r) {
			initpoint = r.point;
			map = new BMap.Map("mapContent");
			map.centerAndZoom(initpoint, 15);
			// 添加地图类型控件
			map.addControl(new BMap.MapTypeControl({
				mapTypes : [ BMAP_NORMAL_MAP, BMAP_HYBRID_MAP ]
			}));
			map.setCurrentCity("上海"); // 设置地图显示的城市 此项是必须设置的
			map.enableScrollWheelZoom(true); // 开启鼠标滚轮缩放
			window.setTimeout(function() {
				map.panTo(initpoint);
			}, 2000);
			//sidebar.hidden = false;
			//initSbObject();
		});
	} else {
		initpoint = new BMap.Point(currPos.coords.latitude,
				currPos.coords.longitude);
	}

	trace("baidumap loaded!");
}

/**
 * 初始化sidebar对象
 */
function initSbObject() {

	var lilist = $("sidebar ul li");
	// trace("lilist length:" + lilist.length);
	for ( var i = 0; i < lilist.length; i++) {
		var liEle = lilist[i];
		if (liEle.id) {
			trace(liEle.id);
			liEle.innerHTML = "<a href=\"#\">" + liEle.id;
			var funname = liEle.id + "_onclick";
			liEle.onclick = eval(funname);
		}
	}
}

/**
 * addNavigationControl
 * 
 * @param event
 */
function addNavigationControl_onclick(event) {
	if (!navigationControl) {
		var opts = {
			type : BMAP_NAVIGATION_CONTROL_SMALL
		};
		navigationControl = new BMap.NavigationControl(opts);
		map.addControl(navigationControl);
	}
}

/**
 * btnSetMapStyle_onclick
 */
function setMapStyle_onclick(e) {
	var mapStyle = {
		style : "mapbox"
	};
	map.setMapStyle(mapStyle);
}

function addMarker(pos, index) {
	var myIcon = new BMap.Icon("../images/marker_red_sprite.png",
			new BMap.Size(122, 122), {
				// 指定定位位置。
				// 当标注显示在地图上时，其所指向的地理位置距离图标左上
				// 角各偏移10像素和25像素。您可以看到在本例中该位置即是
				// 图标中央下端的尖角位置。
				anchor : new BMap.Size(10, 25),
				// 设置图片偏移。
				// 当您需要从一幅较大的图片中截取某部分作为标注图标时，您
				// 需要指定大图的偏移位置，此做法与css sprites技术类似。
				imageOffset : new BMap.Size(0, 0 - index * 25)
			// 设置图片偏移
			});
	// 创建标注对象并添加到地图
	var marker = new BMap.Marker(pos, {
		icon : myIcon
	});
	marker.enableDragging();
	marker.onclick = marker_onclick;
	map.addOverlay(marker);

	/*
	 * var infowin = new BMap.InfoWindow("test
	 * infowindow",{width:200,height:200}); map.addOverlay(infowin);
	 */
}

function marker_onclick(e) {
	// alert("当前位置：" + e.point.lat + ", " + e.point.lng);
	openInfoWindow_onclick(e);
}

/**
 * addMarker_onclick
 * 
 * @param event
 */
function addMarker_onclick(e) {

	addMarker(initpoint, 0);
}

function openInfoWindow_onclick(e) {
	var opts = {
		width : 250, // 信息窗口宽度
		height : 40, // 信息窗口高度
		title : "当前位置:" // 信息窗口标题
	};

	if (e.point) {
		var infoWindow = new BMap.InfoWindow("经度:" + e.point.lat + " 纬度:"
				+ e.point.lng, opts); // 创建信息窗口对象
		map.openInfoWindow(infoWindow, e.point); // 打开信息窗口
	}
}

/**
 * addTileLayer_onclick
 * 
 * @param e
 */
function addTileLayer_onclick(e) {
	ifTraffic = !ifTraffic;
	if (ifTraffic) {
		traffic = new BMap.TrafficLayer(); // 创建交通流量图层实例
		map.addTileLayer(traffic); // 将图层添加到地图上

	} else {
		map.removeTileLayer(traffic); // 将图层移除
	}
}

function addEventListener_zoomend_onclick(e) {
	map.addEventListener("zoomend", function() {
		// alert("地图缩放至：" + this.getZoom() + "级");
	});
}

function removeEventListener_zoomend_onclick(e) {
	// alert("used removeEventListener_zoomend");
	map.removeEventListener("zoomend", function() {
		alert(removeEventListener_zoomend_onclick);
	});
}

function clickmap_onclick(e) {
	map.addEventListener("click", function(e) {
		addMarker(e.point, 0);
	});
}

function searchNearby_onclick(e){
	
	var local = new BMap.LocalSearch(map,   
            { renderOptions:{map: map, autoViewport: true}});  
	local.searchNearby("小吃", "漕河泾"); 
}

//window.addEventListener('load', initmap, false);
