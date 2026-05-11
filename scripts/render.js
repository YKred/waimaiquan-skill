/**
 * 惠生活 - 渲染引擎
 * 将 API 返回数据渲染为不同渠道的输出格式
 * - 微信文本：适合微信聊天
 * - 飞书消息卡片：适合飞书群聊
 * - 纯文本：适合终端/日志
 */

const config = require('./config');

/**
 * 渲染优惠券列表
 * @param {object} data - { success, list, message }
 * @param {string} [format='wechat'] - 渲染格式
 * @returns {string} 渲染后的文本
 */
function renderCoupons(data, format) {
  const fmt = format || 'wechat';

  if (!data.success) {
    return renderError(data.message || '服务暂时不可用', fmt);
  }

  if (!data.list || data.list.length === 0) {
    return renderEmpty(fmt);
  }

  if (fmt === 'feishu') {
    return renderCouponsFeishu(data.list);
  }

  if (fmt === 'text') {
    return renderCouponsText(data.list);
  }

  return renderCouponsWechat(data.list);
}

/**
 * 微信格式渲染
 */
function renderCouponsWechat(list) {
  const date = new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' });

  let output = '🧧 今日外卖优惠券已更新！（' + date + '）\n\n';
  output += '🔗 一键领全部优惠：\n';
  output += '   ' + config.SITE_URL + '\n\n';
  output += '👆 打开链接，领取各平台隐藏红包\n\n';

  output += '💡 今日优惠券推荐：\n';
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    const title = item.title || '优惠券';
    const price = item.final_price || item.price || '';
    const originalPrice = item.price || '';
    const couponAmount = item.coupon_amount || '';
    const saleCount = item.sale_count || 0;

    output += '   ' + (i + 1) + '. ' + title + '\n';
    if (couponAmount) {
      output += '      → 优惠 ' + couponAmount + ' 元';
      if (price) output += '，到手价 ' + price + ' 元';
      output += '\n';
    } else if (price) {
      output += '      → 到手价 ' + price + ' 元\n';
    }
    if (saleCount > 0) {
      output += '      → 已售 ' + formatSaleCount(saleCount) + ' 件\n';
    }
  }

  output += '\n复制到微信打开 → 领券 → 再点餐';

  return output;
}

/**
 * 飞书消息卡片格式渲染
 */
function renderCouponsFeishu(list) {
  const elements = [];

  // 核心链接
  elements.push({
    tag: 'div',
    text: {
      tag: 'lark_md',
      content: '**🔗 一键领全部优惠**\n[' + config.SITE_URL + '](' + config.SITE_URL + ')\n\n打开链接，领取各平台隐藏红包',
    },
  });

  // 优惠券列表
  if (list.length > 0) {
    elements.push({ tag: 'hr' });
    let md = '**💡 今日优惠券推荐**\n';
    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      const title = item.title || '优惠券';
      const price = item.final_price || item.price || '';
      const couponAmount = item.coupon_amount || '';

      md += '**' + (i + 1) + '. ' + escapeFeishuMd(title) + '**\n';
      if (couponAmount) {
        md += '→ 优惠 ' + couponAmount + ' 元';
        if (price) md += '，到手价 ' + price + ' 元';
        md += '\n';
      } else if (price) {
        md += '→ 到手价 ' + price + ' 元\n';
      }
    }
    elements.push({ tag: 'div', text: { tag: 'lark_md', content: md } });
  }

  // 行动引导
  elements.push({ tag: 'hr' });
  elements.push({
    tag: 'note',
    elements: [{ tag: 'plain_text', content: '复制到微信打开 → 领券 → 再点餐' }],
  });

  const card = {
    config: { wide_screen_mode: true },
    header: {
      title: { tag: 'plain_text', content: '🧧 今日外卖优惠券' },
      template: 'orange',
    },
    elements: elements,
  };

  return JSON.stringify(card, null, 2);
}

/**
 * 纯文本格式渲染
 */
function renderCouponsText(list) {
  let output = '今日外卖优惠券\n\n';
  output += '领券链接: ' + config.SITE_URL + '\n\n';

  if (list.length > 0) {
    output += '今日推荐:\n';
    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      const title = item.title || '优惠券';
      const price = item.final_price || item.price || '';
      const couponAmount = item.coupon_amount || '';

      output += '  ' + (i + 1) + '. ' + title;
      if (couponAmount) output += ' [优惠' + couponAmount + '元]';
      if (price) output += ' [到手价' + price + '元]';
      output += '\n';
    }
  }

  output += '\n复制链接到微信打开领券';

  return output;
}

/**
 * 渲染空结果
 */
function renderEmpty(format) {
  const date = new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' });

  if (format === 'feishu') {
    return JSON.stringify({
      config: { wide_screen_mode: true },
      header: {
        title: { tag: 'plain_text', content: '🧧 外卖优惠券' },
        template: 'orange',
      },
      elements: [{
        tag: 'markdown',
        content: '今日暂无新的优惠活动，明天再来看看吧！\n\n也可以直接去各平台 App 搜「外卖红包」',
      }],
    }, null, 2);
  }

  if (format === 'text') {
    return '[暂无活动] 今天没有新的外卖优惠活动';
  }

  return '🔍 今天暂时没有新的优惠活动，明天再来看看吧！\n\n💡 也可以直接在饿了么/美团 App 里搜「外卖红包」\n\n🔗 ' + config.SITE_URL;
}

/**
 * 渲染错误信息
 */
function renderError(message, format) {
  if (format === 'feishu') {
    return JSON.stringify({
      config: { wide_screen_mode: true },
      header: {
        title: { tag: 'plain_text', content: '🧧 外卖优惠券' },
        template: 'red',
      },
      elements: [{
        tag: 'markdown',
        content: '优惠券服务暂时不可用，请稍后重试 🙏\n(' + message + ')',
      }],
    }, null, 2);
  }

  return '优惠券服务暂时不可用，请稍后重试 🙏\n(' + message + ')';
}

/**
 * 格式化销量数字
 * @param {number} count
 * @returns {string}
 */
function formatSaleCount(count) {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + '万';
  }
  return String(count);
}

/**
 * 转义飞书 markdown 特殊字符
 */
function escapeFeishuMd(text) {
  if (!text) return '';
  return text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * 渲染外卖券 / 项目列表
 * @param {object} data - { success, list, message }
 * @param {string} [format='wechat'] - 渲染格式
 * @returns {string} 渲染后的文本
 */
function renderProjects(data, format) {
  const fmt = format || 'wechat';

  if (!data.success) {
    return renderError(data.message || '服务暂时不可用', fmt);
  }

  if (!data.list || data.list.length === 0) {
    return renderEmpty(fmt);
  }

  if (fmt === 'feishu') {
    return renderProjectsFeishu(data.list);
  }

  if (fmt === 'text') {
    return renderProjectsText(data.list);
  }

  return renderProjectsWechat(data.list);
}

/**
 * 微信格式渲染外卖券
 */
function renderProjectsWechat(list) {
  const date = new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' });

  let output = '🧧 今日外卖红包已挖出！（' + date + '）\n\n';
  output += '🔗 查看更多红包（旅游、出行）：\n';
  output += '   ' + config.SITE_URL + '\n\n';
  output += '👆 打开链接，领取各平台隐藏红包\n\n';

  output += '💡 今日必领（共' + list.length + '个）：\n';
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    const title = item.title || '活动';
    const desc = item.description || '';
    const section = item.section_name || '';
    const jumpUrl = item.jump_url || '';

    // 去掉板块名中的★★符号，不单独显示板块标签（因为已经按板块筛选了）
    const cleanSection = section.replace(/★/g, '').trim();
    const tag = cleanSection ? '（' + cleanSection + '）' : '';
    output += '   ' + (i + 1) + '. ' + title + tag + '\n';
    if (desc) {
      output += '      → ' + desc + '\n';
    }
    // 展示领取链接或口令
    if (jumpUrl) {
      if (jumpUrl.startsWith('http')) {
        output += '      → 链接：' + jumpUrl + '\n';
      } else {
        output += '      → 口令：' + jumpUrl + '（复制到对应APP打开）\n';
      }
    }
  }

  return output;
}

/**
 * 飞书消息卡片格式渲染外卖券
 */
function renderProjectsFeishu(list) {
  const elements = [];

  // 核心链接
  elements.push({
    tag: 'div',
    text: {
      tag: 'lark_md',
      content: '**🔗 查看更多红包（旅游、出行）**\n[' + config.SITE_URL + '](' + config.SITE_URL + ')\n\n打开链接，领取各平台隐藏红包',
    },
  });

  // 红包列表
  if (list.length > 0) {
    elements.push({ tag: 'hr' });
    let md = '**💡 今日必领**\n';
    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      const title = item.title || '活动';
      const desc = item.description || '';
      const section = item.section_name || '';

      const tag = section ? '（' + escapeFeishuMd(section) + '）' : '';
      md += '**' + (i + 1) + '. ' + escapeFeishuMd(title) + '**' + tag + '\n';
      if (desc) {
        md += '→ ' + escapeFeishuMd(desc) + '\n';
      }
      if (item.jump_url) {
        if (item.jump_url.startsWith('http')) {
          md += '→ 链接：' + escapeFeishuMd(item.jump_url) + '\n';
        } else {
          md += '→ 口令：' + escapeFeishuMd(item.jump_url) + '（复制到对应APP打开）\n';
        }
      }
    }
    elements.push({ tag: 'div', text: { tag: 'lark_md', content: md } });
  }

  // 行动引导
  elements.push({ tag: 'hr' });
  elements.push({
    tag: 'note',
    elements: [{ tag: 'plain_text', content: '复制到微信打开 → 一个个领 → 再点餐' }],
  });

  const card = {
    config: { wide_screen_mode: true },
    header: {
      title: { tag: 'plain_text', content: '🧧 今日外卖红包' },
      template: 'orange',
    },
    elements: elements,
  };

  return JSON.stringify(card, null, 2);
}

/**
 * 纯文本格式渲染外卖券
 */
function renderProjectsText(list) {
  let output = '今日外卖红包\n\n';
  output += '领券链接: ' + config.SITE_URL + '\n\n';

  if (list.length > 0) {
    output += '今日必领:\n';
    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      const title = item.title || '活动';
      const desc = item.description || '';
      const section = item.section_name || '';

      output += '  ' + (i + 1) + '. ' + title;
      if (section) output += ' [' + section + ']';
      output += '\n';
      if (desc) output += '     → ' + desc + '\n';
      if (item.jump_url) {
        if (item.jump_url.startsWith('http')) {
          output += '     → 链接：' + item.jump_url + '\n';
        } else {
          output += '     → 口令：' + item.jump_url + '（复制到对应APP打开）\n';
        }
      }
    }
  }

  return output;
}

module.exports = {
  renderCoupons,
  renderProjects,
  renderEmpty,
  renderError,
};
