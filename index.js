/**
 * 惠生活 🧧 — 外卖优惠券实时查询助手
 *
 * 查询美团、饿了么、京东等平台的最新优惠券和红包活动。
 * 零依赖：仅使用 Node.js 内置模块
 *
 * 用法:
 *   const { HuiLife } = require('huilife-skill');
 *   const hui = new HuiLife();
 *   const result = await hui.query();
 *   console.log(result.text);
 */

const { fetchCoupons, fetchProjects } = require('./scripts/query');
const { renderCoupons, renderProjects } = require('./scripts/render');
const { parseInput } = require('./scripts/triggers');
const config = require('./scripts/config');

class HuiLife {
  /**
   * @param {object} options
   * @param {string} [options.defaultFormat] - 默认渲染格式 (wechat/feishu/text)
   */
  constructor(options = {}) {
    this.defaultFormat = options.defaultFormat || config.FORMATS.WECHAT;
  }

  /**
   * 检查用户输入是否触发查询
   * @param {string} input - 用户自然语言输入
   * @returns {{ triggered: boolean }}
   */
  shouldTrigger(input) {
    const result = parseInput(input);
    return { triggered: result.triggered };
  }

  /**
   * 查询外卖券 / 优惠活动
   * @param {object} [options]
   * @param {string} [options.format] - 渲染格式 (wechat/feishu/text)
   * @param {number} [options.pageSize=10] - 返回条数
   * @param {string} [options.sectionName] - 板块名筛选，如"外卖"、"美团"
   * @returns {Promise<{success: boolean, text: string, data: object}>}
   */
  async query(options = {}) {
    const format = options.format || this.defaultFormat;
    const pageSize = options.pageSize || 5;

    const result = await fetchProjects({
      pageSize,
      sectionName: options.sectionName || '外卖券',
    });

    if (!result.success) {
      return {
        success: false,
        text: '外卖券服务暂时不可用，请稍后重试 🙏\n(' + result.message + ')',
        data: result,
      };
    }

    const text = renderProjects(result, format);

    return {
      success: true,
      text: text,
      data: {
        list: result.list,
        page: result.page,
        pageSize: result.pageSize,
      },
    };
  }

  /**
   * 一站式处理：解析输入 → 查询 → 渲染
   * @param {string} input - 用户自然语言输入
   * @param {object} [options]
   * @param {string} [options.format] - 渲染格式
   * @returns {Promise<{handled: boolean, text: string}>}
   */
  async handleInput(input, options = {}) {
    const parsed = parseInput(input);

    if (!parsed.triggered) {
      return { handled: false, text: '' };
    }

    const result = await this.query({
      format: options.format || this.defaultFormat,
    });

    return { handled: true, text: result.text };
  }
}

// CLI 模式
if (require.main === module) {
  (async () => {
    const args = process.argv.slice(2);
    const format = args.includes('--feishu') ? 'feishu'
      : args.includes('--text') ? 'text'
      : 'wechat';

    const hui = new HuiLife();

    if (args[0] && !args[0].startsWith('--')) {
      // 解析自然语言输入
      const result = await hui.handleInput(args.join(' '), { format });
      if (result.handled) {
        console.log(result.text);
      } else {
        console.log('未匹配到外卖红包查询意图。试试：外卖红包、领券、今天吃什么');
      }
    } else {
      // 直接查询
      const result = await hui.query({ format });
      console.log(result.text);
    }
  })();
}

module.exports = {
  HuiLife,
  fetchCoupons,
  renderCoupons,
  parseInput,
  config,
};
