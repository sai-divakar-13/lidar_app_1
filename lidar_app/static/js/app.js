/* ============================================================
   FOREST·CARBON·AI — app.js
   ============================================================ */
'use strict';

const STATE = {
  buildingData: null,
  treeZones: null,
  sessionId: null, filename: null, totalPoints: 0,
  classes: [], areaM2: 0, trees: [], summary: {},
  chmData: null, xMin: 0, yMin: 0, resolution: 1.0,
  donutChart: null, scatterChart: null, dbhChart: null,
  spatialMode: 'height', sortCol: 'Height_m', sortDir: -1, filterQ: '',
};
const API = '';

const REPORT_LOGO = "data:image/jpeg;base64,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";

/* Shared report header: logo on left, title + date on right, used by all PDF exports */
function reportHeaderHTML(title, subtitle) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
  const timeStr = now.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' });
  return `
  <div class="report-header">
    <img class="report-logo" src="${REPORT_LOGO}" alt="IIT Tirupati i-Hub / NM-ICPS / DST">
    <div class="report-header-right">
      <div class="report-date">${dateStr} &middot; ${timeStr}</div>
    </div>
  </div>
  <h1 class="report-title">${title}</h1>
  ${subtitle ? `<div class="report-subtitle">${subtitle}</div>` : ''}
  `;
}

const REPORT_HEADER_CSS = `
  .report-header {
    display:flex; justify-content:space-between; align-items:center;
    margin-bottom:14px; padding-bottom:12px; border-bottom:2px solid #0d6e2a;
  }
  .report-logo { height:48px; object-fit:contain; }
  .report-header-right { text-align:right; }
  .report-date { font-size:12px; color:#444; font-family:'Courier New',monospace; font-weight:600; }
  .report-title { font-size:26px; font-weight:800; color:#0d4422; margin:6px 0 2px; letter-spacing:.5px; }
  .report-subtitle { font-size:11px; color:#666; margin-bottom:14px; font-family:'Courier New',monospace; }
`;


// ─── PROJECT INFO POPUP ─────────────────────────────────────
function openProjectInfo() {
  const overlay = document.getElementById('projectInfoOverlay');
  if (overlay) overlay.classList.add('show');
}
function closeProjectInfo() {
  const overlay = document.getElementById('projectInfoOverlay');
  if (overlay) overlay.classList.remove('show');
}
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeProjectInfo();
});

// ─── STATUS DOT ─────────────────────────────────────────────
function setDot(state) {
  const dot = document.getElementById('statusDot');
  const lbl = document.getElementById('statusDotLabel');
  if (!dot) return;
  const map = { idle: ['var(--g1)', 'IDLE'], processing: ['#fbbf24', 'PROCESSING'], done: ['var(--g1)', 'READY'], error: ['#f85149', 'ERROR'] };
  const [col, txt] = map[state] || map.idle;
  dot.style.background = col;
  dot.style.boxShadow  = `0 0 6px ${col}`;
  lbl.textContent = txt;
  lbl.style.color = col;
}

const ENGINEERING_REPORT_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Inter',Arial,sans-serif;background:#fff;color:#1a2332;font-size:11px}

  /* ── COVER HEADER ── */
  .eng-header{
    border-bottom:3px solid #1a3a5c;
    padding:16px 32px 14px;
    display:flex;align-items:center;justify-content:space-between;
    background:#fff;
  }
  .eng-logo-bar{display:flex;align-items:center;gap:20px}
  .eng-logo-bar img{height:48px;object-fit:contain}
  .eng-title-block{flex:1;padding-left:28px;border-left:1px solid #d0d8e4;margin-left:20px}
  .eng-subtitle{font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#607080;margin-bottom:3px;font-family:'IBM Plex Mono',monospace}
  .eng-title{font-size:22px;font-weight:700;color:#1a3a5c;letter-spacing:-0.3px}
  .eng-meta-block{text-align:right;font-size:9px;color:#607080;font-family:'IBM Plex Mono',monospace;line-height:1.7}
  .eng-meta-block b{color:#1a3a5c}

  /* ── INTRO BANNER ── */
  .intro-banner{
    background:#1a2e45;color:#c8daf0;font-size:11px;line-height:1.6;
    padding:14px 32px;margin-bottom:20px;
  }

  /* ── KPI ROW ── */
  .kpi-row{
    display:flex;gap:0;border:1px solid #d0d8e4;
    border-radius:4px;overflow:hidden;margin:16px 32px 24px;
  }
  .kpi-cell{
    flex:1;padding:14px 10px;text-align:center;
    border-right:1px solid #d0d8e4;background:#f7f9fc;
  }
  .kpi-cell:last-child{border-right:none}
  .kpi-cell .kpi-lbl{font-size:8px;text-transform:uppercase;letter-spacing:1px;color:#607080;margin-bottom:5px}
  .kpi-cell .kpi-val{font-size:20px;font-weight:700;color:#1a3a5c;line-height:1}

  /* ── SECTION HEADERS ── */
  .sec-header{
    background:#1a2e45;color:#fff;
    padding:8px 32px;font-size:11px;font-weight:600;
    letter-spacing:1px;text-transform:uppercase;
    margin-bottom:0;
  }

  /* ── TABLES ── */
  .report-section{padding:0 32px 24px}
  table{width:100%;border-collapse:collapse;font-size:10.5px;margin-top:0}
  thead th{
    background:#1a2e45;color:#fff;
    padding:8px 12px;text-align:left;font-size:9.5px;
    text-transform:uppercase;letter-spacing:.5px;font-weight:600;
  }
  tbody tr{border-bottom:1px solid #e8edf3}
  tbody tr:nth-child(even) td{background:#f4f7fb}
  tbody td{padding:7px 12px;color:#1a2332;vertical-align:middle}
  tbody td:first-child{font-weight:500}

  /* coloured values */
  .val-ok{color:#27a641}
  .val-warn{color:#e67e22}
  .val-danger{color:#e74c3c}

  /* ── SUMMARY CARDS row ── */
  .card-row{display:flex;gap:12px;padding:16px 32px}
  .s-card{
    flex:1;background:#f4f7fb;border:1px solid #d0d8e4;border-radius:6px;
    padding:12px 14px;
  }
  .s-card .s-lbl{font-size:9px;text-transform:uppercase;letter-spacing:.5px;color:#607080;margin-bottom:4px}
  .s-card .s-val{font-size:18px;font-weight:700;color:#1a3a5c}
  .s-card .s-sub{font-size:9px;color:#8a9ab0;margin-top:2px}

  /* ── PAGE BREAK ── */
  .page-break{page-break-before:always}
  @media print{@page{margin:10mm} .no-print{display:none}}
`;

function buildEngHeader(title, subtitle, datasetInfo, generatedAt) {
  var ds  = datasetInfo || STATE.filename || '—';
  var pts = STATE.totalPoints ? STATE.totalPoints.toLocaleString() + ' pts' : '—';
  var cls = STATE.classes.length;
  var ha  = (STATE.areaM2/10000).toFixed(2);
  var gen = generatedAt || new Date().toLocaleString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
  var sub = subtitle || 'Forest Carbon Analytics Platform';
  return '<div class="eng-header">'
    + '<div class="eng-logo-bar"><img src="' + REPORT_LOGO + '" alt="IIT Tirupati i-Hub / NM-ICPS / DST"></div>'
    + '<div class="eng-title-block">'
    +   '<div class="eng-subtitle">' + sub + '</div>'
    +   '<div class="eng-title">' + title + '</div>'
    + '</div>'
    + '<div class="eng-meta-block">'
    +   '<div><b>Dataset:</b> ' + ds + '</div>'
    +   '<div><b>Info:</b> ' + pts + ' · ' + cls + ' classes · ' + ha + ' ha</div>'
    +   '<div><b>Generated:</b> ' + gen + '</div>'
    +   '<div><b>Engine:</b> ForestCarbon Engine v2.0 · LAS 1.x</div>'
    + '</div>'
    + '</div>';
}


// ─── TAB SWITCHING ──────────────────────────────────────────
function switchTab(id, btn) {
  const item = btn || document.querySelector(`[data-tab="${id}"]`);
  if (item && item.classList.contains('locked') && !item.classList.contains('unlocked')) return;
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  const panel = document.getElementById(`tab-${id}`);
  if (panel) panel.classList.add('active');
  if (item)  item.classList.add('active');
  if (id === 'spatial' && STATE.trees.length) setTimeout(drawSpatial, 50);
  updateTopBarStats(id);
}

/* Show live values relevant to the currently active panel in the top bar */
function updateTopBarStats(id) {
  const el = document.getElementById('topBarStats');
  if (!el) return;
  const s = STATE.summary;
  const item = (label, val) => `<div class="tbs-item">${label}<span class="tbs-val">${val}</span></div>`;
  const sep  = `<span class="tbs-sep">|</span>`;

  let parts = [];
  if (!STATE.sessionId) { el.innerHTML = ''; return; }

  switch (id) {
    case 'upload':
      parts = [
        item('Points', STATE.totalPoints.toLocaleString()),
        item('Classes', STATE.classes.length),
        item('Area', `${(STATE.areaM2/10000).toFixed(2)} ha`),
      ];
      break;
    case 'pointcloud':
      parts = [
        item('Classes', STATE.classes.length),
        item('Points', STATE.totalPoints.toLocaleString()),
      ];
      break;
    case 'terrain':
      if (STATE.chmData) {
        const flat = STATE.chmData.flat();
        const maxChm = Math.max(...flat);
        parts = [
          item('CHM Max', `${maxChm.toFixed(1)} m`),
          item('Resolution', `${STATE.resolution} m`),
        ];
      }
      break;
    case 'analytics':
      if (s.tree_count) parts = [
        item('Trees', s.tree_count),
        item('AGB', `${s.total_agb_kg.toFixed(0)} kg`),
        item('Carbon', `${s.total_carbon_kg.toFixed(0)} kg`),
        item('CO₂', `${s.total_co2_kg.toFixed(0)} kg`),
      ];
      break;
    case 'spatial':
      if (s.tree_count) parts = [
        item('Trees Mapped', s.tree_count),
        item('Color Mode', STATE.spatialMode.toUpperCase()),
      ];
      break;
    case 'inventory':
      if (STATE.trees.length) parts = [
        item('Rows', STATE.trees.length),
        item('Total AGB', `${s.total_agb_kg.toFixed(0)} kg`),
        item('Total CO₂', `${s.total_co2_kg.toFixed(0)} kg`),
      ];
      break;
  }
  el.innerHTML = parts.join(sep);
}

function unlockTab(id, badge) {
  const el = document.getElementById(`nav-${id}`);
  if (!el) return;
  el.classList.remove('locked'); el.classList.add('unlocked');
  el.querySelector('.nav-dot').style.background = 'var(--g2)';
  if (badge) {
    const b = document.getElementById(`nav-badge-${id}`);
    if (b) { b.textContent = badge; b.classList.add('show'); }
  }
}

function showFooter(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'flex';
}

// ─── PROGRESS ────────────────────────────────────────────────
function setProgress(pct, label) {
  const wrap = document.getElementById('progressWrap');
  const fill = document.getElementById('progressFill');
  const lbl  = document.getElementById('progressLabel');
  wrap.style.display = pct > 0 ? 'block' : 'none';
  fill.style.width   = pct + '%';
  if (label) lbl.textContent = label;
}

function setStatus(icon, text, show = true) {
  const card = document.getElementById('uploadStatus');
  card.style.display = show ? 'flex' : 'none';
  document.getElementById('statusIcon').textContent = icon;
  document.getElementById('statusText').textContent = text;
}

// ─── UPLOAD ──────────────────────────────────────────────────
(function initUpload() {
  const zone  = document.getElementById('uploadZone');
  const input = document.getElementById('fileInput');
  zone.addEventListener('click', () => input.click());
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', e => { e.preventDefault(); zone.classList.remove('drag-over'); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); });
  input.addEventListener('change', () => { if (input.files[0]) handleFile(input.files[0]); });
})();

async function handleFile(file) {
  setDot('processing');
  setStatus('⏳', `Uploading ${file.name}…`);
  setProgress(15, 'Uploading…');
  const fd = new FormData();
  fd.append('file', file);
  let data;
  try {
    const res = await fetch(`${API}/api/upload`, { method: 'POST', body: fd });
    data = await res.json();
  } catch(e) { setStatus('❌', `Upload failed: ${e.message}`); setProgress(0); setDot('error'); return; }
  if (data.error) { setStatus('❌', data.error); setProgress(0); setDot('error'); return; }

  STATE.sessionId = data.session_id; STATE.filename = data.filename;
  STATE.totalPoints = data.total_points; STATE.classes = data.classes; STATE.areaM2 = data.area_m2;

  setProgress(100, 'File analysed ✓');
  setTimeout(() => setProgress(0), 1400);
  setStatus('✅', `${file.name} — ${data.total_points.toLocaleString()} pts · ${data.classes.length} classes`);
  setDot('done');
  updateTopBarStats('upload');

  document.getElementById('sessionInfo').innerHTML =
    `<b style="color:var(--text)">${data.filename}</b><br>${data.total_points.toLocaleString()} pts · ${data.classes.length} cls<br><span style="color:var(--g2)">${data.session_id}</span>`;

  // Collapse the upload zone, show compact "file loaded" bar
  document.getElementById('uploadZone').style.display = 'none';
  document.getElementById('uploadCollapsed').style.display = 'flex';
  document.getElementById('ucName').textContent = data.filename;
  document.getElementById('ucMeta').textContent =
    `${data.total_points.toLocaleString()} pts · ${data.classes.length} classes · ${(data.area_m2/10000).toFixed(2)} ha`;

  buildClassSummary(data);
  unlockTab('pointcloud', data.classes.length);
  showFooter('uploadFooter');

  // Show & build 3D preview
  if (data.preview_points && data.preview_points.length) {
    document.getElementById('viewerCard').style.display = 'block';
    initViewer3D(data.preview_points, data.x_range, data.y_range, data.z_range);
  }

  // Auto-run the full pipeline: class images → terrain → ITD
  // (User stays on the Upload tab; results populate in the background
  //  and become available the moment they switch tabs.)
  runFullPipeline();
}

/* Runs the entire pipeline automatically after upload, without forcing
   a tab switch — results are ready by the time the user navigates. */
async function runFullPipeline() {
  try {
    await runClassImagesBackground();
    await runTerrain(true);
  } catch (e) {
    console.error('Auto-pipeline error:', e);
  }
}

/* Class images generation that does NOT switch tabs (keeps user on Upload) */
async function runClassImagesBackground() {
  if (!STATE.sessionId) return;
  const grid = document.getElementById('classImagesGrid');
  grid.innerHTML = '<div class="loading-placeholder"><div class="spinner"></div><span>Generating class maps…</span></div>';
  setProgress(10, 'Generating class images…');
  grid.innerHTML = '';
  for (let i = 0; i < STATE.classes.length; i++) {
    const cls = STATE.classes[i];
    setProgress(10 + Math.round(i/STATE.classes.length*30), `Rendering Class ${cls.id}…`);
    try {
      const res = await fetch(`${API}/api/class_image/${STATE.sessionId}/${cls.id}`);
      const data = await res.json();
      const card = document.createElement('div');
      card.className = 'cls-img-card';
      card.innerHTML = `<img src="${data.image}" alt="Class ${cls.id}">
        <div class="cls-img-info">
          <div class="cls-img-name"><div class="cls-img-dot" style="background:${cls.color}"></div>${cls.name} (Class ${cls.id})</div>
          <div class="cls-img-pts">${cls.count.toLocaleString()} pts · ${cls.pct}%</div>
        </div>`;
      grid.appendChild(card);
    } catch(e) {}
  }
  unlockTab('pointcloud', STATE.classes.length);
  unlockTab('terrain');
  showFooter('pcFooter');
}

// ─── REOPEN UPLOAD ZONE ──────────────────────────────────────
function reopenUpload() {
  document.getElementById('uploadZone').style.display = 'block';
  document.getElementById('uploadCollapsed').style.display = 'none';
  document.getElementById('viewerCard').style.display = 'none';
  document.getElementById('fileInput').value = '';
  destroyViewer3D();
  // Reset building state so a fresh upload re-evaluates from scratch
  STATE.buildingData = null;
  STATE.treeZones = null;
  const navBuilding = document.getElementById('nav-building');
  if (navBuilding) navBuilding.style.display = '';
}

// ─── 3D POINT CLOUD VIEWER (pure Canvas 2D — no external library) ──
const VIEWER = {
  points: null, canvas: null, ctx: null,
  rotX: -0.6, rotY: 0.7, zoom: 1, panX: 0, panY: 0,
  center: [0,0,0], maxSpan: 1,
  spinning: false, animId: null,
  dragging: false, panning: false, lastX: 0, lastY: 0,
};

function initViewer3D(points, xr, yr, zr) {
  destroyViewer3D();
  const container = document.getElementById('viewer3d');
  container.innerHTML = '';

  if (!points || !points.length) {
    container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--muted);font-family:monospace;font-size:11px">No preview points returned</div>';
    return;
  }

  const canvas = document.createElement('canvas');
  canvas.style.display = 'block';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  container.appendChild(canvas);
  VIEWER.canvas = canvas;
  VIEWER.ctx = canvas.getContext('2d');

  // Hint overlay
  const hint = document.createElement('div');
  hint.className = 'viewer-hint';
  hint.textContent = `${points.length.toLocaleString()} points (preview sample) · drag to rotate`;
  container.appendChild(hint);

  VIEWER.points = points; // [x,y,z,colorHex] already centered around origin from backend
  const xSpan = Math.max(xr[1]-xr[0], 0.001);
  const ySpan = Math.max(yr[1]-yr[0], 0.001);
  const zSpan = Math.max(zr[1]-zr[0], 0.001);
  VIEWER.maxSpan = Math.max(xSpan, ySpan, zSpan);
  VIEWER.rotX = -0.6; VIEWER.rotY = 0.7; VIEWER.zoom = 1; VIEWER.panX = 0; VIEWER.panY = 0;

  // ── Mouse interaction ──
  canvas.addEventListener('mousedown', e => {
    VIEWER.dragging = true; VIEWER.panning = (e.button === 2);
    VIEWER.lastX = e.clientX; VIEWER.lastY = e.clientY;
  });
  window.addEventListener('mouseup', () => { VIEWER.dragging = false; VIEWER.panning = false; });
  canvas.addEventListener('contextmenu', e => e.preventDefault());
  canvas.addEventListener('mousemove', e => {
    if (!VIEWER.dragging) return;
    const dx = e.clientX - VIEWER.lastX, dy = e.clientY - VIEWER.lastY;
    VIEWER.lastX = e.clientX; VIEWER.lastY = e.clientY;
    if (VIEWER.panning) {
      VIEWER.panX += dx; VIEWER.panY += dy;
    } else {
      VIEWER.rotY += dx * 0.006;
      VIEWER.rotX += dy * 0.006;
      VIEWER.rotX = Math.max(-Math.PI/2 + 0.05, Math.min(Math.PI/2 - 0.05, VIEWER.rotX));
    }
    drawViewer();
  });
  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    VIEWER.zoom *= (e.deltaY > 0 ? 0.9 : 1.1);
    VIEWER.zoom = Math.max(0.2, Math.min(8, VIEWER.zoom));
    drawViewer();
  }, { passive: false });

  window.addEventListener('resize', onViewerResize);

  function animate() {
    VIEWER.animId = requestAnimationFrame(animate);
    if (VIEWER.spinning) { VIEWER.rotY += 0.006; drawViewer(); }
  }
  requestAnimationFrame(() => { resizeCanvas(); drawViewer(); animate(); });
}

function resizeCanvas() {
  const container = document.getElementById('viewer3d');
  const canvas = VIEWER.canvas;
  if (!container || !canvas) return;
  const dpr = window.devicePixelRatio || 1;
  const W = container.clientWidth || 800;
  const H = container.clientHeight || 420;
  canvas.width  = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';
  VIEWER.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function onViewerResize() {
  if (!VIEWER.canvas) return;
  resizeCanvas();
  drawViewer();
}

/* Project a 3D point (already in viewer space, z-up) to 2D screen coords */
function project(x, y, z, W, H) {
  const cosY = Math.cos(VIEWER.rotY), sinY = Math.sin(VIEWER.rotY);
  const cosX = Math.cos(VIEWER.rotX), sinX = Math.sin(VIEWER.rotX);

  // Rotate around Y axis (yaw)
  let x1 = x * cosY - y * sinY;
  let y1 = x * sinY + y * cosY;
  let z1 = z;

  // Rotate around X axis (pitch)
  let y2 = y1 * cosX - z1 * sinX;
  let z2 = y1 * sinX + z1 * cosX;

  // Simple perspective
  const dist = VIEWER.maxSpan * 2.2;
  const persp = dist / (dist + z2);

  const scale = (Math.min(W, H) / VIEWER.maxSpan) * 0.42 * VIEWER.zoom * persp;
  const sx = W/2 + x1 * scale + VIEWER.panX;
  const sy = H/2 - y2 * scale + VIEWER.panY;
  return [sx, sy, z2, persp];
}

function drawViewer() {
  const canvas = VIEWER.canvas, ctx = VIEWER.ctx;
  if (!canvas || !ctx) return;
  const W = canvas.clientWidth, H = canvas.clientHeight;

  ctx.fillStyle = '#0d1117';
  ctx.fillRect(0, 0, W, H);

  const pts = VIEWER.points;
  // Sort back-to-front by depth for correct overlap
  const projected = pts.map(p => {
    const [sx, sy, z2, persp] = project(p[0], p[1], p[2], W, H);
    return { sx, sy, z2, color: p[3], size: Math.max(0.8, 1.8 * persp) };
  });
  projected.sort((a,b) => a.z2 - b.z2);

  for (const p of projected) {
    if (p.sx < -20 || p.sx > W+20 || p.sy < -20 || p.sy > H+20) continue;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.sx - p.size/2, p.sy - p.size/2, p.size, p.size);
  }

  // Subtle axis indicator (bottom-left)
  ctx.strokeStyle = '#30363d'; ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, W-1, H-1);
}

function viewerResetCamera() {
  VIEWER.rotX = -0.6; VIEWER.rotY = 0.7; VIEWER.zoom = 1; VIEWER.panX = 0; VIEWER.panY = 0;
  drawViewer();
}

function viewerZoom(factor) {
  // factor < 1 => zoom in (matches existing button semantics: 0.8 = zoom in)
  VIEWER.zoom *= (factor < 1 ? 1.25 : 0.8);
  VIEWER.zoom = Math.max(0.2, Math.min(8, VIEWER.zoom));
  drawViewer();
}

function viewerToggleSpin() {
  VIEWER.spinning = !VIEWER.spinning;
  document.getElementById('viewerSpinBtn').textContent = VIEWER.spinning ? '⏸ Stop Rotate' : '▶ Auto-Rotate';
}

function destroyViewer3D() {
  if (VIEWER.animId) cancelAnimationFrame(VIEWER.animId);
  window.removeEventListener('resize', onViewerResize);
  const container = document.getElementById('viewer3d');
  if (container) container.innerHTML = '';
  VIEWER.canvas = null; VIEWER.ctx = null; VIEWER.points = null;
  VIEWER.animId = null; VIEWER.spinning = false;
  VIEWER.dragging = false; VIEWER.panning = false;
}

// ─── CLASS SUMMARY ───────────────────────────────────────────
function buildClassSummary(data) {
  document.getElementById('classSummary').style.display = 'block';
  document.getElementById('kpiGrid').innerHTML = `
    <div class="kpi" style="--kpi-c:var(--g1)">
      <div class="kpi-label">Total Points</div>
      <div class="kpi-value">${(data.total_points/1e6).toFixed(2)}<span class="kpi-unit"> M</span></div>
      <div class="kpi-sub">${data.total_points.toLocaleString()} returns</div>
    </div>
    <div class="kpi" style="--kpi-c:var(--g2)">
      <div class="kpi-label">Classes Found</div>
      <div class="kpi-value">${data.classes.length}</div>
      <div class="kpi-sub">Classification codes</div>
    </div>
    <div class="kpi" style="--kpi-c:#58a6ff">
      <div class="kpi-label">Area</div>
      <div class="kpi-value" style="color:#58a6ff">${(data.area_m2/10000).toFixed(2)}<span class="kpi-unit"> ha</span></div>
      <div class="kpi-sub">${data.area_m2.toLocaleString()} m²</div>
    </div>
    <div class="kpi" style="--kpi-c:#fbbf24">
      <div class="kpi-label">Z Range</div>
      <div class="kpi-value" style="color:#fbbf24">${(data.z_range[1]-data.z_range[0]).toFixed(1)}<span class="kpi-unit"> m</span></div>
      <div class="kpi-sub">${data.z_range[0].toFixed(1)} – ${data.z_range[1].toFixed(1)} m</div>
    </div>`;

  const ov = document.getElementById('classesOverview');
  ov.innerHTML = '';
  data.classes.forEach(cls => {
    const pct = (cls.count / data.total_points * 100).toFixed(1);
    const d = document.createElement('div');
    d.className = 'cls-card'; d.style.setProperty('--cc', cls.color);
    d.innerHTML = `<div class="cls-name">${cls.name}</div>
      <div class="cls-id">Class ${cls.id}</div>
      <div class="cls-count">${cls.count.toLocaleString()}</div>
      <div class="cls-pct">${pct}%</div>
      <div class="cls-bar"><div class="cls-fill" style="width:${pct}%;background:${cls.color}"></div></div>
      <div class="cls-desc">${cls.desc}</div>`;
    ov.appendChild(d);
  });

  buildDonut(data.classes, data.total_points);
  buildClassLegend(data.classes, data.total_points);
  document.getElementById('donutTotal').textContent = `Total: ${data.total_points.toLocaleString()} pts`;
  document.getElementById('pcSub').textContent = `${data.classes.length} classes · ${data.filename}`;
}

// ─── DONUT ───────────────────────────────────────────────────
function buildDonut(classes, total) {
  if (STATE.donutChart) STATE.donutChart.destroy();
  STATE.donutChart = new Chart(document.getElementById('donutChart'), {
    type: 'doughnut',
    data: { labels: classes.map(c=>`${c.name} (${c.id})`), datasets:[{ data:classes.map(c=>c.count), backgroundColor:classes.map(c=>c.color), borderWidth:2, borderColor:'#0d1117', hoverOffset:6 }] },
    options: { cutout:'65%', responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{display:false}, tooltip:{ backgroundColor:'#161b22', borderColor:'#21262d', borderWidth:1, titleColor:'#39d353', bodyColor:'#8b949e',
        callbacks:{ label: ctx=>`  ${ctx.label}: ${ctx.parsed.toLocaleString()} (${(ctx.parsed/total*100).toFixed(1)}%)` } } } }
  });
}

function buildClassLegend(classes, total) {
  document.getElementById('classLegend').innerHTML = classes.map(c => {
    const pct = (c.count/total*100).toFixed(1);
    return `<div class="leg-item"><div class="leg-dot" style="background:${c.color}"></div><div class="leg-name">${c.name}</div><div class="leg-cnt">${c.count.toLocaleString()}</div><div class="leg-pct" style="color:${c.color}">${pct}%</div></div>`;
  }).join('');
}

// ─── CLASS IMAGES ────────────────────────────────────────────
async function runClassImages() {
  if (!STATE.sessionId) return;
  switchTab('pointcloud', document.querySelector('[data-tab="pointcloud"]'));
  const grid = document.getElementById('classImagesGrid');
  grid.innerHTML = '<div class="loading-placeholder"><div class="spinner"></div><span>Generating class maps…</span></div>';
  setProgress(10, 'Generating class images…');
  grid.innerHTML = '';
  for (let i = 0; i < STATE.classes.length; i++) {
    const cls = STATE.classes[i];
    setProgress(10 + Math.round(i/STATE.classes.length*80), `Rendering Class ${cls.id}…`);
    try {
      const res = await fetch(`${API}/api/class_image/${STATE.sessionId}/${cls.id}`);
      const data = await res.json();
      const card = document.createElement('div');
      card.className = 'cls-img-card';
      card.innerHTML = `<img src="${data.image}" alt="Class ${cls.id}">
        <div class="cls-img-info">
          <div class="cls-img-name"><div class="cls-img-dot" style="background:${cls.color}"></div>${cls.name} (Class ${cls.id})</div>
          <div class="cls-img-pts">${cls.count.toLocaleString()} pts · ${cls.pct}%</div>
        </div>`;
      grid.appendChild(card);
    } catch(e) {}
  }
  setProgress(100, 'Class images ready ✓');
  setTimeout(()=>setProgress(0), 1200);
  unlockTab('pointcloud', STATE.classes.length);
  unlockTab('terrain');
  showFooter('pcFooter');
}

// ─── TERRAIN ─────────────────────────────────────────────────
async function runTerrain(silent = false) {
  if (!STATE.sessionId) return;
  if (!silent) switchTab('terrain', document.querySelector('[data-tab="terrain"]'));
  const el = document.getElementById('terrainContent');
  el.innerHTML = '<div class="loading-placeholder"><div class="spinner"></div><span>Building DTM & CHM…</span></div>';
  setProgress(20, 'Computing terrain…'); setDot('processing');
  let data;
  try {
    const res = await fetch(`${API}/api/terrain/${STATE.sessionId}`);
    data = await res.json();
  } catch(e) {
    el.innerHTML = `<p style="color:var(--accent5);padding:20px;font-family:monospace">Terrain failed: ${e.message}</p>`;
    setProgress(0); setDot('error'); return;
  }
  setProgress(60, 'Running tree detection…');
  STATE.chmData = data.chm_data; STATE.xMin = data.x_min;
  STATE.yMin = data.y_min; STATE.resolution = data.resolution;

  el.innerHTML = `
    <div class="chart-card" style="margin-bottom:14px">
      <div class="chart-title">DTM &amp; CHM Side-by-Side</div>
      <div class="chart-sub">Elevation: ${data.dtm_range[0].toFixed(1)} – ${data.dtm_range[1].toFixed(1)} m · CHM max: ${data.chm_max.toFixed(1)} m</div>
      <img src="${data.image}" style="width:100%;border-radius:6px;margin-top:8px">
    </div>
    <div class="terrain-stats">
      <div class="kpi" style="--kpi-c:var(--g2)"><div class="kpi-label">DTM Elevation Min</div><div class="kpi-value">${data.dtm_range[0].toFixed(2)}<span class="kpi-unit"> m</span></div></div>
      <div class="kpi" style="--kpi-c:var(--g1)"><div class="kpi-label">DTM Elevation Max</div><div class="kpi-value">${data.dtm_range[1].toFixed(2)}<span class="kpi-unit"> m</span></div></div>
      <div class="kpi" style="--kpi-c:#58a6ff"><div class="kpi-label">Max Canopy Height</div><div class="kpi-value" style="color:#58a6ff">${data.chm_max.toFixed(2)}<span class="kpi-unit"> m</span></div></div>
      <div class="kpi" style="--kpi-c:#fbbf24"><div class="kpi-label">Mean Canopy Height</div><div class="kpi-value" style="color:#fbbf24">${data.chm_mean.toFixed(2)}<span class="kpi-unit"> m</span></div></div>
    </div>`;
  unlockTab('terrain');
  await runITD();
}

// ─── ITD ─────────────────────────────────────────────────────
async function runITD() {
  if (!STATE.chmData) return;
  setProgress(65, 'Individual tree detection…');
  let data;
  try {
    const res = await fetch(`${API}/api/itd/${STATE.sessionId}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chm_data:STATE.chmData, x_min:STATE.xMin, y_min:STATE.yMin, resolution:STATE.resolution })
    });
    data = await res.json();
  } catch(e) { setProgress(0); setDot('error'); return; }
  if (data.error) { setProgress(0); return; }

  STATE.trees = data.trees; STATE.summary = data.summary;
  setProgress(90, 'Building analytics…');
  updateInsightsOutputs(data.summary);
  unlockTab('analytics', data.summary.tree_count);
  unlockTab('spatial',   data.summary.tree_count);
  unlockTab('inventory', data.summary.tree_count);
  buildAnalyticsKPI(data.summary);
  buildCarbonCards(data.summary);
  renderTable(STATE.trees);
  buildInteractiveCharts(STATE.trees);
  setProgress(100, 'Pipeline complete ✓');
  setTimeout(() => { setProgress(0); setDot('done'); }, 1500);
  showFooter('terrainFooter');
  updateTopBarStats(document.querySelector('.tab-panel.active')?.id.replace('tab-','') || 'terrain');
  // Always check for a building (Class 6); runBuildingCarbon() itself
  // handles the "no building found" case and hides building UI cleanly.
  runBuildingCarbon();
}

// ─── ANALYTICS KPI ───────────────────────────────────────────
function buildAnalyticsKPI(s) {
  document.getElementById('analyticsKpi').innerHTML = `
    <div class="kpi" style="--kpi-c:var(--g1)"><div class="kpi-label">Trees Detected</div><div class="kpi-value">${s.tree_count}</div><div class="kpi-sub">Individual crowns</div></div>
    <div class="kpi" style="--kpi-c:#58a6ff"><div class="kpi-label">Total AGB</div><div class="kpi-value" style="color:#58a6ff">${s.total_agb_kg.toFixed(0)}<span class="kpi-unit"> kg</span></div><div class="kpi-sub">Above-ground biomass</div></div>
    <div class="kpi" style="--kpi-c:#fbbf24"><div class="kpi-label">Max Height</div><div class="kpi-value" style="color:#fbbf24">${s.max_height_m}<span class="kpi-unit"> m</span></div><div class="kpi-sub">Avg: ${s.avg_height_m} m</div></div>
    <div class="kpi" style="--kpi-c:var(--g2)"><div class="kpi-label">Avg Crown Area</div><div class="kpi-value">${s.avg_crown_area_m2}<span class="kpi-unit"> m²</span></div></div>`;
}

// ─── CARBON CARDS ────────────────────────────────────────────
function buildCarbonCards(s) {
  document.getElementById('carbonGrid').innerHTML = `
    <div class="carbon-card">
      <div class="cc-icon">🌿</div>
      <div class="cc-label">Above-Ground Biomass</div>
      <div class="cc-val" style="color:#4ade80">${s.total_agb_kg.toFixed(1)}<span class="cc-unit"> kg</span></div>
      <div class="cc-sub">Chave et al. 2014 pantropical equation</div>
    </div>
    <div class="carbon-card">
      <div class="cc-icon">♻</div>
      <div class="cc-label">Carbon Stock</div>
      <div class="cc-val" style="color:#34d399">${s.total_carbon_kg.toFixed(1)}<span class="cc-unit"> kg</span></div>
      <div class="cc-sub">AGB × 0.47 (IPCC carbon fraction)</div>
    </div>
    <div class="carbon-card">
      <div class="cc-icon">🌍</div>
      <div class="cc-label">CO₂ Equivalent</div>
      <div class="cc-val" style="color:#6ee7b7">${s.total_co2_kg.toFixed(1)}<span class="cc-unit"> kg</span></div>
      <div class="cc-sub">Carbon × 3.67 (CO₂/C ratio)</div>
    </div>
    <div class="carbon-card">
      <div class="cc-icon">🌲</div>
      <div class="cc-label">Trees Sequestering</div>
      <div class="cc-val" style="color:#a7f3d0">${s.tree_count}<span class="cc-unit"> trees</span></div>
      <div class="cc-sub" id="bldgCarbonSub">No building (Class 6) detected in this file</div>
    </div>`;
}

function renderAnalyticsBuildingSection(bd) {
  const el = document.getElementById('analyticsBuildingSection');
  if (!el) return;
  if (!bd || !bd.has_building) { el.style.display = 'none'; return; }

  const z = STATE.treeZones;
  if (!z) { el.style.display = 'none'; return; }

  el.style.display = 'block';
  el.innerHTML = `
    <div class="section-title" style="margin:24px 0 10px">Tree Carbon — Front Side vs Outside of Building</div>
    <div class="bss-strip">
      <div class="bss-item" style="border-color:#fbbf2444"><div class="bss-icon">🏠</div><div class="bss-body">
        <div class="bss-val" style="color:#fbbf24">${z.front.count}</div>
        <div class="bss-lbl">Trees — Front Side</div>
        <div class="bss-sub">${z.front.carbon_kg.toLocaleString()} kg Carbon · ${z.front.co2_kg.toLocaleString()} kg CO₂</div></div></div>
      <div class="bss-item" style="border-color:#4ade8044"><div class="bss-icon">🌳</div><div class="bss-body">
        <div class="bss-val" style="color:#4ade80">${z.outside.count}</div>
        <div class="bss-lbl">Trees — Outside Zone</div>
        <div class="bss-sub">${z.outside.carbon_kg.toLocaleString()} kg Carbon · ${z.outside.co2_kg.toLocaleString()} kg CO₂</div></div></div>
      <div class="bss-item" style="border-color:#6366f144"><div class="bss-icon">🏛</div><div class="bss-body">
        <div class="bss-val" style="color:#6366f1">${bd.building_area_m2.toLocaleString()}<span style="font-size:12px"> m²</span></div>
        <div class="bss-lbl">Building Footprint</div>
        <div class="bss-sub">${bd.building_carbon_vol_kg.toLocaleString()} kgCO₂e embodied (300 kg/m³ concrete)</div></div></div>
    </div>
    <div style="font-size:10px;color:var(--muted);font-family:'Space Mono',monospace;margin-top:8px">
      Front side detected: <span style="color:#fbbf24;font-weight:700">${bd.front_side}</span> ·
      Buffer depth: ${bd.front_buffer_m} m · Building max height: ${bd.max_height_m} m
    </div>`;
}

// ─── INTERACTIVE CHARTS ──────────────────────────────────────
function buildInteractiveCharts(trees) {
  const el = document.getElementById('chartsContent');
  if (STATE.scatterChart) { STATE.scatterChart.destroy(); STATE.scatterChart = null; }
  if (STATE.dbhChart)     { STATE.dbhChart.destroy();     STATE.dbhChart = null; }

  el.innerHTML = `
    <div class="chart-card">
      <div class="chart-title">Height vs Crown Area</div>
      <div class="chart-sub">Hover a point — see full tree details</div>
      <div style="position:relative;height:300px"><canvas id="scatterCanvas"></canvas></div>
    </div>
    <div class="chart-card">
      <div class="chart-title">DBH vs AGB</div>
      <div class="chart-sub">Hover a point — see full tree details</div>
      <div style="position:relative;height:300px"><canvas id="dbhCanvas"></canvas></div>
    </div>`;

  const ttOpts = {
    backgroundColor: '#161b22', borderColor: '#21262d', borderWidth:1,
    titleColor: '#39d353', bodyColor: '#8b949e', padding:10,
    callbacks: {
      title: items => `Tree #${trees[items[0].dataIndex].Tree_ID}`,
      label: item => {
        const t = trees[item.dataIndex];
        return [`Height:     ${t.Height_m.toFixed(2)} m`, `Crown Area: ${t.Crown_Area_m2} m²`,
          `DBH:        ${t.DBH_cm.toFixed(2)} cm`, `AGB:        ${t.AGB_kg.toFixed(2)} kg`,
          `Carbon:     ${t.Carbon_kg.toFixed(2)} kg`, `CO₂:        ${t.CO2_kg.toFixed(2)} kg`];
      }
    }
  };
  const scales = {
    x: { ticks:{color:'#6e7681',font:{family:'Space Mono',size:10}}, grid:{color:'#21262d'}, border:{color:'#30363d'} },
    y: { ticks:{color:'#6e7681',font:{family:'Space Mono',size:10}}, grid:{color:'#21262d'}, border:{color:'#30363d'} }
  };

  const maxAGB = Math.max(...trees.map(t => t.AGB_kg));
  STATE.scatterChart = new Chart(document.getElementById('scatterCanvas'), {
    type:'bubble',
    data:{ datasets:[{ data:trees.map(t=>({ x:t.Height_m, y:t.Crown_Area_m2, r:Math.max(4,(t.AGB_kg/maxAGB)*14) })),
      backgroundColor: trees.map(t=>{ const n=t.AGB_kg/maxAGB; const g=Math.round(100+n*155); return `rgba(30,${g},80,0.75)`; }),
      borderColor:'#26a64166', borderWidth:1 }] },
    options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{display:false}, tooltip:{...ttOpts,mode:'nearest',intersect:true} },
      scales:{ ...scales, x:{...scales.x,title:{display:true,text:'Height (m)',color:'#6e7681',font:{family:'Space Mono',size:10}}},
        y:{...scales.y,title:{display:true,text:'Crown Area (m²)',color:'#6e7681',font:{family:'Space Mono',size:10}}} } }
  });

  STATE.dbhChart = new Chart(document.getElementById('dbhCanvas'), {
    type:'scatter',
    data:{ datasets:[{ data:trees.map(t=>({x:t.DBH_cm,y:t.AGB_kg})),
      backgroundColor:'#26a64188', borderColor:'#39d353', borderWidth:1, pointRadius:5, pointHoverRadius:8 }] },
    options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{display:false}, tooltip:{...ttOpts,mode:'nearest',intersect:true} },
      scales:{ ...scales, x:{...scales.x,title:{display:true,text:'DBH (cm)',color:'#6e7681',font:{family:'Space Mono',size:10}}},
        y:{...scales.y,title:{display:true,text:'AGB (kg)',color:'#6e7681',font:{family:'Space Mono',size:10}}} } }
  });
}

// ─── NAVIGATION HELPERS ──────────────────────────────────────
function goAnalytics() { switchTab('analytics', document.querySelector('[data-tab="analytics"]')); }
function goSpatial()   { switchTab('spatial',   document.querySelector('[data-tab="spatial"]')); }
function goInventory() { switchTab('inventory', document.querySelector('[data-tab="inventory"]')); }

// ─── SPATIAL MAP (matches reference screenshot style) ────────
function setSpatialMode(mode, btn) {
  STATE.spatialMode = mode;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  drawSpatial();
}

/* Multi-stop gradient: cyan → green → amber → orange → red
   Exactly like the reference screenshot                     */
function treeColor(t, mode) {
  let val, lo, hi;
  const ts = STATE.trees;
  if (mode === 'height') { val=t.Height_m;     lo=Math.min(...ts.map(x=>x.Height_m));     hi=Math.max(...ts.map(x=>x.Height_m)); }
  if (mode === 'agb')    { val=t.AGB_kg;        lo=Math.min(...ts.map(x=>x.AGB_kg));        hi=Math.max(...ts.map(x=>x.AGB_kg)); }
  if (mode === 'crown')  { val=t.Crown_Area_m2; lo=Math.min(...ts.map(x=>x.Crown_Area_m2)); hi=Math.max(...ts.map(x=>x.Crown_Area_m2)); }
  const n = Math.min(1, Math.max(0, (val - lo) / (hi - lo || 1)));
  // 5-stop gradient matching reference image colors
  const stops = [
    [34,211,238],   // cyan    (low)
    [74,222,128],   // green
    [251,191,36],   // amber
    [249,115,22],   // orange
    [239,68,68]     // red     (high)
  ];
  const seg = n * (stops.length - 1);
  const i   = Math.min(Math.floor(seg), stops.length - 2);
  const f   = seg - i;
  const r = Math.round(stops[i][0] + (stops[i+1][0]-stops[i][0])*f);
  const g = Math.round(stops[i][1] + (stops[i+1][1]-stops[i][1])*f);
  const b = Math.round(stops[i][2] + (stops[i+1][2]-stops[i][2])*f);
  return [r, g, b];
}

function drawSpatial() {
  const trees = STATE.trees;
  if (!trees.length) return;

  const canvas = document.getElementById('spatialCanvas');
  const dpr    = window.devicePixelRatio || 1;
  const W      = canvas.offsetWidth  || 900;
  const H      = Math.round(W * 0.52); // same aspect ratio as reference

  canvas.width  = W * dpr;
  canvas.height = H * dpr;
  canvas.style.height = H + 'px';

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  // Dark navy background like reference
  ctx.fillStyle = '#0d1117';
  ctx.fillRect(0, 0, W, H);

  // Coordinates
  const xs = trees.map(t => t.X), ys = trees.map(t => t.Y);
  const xMin = Math.min(...xs), xMax = Math.max(...xs);
  const yMin = Math.min(...ys), yMax = Math.max(...ys);
  const xRange = xMax - xMin || 1;
  const yRange = yMax - yMin || 1;

  const padL = 58, padR = 20, padT = 16, padB = 30;
  const drawW = W - padL - padR;
  const drawH = H - padT - padB;

  // Scale to fill width, preserve aspect
  const scaleX = drawW / xRange;
  const scaleY = drawH / yRange;
  const scale  = Math.min(scaleX, scaleY);
  const offX   = padL + (drawW - xRange * scale) / 2;
  const offY   = padT + (drawH - yRange * scale) / 2;

  const toC = (x, y) => [
    offX + (x - xMin) * scale,
    H - padB - (drawH - yRange * scale) / 2 - (y - yMin) * scale
  ];

  // Subtle grid
  ctx.strokeStyle = '#21262d'; ctx.lineWidth = 1;
  const steps = 5;
  for (let i = 0; i <= steps; i++) {
    const [x1,y1] = toC(xMin + xRange*i/steps, yMin);
    const [x2,y2] = toC(xMin + xRange*i/steps, yMax);
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
    const [xa,ya] = toC(xMin, yMin + yRange*i/steps);
    const [xb,yb] = toC(xMax, yMin + yRange*i/steps);
    ctx.beginPath(); ctx.moveTo(xa,ya); ctx.lineTo(xb,yb); ctx.stroke();
  }

  // Axis labels — matching reference font/size/color
  ctx.fillStyle = '#6e7681'; ctx.font = '10px "Space Mono", monospace'; ctx.textAlign = 'center';
  for (let i = 0; i <= steps; i++) {
    const v = xMin + xRange * i / steps;
    const [x, y] = toC(v, yMin);
    ctx.fillText(Math.round(v), x, y + 16);
  }
  ctx.textAlign = 'right';
  for (let i = 0; i <= steps; i++) {
    const v = yMin + yRange * i / steps;
    const [x, y] = toC(xMin, v);
    ctx.fillText(Math.round(v), x - 6, y + 3);
  }

  // Draw crowns — sized by Crown_Diameter_m, colored by mode
  const mode = STATE.spatialMode;
  trees.forEach(t => {
    const [cx, cy] = toC(t.X, t.Y);
    // Crown radius in pixels: (diameter/2) * scale, with reasonable min/max
    const rPx = Math.max(4, Math.min((t.Crown_Diameter_m / 2) * scale, 50));
    const [r,g,b] = treeColor(t, mode);

    // Fill — translucent grey-blue tint like reference (crowns look grey with colored border)
    ctx.beginPath(); ctx.arc(cx, cy, rPx, 0, Math.PI*2);
    ctx.fillStyle = `rgba(${r},${g},${b},0.18)`;
    ctx.fill();

    // Colored border
    ctx.strokeStyle = `rgba(${r},${g},${b},0.9)`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });

  // Build legend
  const legEl = document.getElementById('spatialLegend');
  const modeLabels = {
    height: ['0 m','5 m','10 m','15 m','20 m'],
    agb:    ['Low AGB','','Mid','','High AGB'],
    crown:  ['Small Crown','','','','Large Crown']
  };
  const labels = modeLabels[mode];
  const stopColors = ['#22d3ee','#4ade80','#fbbf24','#f97316','#ef4444'];
  legEl.innerHTML = '<span style="font-size:10px;color:#6e7681;margin-right:8px;font-family:monospace">Low → High:</span>' +
    labels.map((lbl,i) => `<div class="sp-leg-item"><div class="sp-dot" style="background:${stopColors[i]}"></div>${lbl}</div>`).join('');

  // ── BUILDING: footprint outline + front-zone strip ──────────
  if (STATE.buildingData && STATE.buildingData.has_building && STATE.buildingData.bbox) {
    const bd = STATE.buildingData;
    const bb = bd.bbox;
    const buf = bd.front_buffer_m;

    ctx.save();
    const [bx1, by1] = toC(bb.x_min, bb.y_min);
    const [bx2, by2] = toC(bb.x_max, bb.y_max);

    // Front-zone strip (drawn first, behind the building outline)
    let fz1, fz2;
    if (bd.front_side === 'south') {
      fz1 = toC(bb.x_min, bb.y_min - buf); fz2 = toC(bb.x_max, bb.y_min);
    } else if (bd.front_side === 'north') {
      fz1 = toC(bb.x_min, bb.y_max); fz2 = toC(bb.x_max, bb.y_max + buf);
    } else if (bd.front_side === 'west') {
      fz1 = toC(bb.x_min - buf, bb.y_min); fz2 = toC(bb.x_min, bb.y_max);
    } else {
      fz1 = toC(bb.x_max, bb.y_min); fz2 = toC(bb.x_max + buf, bb.y_max);
    }
    ctx.fillStyle = 'rgba(251,191,36,0.10)';
    ctx.fillRect(Math.min(fz1[0],fz2[0]), Math.min(fz1[1],fz2[1]), Math.abs(fz2[0]-fz1[0]), Math.abs(fz2[1]-fz1[1]));
    ctx.strokeStyle = '#fbbf2466';
    ctx.lineWidth = 1;
    ctx.setLineDash([4,3]);
    ctx.strokeRect(Math.min(fz1[0],fz2[0]), Math.min(fz1[1],fz2[1]), Math.abs(fz2[0]-fz1[0]), Math.abs(fz2[1]-fz1[1]));
    ctx.setLineDash([]);

    // Building bounding box outline (dashed indigo rectangle)
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2;
    ctx.setLineDash([8,5]);
    ctx.strokeRect(bx1, by2, bx2-bx1, by1-by2);
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(99,102,241,0.10)';
    ctx.fillRect(bx1, by2, bx2-bx1, by1-by2);

    // Labels
    const [lblX, lblY] = toC((bb.x_min+bb.x_max)/2, bb.y_max);
    ctx.fillStyle = '#6366f1';
    ctx.font = 'bold 11px "Space Mono",monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`🏛 Building  ${bd.building_area_m2.toLocaleString()} m²`, lblX, lblY - 8);

    const z = STATE.treeZones;
    if (z) {
      ctx.fillStyle = '#fbbf24';
      ctx.font = '9px "Space Mono",monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`Front zone (${bd.front_side}): ${z.front.count} trees`, padL + 6, H - padB - 8);
    }
    ctx.restore();
  }

  showFooter('spatialFooter');

  // Hover tooltip
  canvas.onmousemove = e => {
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (W / rect.width);
    const my = (e.clientY - rect.top)  * (H / rect.height);
    const tt = document.getElementById('tooltip');

    // Check tree hit first
    const hit = trees.find(t => {
      const [cx,cy] = toC(t.X, t.Y);
      const rPx = Math.max(4, Math.min((t.Crown_Diameter_m/2)*scale, 50));
      return Math.hypot(cx-mx, cy-my) < rPx + 4;
    });

    if (hit) {
      document.getElementById('ttTitle').textContent = `Tree #${hit.Tree_ID}`;
      document.getElementById('ttBody').innerHTML = [
        ['Height',     `${hit.Height_m.toFixed(2)} m`],
        ['Crown Area', `${hit.Crown_Area_m2} m²`],
        ['Crown Ø',    `${hit.Crown_Diameter_m.toFixed(2)} m`],
        ['DBH',        `${hit.DBH_cm.toFixed(2)} cm`],
        ['AGB',        `${hit.AGB_kg.toFixed(2)} kg`],
        ['Carbon',     `${hit.Carbon_kg.toFixed(2)} kg`],
        ['CO₂',        `${hit.CO2_kg.toFixed(2)} kg`],
      ].map(([k,v])=>`<div class="tt-row"><span>${k}</span><span>${v}</span></div>`).join('');
      tt.style.left = (e.clientX + 16) + 'px';
      tt.style.top  = (e.clientY - 80) + 'px';
      tt.classList.add('show');
      return;
    }

    tt.classList.remove('show');
  };
  canvas.onmouseleave = () => document.getElementById('tooltip').classList.remove('show');
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.lineTo(x+w-r, y);
  ctx.arcTo(x+w, y, x+w, y+r, r);
  ctx.lineTo(x+w, y+h-r);
  ctx.arcTo(x+w, y+h, x+w-r, y+h, r);
  ctx.lineTo(x+r, y+h);
  ctx.arcTo(x, y+h, x, y+h-r, r);
  ctx.lineTo(x, y+r);
  ctx.arcTo(x, y, x+r, y, r);
  ctx.closePath();
}

// ─── TABLE ────────────────────────────────────────────────────
function renderTable(data) {
  const tbody  = document.getElementById('tableBody');
  const maxAGB = Math.max(...data.map(t => t.AGB_kg));
  const q      = STATE.filterQ.toLowerCase();
  const rows   = q ? data.filter(t => String(t.Tree_ID).includes(q)) : data;
  tbody.innerHTML = rows.map(t => `<tr>
    <td>#${t.Tree_ID}</td>
    <td>${t.X.toFixed(2)}</td>
    <td>${t.Y.toFixed(2)}</td>
    <td>${t.Height_m.toFixed(2)}</td>
    <td>${t.Crown_Area_m2}</td>
    <td>${t.Crown_Diameter_m.toFixed(2)}</td>
    <td>${t.DBH_cm.toFixed(2)}</td>
    <td><div class="mini-bar-wrap">${t.AGB_kg.toFixed(1)}<div class="mini-bar"><div class="mini-bar-fill" style="width:${(t.AGB_kg/maxAGB*100).toFixed(0)}%"></div></div></div></td>
    <td>${t.Carbon_kg.toFixed(2)}</td>
    <td>${t.CO2_kg.toFixed(2)}</td>
  </tr>`).join('');
  document.getElementById('inventoryCount').textContent =
    `${rows.length} trees${q?` matching "${q}"`:''}  ·  sorted by ${STATE.sortCol}`;
  updateInventoryBuildingSummary(STATE.buildingData);
}

function sortTable(ci, key) {
  if (STATE.sortCol === key) STATE.sortDir *= -1; else { STATE.sortCol=key; STATE.sortDir=-1; }
  STATE.trees.sort((a,b) => (a[key]-b[key]) * STATE.sortDir);
  renderTable(STATE.trees);
}
function filterTable(q) { STATE.filterQ = q; renderTable(STATE.trees); }

function updateInventoryBuildingSummary(bd) {
  const invBldg = document.getElementById('inventoryBuildingSummary');
  if (!invBldg) return;
  if (!bd || !bd.has_building) { invBldg.style.display = 'none'; return; }

  const z = STATE.treeZones;
  if (!z) { invBldg.style.display = 'none'; return; }

  invBldg.style.display = 'block';
  invBldg.innerHTML = `
    <div class="section-title" style="margin:18px 0 10px">🏛 Tree Carbon — Front Side vs Outside of Building</div>
    <div class="bldg-summary-strip">
      <div class="bss-item" style="border-color:#fbbf2444"><div class="bss-icon">🏠</div><div class="bss-body">
        <div class="bss-val" style="color:#fbbf24">${z.front.count}</div>
        <div class="bss-lbl">Trees — Front Side</div>
        <div class="bss-sub">${z.front.carbon_kg.toLocaleString()} kg Carbon · ${z.front.co2_kg.toLocaleString()} kg CO₂</div></div></div>
      <div class="bss-item" style="border-color:#4ade8044"><div class="bss-icon">🌳</div><div class="bss-body">
        <div class="bss-val" style="color:#4ade80">${z.outside.count}</div>
        <div class="bss-lbl">Trees — Outside Zone</div>
        <div class="bss-sub">${z.outside.carbon_kg.toLocaleString()} kg Carbon · ${z.outside.co2_kg.toLocaleString()} kg CO₂</div></div></div>
      <div class="bss-item" style="border-color:#6366f144"><div class="bss-icon">🏛</div><div class="bss-body">
        <div class="bss-val" style="color:#6366f1">${bd.building_area_m2.toLocaleString()}<span style="font-size:12px"> m²</span></div>
        <div class="bss-lbl">Building Footprint</div>
        <div class="bss-sub">${bd.building_carbon_vol_kg.toLocaleString()} kgCO₂e embodied</div></div></div>
    </div>`;
}

// ─── EXPORTS ──────────────────────────────────────────────────
function exportCSV() {
  if (!STATE.trees.length) return;
  const keys = Object.keys(STATE.trees[0]);
  let rows = [keys.join(','), ...STATE.trees.map(t => keys.map(k=>t[k]).join(','))];
  // Append tree-vs-building carbon zone summary if a building was detected
  if (STATE.buildingData && STATE.buildingData.has_building && STATE.treeZones) {
    const bd = STATE.buildingData;
    const z = STATE.treeZones;
    rows.push('', 'TREE CARBON — FRONT SIDE vs OUTSIDE OF BUILDING');
    rows.push('Zone,Tree_Count,AGB_kg,Carbon_kg,CO2_kg');
    const frontLabel = 'Front Side (' + bd.front_side + ')';
    rows.push([frontLabel, z.front.count, z.front.agb_kg, z.front.carbon_kg, z.front.co2_kg].join(','));
    rows.push(['Outside Zone', z.outside.count, z.outside.agb_kg, z.outside.carbon_kg, z.outside.co2_kg].join(','));
    rows.push('');
    rows.push(`Building Footprint (m2),${bd.building_area_m2}`);
    rows.push(`Building Volume (m3),${bd.building_volume_m3}`);
    rows.push(`Building Embodied Carbon (kgCO2e),${bd.building_carbon_vol_kg}`);
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([rows.join('\n')], {type:'text/csv'}));
  a.download = `lidar_analysis_${STATE.sessionId}.csv`;
  a.click();
}

function exportPDF() {
  if (!STATE.trees.length) { alert('No tree data. Run pipeline first.'); return; }
  const s = STATE.summary;
  const ts = STATE.trees;
  const maxH = Math.max(...ts.map(t=>t.Height_m));
  const maxC = Math.max(...ts.map(t=>t.Carbon_kg));
  const treeRows = ts.map(t => {
    const hcls = t.Height_m >= maxH*0.85 ? 'val-ok' : t.Height_m < maxH*0.3 ? 'val-warn' : '';
    const ccls = t.Carbon_kg >= maxC*0.75 ? 'val-ok' : '';
    return `<tr>
      <td>#${t.Tree_ID}</td>
      <td>${t.X.toFixed(2)}</td><td>${t.Y.toFixed(2)}</td>
      <td class="${hcls}">${t.Height_m.toFixed(2)} m</td>
      <td>${t.Crown_Area_m2} m²</td><td>${t.Crown_Diameter_m.toFixed(2)} m</td>
      <td>${t.DBH_cm.toFixed(2)} cm</td>
      <td>${t.AGB_kg.toFixed(2)}</td>
      <td class="${ccls}">${t.Carbon_kg.toFixed(2)}</td>
      <td>${t.CO2_kg.toFixed(2)}</td>
    </tr>`;
  }).join('');

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Tree Inventory Report</title>
  <style>${ENGINEERING_REPORT_CSS}</style></head><body>
  ${buildEngHeader('Tree Inventory Report','Forest Carbon Analytics Platform')}

  <div class="intro-banner">
    Full per-tree inventory derived from LiDAR point cloud analysis. Includes spatial coordinates, biometric estimates (Height, Crown Area, DBH) and allometric carbon pipeline outputs (AGB, Carbon stock, CO₂ equivalent) for all ${s.tree_count} detected trees.
  </div>

  <div class="kpi-row">
    <div class="kpi-cell"><div class="kpi-lbl">Trees Detected</div><div class="kpi-val">${s.tree_count}</div></div>
    <div class="kpi-cell"><div class="kpi-lbl">Total AGB</div><div class="kpi-val">${s.total_agb_kg.toFixed(1)} kg</div></div>
    <div class="kpi-cell"><div class="kpi-lbl">Carbon Stock</div><div class="kpi-val">${s.total_carbon_kg.toFixed(1)} kg</div></div>
    <div class="kpi-cell"><div class="kpi-lbl">CO₂ Equivalent</div><div class="kpi-val">${s.total_co2_kg.toFixed(1)} kg</div></div>
    <div class="kpi-cell"><div class="kpi-lbl">Avg Height</div><div class="kpi-val">${s.avg_height_m} m</div></div>
    <div class="kpi-cell"><div class="kpi-lbl">Max Height</div><div class="kpi-val">${s.max_height_m} m</div></div>
    <div class="kpi-cell"><div class="kpi-lbl">Avg Crown Area</div><div class="kpi-val">${s.avg_crown_area_m2} m²</div></div>
  </div>

  <div class="sec-header">Section 1 — Tree Inventory</div>
  <div class="report-section">
    <table><thead><tr>
      <th>Tree ID</th><th>X Coord</th><th>Y Coord</th><th>Height</th>
      <th>Crown Area</th><th>Crown Ø</th><th>DBH</th>
      <th>AGB (kg)</th><th>Carbon (kg)</th><th>CO₂ (kg)</th>
    </tr></thead><tbody>${treeRows}</tbody></table>
  </div>

  <div class="no-print" style="text-align:center;padding:16px">
    <button onclick="window.print()" style="background:#1a3a5c;color:#fff;border:none;padding:10px 28px;border-radius:4px;font-size:13px;cursor:pointer">🖨 Print / Save PDF</button>
  </div>
  </body></html>`;
  const win = window.open('','_blank');
  if(!win){alert('Pop-up blocked — please allow pop-ups');return;}
  win.document.write(html); win.document.close();
}

/* Analytics PDF */
function exportAnalyticsPDF() {
  if (!STATE.trees.length) { alert('No analytics data. Run pipeline first.'); return; }
  const s = STATE.summary;
  const scatterImg = document.getElementById('scatterCanvas')?.toDataURL('image/png') || '';
  const dbhImg     = document.getElementById('dbhCanvas')?.toDataURL('image/png')     || '';

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Analytics Report</title>
  <style>${ENGINEERING_REPORT_CSS}</style></head><body>
  ${buildEngHeader('Analytics Report','Forest Carbon Analytics Platform')}

  <div class="intro-banner">
    Carbon stock analytics from LiDAR-derived tree metrics. Allometric model: Chave et al. (2014) pantropical equation with IPCC carbon conversion factors.
  </div>

  <div class="kpi-row">
    <div class="kpi-cell"><div class="kpi-lbl">Trees Detected</div><div class="kpi-val">${s.tree_count}</div></div>
    <div class="kpi-cell"><div class="kpi-lbl">Total AGB</div><div class="kpi-val">${s.total_agb_kg.toFixed(1)} kg</div></div>
    <div class="kpi-cell"><div class="kpi-lbl">Carbon Stock</div><div class="kpi-val">${s.total_carbon_kg.toFixed(1)} kg</div></div>
    <div class="kpi-cell"><div class="kpi-lbl">CO₂ Equivalent</div><div class="kpi-val">${s.total_co2_kg.toFixed(1)} kg</div></div>
    <div class="kpi-cell"><div class="kpi-lbl">Avg Height</div><div class="kpi-val">${s.avg_height_m} m</div></div>
    <div class="kpi-cell"><div class="kpi-lbl">Max Height</div><div class="kpi-val">${s.max_height_m} m</div></div>
  </div>

  <div class="sec-header">Section 1 — Carbon &amp; CO₂ Summary</div>
  <div class="card-row">
    <div class="s-card"><div class="s-lbl">Above-Ground Biomass</div><div class="s-val">${s.total_agb_kg.toFixed(1)} kg</div><div class="s-sub">Chave et al. 2014 pantropical</div></div>
    <div class="s-card"><div class="s-lbl">Carbon Stock</div><div class="s-val">${s.total_carbon_kg.toFixed(1)} kg</div><div class="s-sub">AGB × 0.47 (IPCC carbon fraction)</div></div>
    <div class="s-card"><div class="s-lbl">CO₂ Equivalent</div><div class="s-val">${s.total_co2_kg.toFixed(1)} kg</div><div class="s-sub">Carbon × 3.67 (CO₂/C ratio)</div></div>
    <div class="s-card"><div class="s-lbl">Avg Crown Area</div><div class="s-val">${s.avg_crown_area_m2} m²</div></div>
  </div>

  <div class="sec-header">Section 2 — Tree Biometrics Charts</div>
  <div class="report-section" style="display:flex;gap:14px;padding-top:16px">
    ${scatterImg ? `<img src="${scatterImg}" style="flex:1;max-width:48%;border-radius:4px;border:1px solid #d0d8e4">` : ''}
    ${dbhImg     ? `<img src="${dbhImg}"     style="flex:1;max-width:48%;border-radius:4px;border:1px solid #d0d8e4">` : ''}
  </div>

  <div class="no-print" style="text-align:center;padding:16px">
    <button onclick="window.print()" style="background:#1a3a5c;color:#fff;border:none;padding:10px 28px;border-radius:4px;font-size:13px;cursor:pointer">🖨 Print / Save PDF</button>
  </div>
  </body></html>`;
  const win = window.open('','_blank');
  if(!win){alert('Pop-up blocked — please allow pop-ups');return;}
  win.document.write(html); win.document.close();
}

/* Full Engineering Report */
function exportFullReport() {
  if (!STATE.trees.length) { alert('No data. Run the full pipeline first.'); return; }
  const s   = STATE.summary;
  const ts  = STATE.trees;
  const scatterImg = document.getElementById('scatterCanvas')?.toDataURL('image/png') || '';
  const dbhImg     = document.getElementById('dbhCanvas')?.toDataURL('image/png')     || '';

  const maxH = Math.max(...ts.map(t=>t.Height_m));
  const maxC = Math.max(...ts.map(t=>t.Carbon_kg));

  const classRows = STATE.classes.map(c =>
    `<tr><td>${c.id}</td><td>${c.name}</td><td>${c.count.toLocaleString()}</td><td>${c.pct}%</td></tr>`
  ).join('');

  const treeRows = ts.map(t => {
    const hcls = t.Height_m >= maxH*0.85 ? 'val-ok' : t.Height_m < maxH*0.25 ? 'val-warn' : '';
    const ccls = t.Carbon_kg >= maxC*0.75 ? 'val-ok' : '';
    return `<tr>
      <td>#${t.Tree_ID}</td>
      <td>${t.X.toFixed(2)}</td><td>${t.Y.toFixed(2)}</td>
      <td class="${hcls}">${t.Height_m.toFixed(2)} m</td>
      <td>${t.Crown_Area_m2} m²</td><td>${t.Crown_Diameter_m.toFixed(2)} m</td>
      <td>${t.DBH_cm.toFixed(2)} cm</td>
      <td>${t.AGB_kg.toFixed(2)}</td>
      <td class="${ccls}">${t.Carbon_kg.toFixed(2)}</td>
      <td>${t.CO2_kg.toFixed(2)}</td>
    </tr>`;
  }).join('');

  /* Building zone section (only if Class 6 present) */
  let bldgSection = '';
  if (STATE.buildingData && STATE.buildingData.has_building && STATE.treeZones) {
    const bd = STATE.buildingData;
    const z  = STATE.treeZones;
    const tc = z.front.carbon_kg + z.outside.carbon_kg || 1;
    bldgSection = `
    <div class="page-break"></div>
    <div class="sec-header">Section 4 — Tree Carbon: Front Side vs Outside of Building</div>
    <div class="card-row">
      <div class="s-card"><div class="s-lbl">Ground Elevation</div><div class="s-val">${bd.z_ground} m</div><div class="s-sub">AMSL (median Class 2)</div></div>
      <div class="s-card"><div class="s-lbl">Building Max Height</div><div class="s-val">${bd.max_height_m} m</div></div>
      <div class="s-card"><div class="s-lbl">Building Footprint</div><div class="s-val">${bd.building_area_m2.toLocaleString()} m²</div></div>
      <div class="s-card"><div class="s-lbl">Embodied Carbon</div><div class="s-val">${bd.building_carbon_vol_kg.toLocaleString()} kgCO₂e</div><div class="s-sub">300 kgCO₂e/m³ concrete</div></div>
      <div class="s-card"><div class="s-lbl">Front Side</div><div class="s-val">${bd.front_side.toUpperCase()}</div><div class="s-sub">${bd.front_buffer_m} m buffer</div></div>
    </div>
    <div class="report-section">
      <table><thead><tr>
        <th>Zone</th><th>Tree Count</th><th>AGB (kg)</th><th>Carbon (kg)</th><th>CO₂ (kg)</th><th>Carbon Share</th>
      </tr></thead><tbody>
        <tr>
          <td><b>Front Side (${bd.front_side})</b></td>
          <td>${z.front.count}</td>
          <td>${z.front.agb_kg.toLocaleString()}</td>
          <td class="val-warn">${z.front.carbon_kg.toLocaleString()}</td>
          <td>${z.front.co2_kg.toLocaleString()}</td>
          <td>${(z.front.carbon_kg/tc*100).toFixed(1)}%</td>
        </tr>
        <tr>
          <td><b>Outside Zone</b></td>
          <td>${z.outside.count}</td>
          <td>${z.outside.agb_kg.toLocaleString()}</td>
          <td class="val-ok">${z.outside.carbon_kg.toLocaleString()}</td>
          <td>${z.outside.co2_kg.toLocaleString()}</td>
          <td>${(z.outside.carbon_kg/tc*100).toFixed(1)}%</td>
        </tr>
        <tr style="font-weight:700;background:#eef2f8">
          <td>TOTAL</td>
          <td>${z.front.count+z.outside.count}</td>
          <td>${(z.front.agb_kg+z.outside.agb_kg).toLocaleString()}</td>
          <td>${tc.toFixed(1)}</td>
          <td>${(z.front.co2_kg+z.outside.co2_kg).toLocaleString()}</td>
          <td>100%</td>
        </tr>
      </tbody></table>
    </div>`;
  }

  /* Annex */
  const annexSection = `
  <div class="page-break"></div>
  <div class="sec-header">Annex A — Methodology &amp; Run Details</div>
  <div class="card-row" style="flex-wrap:wrap;gap:10px">
    <div class="s-card" style="min-width:200px"><div class="s-lbl">File Name</div><div class="s-val" style="font-size:13px">${STATE.filename||'—'}</div></div>
    <div class="s-card" style="min-width:200px"><div class="s-lbl">Session ID</div><div class="s-val" style="font-size:13px;font-family:monospace">${STATE.sessionId||'—'}</div></div>
    <div class="s-card" style="min-width:200px"><div class="s-lbl">Total Points</div><div class="s-val" style="font-size:13px">${STATE.totalPoints.toLocaleString()}</div></div>
    <div class="s-card" style="min-width:200px"><div class="s-lbl">Survey Area</div><div class="s-val" style="font-size:13px">${(STATE.areaM2/10000).toFixed(2)} ha</div></div>
    <div class="s-card" style="min-width:200px"><div class="s-lbl">Grid Resolution</div><div class="s-val" style="font-size:13px">1.0 m</div></div>
    <div class="s-card" style="min-width:200px"><div class="s-lbl">Trees Detected</div><div class="s-val" style="font-size:13px">${s.tree_count}</div></div>
  </div>
  <div class="report-section" style="padding-top:16px">
    <table><thead><tr><th>Step</th><th>Method</th><th>Parameters</th></tr></thead><tbody>
      <tr><td>DTM / DSM</td><td>Minimum / Maximum elevation binning per 1 m grid cell</td><td>Ground = Class 2 · Vegetation = Classes 3, 4, 5</td></tr>
      <tr><td>CHM</td><td>CHM = DSM − DTM, clipped to ≥ 0</td><td>Resolution 1.0 m · NaN filled via nearest-neighbour</td></tr>
      <tr><td>Tree Top Detection</td><td>scikit-image peak_local_max on CHM</td><td>min_distance = 3 · threshold_abs = 2</td></tr>
      <tr><td>Crown Delineation</td><td>Marker-controlled watershed segmentation</td><td>Mask: CHM > 2 m · Min crown area: 5 m²</td></tr>
      <tr><td>DBH Estimation</td><td>Empirical allometric from LiDAR metrics</td><td>DBH = 1.3 + 0.6·H + 0.3·CrownØ</td></tr>
      <tr><td>AGB</td><td>Chave et al. (2014) pantropical equation</td><td>AGB = 0.0673 × (ρ·DBH²·H)^0.976 · ρ = 0.6 g/cm³</td></tr>
      <tr><td>Carbon Stock</td><td>IPCC carbon fraction</td><td>Carbon = AGB × 0.47</td></tr>
      <tr><td>CO₂ Equivalent</td><td>Molecular mass ratio</td><td>CO₂ = Carbon × 3.67 (44/12)</td></tr>
    </tbody></table>
    <p style="margin-top:12px;font-size:10px;color:#607080;line-height:1.7">
      Developed with support from <b>IIT Tirupati Navavishkär I-Hub Foundation</b> under the National Mission on Interdisciplinary Cyber-Physical Systems (NM-ICPS), Department of Science &amp; Technology, Government of India. Pipeline: ForestCarbon Engine v2.0.
    </p>
  </div>`;

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Full Forest Carbon Report</title>
  <style>${ENGINEERING_REPORT_CSS}</style></head><body>
  ${buildEngHeader('Full Forest Carbon Analysis Report','Forest Carbon Analytics Platform')}

  <div class="intro-banner">
    This report provides a comprehensive analysis of the forest surveyed via LiDAR point cloud technology. It covers point cloud classification, terrain model generation, individual tree detection, allometric biomass estimation, and carbon stock assessment across all detected trees.
  </div>

  <div class="kpi-row">
    <div class="kpi-cell"><div class="kpi-lbl">LiDAR Points</div><div class="kpi-val">${STATE.totalPoints.toLocaleString()}</div></div>
    <div class="kpi-cell"><div class="kpi-lbl">Classes Found</div><div class="kpi-val">${STATE.classes.length}</div></div>
    <div class="kpi-cell"><div class="kpi-lbl">Trees Detected</div><div class="kpi-val">${s.tree_count}</div></div>
    <div class="kpi-cell"><div class="kpi-lbl">Total AGB</div><div class="kpi-val">${s.total_agb_kg.toFixed(1)} kg</div></div>
    <div class="kpi-cell"><div class="kpi-lbl">Carbon Stock</div><div class="kpi-val">${s.total_carbon_kg.toFixed(1)} kg</div></div>
    <div class="kpi-cell"><div class="kpi-lbl">CO₂ Equivalent</div><div class="kpi-val">${s.total_co2_kg.toFixed(1)} kg</div></div>
    <div class="kpi-cell"><div class="kpi-lbl">Max Height</div><div class="kpi-val">${s.max_height_m} m</div></div>
    <div class="kpi-cell"><div class="kpi-lbl">Survey Area</div><div class="kpi-val">${(STATE.areaM2/10000).toFixed(2)} ha</div></div>
  </div>

  <div class="sec-header">Section 1 — Point Cloud Classification</div>
  <div class="report-section">
    <table><thead><tr><th>Class ID</th><th>Name</th><th>Point Count</th><th>% of Total</th></tr></thead>
    <tbody>${classRows}</tbody></table>
  </div>

  <div class="sec-header">Section 2 — Carbon &amp; CO₂ Stock Summary</div>
  <div class="card-row">
    <div class="s-card"><div class="s-lbl">Above-Ground Biomass</div><div class="s-val">${s.total_agb_kg.toFixed(1)} kg</div><div class="s-sub">Chave et al. 2014 pantropical</div></div>
    <div class="s-card"><div class="s-lbl">Carbon Stock</div><div class="s-val">${s.total_carbon_kg.toFixed(1)} kg</div><div class="s-sub">AGB × 0.47 (IPCC)</div></div>
    <div class="s-card"><div class="s-lbl">CO₂ Equivalent</div><div class="s-val">${s.total_co2_kg.toFixed(1)} kg</div><div class="s-sub">Carbon × 3.67</div></div>
    <div class="s-card"><div class="s-lbl">Avg Height</div><div class="s-val">${s.avg_height_m} m</div><div class="s-sub">Max: ${s.max_height_m} m</div></div>
    <div class="s-card"><div class="s-lbl">Avg Crown Area</div><div class="s-val">${s.avg_crown_area_m2} m²</div></div>
  </div>

  <div class="sec-header" style="margin-top:8px">Section 2b — Tree Biometrics Charts</div>
  <div style="display:flex;gap:14px;padding:16px 32px 24px">
    ${scatterImg ? `<img src="${scatterImg}" style="flex:1;max-width:48%;border-radius:4px;border:1px solid #d0d8e4">` : ''}
    ${dbhImg     ? `<img src="${dbhImg}"     style="flex:1;max-width:48%;border-radius:4px;border:1px solid #d0d8e4">` : ''}
  </div>

  <div class="page-break"></div>
  <div class="sec-header">Section 3 — Full Tree Inventory (${ts.length} trees)</div>
  <div class="report-section">
    <table><thead><tr>
      <th>Tree ID</th><th>X Coord</th><th>Y Coord</th><th>Height</th>
      <th>Crown Area</th><th>Crown Ø</th><th>DBH</th>
      <th>AGB (kg)</th><th>Carbon (kg)</th><th>CO₂ (kg)</th>
    </tr></thead><tbody>${treeRows}</tbody></table>
  </div>

  ${bldgSection}
  ${annexSection}

  <div class="no-print" style="text-align:center;padding:20px">
    <button onclick="window.print()" style="background:#1a3a5c;color:#fff;border:none;padding:12px 32px;border-radius:4px;font-size:14px;cursor:pointer;font-weight:600">🖨 Print / Save PDF</button>
  </div>
  </body></html>`;

  const win = window.open('','_blank');
  if(!win){alert('Pop-up blocked — please allow pop-ups');return;}
  win.document.write(html); win.document.close();
}


// ─── INSIGHTS ─────────────────────────────────────────────────
function updateInsightsOutputs(s) {
  try {
    sessionStorage.setItem('lidar_summary', JSON.stringify(
      Object.assign({}, s, { area_ha: (STATE.areaM2/10000).toFixed(2) })
    ));
  } catch(e) {}
}

// ─── RESIZE ───────────────────────────────────────────────────
window.addEventListener('resize', () => {
  if (document.getElementById('tab-spatial').classList.contains('active')) drawSpatial();
});

// ══════════════════════════════════════════════════════════════
// TREE CARBON — FRONT SIDE vs OUTSIDE OF BUILDING
// ══════════════════════════════════════════════════════════════

/* Classify each detected tree as "front zone" or "outside zone" relative
   to the building footprint, then sum AGB/Carbon/CO2 per zone. This is
   computed entirely client-side against the existing STATE.trees list,
   so totals always match the Analytics tab exactly — no separate
   tree-detection run is needed for the building comparison. */
function computeTreeZones(bd) {
  if (!bd || !bd.has_building || !STATE.trees.length) { STATE.treeZones = null; return; }
  const zt = bd.zone_test;
  const inFrontZone = (x, y) => {
    if (zt.side === 'south') return y < zt.y_min && y > zt.y_min - zt.buffer_m;
    if (zt.side === 'north') return y > zt.y_max && y < zt.y_max + zt.buffer_m;
    if (zt.side === 'west')  return x < zt.x_min && x > zt.x_min - zt.buffer_m;
    return x > zt.x_max && x < zt.x_max + zt.buffer_m;
  };

  const front = { count:0, agb_kg:0, carbon_kg:0, co2_kg:0 };
  const outside = { count:0, agb_kg:0, carbon_kg:0, co2_kg:0 };

  STATE.trees.forEach(t => {
    const zone = inFrontZone(t.X, t.Y) ? front : outside;
    zone.count++;
    zone.agb_kg += t.AGB_kg;
    zone.carbon_kg += t.Carbon_kg;
    zone.co2_kg += t.CO2_kg;
  });

  [front, outside].forEach(z => {
    z.agb_kg = Math.round(z.agb_kg * 10) / 10;
    z.carbon_kg = Math.round(z.carbon_kg * 10) / 10;
    z.co2_kg = Math.round(z.co2_kg * 10) / 10;
  });

  STATE.treeZones = { front, outside };
}

// Called automatically once tree detection (ITD) completes — checks for
// a building (Class 6) and, if present, computes the front/outside split.
async function runBuildingCarbon() {
  if (!STATE.sessionId) return;
  const el = document.getElementById('buildingContent');
  if (el) el.innerHTML = '<div class="loading-placeholder"><div class="spinner"></div><span>Checking for building footprint…</span></div>';

  try {
    const res  = await fetch(`${API}/api/building_carbon/${STATE.sessionId}`);
    const data = await res.json();
    if (!res.ok) {
      if (el) el.innerHTML = `<div class="status-card" style="color:var(--accent5)">⚠ ${data.error}</div>`;
      return;
    }
    STATE.buildingData = data;

    if (!data.has_building) {
      // No building in this file — tree-only mode. Hide building UI
      // everywhere; the rest of the dashboard already shows full tree
      // results, so nothing else needs to change.
      if (el) el.innerHTML = `
        <div class="status-card" style="color:var(--muted)">
          🌲 No building (Class 6) detected in this file — showing tree data only.
        </div>`;
      const navBuilding = document.getElementById('nav-building');
      if (navBuilding) navBuilding.style.display = 'none';
      const bldgSection = document.getElementById('analyticsBuildingSection');
      if (bldgSection) bldgSection.style.display = 'none';
      const invBldg = document.getElementById('inventoryBuildingSummary');
      if (invBldg) invBldg.style.display = 'none';
      STATE.treeZones = null;
      return;
    }

    // Building found — both tree and building info shown together.
    computeTreeZones(data);
    renderBuildingPanel(data);
    if (STATE.summary) renderAnalyticsBuildingSection(data);
    updateInventoryBuildingSummary(data);
    if (typeof drawSpatial === 'function') drawSpatial();
    unlockTab('building', STATE.treeZones ? (STATE.treeZones.front.count + STATE.treeZones.outside.count) : 0);
    const badge = document.getElementById('nav-badge-building');
    if (badge) badge.textContent = 'Front/Outside';
  } catch(e) {
    if (el) el.innerHTML = `<div class="status-card" style="color:var(--accent5)">⚠ ${e.message}</div>`;
  }
}

function renderBuildingPanel(data) {
  const el = document.getElementById('buildingContent');
  if (!el) return;
  const z = STATE.treeZones;

  el.innerHTML = `
    <div class="section-title" style="margin-bottom:10px">Building Overview</div>
    <div class="bldg-summary-strip">
      <div class="bss-item">
        <div class="bss-icon">📍</div>
        <div class="bss-body">
          <div class="bss-val">${data.z_ground}</div>
          <div class="bss-lbl">Ground Elevation (m AMSL)</div>
          <div class="bss-sub">median of Class 2 points</div>
        </div>
      </div>
      <div class="bss-item">
        <div class="bss-icon">📐</div>
        <div class="bss-body">
          <div class="bss-val">${data.max_height_m}</div>
          <div class="bss-lbl">Max Building Height (m)</div>
          <div class="bss-sub">above ground level</div>
        </div>
      </div>
      <div class="bss-item">
        <div class="bss-icon">🗺</div>
        <div class="bss-body">
          <div class="bss-val">${data.building_area_m2.toLocaleString()}</div>
          <div class="bss-lbl">Building Footprint (m²)</div>
          <div class="bss-sub">height &gt; 2 m cells × 1 m²</div>
        </div>
      </div>
      <div class="bss-item">
        <div class="bss-icon">📦</div>
        <div class="bss-body">
          <div class="bss-val">${data.building_volume_m3.toLocaleString()}</div>
          <div class="bss-lbl">Building Volume (m³)</div>
          <div class="bss-sub">${data.building_carbon_vol_kg.toLocaleString()} kgCO₂e embodied</div>
        </div>
      </div>
    </div>

    <div class="section-title" style="margin:24px 0 10px">Tree Carbon — Front Side vs Outside of Building</div>
    <div class="chart-card" style="text-align:center;padding:12px;margin-bottom:20px">
      <img src="data:image/png;base64,${data.plan_image}" style="max-width:600px;width:100%;border-radius:8px">
    </div>

    ${z ? `
    <div class="bldg-summary-strip">
      <div class="bss-item" style="border-color:#fbbf2444">
        <div class="bss-icon">🏠</div>
        <div class="bss-body">
          <div class="bss-val" style="color:#fbbf24">${z.front.count}</div>
          <div class="bss-lbl">Trees — Front Side (${data.front_side})</div>
          <div class="bss-sub">${data.front_buffer_m} m buffer strip</div>
        </div>
      </div>
      <div class="bss-item" style="border-color:#4ade8044">
        <div class="bss-icon">🌳</div>
        <div class="bss-body">
          <div class="bss-val" style="color:#4ade80">${z.outside.count}</div>
          <div class="bss-lbl">Trees — Outside Zone</div>
          <div class="bss-sub">Rest of surveyed area</div>
        </div>
      </div>
      <div class="bss-item bss-grand" style="border-color:#fbbf2444">
        <div class="bss-icon">♻</div>
        <div class="bss-body">
          <div class="bss-val" style="color:#fbbf24">${z.front.carbon_kg.toLocaleString()}</div>
          <div class="bss-lbl">Front Carbon (kg)</div>
          <div class="bss-sub">${z.front.co2_kg.toLocaleString()} kg CO₂ equiv.</div>
        </div>
      </div>
      <div class="bss-item" style="border-color:#4ade8044">
        <div class="bss-icon">♻</div>
        <div class="bss-body">
          <div class="bss-val" style="color:#4ade80">${z.outside.carbon_kg.toLocaleString()}</div>
          <div class="bss-lbl">Outside Carbon (kg)</div>
          <div class="bss-sub">${z.outside.co2_kg.toLocaleString()} kg CO₂ equiv.</div>
        </div>
      </div>
    </div>

    <div class="zone-compare-bar">
      <div class="zcb-track">
        <div class="zcb-seg" style="width:${(z.front.carbon_kg/(z.front.carbon_kg+z.outside.carbon_kg)*100).toFixed(1)}%;background:#fbbf24" title="Front: ${z.front.carbon_kg.toLocaleString()} kg"></div>
        <div class="zcb-seg" style="width:${(z.outside.carbon_kg/(z.front.carbon_kg+z.outside.carbon_kg)*100).toFixed(1)}%;background:#4ade80" title="Outside: ${z.outside.carbon_kg.toLocaleString()} kg"></div>
      </div>
      <div class="zcb-legend">
        <span style="color:#fbbf24">■ Front Side: ${(z.front.carbon_kg/(z.front.carbon_kg+z.outside.carbon_kg)*100).toFixed(1)}% of tree carbon</span>
        <span style="color:#4ade80">■ Outside: ${(z.outside.carbon_kg/(z.front.carbon_kg+z.outside.carbon_kg)*100).toFixed(1)}% of tree carbon</span>
      </div>
    </div>
    ` : `<div class="status-card" style="color:var(--muted)">Run tree detection (Analytics tab) first to see the front/outside carbon split.</div>`}

    <p style="font-size:10px;color:var(--dim);margin-top:14px">
      Front-side zone: ${data.front_buffer_m} m buffer along the ${data.front_side} facade (the side facing the densest surrounding vegetation) ·
      Building embodied carbon: 300 kgCO₂e/m³ (concrete) · Each tree classified by its detected (X, Y) centroid.
    </p>`;
}

// ── CSV export ───────────────────────────────────────────────
function exportBuildingCSV() {
  if (!STATE.buildingData || !STATE.buildingData.has_building) { alert('No building detected in this file.'); return; }
  const z = STATE.treeZones;
  if (!z) { alert('Run tree detection first.'); return; }
  const bd = STATE.buildingData;
  const lines = ['Zone,Tree_Count,AGB_kg,Carbon_kg,CO2_kg'];
  lines.push(['Front Side ('+bd.front_side+')', z.front.count, z.front.agb_kg, z.front.carbon_kg, z.front.co2_kg].join(','));
  lines.push(['Outside Zone', z.outside.count, z.outside.agb_kg, z.outside.carbon_kg, z.outside.co2_kg].join(','));
  lines.push(['TOTAL', z.front.count+z.outside.count,
              (z.front.agb_kg+z.outside.agb_kg).toFixed(1),
              (z.front.carbon_kg+z.outside.carbon_kg).toFixed(1),
              (z.front.co2_kg+z.outside.co2_kg).toFixed(1)].join(','));
  lines.push('');
  lines.push('Building Footprint (m2),' + bd.building_area_m2);
  lines.push('Building Volume (m3),' + bd.building_volume_m3);
  lines.push('Building Embodied Carbon (kgCO2e),' + bd.building_carbon_vol_kg);
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(lines.join('\n'));
  a.download = `tree_building_carbon_${STATE.sessionId||'data'}.csv`;
  a.click();
}

// ── PDF export ───────────────────────────────────────────────
function exportBuildingPDF() {
  if (!STATE.buildingData || !STATE.buildingData.has_building) { alert('No building detected in this file.'); return; }
  const bd = STATE.buildingData;
  const z  = STATE.treeZones;
  const tc = z ? (z.front.carbon_kg + z.outside.carbon_kg) || 1 : 1;

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <title>Tree vs Building Carbon Report</title>
  <style>${ENGINEERING_REPORT_CSS}</style></head><body>
  ${buildEngHeader('Tree vs Building Carbon Report','Forest Carbon Analytics Platform')}

  <div class="intro-banner">
    Comparison of tree carbon stock in the front-side buffer zone versus the wider outside zone, relative to the detected building footprint (Class 6). Includes building embodied carbon estimate based on volume and concrete emission factor.
  </div>

  <div class="kpi-row">
    <div class="kpi-cell"><div class="kpi-lbl">Building Footprint</div><div class="kpi-val">${bd.building_area_m2.toLocaleString()} m²</div></div>
    <div class="kpi-cell"><div class="kpi-lbl">Building Height</div><div class="kpi-val">${bd.max_height_m} m</div></div>
    <div class="kpi-cell"><div class="kpi-lbl">Building Volume</div><div class="kpi-val">${bd.building_volume_m3.toLocaleString()} m³</div></div>
    <div class="kpi-cell"><div class="kpi-lbl">Embodied Carbon</div><div class="kpi-val">${bd.building_carbon_vol_kg.toLocaleString()} kgCO₂e</div></div>
    <div class="kpi-cell"><div class="kpi-lbl">Front Side</div><div class="kpi-val">${bd.front_side.toUpperCase()}</div></div>
    <div class="kpi-cell"><div class="kpi-lbl">Front Trees</div><div class="kpi-val">${z ? z.front.count : '—'}</div></div>
    <div class="kpi-cell"><div class="kpi-lbl">Outside Trees</div><div class="kpi-val">${z ? z.outside.count : '—'}</div></div>
  </div>

  <div class="sec-header">Section 1 — Building Overview</div>
  <div class="card-row">
    <div class="s-card"><div class="s-lbl">Ground Elevation</div><div class="s-val">${bd.z_ground} m</div><div class="s-sub">AMSL (median Class 2)</div></div>
    <div class="s-card"><div class="s-lbl">Max Height</div><div class="s-val">${bd.max_height_m} m</div><div class="s-sub">Above ground level</div></div>
    <div class="s-card"><div class="s-lbl">Footprint Area</div><div class="s-val">${bd.building_area_m2.toLocaleString()} m²</div><div class="s-sub">Cells with height &gt; 2 m</div></div>
    <div class="s-card"><div class="s-lbl">Volume</div><div class="s-val">${bd.building_volume_m3.toLocaleString()} m³</div><div class="s-sub">Summed grid cell heights</div></div>
    <div class="s-card"><div class="s-lbl">Embodied Carbon</div><div class="s-val">${bd.building_carbon_vol_kg.toLocaleString()}</div><div class="s-sub">kgCO₂e · 300 kg/m³ concrete</div></div>
  </div>

  <div class="sec-header">Section 2 — Tree Carbon: Front Side vs Outside</div>
  <div class="report-section">
    <div style="text-align:center;padding:12px 0">
      <img src="data:image/png;base64,${bd.plan_image}" style="max-width:580px;width:100%;border-radius:4px;border:1px solid #d0d8e4">
    </div>
    ${z ? `
    <table><thead><tr>
      <th>Zone</th><th>Tree Count</th><th>AGB (kg)</th><th>Carbon (kg)</th><th>CO₂ (kg)</th><th>Carbon Share</th>
    </tr></thead><tbody>
      <tr>
        <td><b>Front Side (${bd.front_side}) — ${bd.front_buffer_m} m buffer</b></td>
        <td>${z.front.count}</td>
        <td>${z.front.agb_kg.toLocaleString()}</td>
        <td class="val-warn">${z.front.carbon_kg.toLocaleString()}</td>
        <td>${z.front.co2_kg.toLocaleString()}</td>
        <td>${(z.front.carbon_kg/tc*100).toFixed(1)}%</td>
      </tr>
      <tr>
        <td><b>Outside Zone (rest of survey area)</b></td>
        <td>${z.outside.count}</td>
        <td>${z.outside.agb_kg.toLocaleString()}</td>
        <td class="val-ok">${z.outside.carbon_kg.toLocaleString()}</td>
        <td>${z.outside.co2_kg.toLocaleString()}</td>
        <td>${(z.outside.carbon_kg/tc*100).toFixed(1)}%</td>
      </tr>
      <tr style="font-weight:700;background:#eef2f8">
        <td>TOTAL</td>
        <td>${z.front.count+z.outside.count}</td>
        <td>${(z.front.agb_kg+z.outside.agb_kg).toLocaleString()}</td>
        <td>${tc.toFixed(1)}</td>
        <td>${(z.front.co2_kg+z.outside.co2_kg).toLocaleString()}</td>
        <td>100%</td>
      </tr>
    </tbody></table>
    <p style="margin-top:10px;font-size:10px;color:#607080;line-height:1.6">
      Front-side zone: ${bd.front_buffer_m} m buffer along the <b>${bd.front_side}</b> facade (auto-detected as the building side facing densest surrounding vegetation).
      Each tree is classified by its detected centroid (X, Y) position relative to the building bounding box.
      Building embodied carbon: 300 kgCO₂e/m³ (reinforced concrete, RICS 2017).
    </p>` : '<p style="color:#607080;padding:16px">Run the full pipeline (Analytics tab) to compute the front/outside tree carbon split.</p>'}
  </div>

  <div class="no-print" style="text-align:center;padding:16px">
    <button onclick="window.print()" style="background:#1a3a5c;color:#fff;border:none;padding:12px 32px;border-radius:4px;font-size:14px;cursor:pointer;font-weight:600">🖨 Print / Save PDF</button>
  </div>
  </body></html>`;

  const win = window.open('','_blank');
  if(!win){alert('Pop-up blocked — please allow pop-ups');return;}
  win.document.write(html); win.document.close();
}
