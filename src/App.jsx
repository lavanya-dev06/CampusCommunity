import { useState, useEffect, useRef } from "react";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ─────────────────────────────────────────────────────────────
// PASTE YOUR SUPABASE VALUES HERE
// ─────────────────────────────────────────────────────────────
const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────
const Icon = ({ name, size = 18, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={style}>
    {name==="hash"       && <><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></>}
    {name==="send"       && <><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></>}
    {name==="logout"     && <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>}
    {name==="reply"      && <><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></>}
    {name==="megaphone"  && <><path d="M3 11l18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></>}
    {name==="book"       && <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></>}
    {name==="users"      && <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>}
    {name==="check"      && <polyline points="20 6 9 17 4 12"/>}
    {name==="x"          && <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>}
    {name==="google"     && <path d="M20.283 10.356h-8.327v3.451h4.792c-.446 2.193-2.313 3.453-4.792 3.453a5.27 5.27 0 0 1-5.279-5.28 5.27 5.27 0 0 1 5.279-5.279c1.259 0 2.397.447 3.29 1.178l2.6-2.599c-1.584-1.381-3.615-2.233-5.89-2.233a8.908 8.908 0 0 0-8.934 8.934 8.908 8.908 0 0 0 8.934 8.934c4.467 0 8.529-3.249 8.529-8.934 0-.528-.081-1.097-.202-1.625z"/>}
    {name==="search"     && <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>}
    {name==="plus"       && <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>}
    {name==="paperclip"  && <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>}
    {name==="download"   && <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>}
    {name==="file"       && <><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></>}
    {name==="image"      && <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></>}
  </svg>
);

// ─────────────────────────────────────────────────────────────
// CONSTANTS & HELPERS
// ─────────────────────────────────────────────────────────────
const fmtTime  = (ts) => new Date(ts).toLocaleString("en-IN", { day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit" });
const avatar   = (n="") => n.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
const COLORS   = ["#4f46e5","#0891b2","#059669","#d97706","#dc2626","#7c3aed","#db2777"];
const avatarColor = (s="") => COLORS[s.charCodeAt(0) % COLORS.length];

const fmtBytes = (b) => {
  if (!b) return "";
  if (b < 1024)           return b + " B";
  if (b < 1024*1024)      return (b/1024).toFixed(1) + " KB";
  return (b/(1024*1024)).toFixed(1) + " MB";
};

const fileCat = (mime="", name="") => {
  if (mime.startsWith("image/"))  return "image";
  if (mime.startsWith("video/"))  return "video";
  if (mime.startsWith("audio/"))  return "audio";
  if (mime==="application/pdf" || name.endsWith(".pdf")) return "pdf";
  return "file";
};

const fileEmoji = (cat) => ({ image:"🖼️", video:"🎬", audio:"🎵", pdf:"📄", file:"📎" }[cat] || "📎");

const MAX_MB   = 20;
const MAX_SIZE = MAX_MB * 1024 * 1024;

const ROOM_TYPES = [
  { value:"club",       label:"Club",       icon:"🎯" },
  { value:"department", label:"Department", icon:"🏛️" },
  { value:"project",    label:"Project",    icon:"🚀" },
  { value:"study",      label:"Study",      icon:"📚" },
  { value:"sports",     label:"Sports",     icon:"⚽" },
  { value:"general",    label:"General",    icon:"💬" },
];

const FILTER_TABS = [
  { key:"all",     label:"All" },
  { key:"club",    label:"🎯 Clubs" },
  { key:"dept",    label:"🏛️ Departments" },
  { key:"project", label:"🚀 Projects & Study" },
  { key:"sports",  label:"⚽ Sports" },
  { key:"joined",  label:"✅ Joined" },
];

// ─────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  :root{
    --bg:#0f0f13;--bg2:#16161d;--bg3:#1e1e28;--bg4:#252530;
    --border:rgba(255,255,255,.07);--border2:rgba(255,255,255,.12);
    --text:#e8e8f0;--text2:#9898b0;--text3:#5a5a6e;
    --accent:#6c63ff;--accent2:#8b85ff;--accent-bg:rgba(108,99,255,.12);
    --red:#f87171;--amber:#fbbf24;
  }
  body{font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;}

  /* ── AUTH ── */
  .auth-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1rem;}
  .auth-card{background:var(--bg2);border:1px solid var(--border2);border-radius:20px;padding:3rem 2.5rem;width:100%;max-width:420px;}
  .auth-logo{font-size:1.05rem;font-weight:600;color:var(--text2);letter-spacing:.05em;text-transform:uppercase;margin-bottom:2rem;}
  .auth-title{font-size:2rem;font-weight:600;margin-bottom:.4rem;line-height:1.2;}
  .auth-sub{color:var(--text2);font-size:.9rem;margin-bottom:2rem;line-height:1.5;}
  .auth-input{width:100%;background:var(--bg3);border:1px solid var(--border2);border-radius:10px;padding:.75rem 1rem;color:var(--text);font-size:.95rem;font-family:inherit;margin-bottom:.75rem;outline:none;transition:border-color .2s;}
  .auth-input:focus{border-color:var(--accent);}
  .auth-btn{width:100%;background:var(--accent);border:none;border-radius:10px;padding:.8rem 1rem;color:#fff;font-size:.95rem;font-weight:500;font-family:inherit;cursor:pointer;transition:opacity .2s;}
  .auth-btn:hover{opacity:.88;}.auth-btn:disabled{opacity:.5;cursor:not-allowed;}
  .auth-divider{display:flex;align-items:center;gap:1rem;color:var(--text3);font-size:.8rem;margin:1rem 0;}
  .auth-divider::before,.auth-divider::after{content:'';flex:1;height:1px;background:var(--border);}
  .google-btn{width:100%;background:var(--bg3);border:1px solid var(--border2);border-radius:10px;padding:.75rem 1rem;color:var(--text);font-size:.9rem;font-family:inherit;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:.6rem;transition:background .2s;}
  .google-btn:hover{background:var(--bg4);}
  .auth-toggle{text-align:center;margin-top:1.5rem;font-size:.85rem;color:var(--text2);}
  .auth-toggle span{color:var(--accent2);cursor:pointer;}
  .auth-error{background:rgba(248,113,113,.12);border:1px solid rgba(248,113,113,.3);border-radius:8px;padding:.6rem .9rem;color:var(--red);font-size:.85rem;margin-bottom:1rem;}

  /* ── LAYOUT ── */
  .layout{display:flex;height:100vh;overflow:hidden;}

  /* ── SIDEBAR ── */
  .sidebar{width:260px;flex-shrink:0;background:var(--bg2);border-right:1px solid var(--border);display:flex;flex-direction:column;overflow:hidden;}
  .sidebar-top{padding:1.2rem 1rem 0;}
  .sidebar-brand{font-size:.85rem;font-weight:600;color:var(--text2);text-transform:uppercase;letter-spacing:.08em;padding:0 .5rem 1rem;display:flex;align-items:center;gap:.5rem;}
  .brand-dot{width:8px;height:8px;border-radius:50%;background:var(--accent);}
  .sidebar-scroll{flex:1;overflow-y:auto;padding:0 1rem 1rem;}
  .sidebar-scroll::-webkit-scrollbar{width:4px;}
  .sidebar-scroll::-webkit-scrollbar-thumb{background:var(--border2);border-radius:4px;}
  .sidebar-section{margin-bottom:1.5rem;}
  .section-label{font-size:.68rem;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.1em;padding:0 .5rem;margin-bottom:.4rem;}
  .room-item{display:flex;align-items:center;gap:.6rem;padding:.45rem .6rem;border-radius:8px;cursor:pointer;font-size:.88rem;color:var(--text2);transition:all .15s;}
  .room-item:hover{background:var(--bg3);color:var(--text);}
  .room-item.active{background:var(--accent-bg);color:var(--accent2);}
  .room-emoji{flex-shrink:0;font-size:.85rem;}
  .room-name{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  .badge{background:var(--accent);color:#fff;border-radius:999px;font-size:.65rem;font-weight:600;padding:1px 6px;min-width:18px;text-align:center;flex-shrink:0;}
  .sidebar-footer{padding:1rem;border-top:1px solid var(--border);}
  .user-row{display:flex;align-items:center;gap:.7rem;}
  .u-avatar{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:600;color:#fff;flex-shrink:0;}
  .u-info{flex:1;overflow:hidden;}
  .u-name{font-size:.85rem;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .u-id{font-size:.72rem;color:var(--text3);font-family:'DM Mono',monospace;}
  .logout-btn{background:none;border:none;color:var(--text3);cursor:pointer;padding:4px;border-radius:6px;display:flex;transition:color .15s;}
  .logout-btn:hover{color:var(--red);}

  /* ── MAIN ── */
  .main{flex:1;display:flex;flex-direction:column;overflow:hidden;}
  .chan-header{padding:1rem 1.5rem;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:.8rem;flex-shrink:0;}
  .chan-name{font-size:1rem;font-weight:600;}
  .chan-desc{font-size:.82rem;color:var(--text2);}
  .member-count{margin-left:auto;display:flex;align-items:center;gap:.4rem;font-size:.8rem;color:var(--text3);}

  /* ── MESSAGES ── */
  .msgs{flex:1;overflow-y:auto;padding:1.5rem;display:flex;flex-direction:column;gap:.5rem;}
  .msgs::-webkit-scrollbar{width:5px;}
  .msgs::-webkit-scrollbar-thumb{background:var(--border2);border-radius:4px;}
  .msg-group{display:flex;gap:.75rem;padding:.3rem 0;}
  .msg-av{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:600;color:#fff;flex-shrink:0;margin-top:2px;}
  .msg-body{flex:1;}
  .msg-meta{display:flex;align-items:baseline;gap:.6rem;margin-bottom:.2rem;}
  .msg-author{font-size:.88rem;font-weight:600;}
  .msg-time{font-size:.72rem;color:var(--text3);font-family:'DM Mono',monospace;}
  .msg-role{font-size:.65rem;background:var(--accent-bg);color:var(--accent2);padding:1px 6px;border-radius:4px;font-weight:500;}
  .msg-text{font-size:.9rem;line-height:1.6;color:var(--text);white-space:pre-wrap;word-break:break-word;}
  .msg-text.ann{color:var(--amber);}
  .reply-btn{background:none;border:none;color:var(--text3);font-size:.75rem;font-family:inherit;cursor:pointer;display:flex;align-items:center;gap:.3rem;margin-top:.3rem;padding:2px 0;transition:color .15s;}
  .reply-btn:hover{color:var(--accent2);}
  .replies{margin-top:.5rem;padding-left:1rem;border-left:2px solid var(--border2);display:flex;flex-direction:column;gap:.4rem;}
  .reply-row{display:flex;gap:.5rem;align-items:flex-start;}
  .reply-av{width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.55rem;font-weight:600;color:#fff;flex-shrink:0;}
  .reply-body{flex:1;}
  .reply-author{font-size:.78rem;font-weight:600;}
  .reply-time{font-size:.68rem;color:var(--text3);margin-left:.4rem;}
  .reply-text{font-size:.82rem;color:var(--text2);line-height:1.5;}
  .reply-input-wrap{background:var(--bg3);border:1px solid var(--border2);border-radius:8px;padding:.4rem .6rem;display:flex;gap:.4rem;margin-top:.4rem;}
  .reply-input{flex:1;background:none;border:none;color:var(--text);font-size:.82rem;font-family:inherit;outline:none;}
  .reply-send{background:var(--accent);border:none;border-radius:5px;color:#fff;cursor:pointer;padding:3px 8px;display:flex;align-items:center;}

  /* ── FILE ATTACHMENT (in message) ── */
  .att-image{display:block;margin-top:.5rem;border-radius:10px;overflow:hidden;max-width:320px;border:1px solid var(--border2);text-decoration:none;}
  .att-image img{width:100%;display:block;max-height:220px;object-fit:cover;}
  .att-image-footer{display:flex;justify-content:space-between;align-items:center;padding:.35rem .6rem;background:var(--bg3);font-size:.72rem;color:var(--text3);}
  .att-file{display:inline-flex;align-items:center;gap:.6rem;background:var(--bg3);border:1px solid var(--border2);border-radius:10px;padding:.55rem .85rem;margin-top:.5rem;text-decoration:none;max-width:320px;transition:border-color .2s;}
  .att-file:hover{border-color:var(--accent);}
  .att-file-icon{width:32px;height:32px;border-radius:7px;background:var(--accent-bg);display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0;}
  .att-file-info{flex:1;overflow:hidden;}
  .att-file-name{font-size:.82rem;font-weight:500;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .att-file-meta{font-size:.7rem;color:var(--text3);}
  .att-file-dl{color:var(--text3);flex-shrink:0;transition:color .2s;}
  .att-file:hover .att-file-dl{color:var(--accent2);}

  /* ── INPUT BAR ── */
  .input-bar{padding:1rem 1.5rem 1.5rem;flex-shrink:0;}
  .input-outer{border:1px solid var(--border2);border-radius:12px;overflow:hidden;transition:border-color .2s;background:var(--bg3);}
  .input-outer:focus-within{border-color:var(--accent);}
  .file-strip{display:flex;align-items:center;gap:.6rem;padding:.5rem .9rem;border-bottom:1px solid var(--border2);}
  .file-strip-icon{font-size:1rem;flex-shrink:0;}
  .file-strip-name{flex:1;font-size:.82rem;color:var(--text2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  .file-strip-size{font-size:.72rem;color:var(--text3);flex-shrink:0;}
  .file-strip-remove{background:none;border:none;color:var(--text3);cursor:pointer;padding:2px;display:flex;transition:color .15s;}
  .file-strip-remove:hover{color:var(--red);}
  .progress-bar{height:3px;background:var(--accent-bg);}
  .progress-fill{height:100%;background:var(--accent);transition:width .3s ease;}
  .input-row{display:flex;align-items:flex-end;gap:.5rem;padding:.65rem .9rem;}
  .attach-btn{background:none;border:none;color:var(--text3);cursor:pointer;padding:4px;border-radius:6px;display:flex;transition:color .15s;flex-shrink:0;}
  .attach-btn:hover{color:var(--accent2);}
  .msg-input{flex:1;background:none;border:none;color:var(--text);font-size:.9rem;font-family:inherit;outline:none;resize:none;max-height:120px;line-height:1.5;}
  .msg-input::placeholder{color:var(--text3);}
  .send-btn{background:var(--accent);border:none;border-radius:8px;color:#fff;cursor:pointer;padding:6px 10px;display:flex;align-items:center;flex-shrink:0;transition:opacity .2s;}
  .send-btn:hover{opacity:.88;}.send-btn:disabled{opacity:.4;cursor:not-allowed;}
  .no-post{padding:.75rem 1.5rem;color:var(--text3);font-size:.82rem;border-top:1px solid var(--border);flex-shrink:0;}

  /* ── DISCOVER ── */
  .discover{flex:1;overflow-y:auto;padding:2rem;}
  .discover::-webkit-scrollbar{width:5px;}
  .discover-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:1rem;gap:1rem;}
  .discover-title{font-size:1.3rem;font-weight:600;margin-bottom:.3rem;}
  .discover-sub{color:var(--text2);font-size:.88rem;}
  .create-btn{display:flex;align-items:center;gap:.4rem;background:var(--accent);border:none;border-radius:8px;color:#fff;font-size:.82rem;font-weight:500;font-family:inherit;padding:.5rem .9rem;cursor:pointer;white-space:nowrap;transition:opacity .2s;flex-shrink:0;}
  .create-btn:hover{opacity:.88;}
  .filter-tabs{display:flex;gap:.4rem;flex-wrap:wrap;margin-bottom:1rem;}
  .ftab{padding:.3rem .75rem;border-radius:999px;font-size:.78rem;font-family:inherit;cursor:pointer;background:var(--bg3);border:1px solid var(--border2);color:var(--text2);transition:all .2s;}
  .ftab.active{font-weight:600;background:var(--accent-bg);border-color:var(--accent);color:var(--accent2);}
  .search-box{background:var(--bg3);border:1px solid var(--border2);border-radius:10px;display:flex;align-items:center;gap:.6rem;padding:.6rem .9rem;margin-bottom:1.5rem;}
  .search-input{flex:1;background:none;border:none;color:var(--text);font-size:.9rem;font-family:inherit;outline:none;}
  .search-input::placeholder{color:var(--text3);}
  .group-section{margin-bottom:2rem;}
  .group-label{font-size:.75rem;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.1em;margin-bottom:.75rem;}
  .rooms-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:.75rem;}
  .room-card{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:1rem 1.1rem;transition:all .2s;}
  .room-card:hover{border-color:var(--border2);background:var(--bg3);}
  .room-card.joined{border-color:rgba(108,99,255,.3);}
  .rc-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:.3rem;}
  .rc-name{font-size:.9rem;font-weight:500;}
  .rc-type{display:inline-block;font-size:.65rem;background:var(--bg4);border:1px solid var(--border2);color:var(--text3);padding:1px 7px;border-radius:4px;margin-bottom:.4rem;}
  .rc-desc{font-size:.8rem;color:var(--text2);line-height:1.4;margin-bottom:.4rem;}
  .rc-creator{font-size:.72rem;color:var(--text3);margin-bottom:.6rem;}
  .rc-footer{display:flex;align-items:center;justify-content:space-between;}
  .rc-count{font-size:.75rem;color:var(--text3);display:flex;align-items:center;gap:.3rem;}
  .join-btn{font-size:.78rem;font-weight:500;font-family:inherit;border-radius:6px;padding:4px 12px;cursor:pointer;border:1px solid;transition:all .2s;}
  .join-btn.join{background:var(--accent);border-color:var(--accent);color:#fff;}
  .join-btn.join:hover{opacity:.85;}
  .join-btn.leave{background:transparent;border-color:var(--border2);color:var(--text2);}
  .join-btn.leave:hover{border-color:var(--red);color:var(--red);}

  /* ── MODAL ── */
  .overlay{position:fixed;inset:0;background:rgba(0,0,0,.65);display:flex;align-items:center;justify-content:center;z-index:200;padding:1rem;}
  .modal{background:var(--bg2);border:1px solid var(--border2);border-radius:18px;padding:2rem;width:100%;max-width:480px;max-height:90vh;overflow-y:auto;}
  .modal::-webkit-scrollbar{width:4px;}
  .modal::-webkit-scrollbar-thumb{background:var(--border2);border-radius:4px;}
  .modal-title{font-size:1.15rem;font-weight:600;margin-bottom:.3rem;}
  .modal-sub{font-size:.83rem;color:var(--text2);margin-bottom:1.5rem;line-height:1.5;}
  .modal-label{font-size:.75rem;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:.45rem;display:block;}
  .modal-input{width:100%;background:var(--bg3);border:1px solid var(--border2);border-radius:8px;padding:.65rem .9rem;color:var(--text);font-size:.9rem;font-family:inherit;outline:none;transition:border-color .2s;margin-bottom:1.1rem;}
  .modal-input:focus{border-color:var(--accent);}
  .modal-select{appearance:none;}
  .modal-ta{resize:vertical;min-height:72px;}
  .type-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.5rem;margin-bottom:1.1rem;}
  .type-card{background:var(--bg3);border:1px solid var(--border2);border-radius:8px;padding:.65rem .5rem;cursor:pointer;text-align:center;transition:all .2s;}
  .type-card:hover{background:var(--bg4);}
  .type-card.sel{background:var(--accent-bg);border-color:var(--accent);}
  .type-icon{font-size:1.3rem;margin-bottom:.25rem;}
  .type-label{font-size:.73rem;font-weight:500;color:var(--text2);}
  .type-card.sel .type-label{color:var(--accent2);}
  .modal-row{display:flex;gap:.75rem;margin-top:.5rem;}
  .modal-btn{flex:1;padding:.7rem 1rem;border-radius:8px;font-size:.88rem;font-weight:500;font-family:inherit;cursor:pointer;border:1px solid;transition:all .2s;}
  .modal-btn.primary{background:var(--accent);border-color:var(--accent);color:#fff;}
  .modal-btn.primary:hover{opacity:.88;}.modal-btn.primary:disabled{opacity:.5;cursor:not-allowed;}
  .modal-btn.secondary{background:transparent;border-color:var(--border2);color:var(--text2);}
  .modal-btn.secondary:hover{color:var(--text);}
  .modal-err{background:rgba(248,113,113,.12);border:1px solid rgba(248,113,113,.3);border-radius:8px;padding:.5rem .85rem;color:var(--red);font-size:.82rem;margin-bottom:1rem;}

  /* ── MISC ── */
  .empty{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:var(--text3);gap:.75rem;padding:2rem;}
  .empty-icon{opacity:.3;}
  .empty p{font-size:.88rem;text-align:center;max-width:260px;line-height:1.5;}
  .toast{position:fixed;bottom:1.5rem;right:1.5rem;background:var(--bg4);border:1px solid var(--border2);border-radius:10px;padding:.7rem 1rem;font-size:.85rem;color:var(--text);z-index:999;animation:su .3s ease;}
  @keyframes su{from{transform:translateY(10px);opacity:0;}to{transform:translateY(0);opacity:1;}}
  @media(max-width:700px){.sidebar{width:200px;}.discover{padding:1rem;}.rooms-grid{grid-template-columns:1fr;}.type-grid{grid-template-columns:repeat(2,1fr);}}
`;

// ─────────────────────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast,   setToast]   = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3500); };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id); else setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_ev, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else { setProfile(null); setLoading(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (uid) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", uid).single();
    setProfile(data); setLoading(false);
  };

  if (loading) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:"#0f0f13",color:"#6c63ff",fontFamily:"sans-serif"}}>
      <style>{css}</style>Loading…
    </div>
  );

  return (
    <>
      <style>{css}</style>
      {toast && <div className="toast">{toast}</div>}
      {!session   ? <AuthScreen showToast={showToast}/>
      : !profile  ? <CompleteProfile session={session} onDone={() => fetchProfile(session.user.id)} showToast={showToast}/>
                  : <Dashboard profile={profile} session={session} showToast={showToast}/>}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// AUTH SCREEN
// ─────────────────────────────────────────────────────────────
function AuthScreen({ showToast }) {
  const [mode,      setMode]      = useState("login");
  const [name,      setName]      = useState("");
  const [studentId, setStudentId] = useState("");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [error,     setError]     = useState("");
  const [loading,   setLoading]   = useState(false);

  const submit = async () => {
    setError(""); setLoading(true);
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) setError(error.message);
    } else {
      if (!name.trim())      { setError("Enter your full name.");     setLoading(false); return; }
      if (!studentId.trim()) { setError("Enter your Student ID.");    setLoading(false); return; }
      if (!email.trim())     { setError("Enter your Gmail address."); setLoading(false); return; }
      if (!password)         { setError("Choose a password.");        setLoading(false); return; }
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(), password,
        options: { data: { full_name: name.trim(), student_id: studentId.trim() } }
      });
      if (error) { setError(error.message); setLoading(false); return; }
      if (data.user) {
        const { data: ann } = await supabase.from("rooms").select("id").eq("is_announcement", true).single();
        if (ann) await supabase.from("room_members").upsert({ room_id: ann.id, user_id: data.user.id }, { onConflict: "room_id,user_id" });
        setMode("verify");
      }
    }
    setLoading(false);
  };



  if (mode === "verify") return (
    <div className="auth-wrap">
      <div className="auth-card" style={{textAlign:"center"}}>
        <div style={{fontSize:"3rem",marginBottom:"1rem"}}>📬</div>
        <h1 className="auth-title" style={{fontSize:"1.5rem"}}>Check your inbox</h1>
        <p className="auth-sub">
          Verification link sent to<br/>
          <strong style={{color:"var(--text)"}}>{email}</strong>.<br/><br/>
          Click the link to activate your account, then sign in.
        </p>
        <button className="auth-btn" onClick={() => setMode("login")}>Back to Sign in</button>
      </div>
    </div>
  );

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">🎓 CampusCommunity</div>
        <h1 className="auth-title">{mode==="login" ? "Welcome back" : "Join your campus"}</h1>
        <p className="auth-sub">{mode==="login" ? "Sign in with your Gmail" : "Create your account"}</p>
        {error && <div className="auth-error">{error}</div>}
        {mode==="register" && <>
          <input className="auth-input" placeholder="Full Name" value={name} onChange={e=>setName(e.target.value)}/>
          <input className="auth-input" placeholder="Student ID (e.g. 22CS1045)" value={studentId} onChange={e=>setStudentId(e.target.value)}/>
        </>}
        <input className="auth-input" type="email" placeholder="Gmail (e.g. you@gmail.com)" value={email} onChange={e=>setEmail(e.target.value)}/>
        {mode==="login" && <input className="auth-input" placeholder="Student ID" value={studentId} onChange={e=>setStudentId(e.target.value)}/>}
        <input className="auth-input" type="password" placeholder="Password" value={password}
          onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()}/>
        <button className="auth-btn" onClick={submit} disabled={loading||!email||!password}>
          {loading ? "Please wait…" : mode==="login" ? "Sign in" : "Create account"}
        </button>

        <div className="auth-toggle">
          {mode==="login"
            ? <>No account? <span onClick={()=>setMode("register")}>Register</span></>
            : <>Already registered? <span onClick={()=>setMode("login")}>Sign in</span></>}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// COMPLETE PROFILE  (for Google OAuth users)
// ─────────────────────────────────────────────────────────────
function CompleteProfile({ session, onDone, showToast }) {
  const [studentId, setStudentId] = useState(session.user.user_metadata?.student_id || "");
  const [course,    setCourse]    = useState("");
  const [year,      setYear]      = useState("");
  const [courses,   setCourses]   = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");

  useEffect(() => { supabase.from("courses").select("id,name").then(({ data }) => setCourses(data||[])); }, []);

  const save = async () => {
    if (!studentId||!course||!year) { setError("All fields are required."); return; }
    setLoading(true);
    const { error } = await supabase.from("profiles").upsert({
      id: session.user.id,
      full_name: session.user.user_metadata?.full_name || session.user.email,
      student_id: studentId.trim(), course_id: course,
      year: parseInt(year), email: session.user.email,
    });
    if (error) { setError(error.message); setLoading(false); return; }
    const { data: ann } = await supabase.from("rooms").select("id").eq("is_announcement", true).single();
    if (ann) await supabase.from("room_members").upsert({ room_id: ann.id, user_id: session.user.id }, { onConflict:"room_id,user_id" });
    showToast("Welcome aboard 🎉"); onDone(); setLoading(false);
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">🎓 CampusCommunity</div>
        <h1 className="auth-title">Complete your profile</h1>
        <p className="auth-sub">A few more details to get you set up.</p>
        {error && <div className="auth-error">{error}</div>}
        <input className="auth-input" placeholder="Student ID (e.g. 22CS1045)" value={studentId} onChange={e=>setStudentId(e.target.value)}/>
        <select className="auth-input" value={course} onChange={e=>setCourse(e.target.value)} style={{appearance:"none"}}>
          <option value="">Select your course</option>
          {courses.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select className="auth-input" value={year} onChange={e=>setYear(e.target.value)} style={{appearance:"none"}}>
          <option value="">Select year</option>
          {[1,2,3,4].map(y=><option key={y} value={y}>Year {y}</option>)}
        </select>
        <button className="auth-btn" onClick={save} disabled={loading}>{loading?"Saving…":"Get started"}</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────────────
function Dashboard({ profile, session, showToast }) {
  const [rooms,     setRooms]     = useState([]);
  const [active,    setActive]    = useState(null);
  const [tab,       setTab]       = useState("rooms");
  const [unread,    setUnread]    = useState({});
  const activeRef = useRef(null);

  useEffect(() => { loadRooms(); }, []);

  useEffect(() => {
    if (!rooms.length) return;
    calcUnread();
    const t = setInterval(calcUnread, 20000);
    return () => clearInterval(t);
  }, [rooms]);

  useEffect(() => {
    if (!rooms.length) return;
    const sub = supabase.channel("unread-watcher")
      .on("postgres_changes", { event:"INSERT", schema:"public", table:"messages" }, (p) => {
        const rid = p.new.room_id;
        if (!activeRef.current || activeRef.current.id !== rid)
          if (p.new.user_id !== session.user.id && rooms.some(r=>r.id===rid))
            setUnread(prev => ({...prev, [rid]:(prev[rid]||0)+1}));
      }).subscribe();
    return () => supabase.removeChannel(sub);
  }, [rooms]);

  const loadRooms = async () => {
    const { data } = await supabase.from("room_members").select("rooms(*)").eq("user_id", session.user.id);
    const rs = (data||[]).map(d=>d.rooms).filter(Boolean);
    setRooms(rs);
    const ann = rs.find(r=>r.is_announcement);
    if (ann && !activeRef.current) { setActive(ann); activeRef.current = ann; }
  };

  const calcUnread = async () => {
    if (!rooms.length) return;
    const { data: reads } = await supabase.from("room_reads").select("room_id,last_read").eq("user_id", session.user.id);
    const readMap = {}; (reads||[]).forEach(r => { readMap[r.room_id]=r.last_read; });
    const counts = {};
    await Promise.all(rooms.map(async r => {
      const since = readMap[r.id] || "1970-01-01";
      const { count } = await supabase.from("messages")
        .select("*",{count:"exact",head:true})
        .eq("room_id",r.id).is("parent_id",null)
        .neq("user_id",session.user.id).gt("created_at",since);
      counts[r.id] = count||0;
    }));
    setUnread(counts);
  };

  const openRoom = async (room) => {
    setActive(room); activeRef.current = room; setTab("rooms");
    setUnread(prev => ({...prev,[room.id]:0}));
    await supabase.from("room_reads").upsert(
      { user_id:session.user.id, room_id:room.id, last_read:new Date().toISOString() },
      { onConflict:"user_id,room_id" }
    );
  };

  const annRoom    = rooms.find(r=>r.is_announcement);
  const otherRooms = rooms.filter(r=>!r.is_announcement);
  const typeEmoji  = (t) => ROOM_TYPES.find(x=>x.value===t)?.icon || "💬";

  const RoomLink = ({ room }) => {
    const u = unread[room.id]||0;
    const isAct = active?.id===room.id && tab==="rooms";
    return (
      <div className={`room-item ${isAct?"active":""}`} onClick={()=>openRoom(room)}>
        <span className="room-emoji">{room.is_announcement ? "📢" : typeEmoji(room.room_type)}</span>
        <span className="room-name">{room.name}</span>
        {u>0 && <span className="badge">{u>99?"99+":u}</span>}
      </div>
    );
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="sidebar-brand"><div className="brand-dot"/>CampusCommunity</div>
        </div>
        <div className="sidebar-scroll">
          {annRoom && (
            <div className="sidebar-section">
              <div className="section-label">General</div>
              <RoomLink room={annRoom}/>
            </div>
          )}
          {otherRooms.length > 0 && (
            <div className="sidebar-section">
              <div className="section-label">My Rooms</div>
              {otherRooms.map(r=><RoomLink key={r.id} room={r}/>)}
            </div>
          )}
          <div className="sidebar-section">
            <div className={`room-item ${tab==="discover"?"active":""}`} onClick={()=>setTab("discover")}>
              <Icon name="search" size={14} style={{color:"var(--text3)",flexShrink:0}}/>
              <span className="room-name">Discover Rooms</span>
            </div>
          </div>
        </div>
        <div className="sidebar-footer">
          <div className="user-row">
            <div className="u-avatar" style={{background:avatarColor(profile.full_name)}}>{avatar(profile.full_name)}</div>
            <div className="u-info">
              <div className="u-name">{profile.full_name}</div>
              <div className="u-id">{profile.student_id}</div>
            </div>
            <button className="logout-btn" onClick={()=>supabase.auth.signOut()} title="Sign out">
              <Icon name="logout" size={16}/>
            </button>
          </div>
        </div>
      </aside>
      <main className="main">
        {tab==="discover"
          ? <DiscoverPanel session={session} joinedRooms={rooms}
              onJoin={()=>{loadRooms();showToast("Joined! ✅");}}
              onLeave={()=>{loadRooms();showToast("Left room.");}}/>
          : active
            ? <RoomView room={active} profile={profile} session={session} showToast={showToast}/>
            : <div className="empty">
                <div className="empty-icon"><Icon name="hash" size={40}/></div>
                <p>Pick a room from the sidebar or Discover new ones.</p>
              </div>
        }
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ROOM VIEW  (with file attachments)
// ─────────────────────────────────────────────────────────────
function RoomView({ room, profile, session, showToast }) {
  const [msgs,       setMsgs]       = useState([]);
  const [input,      setInput]      = useState("");
  const [sending,    setSending]    = useState(false);
  const [members,    setMembers]    = useState(0);
  const [pendingFile,setPendingFile]= useState(null);  // { file, previewUrl }
  const [uploadPct,  setUploadPct]  = useState(0);
  const bottomRef = useRef(null);
  const fileRef   = useRef(null);

  useEffect(() => {
    loadMsgs(); loadMembers();
    const sub = supabase.channel(`room:${room.id}`)
      .on("postgres_changes",{event:"INSERT",schema:"public",table:"messages",filter:`room_id=eq.${room.id}`},
        async (p) => {
          if (p.new.parent_id) { loadMsgs(); return; }
          const { data } = await supabase.from("messages")
            .select("*, profile:profiles(full_name,student_id,role)")
            .eq("id", p.new.id).single();
          if (!data) return;
          setMsgs(prev => {
            const idx = prev.findIndex(m => String(m.id).startsWith("temp-") && m.user_id===p.new.user_id && m.content===p.new.content);
            if (idx!==-1) { const n=[...prev]; n[idx]={...data,replies:[]}; return n; }
            return [...prev, {...data,replies:[]}];
          });
        }).subscribe();
    return () => supabase.removeChannel(sub);
  }, [room.id]);

  useEffect(() => { setInput(""); clearFile(); }, [room.id]);
  useEffect(() => { bottomRef.current?.scrollIntoView({behavior:"smooth"}); }, [msgs]);

  const loadMsgs = async () => {
    const { data: top, error } = await supabase.from("messages")
      .select("*, profile:profiles(full_name,student_id,role)")
      .eq("room_id",room.id).is("parent_id",null).order("created_at",{ascending:true});
    if (error) { console.error(error); return; }
    const { data: reps } = await supabase.from("messages")
      .select("*, profile:profiles(full_name,student_id)")
      .eq("room_id",room.id).not("parent_id","is",null).order("created_at",{ascending:true});
    const map = {};
    (reps||[]).forEach(r => { if (!map[r.parent_id]) map[r.parent_id]=[]; map[r.parent_id].push(r); });
    setMsgs((top||[]).map(m => ({...m, replies:map[m.id]||[]})));
  };

  const loadMembers = async () => {
    const { count } = await supabase.from("room_members").select("*",{count:"exact",head:true}).eq("room_id",room.id);
    setMembers(count||0);
  };

  // ── File selection ──
  const pickFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > MAX_SIZE) { showToast(`File too large. Max ${MAX_MB} MB.`); return; }
    const previewUrl = f.type.startsWith("image/") ? URL.createObjectURL(f) : null;
    setPendingFile({ file:f, previewUrl });
    e.target.value = "";
  };

  const clearFile = () => {
    if (pendingFile?.previewUrl) URL.revokeObjectURL(pendingFile.previewUrl);
    setPendingFile(null); setUploadPct(0);
  };

  // ── Upload to Supabase Storage ──
  const uploadFile = async (f) => {
    const ext      = f.name.split(".").pop();
    const safeName = f.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path     = `${session.user.id}-${Date.now()}-${safeName}`;
    setUploadPct(30);
    const { data, error } = await supabase.storage.from("attachments").upload(path, f, {
      cacheControl: "3600",
      upsert: true,
    });
    if (error) {
      console.error("Storage error:", error);
      throw new Error(error.message);
    }
    setUploadPct(90);
    const { data: urlData } = supabase.storage.from("attachments").getPublicUrl(path);
    setUploadPct(100);
    return { url: urlData.publicUrl, name: f.name, size: f.size, mime: f.type, cat: fileCat(f.type, f.name) };
  };

  // ── Send ──
  const send = async () => {
    const text = input.trim();
    if (!text && !pendingFile) return;
    if (sending) return;
    setSending(true);

    let att = null;
    if (pendingFile) {
      try { att = await uploadFile(pendingFile.file); }
      catch(err) { showToast("Upload failed: "+err.message); setSending(false); setUploadPct(0); return; }
    }

    const content = text || null;
    setInput(""); clearFile();

    const optimistic = {
      id:`temp-${Date.now()}`, room_id:room.id, user_id:session.user.id,
      content, created_at:new Date().toISOString(), parent_id:null, replies:[],
      attachment: att ? JSON.stringify(att) : null,
      profile:{ full_name:profile.full_name, student_id:profile.student_id, role:profile.role }
    };
    setMsgs(prev => [...prev, optimistic]);

    const { error } = await supabase.from("messages").insert({
      room_id:room.id, user_id:session.user.id, content,
      attachment: att ? JSON.stringify(att) : null,
    });
    if (error) {
      showToast("Failed to send.");
      setMsgs(prev => prev.filter(m => m.id !== optimistic.id));
    }
    setSending(false); setUploadPct(0);
  };

  const canPost = !room.is_announcement || profile.role==="admin" || profile.role==="faculty";
  const typeInfo = ROOM_TYPES.find(t=>t.value===room.room_type);

  return (
    <>
      {/* Header */}
      <div className="chan-header">
        <span style={{fontSize:"1.1rem"}}>{room.is_announcement?"📢":(typeInfo?.icon||"#")}</span>
        <div>
          <div className="chan-name">{room.name}</div>
          {room.description && <div className="chan-desc">{room.description}</div>}
        </div>
        <div className="member-count"><Icon name="users" size={14}/> {members} members</div>
      </div>

      {/* Messages */}
      <div className="msgs">
        {msgs.length===0 && (
          <div className="empty">
            <div className="empty-icon"><Icon name="book" size={36}/></div>
            <p>No messages yet — be the first!</p>
          </div>
        )}
        {msgs.map(m => (
          <MsgItem key={m.id} msg={m} profile={profile} session={session}
            onReply={loadMsgs} isAnn={room.is_announcement}/>
        ))}
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      {canPost ? (
        <div className="input-bar">
          <input ref={fileRef} type="file" style={{display:"none"}}
            accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.mp4,.mp3"
            onChange={pickFile}/>
          <div className="input-outer">
            {/* File preview strip */}
            {pendingFile && (
              <>
                <div className="file-strip">
                  <span className="file-strip-icon">{fileEmoji(fileCat(pendingFile.file.type, pendingFile.file.name))}</span>
                  <span className="file-strip-name">{pendingFile.file.name}</span>
                  <span className="file-strip-size">{fmtBytes(pendingFile.file.size)}</span>
                  <button className="file-strip-remove" onClick={clearFile}><Icon name="x" size={13}/></button>
                </div>
                {uploadPct > 0 && uploadPct < 100 && (
                  <div className="progress-bar"><div className="progress-fill" style={{width:`${uploadPct}%`}}/></div>
                )}
              </>
            )}
            {/* Text row */}
            <div className="input-row">
              <button className="attach-btn" title={`Attach file (max ${MAX_MB} MB)`}
                onClick={()=>fileRef.current?.click()}>
                <Icon name="paperclip" size={17}/>
              </button>
              <textarea className="msg-input" rows={1}
                placeholder={pendingFile ? "Add a caption (optional)…" : `Message #${room.name}…`}
                value={input} onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}/>
              <button className="send-btn" onClick={send} disabled={(!input.trim()&&!pendingFile)||sending}>
                <Icon name="send" size={15}/>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="no-post">Only faculty &amp; admins can post in Announcements.</div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// ATTACHMENT RENDERER
// ─────────────────────────────────────────────────────────────
function Attachment({ raw }) {
  if (!raw) return null;
  let att; try { att = typeof raw==="string" ? JSON.parse(raw) : raw; } catch { return null; }
  if (!att?.url) return null;
  const cat = att.cat || fileCat(att.mime||"", att.name||"");

  if (cat === "image") return (
    <a className="att-image" href={att.url} target="_blank" rel="noreferrer">
      <img src={att.url} alt={att.name} loading="lazy"/>
      <div className="att-image-footer"><span>{att.name}</span><span>{fmtBytes(att.size)}</span></div>
    </a>
  );

  return (
    <a className="att-file" href={att.url} target="_blank" rel="noreferrer" download={att.name}>
      <div className="att-file-icon">{fileEmoji(cat)}</div>
      <div className="att-file-info">
        <div className="att-file-name">{att.name}</div>
        <div className="att-file-meta">{fmtBytes(att.size)} · {(cat).toUpperCase()}</div>
      </div>
      <div className="att-file-dl"><Icon name="download" size={14}/></div>
    </a>
  );
}

// ─────────────────────────────────────────────────────────────
// MESSAGE ITEM
// ─────────────────────────────────────────────────────────────
function MsgItem({ msg, profile, session, onReply, isAnn }) {
  const [open,      setOpen]      = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sending,   setSending]   = useState(false);
  const name = msg.profile?.full_name || "Unknown";
  const role = msg.profile?.role;

  const sendReply = async () => {
    const text = replyText.trim();
    if (!text||sending) return;
    setSending(true);
    await supabase.from("messages").insert({ room_id:msg.room_id, user_id:session.user.id, content:text, parent_id:msg.id });
    setReplyText(""); onReply(); setSending(false);
  };

  return (
    <div className="msg-group">
      <div className="msg-av" style={{background:avatarColor(name)}}>{avatar(name)}</div>
      <div className="msg-body">
        <div className="msg-meta">
          <span className="msg-author">{name}</span>
          {role&&role!=="student"&&<span className="msg-role">{role}</span>}
          <span className="msg-time">{fmtTime(msg.created_at)}</span>
        </div>
        {msg.content && <div className={`msg-text ${isAnn?"ann":""}`}>{msg.content}</div>}
        <Attachment raw={msg.attachment}/>
        {!isAnn && (
          <button className="reply-btn" onClick={()=>setOpen(o=>!o)}>
            <Icon name="reply" size={12}/>
            {msg.replies?.length>0 ? `${msg.replies.length} ${msg.replies.length===1?"reply":"replies"}` : "Reply"}
          </button>
        )}
        {open && (
          <div className="replies">
            {(msg.replies||[]).map(r=>(
              <div key={r.id} className="reply-row">
                <div className="reply-av" style={{background:avatarColor(r.profile?.full_name||"")}}>{avatar(r.profile?.full_name||"")}</div>
                <div className="reply-body">
                  <span className="reply-author">{r.profile?.full_name||"Unknown"}</span>
                  <span className="reply-time">{fmtTime(r.created_at)}</span>
                  <div className="reply-text">{r.content}</div>
                </div>
              </div>
            ))}
            <div className="reply-input-wrap">
              <input className="reply-input" placeholder="Write a reply…" value={replyText}
                onChange={e=>setReplyText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendReply()}/>
              <button className="reply-send" onClick={sendReply} disabled={!replyText.trim()||sending}>
                <Icon name="send" size={12}/>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CREATE ROOM MODAL
// ─────────────────────────────────────────────────────────────
function CreateRoomModal({ session, courses, onClose, onCreated }) {
  const [roomName, setRoomName] = useState("");
  const [desc,     setDesc]     = useState("");
  const [roomType, setRoomType] = useState("club");
  const [courseId, setCourseId] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const create = async () => {
    if (!roomName.trim()) { setError("Room name is required."); return; }
    setLoading(true); setError("");
    const { data: room, error: err } = await supabase.from("rooms").insert({
      name: roomName.trim(), description: desc.trim()||null,
      room_type: roomType, course_id: courseId||null,
      created_by: session.user.id, is_announcement: false,
    }).select().single();
    if (err) { setError(err.message); setLoading(false); return; }
    await supabase.from("room_members").upsert({ room_id:room.id, user_id:session.user.id }, { onConflict:"room_id,user_id" });
    onCreated(room); setLoading(false);
  };

  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-title">Create a Room</div>
        <div className="modal-sub">Start a club, project group, study circle, department hub, or anything else.</div>
        {error && <div className="modal-err">{error}</div>}
        <label className="modal-label">Room Type</label>
        <div className="type-grid">
          {ROOM_TYPES.map(t=>(
            <div key={t.value} className={`type-card ${roomType===t.value?"sel":""}`} onClick={()=>setRoomType(t.value)}>
              <div className="type-icon">{t.icon}</div>
              <div className="type-label">{t.label}</div>
            </div>
          ))}
        </div>
        <label className="modal-label">Room Name *</label>
        <input className="modal-input" placeholder="e.g. Software Dev Club, ML Research, Badminton Team"
          value={roomName} onChange={e=>setRoomName(e.target.value)} maxLength={60}/>
        <label className="modal-label">Description</label>
        <textarea className="modal-input modal-ta" placeholder="What's this room for? Who should join?"
          value={desc} onChange={e=>setDesc(e.target.value)} maxLength={200}/>
        <label className="modal-label">Link to Department (optional)</label>
        <select className="modal-input modal-select" value={courseId} onChange={e=>setCourseId(e.target.value)}>
          <option value="">— No specific department —</option>
          {courses.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <div className="modal-row">
          <button className="modal-btn secondary" onClick={onClose}>Cancel</button>
          <button className="modal-btn primary" onClick={create} disabled={loading||!roomName.trim()}>
            {loading?"Creating…":"Create Room"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DISCOVER PANEL
// ─────────────────────────────────────────────────────────────
function DiscoverPanel({ session, onJoin, onLeave, joinedRooms }) {
  const [allRooms,   setAllRooms]   = useState([]);
  const [courses,    setCourses]    = useState([]);
  const [search,     setSearch]     = useState("");
  const [activeTab,  setActiveTab]  = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const joinedIds = new Set(joinedRooms.map(r=>r.id));

  useEffect(() => {
    loadRooms();
    supabase.from("courses").select("id,name").then(({data})=>setCourses(data||[]));
  }, []);

  const loadRooms = async () => {
    const { data } = await supabase.from("rooms")
      .select("*, courses(name), creator:profiles!rooms_created_by_fkey(full_name)")
      .eq("is_announcement",false).order("created_at",{ascending:false});
    setAllRooms(data||[]);
  };

  const doJoin  = async (r) => { await supabase.from("room_members").upsert({room_id:r.id,user_id:session.user.id},{onConflict:"room_id,user_id"}); onJoin(); };
  const doLeave = async (r) => { await supabase.from("room_members").delete().eq("room_id",r.id).eq("user_id",session.user.id); onLeave(); };

  const tabFiltered = allRooms.filter(r => {
    if (activeTab==="joined")  return joinedIds.has(r.id);
    if (activeTab==="club")    return r.room_type==="club";
    if (activeTab==="dept")    return r.room_type==="department";
    if (activeTab==="sports")  return r.room_type==="sports";
    if (activeTab==="project") return r.room_type==="project"||r.room_type==="study";
    return true;
  });

  const filtered = tabFiltered.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.description?.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = {};
  filtered.forEach(r => {
    const k = r.courses?.name || (ROOM_TYPES.find(t=>t.value===r.room_type)?.label+" Rooms") || "Other";
    if (!grouped[k]) grouped[k]=[];
    grouped[k].push(r);
  });

  const tEmoji = (t) => ROOM_TYPES.find(x=>x.value===t)?.icon || "💬";

  return (
    <>
      {showCreate && <CreateRoomModal session={session} courses={courses} onClose={()=>setShowCreate(false)}
        onCreated={()=>{setShowCreate(false);loadRooms();onJoin();}}/>}
      <div className="discover">
        <div className="discover-header">
          <div>
            <h2 className="discover-title">Discover Rooms</h2>
            <p className="discover-sub">Browse, join, or create rooms for clubs, projects, departments and more.</p>
          </div>
          <button className="create-btn" onClick={()=>setShowCreate(true)}>
            <Icon name="plus" size={14}/> Create Room
          </button>
        </div>
        <div className="filter-tabs">
          {FILTER_TABS.map(t=>(
            <button key={t.key} className={`ftab ${activeTab===t.key?"active":""}`} onClick={()=>setActiveTab(t.key)}>{t.label}</button>
          ))}
        </div>
        <div className="search-box">
          <Icon name="search" size={16} style={{color:"var(--text3)"}}/>
          <input className="search-input" placeholder="Search rooms…" value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        {Object.entries(grouped).map(([gName, gRooms])=>(
          <div key={gName} className="group-section">
            <div className="group-label">{gName}</div>
            <div className="rooms-grid">
              {gRooms.map(r=>(
                <div key={r.id} className={`room-card ${joinedIds.has(r.id)?"joined":""}`}>
                  <div className="rc-top">
                    <span className="rc-name">{tEmoji(r.room_type)} {r.name}</span>
                    {joinedIds.has(r.id)&&<Icon name="check" size={14} style={{color:"var(--accent2)"}}/>}
                  </div>
                  <div><span className="rc-type">{ROOM_TYPES.find(t=>t.value===r.room_type)?.label||"Room"}</span></div>
                  <div className="rc-desc">{r.description||"No description."}</div>
                  {r.creator?.full_name&&<div className="rc-creator">👤 {r.creator.full_name}</div>}
                  <div className="rc-footer">
                    <span className="rc-count"><Icon name="users" size={12}/> {r.member_count||0}</span>
                    {joinedIds.has(r.id)
                      ? <button className="join-btn leave" onClick={()=>doLeave(r)}>Leave</button>
                      : <button className="join-btn join"  onClick={()=>doJoin(r)}>Join</button>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {filtered.length===0 && (
          <div className="empty">
            <div className="empty-icon"><Icon name="search" size={36}/></div>
            <p>{search?`No rooms found for "${search}"`:"No rooms here yet."}</p>
            {!search&&<button className="create-btn" style={{marginTop:".5rem"}} onClick={()=>setShowCreate(true)}>
              <Icon name="plus" size={14}/> Create the first one
            </button>}
          </div>
        )}
      </div>
    </>
  );
}
