/*!
 * Live2D Widget —— 全自托管加载器
 * 基于 https://github.com/stevenjoezhang/live2d-widget (v1.0.1, MIT)
 * 所有资源均从本站 /live2d/ 目录读取，不依赖任何外部 CDN
 */

/* ⚠️ 资源版本号 —— 改动 /live2d/ 下任何文件后，必须把它改掉（如 20261013a → 20261013b）。
 *
 * 为什么需要：Cloudflare 对静态资源做长缓存，URL 不变时浏览器会一直吃旧文件，
 * 表现为「明明改了、线上却没变」。挂上 ?v= 后 URL 变了，浏览器才会重新拉取。
 *
 * 注意有两处版本号要一起改：
 *   ① 本文件的 ASSET_VERSION（管 waifu.css / live2d-custom.css / waifu-tips.js / 内核 / 模型 json）
 *   ② _config.butterfly.yml 里 autoload.js 自己的 ?v=（管本文件，不改它新版加载器根本进不来）
 */
const ASSET_VERSION = '20261013d';

// 资源根目录（本站自托管）
const live2d_path = '/live2d/';

// 资源路径挂上版本号，强制浏览器重新拉取
const asset = (name) => `${live2d_path}${name}?v=${ASSET_VERSION}`;

// 异步加载 css / js
function loadExternalResource(url, type) {
  return new Promise((resolve, reject) => {
    let tag;

    if (type === 'css') {
      tag = document.createElement('link');
      tag.rel = 'stylesheet';
      tag.href = url;
    }
    else if (type === 'js') {
      tag = document.createElement('script');
      tag.type = 'module';
      tag.src = url;
    }
    if (tag) {
      tag.onload = () => resolve(url);
      tag.onerror = () => reject(url);
      document.head.appendChild(tag);
    }
  });
}

(async () => {
  // 窄屏不加载，交给 CSS 隐藏（省流量）
  // 注意：这里用 innerWidth 而不是 screen.width —— 后者在无头/多屏环境下不可靠
  if (window.innerWidth < 992) return;

  // 避免贴图跨域问题
  const OriginalImage = window.Image;
  window.Image = function (...args) {
    const img = new OriginalImage(...args);
    img.crossOrigin = 'anonymous';
    return img;
  };
  window.Image.prototype = OriginalImage.prototype;

  await Promise.all([
    loadExternalResource(asset('waifu.css'), 'css'),
    loadExternalResource(asset('waifu-tips.js'), 'js'),
  ]);

  // 定位补丁必须排在 waifu.css 之后加载，否则同优先级会被它覆盖
  await loadExternalResource(asset('live2d-custom.css'), 'css');

  initWidget({
    waifuPath: asset('waifu-tips.json'),
    cubism2Path: asset('live2d.min.js'),
    // Cubism 5 内核：驱动 .moc3（model3/model4）模型，同样自托管
    cubism5Path: asset('live2dcubismcore.min.js'),
    tools: ['hitokoto', 'switch-model', 'switch-texture', 'photo', 'info', 'quit'],
    logLevel: 'warn',
    drag: false,
  });
})();
