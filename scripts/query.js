/**
 * 惠生活 - 数据查询引擎
 * 负责签名计算和 API 请求
 *
 * 签名规则（HMAC-SHA256）：
 * 1. 将除 signature 外的所有参数按参数名 ASCII 升序排列
 * 2. 拼接成 key=value 格式，用 & 连接
 * 3. 末尾追加 &secret=SecretKey
 * 4. 用 SecretKey 作为密钥，对拼接字符串做 HMAC-SHA256 哈希
 * 5. 哈希结果转16进制小写字符串即为签名
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');
const crypto = require('crypto');
const config = require('./config');

/**
 * 生成 HMAC-SHA256 签名
 * @param {object} params - 请求参数（不含 signature）
 * @returns {string} 签名的16进制小写字符串
 */
function generateSignature(params) {
  const signStr = Object.keys(params)
    .sort()
    .map(k => k + '=' + params[k])
    .join('&') + '&secret=' + config.SECRET_KEY;

  return crypto
    .createHmac('sha256', config.SECRET_KEY)
    .update(signStr)
    .digest('hex');
}

/**
 * 发送 HTTP GET 请求
 * @param {string} urlStr - 完整请求地址
 * @param {number} timeout - 超时时间（毫秒）
 * @returns {Promise<object>} 解析后的 JSON
 */
function httpGet(urlStr, timeout = config.TIMEOUT) {
  return new Promise((resolve, reject) => {
    let parsedUrl;
    try {
      parsedUrl = new URL(urlStr);
    } catch (e) {
      return reject(new Error('无效的 URL: ' + urlStr));
    }

    const client = parsedUrl.protocol === 'https:' ? https : http;
    const req = client.get(urlStr, { timeout }, (res) => {
      // 处理重定向
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return httpGet(res.headers.location, timeout).then(resolve).catch(reject);
      }

      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (res.statusCode >= 400) {
            reject(new Error('API 返回错误 ' + res.statusCode + ': ' + (json.message || data.substring(0, 200))));
          } else {
            resolve(json);
          }
        } catch (e) {
          reject(new Error('JSON 解析失败: ' + e.message));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('请求超时 (' + timeout + 'ms)'));
    });
  });
}

/**
 * 获取优惠券列表
 * @param {object} [options]
 * @param {number} [options.page=1] - 页码
 * @param {number} [options.pageSize=10] - 每页条数
 * @returns {Promise<{success: boolean, list: [], message: string}>}
 */
async function fetchCoupons(options = {}) {
  const page = options.page || 1;
  const pageSize = options.pageSize || 10;

  const params = {
    access_key: config.ACCESS_KEY,
    timestamp: Math.floor(Date.now() / 1000).toString(),
    page: String(page),
    page_size: String(pageSize),
  };

  const signature = generateSignature(params);
  const queryString = Object.keys(params)
    .sort()
    .map(k => k + '=' + params[k])
    .join('&') + '&signature=' + signature;

  const url = config.API_BASE_URL + '/coupons?' + queryString;

  try {
    const response = await httpGet(url);

    if (response.code === 200 && response.data) {
      return {
        success: true,
        list: Array.isArray(response.data.list) ? response.data.list : [],
        page: response.data.page || page,
        pageSize: response.data.page_size || pageSize,
        message: '',
      };
    }

    return {
      success: false,
      list: [],
      message: response.message || '接口返回异常',
    };
  } catch (error) {
    return {
      success: false,
      list: [],
      message: error.message,
    };
  }
}

/**
 * 获取商品列表
 * @param {object} [options]
 * @param {number} [options.page=1] - 页码
 * @param {number} [options.pageSize=10] - 每页条数
 * @returns {Promise<{success: boolean, list: [], message: string}>}
 */
async function fetchGoods(options = {}) {
  const page = options.page || 1;
  const pageSize = options.pageSize || 10;

  const params = {
    access_key: config.ACCESS_KEY,
    timestamp: Math.floor(Date.now() / 1000).toString(),
    page: String(page),
    page_size: String(pageSize),
  };

  const signature = generateSignature(params);
  const queryString = Object.keys(params)
    .sort()
    .map(k => k + '=' + params[k])
    .join('&') + '&signature=' + signature;

  const url = config.API_BASE_URL + '/goods?' + queryString;

  try {
    const response = await httpGet(url);

    if (response.code === 200 && response.data) {
      return {
        success: true,
        list: Array.isArray(response.data.list) ? response.data.list : [],
        page: response.data.page || page,
        pageSize: response.data.page_size || pageSize,
        message: '',
      };
    }

    return {
      success: false,
      list: [],
      message: response.message || '接口返回异常',
    };
  } catch (error) {
    return {
      success: false,
      list: [],
      message: error.message,
    };
  }
}

/**
 * 获取外卖券 / 项目列表
 * @param {object} [options]
 * @param {string} [options.sectionName] - 板块名关键词，如"外卖"、"美团"，不传则返回全部
 * @param {number} [options.page=1] - 页码
 * @param {number} [options.pageSize=10] - 每页条数
 * @returns {Promise<{success: boolean, list: [], message: string}>}
 */
async function fetchProjects(options = {}) {
  const page = options.page || 1;
  const pageSize = options.pageSize || 10;

  const params = {
    access_key: config.ACCESS_KEY,
    timestamp: Math.floor(Date.now() / 1000).toString(),
    page: String(page),
    page_size: String(pageSize),
  };

  // 可选参数：板块名筛选
  if (options.sectionName) {
    params.section_name = options.sectionName;
  }

  const signature = generateSignature(params);
  const queryString = Object.keys(params)
    .sort()
    .map(k => k + '=' + params[k])
    .join('&') + '&signature=' + signature;

  const url = config.API_BASE_URL + '/projects?' + queryString;

  try {
    const response = await httpGet(url);

    if (response.code === 200 && response.data) {
      return {
        success: true,
        list: Array.isArray(response.data.list) ? response.data.list : [],
        page: response.data.page || page,
        pageSize: response.data.page_size || pageSize,
        message: '',
      };
    }

    return {
      success: false,
      list: [],
      message: response.message || '接口返回异常',
    };
  } catch (error) {
    return {
      success: false,
      list: [],
      message: error.message,
    };
  }
}

module.exports = {
  fetchCoupons,
  fetchGoods,
  fetchProjects,
  generateSignature,
};
