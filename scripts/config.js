/**
 * 惠生活 Skill 配置文件
 *
 * ⚠️ 安全提示：正式使用时建议通过环境变量传入密钥，
 * 不要直接把密钥写在代码里上传到公开仓库。
 * 设置方式：
 *   set HL_ACCESS_KEY=你的AccessKey
 *   set HL_SECRET_KEY=你的SecretKey
 */

module.exports = {
  /** API 基础地址 */
  API_BASE_URL: process.env.HL_API_BASE_URL || 'https://backend.appmiaoda.com/projects/supabase300636050605256704/functions/v1/open-api',

  /** API 密钥（优先从环境变量读取） */
  ACCESS_KEY: process.env.HL_ACCESS_KEY || 'AKX9g1JgT6M3A8Rh9cC6M1HGGztDACFO',
  SECRET_KEY: process.env.HL_SECRET_KEY || 'SK7%5xLTZGtHrL2UrYdS5zTDWf5gExzRXE6C41Bwms2I2HtT',

  /** 请求超时时间（毫秒） */
  TIMEOUT: 15000,

  /** 网站首页（用户点击跳转领券的链接） */
  SITE_URL: process.env.HL_SITE_URL || 'https://app-aujs40uyrf9d.appmiaoda.com',

  /** 触发关键词 */
  TRIGGER_KEYWORDS: [
    '外卖红包', '外卖优惠', '外卖券', '外卖优惠券',
    '优惠券', '领券', '领红包', '省钱',
    '点外卖', '叫外卖', '外卖', '外卖神券',
    '满减', '满减红包', '折扣', '首单优惠',
    '美团红包', '饿了么红包', '京东外卖',
    '美团外卖', '饿了么外卖',
    '惠生活', '吃什么', '今天吃什么',
  ],

  /** 渲染格式 */
  FORMATS: {
    WECHAT: 'wechat',
    FEISHU: 'feishu',
    TEXT: 'text',
  },
};
