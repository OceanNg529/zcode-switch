import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { esc, toast, openPwModal, installDelegation, dismissSplash } from "./ui.js";
import { ic } from "./icons.js";
import { renderLogo, processMacAppIcon } from "./logo.js";
import { init, t, lang, stripErr } from "./i18n.js";

const $app = document.getElementById("app");
let state = null;
let autostart = false;
let busy = false;
let appVer = "";

const MODES = [
  { id: "system", labelKey: "s.themeSystem", descKey: "s.themeSystemDesc", icon: "monitor" },
  { id: "light", labelKey: "s.themeLight", descKey: "s.themeLightDesc", icon: "sun" },
  { id: "dark", labelKey: "s.themeDark", descKey: "s.themeDarkDesc", icon: "moon" },
];

const PALETTES = [
  { id: "paper-ivory", labelKey: "s.themePaperIvory", color: "#a8703f", bg: "#faf3e9", dotBorder: "#b8aa94" },
  { id: "cream-milk", labelKey: "s.themeCreamMilk", color: "#b22a2a", bg: "#f5e8d3", dotBorder: "#bfa37d" },
  { id: "spring-green", labelKey: "s.themeSpringGreen", color: "#3c7c4c", bg: "#e0f4e6", dotBorder: "#98c7a3" },
  { id: "mint-cyan", labelKey: "s.themeMintCyan", color: "#21858d", bg: "#ddf7f3", dotBorder: "#88cac1" },
  { id: "sky-azure", labelKey: "s.themeSkyAzure", color: "#1387c0", bg: "#e2f0f9", dotBorder: "#95bedd" },
  { id: "lilac-pastel", labelKey: "s.themeLilacPastel", color: "#bb5799", bg: "#f7e8f1", dotBorder: "#c99cb8" },
  { id: "royal-navy", labelKey: "s.themeRoyalNavy", color: "#fac75e", bg: "#082046", dotBorder: "#275bb0" },
];

function getEffectiveTheme(th) {
  const mode = th || "system";
  if (mode === "system") {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return mode;
}

function applyTheme(th) {
  if (!th) th = "system";
  localStorage.setItem("zcode_theme", th);
  document.documentElement.dataset.theme = getEffectiveTheme(th);
  document.documentElement.dataset.themeSetting = th;
}

if (window.matchMedia) {
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    const current = localStorage.getItem("zcode_theme") || "system";
    if (current === "system") {
      document.documentElement.dataset.theme = getEffectiveTheme("system");
    }
  });
}

async function refresh() {
  state = await invoke("get_state");
  autostart = await invoke("autostart_status").catch(() => false);
  if (state?.language) init(state.language);
  if (state?.theme) applyTheme(state.theme);
}

async function guard(fn) {
  if (busy) return;
  busy = true;
  try {
    await fn();
  } catch (e) {
    toast(stripErr(e), "err");
  } finally {
    busy = false;
  }
}

const actions = {
  async refresh() { await refresh(); render(); },

  async openGitHub() {
    await invoke("open_external", { url: "https://github.com/pjpv/zcode-switch" });
  },

  async setLang(l) {
    if (l === lang()) return;
    await guard(async () => {
      await invoke("set_language", { lang: l });
      await refresh(); render();
    });
  },

  async setTheme(th) {
    if (!th || th === (state?.theme || localStorage.getItem("zcode_theme"))) return;
    await guard(async () => {
      applyTheme(th);
      await invoke("set_theme", { theme: th });
      const item = [...MODES, ...PALETTES].find(tItem => tItem.id === th);
      const name = item ? t(item.labelKey) : th;
      toast(t("s.themeToast", { name }));
      await refresh(); render();
    });
  },

  async uploadLogo() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png,image/jpeg,image/webp,image/svg+xml";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      if (file.size > 2 * 1024 * 1024) {
        toast("图片大小请小于 2MB", "err");
        return;
      }
      const reader = new FileReader();
      reader.onload = async () => {
        const rawDataUrl = reader.result;
        if (typeof rawDataUrl === "string") {
          await guard(async () => {
            const dataUrl = await processMacAppIcon(rawDataUrl);
            await invoke("set_app_logo", { logo: dataUrl });
            try { localStorage.setItem("zcode_app_logo", dataUrl); } catch (_) {}
            const splashImg = document.getElementById("splash-img");
            if (splashImg) splashImg.src = dataUrl;
            toast(t("s.logoUploadToast"));
            await refresh(); render();
          });
        }
      };
      reader.readAsDataURL(file);
    };
    input.click();
  },

  async resetLogo() {
    await guard(async () => {
      await invoke("set_app_logo", { logo: "default" });
      try { localStorage.removeItem("zcode_app_logo"); } catch (_) {}
      toast(t("s.logoResetToast"));
      await refresh(); render();
    });
  },

  async toggleAutostart() {
    await guard(async () => {
      const v = await invoke("autostart_set", { enable: !autostart });
      autostart = v;
      toast(v ? t("s.autostartOnToast") : t("s.autostartOffToast"));
      render();
    });
  },

  async toggleBehavior(key) {
    await guard(async () => {
      await invoke("set_behavior", {
        launchAfterSwitch: key === "launch" ? !state.launch_after_switch : null,
        closeToTray: key === "tray" ? !state.close_to_tray : null,
        hotSwitch: key === "hot" ? !state.hot_switch : null,
      });
      await refresh(); render();
      toast(t("s.savedToast"));
    });
  },

  async exportAll() {
    await guard(async () => {
      const p = await invoke("export_all_pick_path");
      if (!p.picked) { toast(t("m.exportCanceled")); return; }
      openPwModal({ mode: "exportAll", path: p.path, count: p.count, onDone: () => actions.refresh() });
    });
  },

  async importFiles() {
    await guard(async () => {
      const p = await invoke("import_pick_files");
      if (!p.picked) return;
      const sealed = p.sealed || [];
      const preErrors = p.errors || [];
      if (sealed.length) {
        openPwModal({ mode: "import", files: sealed, preErrors, onDone: (rep) => actions.finishImport(rep) });
        return;
      }
      actions.finishImport({ added: [], skipped: [], errors: preErrors });
    });
  },

  finishImport(report) {
    if (report.added.length === 0 && report.skipped.length === 0) {
      toast(t("s.importNone"), "err", report.errors.join(t("common.listSep")) || undefined);
    } else {
      const parts = [];
      if (report.added.length) parts.push(t("s.importAdded", { count: report.added.length, names: report.added.join(t("common.listSep")) }));
      if (report.skipped.length) parts.push(t("s.importSkipped", { count: report.skipped.length }));
      if (report.errors.length) parts.push(t("s.importFailed", { count: report.errors.length }));
      toast(parts[0], report.errors.length ? "err" : "ok", parts.slice(1).join(t("common.listSep")));
    }
    refresh().then(render);
  },

  async browsePath() {
    await guard(async () => {
      const r = await invoke("pick_zcode_path");
      if (r.picked) {
        await invoke("set_zcode_path", { path: r.path });
        toast(t("s.pathUpdated"));
        await refresh(); render();
      }
    });
  },

  async savePath() {
    const input = document.querySelector(".settings input.zcode-path:not(.auth-proxy)");
    if (!input) return;
    const v = input.value.trim();
    await guard(async () => {
      await invoke("set_zcode_path", { path: v });
      toast(v ? t("s.pathUpdated") : t("s.pathAuto"));
      await refresh(); render();
    });
  },

  async toggleAuthProxy() {
    const input = document.querySelector(".settings input.auth-proxy");
    const url = (input?.value || "").trim() || state.auth_proxy_url || null;
    await guard(async () => {
      await invoke("set_auth_proxy", { on: !state.auth_proxy_on, url });
      await refresh(); render();
      toast(state.auth_proxy_on ? t("s.proxyOnToast") : t("s.proxyOffToast"), "ok", t("s.proxyOnDetail"));
    });
  },

  async saveProxy() {
    const input = document.querySelector(".settings input.auth-proxy");
    if (!input) return;
    await guard(async () => {
      await invoke("set_auth_proxy", { on: state.auth_proxy_on, url: input.value.trim() });
      await refresh(); render();
      toast(t("s.proxySaved"), "ok",
        state.auth_proxy_on ? t("s.proxySavedOn") : t("s.proxySavedOff"));
    });
  },
};

const toggle = (on, onclickAttr, label, desc) => `
  <div class="tog-row">
    <div class="tog-info"><div class="tog-label">${label}</div><div class="tog-desc">${desc}</div></div>
    <button class="toggle${on ? " on" : ""}" role="switch" aria-checked="${on}" aria-label="${label}" click="${onclickAttr}">
      <span class="knob"></span>
    </button>
  </div>`;

const langSeg = (cur) => `
  <div class="tog-row">
    <div class="tog-info"><div class="tog-label">${t("s.langLabel")}</div></div>
    <div class="lang-seg" role="radiogroup" aria-label="${t("s.langLabel")}">
      <button class="lang-opt${cur === "zh" ? " on" : ""}" role="radio" aria-checked="${cur === "zh"}" click="actions.setLang('zh')">${t("s.langZh")}</button>
      <button class="lang-opt${cur === "en" ? " on" : ""}" role="radio" aria-checked="${cur === "en"}" click="actions.setLang('en')">${t("s.langEn")}</button>
    </div>
  </div>`;

const themeSeg = (cur) => `
  <div class="theme-section">
    <label style="margin-top:2px">${t("s.themeLabel")}</label>
    <div class="theme-mode-grid" role="radiogroup" aria-label="${t("s.themeLabel")}">
      ${MODES.map((m) => {
        const active = cur === m.id;
        return `
          <button class="theme-mode-card${active ? " on" : ""}" role="radio" aria-checked="${active}" click="actions.setTheme('${m.id}')">
            <div class="theme-mode-head">
              <span class="theme-icon-wrap">${ic(m.icon, 16)}</span>
              <span class="theme-mode-title">${t(m.labelKey)}</span>
              <span class="theme-mode-check">${ic("check", 13)}</span>
            </div>
            <div class="theme-mode-desc">${t(m.descKey)}</div>
          </button>`;
      }).join("")}
    </div>

    <label style="margin-top:10px">${t("s.themeColorsLabel")}</label>
    <div class="theme-grid" role="radiogroup" aria-label="${t("s.themeColorsLabel")}">
      ${PALETTES.map((th) => {
        const active = cur === th.id;
        const borderStyle = th.dotBorder ? `border: 1.5px solid ${th.dotBorder};` : "";
        const dotBg = `background: linear-gradient(135deg, ${th.bg} 50%, ${th.color} 50%);`;
        return `
          <button class="theme-card${active ? " on" : ""}" role="radio" aria-checked="${active}" click="actions.setTheme('${th.id}')">
            <span class="theme-dot" style="${dotBg}${borderStyle}"></span>
            <span class="theme-name">${t(th.labelKey)}</span>
          </button>`;
      }).join("")}
    </div>
  </div>`;

const logoSeg = (curLogo) => {
  const isCustom = curLogo && (curLogo.startsWith("data:") || curLogo.startsWith("http") || curLogo.startsWith("blob:"));
  return `
    <div class="theme-section">
      <label style="margin-top:10px">${t("s.logoLabel")}</label>
      <div class="logo-custom-panel${isCustom ? " is-active" : ""}">
        <div class="logo-custom-left">
          <div class="logo-custom-preview">
            ${renderLogo(curLogo, 26)}
          </div>
          <div class="logo-custom-text">
            <div class="title">${isCustom ? t("s.logoCustomActive") : t("s.logoDefaultActive")}</div>
            <div class="desc">${t("s.logoDesc")}</div>
          </div>
        </div>
        <div class="logo-custom-actions">
          <button class="btn-ghost" click="actions.uploadLogo()">${isCustom ? t("s.logoChangeBtn") : t("s.logoUploadBtn")}</button>
          <button class="btn-ghost" click="actions.resetLogo()" ${isCustom ? "" : "disabled"}>${t("s.logoResetBtn")}</button>
        </div>
      </div>
    </div>`;
};

function render() {
  if (!state) {
    $app.innerHTML = `<div class="loading">LOADING</div>`;
    return;
  }
  const s = state;
  document.title = `Z·SWITCH ${t("s.title")}`;
  $app.innerHTML = `
    <header class="topbar">
      <div class="brand-group">
        <div class="app-logo-badge">${renderLogo(s.app_logo, 20)}</div>
        <div class="wordmark">Z·SWITCH <span class="ver">/ ${t("s.title")}</span></div>
      </div>
    </header>
    <section class="settings open">
      ${themeSeg(s.theme || "system")}
      ${logoSeg(s.app_logo || "default")}
      ${langSeg(s.language || "zh")}
      <label>BEHAVIOR · ${t("s.behaviorLabel")}</label>
      ${toggle(autostart, "actions.toggleAutostart()", t("s.autostart"), t("s.autostartDesc"))}
      ${toggle(s.launch_after_switch, "actions.toggleBehavior('launch')", t("s.launchAfter"), t("s.launchAfterDesc"))}
      ${toggle(s.close_to_tray, "actions.toggleBehavior('tray')", t("s.closeTray"), t("s.closeTrayDesc"))}
      ${toggle(s.hot_switch, "actions.toggleBehavior('hot')", t("s.hotSwitch"), t("s.hotSwitchDesc"))}
      <label style="margin-top:14px">${t("s.authLabel")}</label>
      ${toggle(s.auth_proxy_on, "actions.toggleAuthProxy()", t("s.proxyToggle"), t("s.proxyToggleDesc"))}
      <div class="path-line" style="margin-top:6px">
        <input class="zcode-path auth-proxy" type="text" value="${esc(s.auth_proxy_url || "")}"
          placeholder="${t("s.proxyPh")}" keydown="onProxyKey(event)">
        <button class="btn-ghost" click="actions.saveProxy()">${t("common.save")}</button>
      </div>
      <label style="margin-top:14px">${t("s.libLabel")}</label>
      <div class="lib-row">
        <button class="btn-ghost has-ic" click="actions.importFiles()">${ic("import", 14)} ${t("s.importBtn")}</button>
        <button class="btn-ghost has-ic" click="actions.exportAll()" ${s.accounts.length ? "" : "disabled"}>${ic("exportAll", 14)} ${t("s.exportAllBtn")}</button>
      </div>
      <label style="margin-top:14px">${t("s.pathLabel")}</label>
      <div class="path-line">
        <input class="zcode-path" type="text" value="${esc(s.zcode_path)}" placeholder="C:\\Program Files\\ZCode\\ZCode.exe" keydown="onPathKey(event)">
        <button class="btn-ghost" click="actions.browsePath()">${t("s.browse")}</button>
        <button class="btn-ghost" click="actions.savePath()">${t("common.save")}</button>
      </div>
      <div class="hint">${t("s.hint")}</div>
      <div class="gh-row"><a class="gh-link" href="https://github.com/pjpv/zcode-switch" target="_blank" rel="noopener" click="actions.openGitHub()">${t("s.githubLink")}</a>${appVer ? `<span class="ver">v${esc(appVer)}</span>` : ""}</div>
    </section>`;
}

window.actions = actions;
window.onPathKey = (e) => { if (e.key === "Enter") actions.savePath(); };
window.onProxyKey = (e) => { if (e.key === "Enter") actions.saveProxy(); };
installDelegation();

listen("state-changed", () => {
  refresh().then(render).catch(() => {});
});

listen("theme-changed", (e) => {
  if (e.payload) {
    applyTheme(e.payload);
    if (state) state.theme = e.payload;
    render();
  }
});

listen("logo-changed", (e) => {
  if (state && e.payload) {
    state.app_logo = e.payload;
    try {
      if (e.payload && e.payload !== "default") {
        localStorage.setItem("zcode_app_logo", e.payload);
      } else {
        localStorage.removeItem("zcode_app_logo");
      }
    } catch (_) {}
    render();
  }
});

(async () => {
  try {
    appVer = await invoke("app_version").catch(() => "");
    await refresh();
    if (state?.app_logo) {
      try {
        if (state.app_logo !== "default") {
          localStorage.setItem("zcode_app_logo", state.app_logo);
        } else {
          localStorage.removeItem("zcode_app_logo");
        }
      } catch (_) {}
    }
    render();
    dismissSplash();
  } catch (e) {
    $app.innerHTML = `<div class="loading" style="color:var(--red)">${t("common.loadFail", { e: esc(String(e)) })}</div>`;
    dismissSplash();
  }
})();
