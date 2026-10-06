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
 * 将用户上传的任意图片自动处理为符合 macOS 规范的 Squircle 连续圆角矩形图标
 * - 规格：1024x1024 画布，824x824 主体居中（四周留约 10% 呼吸留白边距，与原生 App 视觉对齐）
 * - 圆角半径：185px（标准连续圆角）
 */
export function processMacAppIcon(dataUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(dataUrl);

      const size = 1024;
      const x = 0;
      const y = 0;
      const r = Math.round(size * 0.224); // 约 229px

      ctx.clearRect(0, 0, 1024, 1024);

      // 绘制 macOS 标准圆角并裁剪
      ctx.save();
      ctx.beginPath();
      if (typeof ctx.roundRect === "function") {
        ctx.roundRect(x, y, size, size, r);
      } else {
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + size, y, x + size, y + size, r);
        ctx.arcTo(x + size, y + size, x, y + size, r);
        ctx.arcTo(x, y + size, x, y, r);
        ctx.arcTo(x, y, x + size, y, r);
        ctx.closePath();
      }
      ctx.clip();

      const aspectImg = img.width / img.height;
      let drawW = size;
      let drawH = size;
      let drawX = x;
      let drawY = y;
      if (aspectImg > 1) {
        drawW = size * aspectImg;
        drawX = x - (drawW - size) / 2;
      } else {
        drawH = size / aspectImg;
        drawY = y - (drawH - size) / 2;
      }
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      ctx.restore();

      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}
