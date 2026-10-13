/*!
 * Live2D Widget —— 全自托管加载器
 * 基于 https://github.com/stevenjoezhang/live2d-widget (v1.0.1, MIT)
 * 所有资源均从本站 /live2d/ 目录读取，不依赖任何外部 CDN
 */

// 资源根目录（本站自托管）
const live2d_path = '/live2d/';

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
    loadExternalResource(live2d_path + 'waifu.css', 'css'),
    loadExternalResource(live2d_path + 'waifu-tips.js', 'js'),
  ]);

  // 定位补丁必须排在 waifu.css 之后加载，否则同优先级会被它覆盖
  await loadExternalResource(live2d_path + 'live2d-custom.css', 'css');

  initWidget({
    waifuPath: live2d_path + 'waifu-tips.json',
    cubism2Path: live2d_path + 'live2d.min.js',
    // Cubism 5 内核：驱动 .moc3（model3/model4）模型，同样自托管
    cubism5Path: live2d_path + 'live2dcubismcore.min.js',
    tools: ['hitokoto', 'switch-model', 'switch-texture', 'photo', 'info', 'quit'],
    logLevel: 'warn',
    drag: false,
  });
})();
