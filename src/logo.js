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
