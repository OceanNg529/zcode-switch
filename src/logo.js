/**
 * 应用 Logo 图标渲染引擎
 * 默认经典品牌折线徽标，支持用户上传自定义图片
 */

export const DEFAULT_LOGO_SVG = `
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="6" fill="var(--amber)" fill-opacity="0.16"/>
    <path d="M5.5 6.5H18.5L9.5 17.5H18.5" stroke="var(--amber)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="6" cy="6.5" r="1.5" fill="var(--amber)"/>
    <circle cx="18" cy="17.5" r="1.5" fill="var(--amber)"/>
  </svg>
`;

export function renderLogo(logoKey, size = 20, cls = "") {
  // 自定义图片（base64 或 url）
  if (logoKey && (logoKey.startsWith("data:") || logoKey.startsWith("http") || logoKey.startsWith("blob:"))) {
    return `<span class="app-logo-badge custom-img${cls ? " " + cls : ""}">
      <img src="${logoKey}" width="${size}" height="${size}" alt="Logo" class="app-logo-img" style="width:${size}px;height:${size}px;border-radius:5px;object-fit:cover;display:block;" />
    </span>`;
  }

  // 默认徽标
  return `<span class="app-logo-badge default-img${cls ? " " + cls : ""}">
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="6" fill="var(--amber)" fill-opacity="0.16"/>
      <path d="M5.5 6.5H18.5L9.5 17.5H18.5" stroke="var(--amber)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="6" cy="6.5" r="1.5" fill="var(--amber)"/>
      <circle cx="18" cy="17.5" r="1.5" fill="var(--amber)"/>
    </svg>
  </span>`;
}

/**
 * 将用户上传的任意图片自动处理为符合 macOS 官方规范的 Squircle 连续圆角矩形图标
 * - 规格：1024x1024 画布，824x824 主体居中（四周各留 100px 边距用于官方环境阴影）
 * - 圆角半径：185px（标准连续圆角，占主体宽度 22.45%）
 * - 阴影：柔和黑色环境阴影 (模糊 24px，向下偏移 12px)
 */
export function processMacAppIcon(dataUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const cardSize = 824;
      const cornerRadius = 185;

      // 1. 离屏绘制 824x824 标准圆角卡片
      const offscreen = document.createElement("canvas");
      offscreen.width = cardSize;
      offscreen.height = cardSize;
      const offCtx = offscreen.getContext("2d");
      if (!offCtx) return resolve(dataUrl);

      offCtx.save();
      offCtx.beginPath();
      if (typeof offCtx.roundRect === "function") {
        offCtx.roundRect(0, 0, cardSize, cardSize, cornerRadius);
      } else {
        const r = cornerRadius;
        offCtx.moveTo(r, 0);
        offCtx.arcTo(cardSize, 0, cardSize, cardSize, r);
        offCtx.arcTo(cardSize, cardSize, 0, cardSize, r);
        offCtx.arcTo(0, cardSize, 0, 0, r);
        offCtx.arcTo(0, 0, cardSize, 0, r);
        offCtx.closePath();
      }
      offCtx.clip();

      const aspectImg = img.width / img.height;
      let drawW = cardSize;
      let drawH = cardSize;
      let drawX = 0;
      let drawY = 0;
      if (aspectImg > 1) {
        drawW = cardSize * aspectImg;
        drawX = -(drawW - cardSize) / 2;
      } else {
        drawH = cardSize / aspectImg;
        drawY = -(drawH - cardSize) / 2;
      }
      offCtx.drawImage(img, drawX, drawY, drawW, drawH);
      offCtx.restore();

      // 2. 绘制到 1024x1024 画布，带 Apple 官方环境阴影
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(dataUrl);

      ctx.clearRect(0, 0, 1024, 1024);
      ctx.save();
      ctx.shadowColor = "rgba(0, 0, 0, 0.24)";
      ctx.shadowBlur = 24;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 12;

      const origin = 100; // (1024 - 824) / 2 = 100
      ctx.drawImage(offscreen, origin, origin, cardSize, cardSize);
      ctx.restore();

      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}
