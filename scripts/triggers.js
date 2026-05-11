/**
 * 惠生活 - 触发解析器
 * 解析用户自然语言输入，判断是否需要查询优惠券
 */

const config = require('./config');

/**
 * 解析用户输入
 * @param {string} input - 用户自然语言输入
 * @returns {object} 解析结果
 *   { triggered: boolean, platform: string|null, format: string, raw: string }
 */
function parseInput(input) {
  const result = {
    triggered: false,
    platform: null,
    format: config.FORMATS.WECHAT,
    raw: input,
  };

  if (!input || typeof input !== 'string') return result;

  const normalized = input.toLowerCase().trim();

  // 检查是否命中触发关键词
  for (const kw of config.TRIGGER_KEYWORDS) {
    if (normalized.includes(kw.toLowerCase())) {
      result.triggered = true;
      break;
    }
  }

  return result;
}

module.exports = {
  parseInput,
};
