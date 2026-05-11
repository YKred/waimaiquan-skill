# 🧧 惠生活优惠券 — 外卖红包实时查询助手

> 一个链接挖取当日所有隐藏外卖红包，美团 / 饿了么 / 京东外卖 / 淘宝闪购全覆盖。
> **无需注册、无需 API Key、装完即用。**

## 它能做什么

每次点外卖前，帮你一次性查出当前所有平台的隐藏红包和优惠活动，不用逐个 App 翻找。

- 覆盖美团、饿了么、京东外卖、淘宝闪购等多个平台
- 挖掘限时活动（App 里找不到的那种）
- 支持微信文本、飞书消息卡片、纯文本三种输出格式
- 零依赖，仅使用 Node.js 内置模块，不需要安装任何第三方包

## 怎么用

### 直接查询

```bash
node index.js
```

输出适合微信直接复制的文本格式。

### 指定输出格式

```bash
node index.js --feishu   # 飞书消息卡片（JSON 格式，可直接发送飞书群）
node index.js --text     # 纯文本（适合终端查看）
```

### 自然语言触发

```bash
node index.js "有什么外卖红包"
node index.js "今天吃什么"
node index.js "点外卖怎么省钱"
```

输入中包含"外卖"、"红包"、"领券"、"今天吃什么"等关键词时会自动触发查询。

### 作为模块引入

```js
const { HuiLife } = require('huilife-skill');

const hui = new HuiLife();
const result = await hui.query({ format: 'wechat' });
console.log(result.text);
```

也可以只判断用户的输入是否需要查询：

```js
const hui = new HuiLife();
const { triggered } = hui.shouldTrigger('帮我看看外卖红包');
if (triggered) {
  const result = await hui.query();
  console.log(result.text);
}
```

## 输出示例

```
🧧 今日外卖红包已挖出！（5月11日）

🔗 一键领全部红包：
   https://app-aujs40uyrf9d.appmiaoda.com

👆 打开链接，领取各平台隐藏红包

💡 今日必领：
   1. 美团外卖节（外卖券）
      → 领多张大额红包券
   2. 淘宝闪购-闪购红包（淘宝闪购）
      → 每天都可以在活动页面领取外卖红包
   3. 京东外卖-百亿补贴（京东外卖）
   4. 美团-酒店低至3折（酒店名宿）
      → 低价酒店

复制到微信打开 → 一个个领 → 再点餐
```

## 项目结构

```
├── index.js              # 主入口，提供 HuiLife 类和 CLI 命令
├── SKILL.md              # Claude Code Skill 配置文件
├── package.json          # 项目元信息
└── scripts/
    ├── config.js         # 配置：API 地址、密钥、触发关键词
    ├── query.js          # 数据查询：签名计算、HTTP 请求、API 调用
    ├── render.js         # 渲染引擎：微信/飞书/纯文本三种格式输出
    └── triggers.js       # 触发解析：判断用户输入是否需要查询
```

## 环境变量配置

密钥默认写在 `scripts/config.js` 中，生产环境建议改为环境变量传入，更安全：

```bash
# Windows PowerShell
$env:HL_ACCESS_KEY = "你的AccessKey"
$env:HL_SECRET_KEY = "你的SecretKey"
$env:HL_API_BASE_URL = "https://your-api-endpoint.com"   # 可选，有默认值
$env:HL_SITE_URL = "https://your-site.com"                # 可选，有默认值
```

| 变量名 | 说明 | 是否必须 |
|--------|------|----------|
| `HL_ACCESS_KEY` | API 访问密钥 | 建议设置 |
| `HL_SECRET_KEY` | API 签名密钥 | 建议设置 |
| `HL_API_BASE_URL` | API 接口地址 | 可选，有默认值 |
| `HL_SITE_URL` | 领券跳转链接 | 可选，有默认值 |

## 触发关键词

以下关键词会自动触发外卖红包查询：

外卖红包、外卖优惠、外卖券、外卖优惠券、优惠券、领券、领红包、省钱、点外卖、叫外卖、外卖、外卖神券、满减、满减红包、折扣、首单优惠、美团红包、饿了么红包、京东外卖、美团外卖、饿了么外卖、惠生活、吃什么、今天吃什么

## 系统要求

- Node.js >= 12.0.0
- 无需任何第三方依赖（零 npm install）

## 许可证

MIT-0（可自由使用，无需保留版权声明）
