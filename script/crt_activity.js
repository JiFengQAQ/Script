/**
 * @fileoverview 示例：发送 HTTP POST 请求并基于响应体中的 'errCode' 处理响应。
 */

const url = "https://passenger.cqmetro.cn/JKALL/c/cck/phone/activitylist";
const method = "POST";
const headers = {
  "Host": "passenger.cqmetro.cn",
  "Connection": "keep-alive",
  "content-type": "application/x-www-form-urlencoded",
  "Accept-Encoding": "gzip,compress,br,deflate"
};
const data = {
  "areaId": "-1",
  "lineId": "-1",
  "stationId": "-1",
  "pageSize": "1",
  "pageNum": "1"
};

const activityKey = "crtPassengerActivity";

const myRequest = {
  url: url,
  method: method, // 可选，默认为 GET。
  headers: headers, // 可选。
  body: Object.keys(data).map(key => `${key}=${encodeURIComponent(data[key])}`).join('&') // 将数据转换为 URL 编码字符串。
};

const storedActivityData = $prefs.valueForKey(activityKey);

const separator = "===============================";

console.log(separator);
console.log("发送请求至 " + url);

$task.fetch(myRequest).then(response => {
  try {
    console.log("收到响应，状态码：" + response.statusCode);
    console.log(separator);

    if (response.statusCode === 200) {
      const responseBody = JSON.parse(response.body);

      if (responseBody.errCode === null) {
        const activityData = responseBody.data.data[0];

        if (JSON.stringify(activityData) !== storedActivityData) {
          // 数据已更改，发送通知并存储新数据。
          $prefs.setValueForKey(JSON.stringify(activityData), activityKey);
          console.log("数据发生更改");
          console.log(storedActivityData);
          console.log("↓↓↓↓↓");
          console.log(JSON.stringify(activityData));
          $notify("CRT常乘客活动", activityData.name, JSON.stringify(activityData));
        } else {
          // 数据未更改，发送通知包含旧数据。
          console.log("数据未更改");
          console.log(storedActivityData);
          //$notify("无数据变更", "旧的活动数据", storedActivityData);
        }
      } else {
        // 响应中存在错误码，发送通知并记录响应全文。
        console.log("请求失败, 错误码: " + responseBody.errCode);
        console.log(response.body);
        // $notify("CRT常乘客活动", "请求失败: " + responseBody.errCode, responseBody.errMsg);
      }
    } else {
      // 请求失败，发送错误通知并记录响应全文。
      console.log("请求失败, 状态码: " + response.statusCode);
      console.log(response.body);
      // $notify("CRT常乘客活动", "网络错误: " + response.statusCode, "");
    }
  } catch (error) {
    // 解析响应体时发生错误，发送解析错误通知并记录响应全文。
    console.log("解析响应体时发生错误: " + error);
    console.log(response.body);
    $notify("CRT常乘客活动", "解析响应体时发生错误", error);
  } finally {
    console.log(separator);
    $done();
  }
}, reason => {
  // 请求失败，发送错误通知并记录错误信息。
  console.log("请求失败: " + reason.error);
  // $notify("CRT常乘客活动", "发起请求时出现错误: " + reason.error, "");
  console.log(separator);
  $done();
});
