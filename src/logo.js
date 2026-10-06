/**
 * 应用 Logo 图标库与渲染引擎
 * 支持预设矢量图形（自适应当前主题色彩）与自定义上传图片
 */

export const LOGO_PRESETS = [
  {
    id: "default",
    nameZh: "经典 Z·SWITCH",
    nameEn: "Classic Z",
    descZh: "品牌折线徽标 · 极速切换",
    descEn: "Brand geometric insignia",
    render: (size) => `
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="6" fill="var(--amber)" fill-opacity="0.16"/>
        <path d="M5.5 6.5H18.5L9.5 17.5H18.5" stroke="var(--amber)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="6" cy="6.5" r="1.5" fill="var(--amber)"/>
        <circle cx="18" cy="17.5" r="1.5" fill="var(--amber)"/>
      </svg>
    `
  },
  {
    id: "bolt",
    nameZh: "极速闪电",
    nameEn: "Thunder Bolt",
    descZh: "能量充沛 · 秒速响应",
    descEn: "High-speed switching",
    render: (size) => `
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="6" fill="var(--amber)" fill-opacity="0.16"/>
        <path d="M13 2.5L5.5 13.5H12L11 21.5L18.5 10.5H12L13 2.5Z" fill="var(--amber)" stroke="var(--amber)" stroke-width="1.2" stroke-linejoin="round"/>
      </svg>
    `
  },
  {
    id: "robot",
    nameZh: "灵动伴侣",
    nameEn: "Cyber Bot",
    descZh: "智能伙伴 · 科技可爱",
    descEn: "Intelligent companion",
    render: (size) => `
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="6" fill="var(--amber)" fill-opacity="0.16"/>
        <rect x="5.5" y="6.5" width="13" height="11" rx="3.5" stroke="var(--amber)" stroke-width="2" fill="none"/>
        <path d="M12 3V6.5" stroke="var(--amber)" stroke-width="2" stroke-linecap="round"/>
        <circle cx="9.2" cy="11.5" r="1.4" fill="var(--amber)"/>
        <circle cx="14.8" cy="11.5" r="1.4" fill="var(--amber)"/>
        <path d="M9.5 14.8C10.2 15.5 13.8 15.5 14.5 14.8" stroke="var(--amber)" stroke-width="1.6" stroke-linecap="round"/>
        <rect x="3.2" y="10" width="1.8" height="4" rx="0.9" fill="var(--amber)"/>
        <rect x="19" y="10" width="1.8" height="4" rx="0.9" fill="var(--amber)"/>
      </svg>
    `
  },
  {
    id: "shield",
    nameZh: "安全护盾",
    nameEn: "Quantum Shield",
    descZh: "独立隔离 · 稳定守护",
    descEn: "Safe isolated environment",
    render: (size) => `
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="6" fill="var(--amber)" fill-opacity="0.16"/>
        <path d="M12 4.5L18.5 7.5V12.2C18.5 16.5 15.6 19.8 12 21C8.4 19.8 5.5 16.5 5.5 12.2V7.5L12 4.5Z" stroke="var(--amber)" stroke-width="2" stroke-linejoin="round"/>
        <path d="M9.5 12.5L11.5 14.5L15 10" stroke="var(--amber)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `
  },
  {
    id: "planet",
    nameZh: "星轨探索",
    nameEn: "Orbit Planet",
    descZh: "浩瀚宇宙 · 跨维穿梭",
    descEn: "Cosmic multi-dimensional",
    render: (size) => `
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="6" fill="var(--amber)" fill-opacity="0.16"/>
        <circle cx="12" cy="12" r="5.2" fill="var(--amber)" fill-opacity="0.3" stroke="var(--amber)" stroke-width="1.8"/>
        <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(-26 12 12)" stroke="var(--amber)" stroke-width="1.8" stroke-dasharray="24 0" fill="none"/>
      </svg>
    `
  },
  {
    id: "cube",
    nameZh: "超维魔方",
    nameEn: "Hyper Cube",
    descZh: "立体分身 · 空间矩阵",
    descEn: "Spatial matrix cube",
    render: (size) => `
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="6" fill="var(--amber)" fill-opacity="0.16"/>
        <path d="M12 4.5L18.5 8.2V15.8L12 19.5L5.5 15.8V8.2L12 4.5Z" stroke="var(--amber)" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M12 4.5V19.5M18.5 8.2L12 12L5.5 8.2" stroke="var(--amber)" stroke-width="1.8" stroke-linejoin="round"/>
      </svg>
    `
  },
  {
    id: "chip",
    nameZh: "仿生算芯",
    nameEn: "Neural Chip",
    descZh: "算力核心 · 极客纯粹",
    descEn: "Neural compute core",
    render: (size) => `
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="6" fill="var(--amber)" fill-opacity="0.16"/>
        <rect x="7" y="7" width="10" height="10" rx="2" stroke="var(--amber)" stroke-width="2" fill="var(--amber)" fill-opacity="0.2"/>
        <path d="M10 10H14V14H10V10Z" fill="var(--amber)"/>
        <path d="M9 4V7M15 4V7M9 17V20M15 17V20M4 9H7M4 15H7M17 9H20M17 15H20" stroke="var(--amber)" stroke-width="1.6" stroke-linecap="round"/>
      </svg>
    `
  }
];

export function renderLogo(logoKey, size = 20, cls = "") {
  if (!logoKey || logoKey === "default") {
    const item = LOGO_PRESETS[0];
    return `<span class="app-logo-badge${cls ? " " + cls : ""}">${item.render(size)}</span>`;
  }

  // 自定义图片（base64 或 url）
  if (logoKey.startsWith("data:") || logoKey.startsWith("http") || logoKey.startsWith("blob:")) {
    return `<span class="app-logo-badge custom-img${cls ? " " + cls : ""}">
      <img src="${logoKey}" width="${size}" height="${size}" alt="Logo" class="app-logo-img" style="width:${size}px;height:${size}px;border-radius:5px;object-fit:cover;display:block;" />
    </span>`;
  }

  const preset = LOGO_PRESETS.find(p => p.id === logoKey) || LOGO_PRESETS[0];
  return `<span class="app-logo-badge${cls ? " " + cls : ""}">${preset.render(size)}</span>`;
}
