$(document).ready(initChart);

function trace(text) {
    console.log((performance.now() / 1000).toFixed(3) + ": " + text);
}

function ajaxError(xhr, state) {
    alert("ajax invoke error: " + state+"\n"+xhr.status+": "+xhr.statusText+
          "\n"+xhr.responseText);
    //closeWindow();
}

//初始化页面上的所有图表
function initChart(){
    loadChart1();
}

//载入Chart1的数据
function loadChart1()
{
    $.ajax({
        type: "GET",
        url: "/reports/chart1",
        //contentType:"application/json;charset=utf-8",
        headers: {
            Accept: "application/json;charset=utf-8"
        },
        dataType: "json",
        success: getChart1DataSucceed,
        error: ajaxError
    });
}

function getChart1DataSucceed(jsObj, state) {
    $('#chart1').highcharts(jsObj);
    $('#chart2').highcharts(jsObj);
    $('#chart3').highcharts(jsObj);
    $('#chart4').highcharts(jsObj);
}
