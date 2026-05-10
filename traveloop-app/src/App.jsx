import { useState, useEffect, useRef } from "react";
import { ExpensesPage } from "./ExpensesPage";

// ─── Constants & Mock Data ───────────────────────────────────────────────────

const DESTINATIONS = [
  { id: 1, name: "Paris", country: "France", emoji: "🗼", cost: 180, rating: 4.8, tag: "Romantic", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=500&q=60" },
  { id: 2, name: "Tokyo", country: "Japan", emoji: "⛩️", cost: 140, rating: 4.9, tag: "Cultural", image: "https://tse3.mm.bing.net/th/id/OIP.lilpuEVpKodYkCGyST9SGwHaE7?rs=1&pid=ImgDetMain&o=7&rm=3" },
  { id: 3, name: "Bali", country: "Indonesia", emoji: "🌴", cost: 80, rating: 4.7, tag: "Tropical", image: "https://tse4.mm.bing.net/th/id/OIP.OINRF_r_JyOH80rC0WzxCAHaEK?rs=1&pid=ImgDetMain&o=7&rm=3" },
  { id: 4, name: "New York", country: "USA", emoji: "🗽", cost: 220, rating: 4.6, tag: "Urban", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=500&q=60" },
  { id: 5, name: "Santorini", country: "Greece", emoji: "🌊", cost: 160, rating: 4.8, tag: "Scenic", image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=500&q=60" },
  { id: 6, name: "Dubai", country: "UAE", emoji: "🏙️", cost: 200, rating: 4.5, tag: "Luxury", image: "https://a.cdn-hotels.com/gdcs/production92/d1833/3a7484ab-feb8-4f81-b836-d082597d083a.jpg" },
  { id: 7, name: "Barcelona", country: "Spain", emoji: "🎨", cost: 130, rating: 4.7, tag: "Art", image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=500&q=60" },
  { id: 8, name: "Maldives", country: "Maldives", emoji: "🐠", cost: 350, rating: 4.9, tag: "Beach", image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=500&q=60" },
];

const ACTIVITIES = [
  { id: 1, name: "City Walking Tour", category: "Culture", duration: "3h", cost: 25, icon: "🚶" },
  { id: 2, name: "Museum Visit", category: "Culture", duration: "2h", cost: 18, icon: "🏛️" },
  { id: 3, name: "Local Food Tour", category: "Food", duration: "3h", cost: 45, icon: "🍜" },
  { id: 4, name: "Sunset Cruise", category: "Adventure", duration: "2h", cost: 60, icon: "⛵" },
  { id: 5, name: "Cooking Class", category: "Food", duration: "4h", cost: 75, icon: "👨‍🍳" },
  { id: 6, name: "Hiking Trail", category: "Adventure", duration: "5h", cost: 15, icon: "🏔️" },
  { id: 7, name: "Spa & Wellness", category: "Relaxation", duration: "3h", cost: 90, icon: "💆" },
  { id: 8, name: "Night Market", category: "Shopping", duration: "2h", cost: 30, icon: "🛍️" },
];

const PACKING_DEFAULTS = [
  { id: 1, item: "Passport", category: "Documents", packed: false },
  { id: 2, item: "Travel Insurance", category: "Documents", packed: false },
  { id: 3, item: "Phone Charger", category: "Electronics", packed: false },
  { id: 4, item: "Power Bank", category: "Electronics", packed: false },
  { id: 5, item: "Sunscreen", category: "Health", packed: false },
  { id: 6, item: "First Aid Kit", category: "Health", packed: false },
  { id: 7, item: "T-Shirts (5x)", category: "Clothing", packed: false },
  { id: 8, item: "Walking Shoes", category: "Clothing", packed: false },
];

const gradients = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
];

// ─── Utility ─────────────────────────────────────────────────────────────────

function useLocalStorage(key, initial) {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : initial; }
    catch { return initial; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }, [key, val]);
  return [val, setVal];
}

function fmtDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function daysBetween(a, b) {
  if (!a || !b) return 0;
  return Math.max(0, Math.ceil((new Date(b) - new Date(a)) / 86400000));
}

// ─── CSS ─────────────────────────────────────────────────────────────────────

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
  
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  
  :root {
    --bg: #faf9f7;
    --bg2: #f3f1ee;
    --bg3: #ffffff;
    --text: #1a1816;
    --text2: #6b6560;
    --text3: #a09b96;
    --border: #e8e4df;
    --accent: #e8622a;
    --accent2: #f5a44a;
    --accent-light: #fdf0e8;
    --sidebar: #1a1816;
    --sidebar-text: #f0ece8;
    --sidebar-muted: #8a8480;
    --card-shadow: 0 2px 20px rgba(26,24,22,0.06);
    --radius: 16px;
    --radius-sm: 10px;
    --font-display: 'Playfair Display', Georgia, serif;
    --font-body: 'DM Sans', system-ui, sans-serif;
  }
  
  .dark {
    --bg: #141210;
    --bg2: #1e1c1a;
    --bg3: #252320;
    --text: #f0ece8;
    --text2: #a09b96;
    --text3: #6b6560;
    --border: #2e2c2a;
    --accent-light: #2a1a10;
    --card-shadow: 0 2px 20px rgba(0,0,0,0.3);
    --bg3: #252320;
  }
  
  body { font-family: var(--font-body); background: var(--bg); color: var(--text); }
  
  .app { display: flex; min-height: 100vh; }
  
  .sidebar {
    width: 240px; min-height: 100vh; background: var(--sidebar); color: var(--sidebar-text);
    display: flex; flex-direction: column; position: fixed; top: 0; left: 0; bottom: 0;
    z-index: 100; transition: transform 0.3s ease;
  }
  
  .sidebar-logo {
    padding: 28px 24px 20px; border-bottom: 1px solid rgba(255,255,255,0.07);
  }
  
  .sidebar-logo h1 {
    font-family: var(--font-display); font-size: 22px; font-weight: 700;
    color: #fff; letter-spacing: -0.5px;
  }
  
  .sidebar-logo span { color: var(--accent2); }
  
  .sidebar-logo p { font-size: 11px; color: var(--sidebar-muted); margin-top: 2px; letter-spacing: 0.5px; text-transform: uppercase; }
  
  .sidebar-nav { flex: 1; padding: 16px 12px; overflow-y: auto; }
  
  .nav-label { font-size: 10px; color: var(--sidebar-muted); letter-spacing: 1px; text-transform: uppercase; padding: 8px 12px 4px; }
  
  .nav-item {
    display: flex; align-items: center; gap: 10px; padding: 10px 12px;
    border-radius: 10px; cursor: pointer; transition: all 0.15s;
    color: var(--sidebar-muted); font-size: 14px; font-weight: 400;
    margin-bottom: 2px;
  }
  
  .nav-item:hover { background: rgba(255,255,255,0.06); color: var(--sidebar-text); }
  .nav-item.active { background: rgba(232,98,42,0.18); color: #f5a44a; font-weight: 500; }
  .nav-item .icon { font-size: 16px; width: 20px; text-align: center; }
  
  .sidebar-footer { padding: 16px 12px; border-top: 1px solid rgba(255,255,255,0.07); }
  
  .main { margin-left: 240px; flex: 1; min-height: 100vh; }
  
  .topbar {
    background: var(--bg3); border-bottom: 1px solid var(--border);
    padding: 0 32px; height: 64px; display: flex; align-items: center;
    justify-content: space-between; position: sticky; top: 0; z-index: 50;
  }
  
  .topbar-title { font-family: var(--font-display); font-size: 20px; font-weight: 600; }
  
  .topbar-actions { display: flex; align-items: center; gap: 12px; }
  
  .page { padding: 32px; }
  
  .btn {
    display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px;
    border-radius: 10px; font-family: var(--font-body); font-size: 14px;
    font-weight: 500; cursor: pointer; transition: all 0.15s; border: none;
  }
  
  .btn-primary {
    background: var(--accent); color: #fff;
  }
  
  .btn-primary:hover { background: #d4551f; transform: translateY(-1px); }
  
  .btn-ghost {
    background: transparent; color: var(--text2); border: 1px solid var(--border);
  }
  
  .btn-ghost:hover { background: var(--bg2); color: var(--text); }
  
  .btn-sm { padding: 6px 14px; font-size: 13px; }
  
  .card {
    background: var(--bg3); border: 1px solid var(--border);
    border-radius: var(--radius); box-shadow: var(--card-shadow);
  }
  
  .grid { display: grid; gap: 20px; }
  .grid-2 { grid-template-columns: repeat(2, 1fr); }
  .grid-3 { grid-template-columns: repeat(3, 1fr); }
  .grid-4 { grid-template-columns: repeat(4, 1fr); }
  
  .badge {
    display: inline-flex; align-items: center; padding: 3px 10px;
    border-radius: 20px; font-size: 11px; font-weight: 500; letter-spacing: 0.3px;
  }
  
  .badge-orange { background: var(--accent-light); color: var(--accent); }
  .badge-green { background: #e8f5e9; color: #2e7d32; }
  .badge-blue { background: #e3f2fd; color: #1565c0; }
  .badge-gray { background: var(--bg2); color: var(--text2); }
  
  .dark .badge-green { background: #1a2e1b; color: #66bb6a; }
  .dark .badge-blue { background: #0d2137; color: #64b5f6; }
  
  .input {
    width: 100%; padding: 10px 14px; border: 1px solid var(--border);
    border-radius: var(--radius-sm); font-family: var(--font-body); font-size: 14px;
    background: var(--bg); color: var(--text); outline: none; transition: border 0.15s;
  }
  
  .input:focus { border-color: var(--accent); }
  
  .input-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
  .input-group label { font-size: 13px; font-weight: 500; color: var(--text2); }
  
  .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
  .section-title { font-family: var(--font-display); font-size: 20px; font-weight: 600; }
  
  .trip-card {
    border-radius: var(--radius); overflow: hidden; cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s; border: 1px solid var(--border);
  }
  
  .trip-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(26,24,22,0.12); }
  
  .trip-card-banner {
    height: 140px; display: flex; align-items: flex-end; padding: 16px;
    position: relative;
  }
  
  .trip-card-body { padding: 16px; background: var(--bg3); }
  
  .dest-card {
    border-radius: var(--radius); padding: 20px; cursor: pointer;
    border: 1px solid var(--border); background: var(--bg3);
    transition: all 0.2s; text-align: center;
  }
  
  .dest-card:hover { transform: translateY(-3px); box-shadow: var(--card-shadow); border-color: var(--accent); }
  
  .stat-card {
    border-radius: var(--radius); padding: 24px; background: var(--bg3);
    border: 1px solid var(--border);
  }
  
  .stat-value { font-family: var(--font-display); font-size: 32px; font-weight: 700; color: var(--text); }
  .stat-label { font-size: 13px; color: var(--text3); margin-top: 4px; }
  
  .modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200;
    display: flex; align-items: center; justify-content: center; padding: 20px;
    backdrop-filter: blur(4px);
  }
  
  .modal {
    background: var(--bg3); border-radius: var(--radius); width: 100%; max-width: 560px;
    max-height: 90vh; overflow-y: auto; box-shadow: 0 24px 80px rgba(0,0,0,0.25);
    animation: slideUp 0.25s ease;
  }
  
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .modal-header {
    padding: 24px 24px 0; display: flex; align-items: center; justify-content: space-between;
  }
  
  .modal-title { font-family: var(--font-display); font-size: 20px; font-weight: 600; }
  .modal-body { padding: 24px; }
  .modal-footer { padding: 0 24px 24px; display: flex; gap: 10px; justify-content: flex-end; }
  
  .close-btn {
    width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--border);
    background: transparent; cursor: pointer; display: flex; align-items: center;
    justify-content: center; font-size: 18px; color: var(--text2);
  }
  
  .close-btn:hover { background: var(--bg2); }
  
  .tabs { display: flex; gap: 4px; padding: 4px; background: var(--bg2); border-radius: var(--radius-sm); }
  
  .tab {
    flex: 1; padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 500;
    cursor: pointer; border: none; background: transparent; color: var(--text2);
    transition: all 0.15s; text-align: center;
  }
  
  .tab.active { background: var(--bg3); color: var(--text); box-shadow: 0 1px 4px rgba(0,0,0,0.1); }
  
  .progress-bar { height: 6px; background: var(--bg2); border-radius: 3px; overflow: hidden; }
  .progress-fill { height: 100%; background: var(--accent); border-radius: 3px; transition: width 0.4s ease; }
  
  .timeline { position: relative; padding-left: 28px; }
  .timeline::before { content: ''; position: absolute; left: 8px; top: 8px; bottom: 8px; width: 2px; background: var(--border); }
  .timeline-item { position: relative; margin-bottom: 24px; }
  .timeline-dot { position: absolute; left: -24px; width: 12px; height: 12px; border-radius: 50%; background: var(--accent); border: 2px solid var(--bg3); top: 4px; }
  
  .checklist-item {
    display: flex; align-items: center; gap: 12px; padding: 12px 16px;
    border-radius: var(--radius-sm); border: 1px solid var(--border); margin-bottom: 8px;
    background: var(--bg3); transition: opacity 0.2s;
  }
  
  .checklist-item.packed { opacity: 0.5; }
  
  .checkbox {
    width: 20px; height: 20px; border-radius: 6px; border: 2px solid var(--border);
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; transition: all 0.15s; background: var(--bg);
  }
  
  .checkbox.checked { background: var(--accent); border-color: var(--accent); color: #fff; }
  
  .auth-page {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, #1a1816 0%, #2d2420 50%, #1a1816 100%);
    padding: 20px;
  }
  
  .auth-card {
    width: 100%; max-width: 440px; background: var(--bg3);
    border-radius: 24px; padding: 40px; box-shadow: 0 32px 80px rgba(0,0,0,0.4);
  }
  
  .hero-section {
    background: linear-gradient(135deg, #1a1816 0%, #2d2420 100%);
    border-radius: var(--radius); padding: 40px; color: #fff; margin-bottom: 32px;
    position: relative; overflow: hidden;
  }
  
  .hero-section::after {
    content: '✈️'; position: absolute; right: 40px; bottom: -10px;
    font-size: 100px; opacity: 0.1;
  }
  
  .pill {
    display: inline-flex; align-items: center; padding: 4px 12px;
    background: rgba(255,255,255,0.12); border-radius: 20px;
    font-size: 12px; color: rgba(255,255,255,0.7); margin-bottom: 12px;
  }
  
  .divider { height: 1px; background: var(--border); margin: 20px 0; }
  
  .search-input-wrap { position: relative; }
  .search-input-wrap input { padding-left: 40px; }
  .search-icon { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: var(--text3); font-size: 15px; }
  
  .activity-card {
    display: flex; align-items: center; gap: 14px; padding: 14px 16px;
    border: 1px solid var(--border); border-radius: var(--radius-sm);
    background: var(--bg3); margin-bottom: 10px; transition: border-color 0.15s;
  }
  .activity-card:hover { border-color: var(--accent); }
  
  .city-stop {
    background: var(--bg3); border: 1px solid var(--border); border-radius: var(--radius);
    margin-bottom: 12px; overflow: hidden;
  }
  
  .city-stop-header {
    padding: 16px 20px; display: flex; align-items: center; justify-content: space-between;
    cursor: pointer; background: var(--bg2);
  }
  
  .city-stop-body { padding: 16px 20px; }
  
  .budget-bar { display: flex; flex-direction: column; gap: 14px; }
  .budget-row { display: flex; flex-direction: column; gap: 6px; }
  .budget-row-header { display: flex; justify-content: space-between; font-size: 13px; }
  
  .note-card {
    background: var(--bg3); border: 1px solid var(--border); border-radius: var(--radius);
    padding: 20px; margin-bottom: 12px;
  }
  
  .profile-avatar {
    width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, var(--accent), var(--accent2));
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-display); font-size: 28px; color: #fff; font-weight: 700;
  }
  
  .tag-chip {
    display: inline-flex; padding: 4px 10px; background: var(--bg2); border-radius: 20px;
    font-size: 12px; color: var(--text2); cursor: pointer; border: 1px solid var(--border);
    transition: all 0.15s;
  }
  .tag-chip.selected { background: var(--accent-light); color: var(--accent); border-color: var(--accent); }
  
  .empty-state {
    text-align: center; padding: 60px 20px; color: var(--text3);
  }
  .empty-state .icon { font-size: 48px; margin-bottom: 16px; }
  .empty-state h3 { font-family: var(--font-display); font-size: 20px; color: var(--text2); margin-bottom: 8px; }
  .empty-state p { font-size: 14px; max-width: 280px; margin: 0 auto 20px; }
  
  select.input { appearance: none; cursor: pointer; }
  textarea.input { resize: vertical; min-height: 80px; }
  
  .chart-bar-wrap { display: flex; align-items: flex-end; gap: 8px; height: 120px; }
  .chart-bar-col { display: flex; flex-direction: column; align-items: center; gap: 6px; flex: 1; }
  .chart-bar { width: 100%; border-radius: 6px 6px 0 0; background: var(--accent); transition: height 0.5s ease; }
  .chart-bar-label { font-size: 11px; color: var(--text3); }
  .invoice-header { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: center; padding: 24px; background: var(--bg3); border: 1px solid var(--border); border-radius: var(--radius); margin-bottom: 24px; }
  .invoice-place-img { width: 100%; height: 200px; border-radius: 12px; object-fit: cover; }
  .invoice-details { display: flex; flex-direction: column; gap: 12px; }
  .invoice-detail-row { display: flex; justify-content: space-between; font-size: 13px; padding: 8px 0; border-bottom: 1px solid var(--border); }
  .invoice-detail-label { color: var(--text3); }
  .invoice-detail-value { font-weight: 500; color: var(--text); }
  .invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  .invoice-table th { background: var(--bg2); padding: 12px; text-align: left; font-size: 12px; font-weight: 600; color: var(--text2); border-bottom: 1px solid var(--border); }
  .invoice-table td { padding: 12px; border-bottom: 1px solid var(--border); font-size: 13px; }
  .invoice-table tr:last-child td { border-bottom: none; }
  .invoice-totals { display: flex; flex-direction: column; gap: 8px; padding: 16px 0; border-top: 2px solid var(--border); border-bottom: 2px solid var(--border); margin-bottom: 16px; }
  .invoice-total-row { display: flex; justify-content: space-between; font-size: 13px; }
  .invoice-total-row.grand { font-size: 16px; font-weight: 700; color: var(--accent); }
  .pie-chart-container { display: flex; align-items: center; justify-content: center; gap: 24px; padding: 24px; background: var(--bg3); border-radius: var(--radius); }
  .pie-chart { width: 200px; height: 200px; border-radius: 50%; }
  .pie-legend { display: flex; flex-direction: column; gap: 10px; }
  .pie-legend-item { display: flex; align-items: center; gap: 8px; font-size: 13px; }
  .pie-legend-color { width: 12px; height: 12px; border-radius: 2px; flex-shrink: 0; }
  
  .mobile-menu-btn {
    display: none; position: fixed; bottom: 24px; right: 24px; z-index: 300;
    width: 52px; height: 52px; border-radius: 50%; background: var(--accent);
    color: #fff; border: none; cursor: pointer; font-size: 22px;
    box-shadow: 0 4px 20px rgba(232,98,42,0.4);
  }
  
  @media (max-width: 768px) {
    .sidebar { transform: translateX(-100%); }
    .sidebar.open { transform: translateX(0); }
    .main { margin-left: 0; }
    .page { padding: 20px 16px; }
    .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr; }
    .topbar { padding: 0 16px; }
    .mobile-menu-btn { display: flex; align-items: center; justify-content: center; }
    .hero-section { padding: 28px; }
    .hero-section::after { display: none; }
  }
  
  .fade-in { animation: fadeIn 0.3s ease; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  
  .shine {
    position: relative; overflow: hidden;
  }
  .shine::after {
    content: ''; position: absolute; top: 0; left: -100%; width: 60%;
    height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
    animation: shine 3s infinite;
  }
  @keyframes shine { to { left: 150%; } }
  
  .drag-handle { cursor: grab; color: var(--text3); padding: 4px; }
  .drag-handle:active { cursor: grabbing; }
`;

// ─── Components ───────────────────────────────────────────────────────────────

function Avatar({ name = "U", size = 36, photo }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "linear-gradient(135deg, #e8622a, #f5a44a)",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontWeight: 600, fontSize: size * 0.36,
      flexShrink: 0, overflow: "hidden",
    }}>
      {photo ? <img src={photo} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials}
    </div>
  );
}

function Modal({ title, onClose, children, footer }) {
  useEffect(() => {
    const handler = e => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal fade-in">
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

// ─── Shared FormField ────────────────────────────────────────────────────────

function FormField({ name, label, type = "text", placeholder, as, value, onChange, error }) {
  return (
    <div className="input-group">
      <label>{label}</label>
      {as === "textarea"
        ? <textarea className="input" placeholder={placeholder} value={value} onChange={onChange} />
        : <input className="input" type={type} placeholder={placeholder} value={value} onChange={onChange} />}
      {error && <span style={{ color: "var(--accent)", fontSize: 12 }}>{error}</span>}
    </div>
  );
}

// ─── Auth Pages ───────────────────────────────────────────────────────────────

const authCss = `
  .auth-root {
    min-height: 100vh; display: flex; font-family: 'DM Sans', system-ui, sans-serif;
    background: #0f0e0d;
  }
  .auth-panel-left {
    flex: 1; position: relative; display: none;
    background: linear-gradient(160deg, #1a1816 0%, #2d1f14 50%, #0f0e0d 100%);
    overflow: hidden;
  }
  @media(min-width:900px){ .auth-panel-left { display: flex; flex-direction: column; justify-content: flex-end; padding: 48px; } }
  .auth-panel-left::before {
    content: ''; position: absolute; inset: 0;
    background: url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=900&q=80') center/cover no-repeat;
    opacity: 0.35;
  }
  .auth-panel-left-orb {
    position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none;
  }
  .auth-panel-right {
    width: 100%; max-width: 560px; background: #faf9f7;
    display: flex; flex-direction: column; justify-content: center;
    padding: 40px 48px; overflow-y: auto;
  }
  @media(max-width:600px){ .auth-panel-right { padding: 32px 20px; } }
  .auth-logo { font-family: 'Playfair Display', Georgia, serif; font-size: 26px; font-weight: 700; color: #1a1816; margin-bottom: 32px; }
  .auth-logo span { color: #e8622a; }
  .auth-avatar-ring {
    width: 96px; height: 96px; border-radius: 50%;
    border: 3px dashed #e8e4df; display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: border-color 0.2s; position: relative; overflow: hidden;
    background: #f3f1ee; flex-shrink: 0;
  }
  .auth-avatar-ring:hover { border-color: #e8622a; }
  .auth-avatar-ring img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
  .auth-avatar-ring .upload-icon { font-size: 28px; color: #a09b96; }
  .auth-avatar-ring .upload-label {
    position: absolute; bottom: 0; left: 0; right: 0;
    background: rgba(232,98,42,0.85); color: #fff; font-size: 10px;
    text-align: center; padding: 4px 0; font-weight: 600; letter-spacing: 0.5px;
  }
  .auth-field { display: flex; flex-direction: column; gap: 5px; margin-bottom: 14px; }
  .auth-field label { font-size: 12px; font-weight: 600; color: #6b6560; letter-spacing: 0.4px; text-transform: uppercase; }
  .auth-field input, .auth-field textarea, .auth-field select {
    padding: 11px 14px; border: 1.5px solid #e8e4df; border-radius: 10px;
    font-family: inherit; font-size: 14px; background: #fff; color: #1a1816;
    outline: none; transition: border-color 0.15s, box-shadow 0.15s; width: 100%;
  }
  .auth-field input:focus, .auth-field textarea:focus, .auth-field select:focus {
    border-color: #e8622a; box-shadow: 0 0 0 3px rgba(232,98,42,0.1);
  }
  .auth-field textarea { resize: vertical; min-height: 72px; }
  .auth-field .err { color: #e74c3c; font-size: 11px; margin-top: 2px; }
  .auth-btn {
    width: 100%; padding: 13px; border-radius: 12px; border: none;
    background: linear-gradient(135deg, #e8622a, #f5a44a); color: #fff;
    font-family: inherit; font-size: 15px; font-weight: 600; cursor: pointer;
    transition: opacity 0.15s, transform 0.15s; margin-top: 4px;
  }
  .auth-btn:hover:not(:disabled) { opacity: 0.92; transform: translateY(-1px); }
  .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .auth-divider { display: flex; align-items: center; gap: 12px; margin: 18px 0; }
  .auth-divider span { font-size: 12px; color: #a09b96; white-space: nowrap; }
  .auth-divider::before, .auth-divider::after { content: ''; flex: 1; height: 1px; background: #e8e4df; }
  .auth-link { color: #e8622a; cursor: pointer; font-weight: 500; }
  .auth-link:hover { text-decoration: underline; }
  .auth-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  @media(max-width:480px){ .auth-row { grid-template-columns: 1fr; } }
  .auth-user-preview {
    display: flex; align-items: center; gap: 14px; padding: 14px 16px;
    background: #f3f1ee; border-radius: 12px; margin-bottom: 24px;
    border: 1px solid #e8e4df;
  }
  .auth-user-preview-avatar {
    width: 52px; height: 52px; border-radius: 50%;
    background: linear-gradient(135deg, #e8622a, #f5a44a);
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; font-weight: 700; color: #fff; flex-shrink: 0; overflow: hidden;
  }
  .auth-user-preview-avatar img { width: 100%; height: 100%; object-fit: cover; }
`;

// ─── Admin Shell ─────────────────────────────────────────────────────────────

const ADMIN_NAV = [
  { id: "admin-manage-users", label: "Manage Users", icon: "👥", group: "admin" },
  { id: "admin-cities", label: "Popular Cities", icon: "🏙️", group: "admin" },
  { id: "admin-activities", label: "Popular Activities", icon: "🎯", group: "admin" },
  { id: "admin-trends", label: "User Trends", icon: "📈", group: "admin" },
];

function AdminShell({ onLogout, dark, setDark }) {
  const [allUsersTrips] = useLocalStorage("traveloop-users-trips", {});
  const [adminPage, setAdminPage] = useState("admin-manage-users");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Derive analytics
  const allTrips = Object.values(allUsersTrips).flat();
  const users = Object.keys(allUsersTrips).map(email => ({
    email,
    trips: allUsersTrips[email],
  }));

  const cityCount = {};
  const activityCount = {};
  allTrips.forEach(trip => {
    (trip.stops || []).forEach(stop => {
      cityCount[stop.city] = (cityCount[stop.city] || 0) + 1;
      (stop.activities || []).forEach(act => {
        activityCount[act.name] = (activityCount[act.name] || 0) + 1;
      });
    });
  });

  const topCities = Object.entries(cityCount).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const topActivities = Object.entries(activityCount).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const maxCity = topCities[0]?.[1] || 1;
  const maxAct = topActivities[0]?.[1] || 1;

  const pageTitles = {
    "admin-manage-users": "Manage Users",
    "admin-cities": "Popular Cities",
    "admin-activities": "Popular Activities",
    "admin-trends": "User Trends & Analytics",
  };

  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <div className={dark ? "dark" : ""}>
      <style>{css}</style>
      <div className="app">
        <nav className={`sidebar${sidebarOpen ? " open" : ""}`}>
          <div className="sidebar-logo">
            <h1>Travel<span>oop</span></h1>
            <p>Admin Panel</p>
          </div>
          <div className="sidebar-nav">
            <div className="nav-label">Admin</div>
            {ADMIN_NAV.map(item => (
              <div key={item.id}
                className={`nav-item${adminPage === item.id ? " active" : ""}`}
                onClick={() => { setAdminPage(item.id); setSidebarOpen(false); setSelectedUser(null); }}>
                <span className="icon">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
          <div className="sidebar-footer">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14 }}>A</div>
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--sidebar-text)" }}>Admin</div>
                <div style={{ fontSize: 11, color: "var(--sidebar-muted)" }}>admin123@gmail.com</div>
              </div>
            </div>
          </div>
        </nav>

        <main className="main">
          <div className="topbar">
            <div className="topbar-title">{pageTitles[adminPage]}</div>
            <div className="topbar-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => setDark(d => !d)}>{dark ? "☀️" : "🌙"}</button>
              <button className="btn btn-ghost btn-sm" style={{ color: "#e74c3c" }} onClick={onLogout}>Sign Out</button>
            </div>
          </div>

          {adminPage === "admin-manage-users" && !selectedUser && (
            <div className="page fade-in">
              <div className="grid grid-4" style={{ marginBottom: 28 }}>
                {[
                  { label: "Total Users", value: users.length, icon: "👥" },
                  { label: "Total Trips", value: allTrips.length, icon: "🗺️" },
                  { label: "Total Cities", value: Object.keys(cityCount).length, icon: "🏙️" },
                  { label: "Total Activities", value: Object.keys(activityCount).length, icon: "🎯" },
                ].map(s => (
                  <div key={s.label} className="stat-card">
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                    <div className="stat-value">{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
              {users.length === 0 ? (
                <div className="empty-state"><div className="icon">👥</div><h3>No users yet</h3><p>Users will appear here once they sign up and create trips.</p></div>
              ) : (
                <div className="card">
                  {users.map((u, i) => (
                    <div key={u.email} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 24px", borderBottom: i < users.length - 1 ? "1px solid var(--border)" : "none" }}>
                      <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, var(--accent), var(--accent2))", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                        {u.email[0].toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{u.email}</div>
                        <div style={{ fontSize: 12, color: "var(--text3)" }}>{u.trips.length} trip{u.trips.length !== 1 ? "s" : ""} · {u.trips.reduce((a, t) => a + (t.stops?.length || 0), 0)} cities</div>
                      </div>
                      <button className="btn btn-ghost btn-sm" onClick={() => setSelectedUser(u)}>View Details</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {adminPage === "admin-manage-users" && selectedUser && (
            <div className="page fade-in">
              <button className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }} onClick={() => setSelectedUser(null)}>← Back to Users</button>
              <div className="section-header">
                <div>
                  <h2 className="section-title">{selectedUser.email}</h2>
                  <p style={{ color: "var(--text3)", fontSize: 13, marginTop: 4 }}>{selectedUser.trips.length} trips</p>
                </div>
              </div>
              {selectedUser.trips.length === 0 ? (
                <div className="empty-state"><div className="icon">🗺️</div><h3>No trips</h3><p>This user hasn't created any trips yet.</p></div>
              ) : (
                <div className="grid grid-3">
                  {selectedUser.trips.map(trip => (
                    <TripCard key={trip.id} trip={trip} onClick={() => {}} />
                  ))}
                </div>
              )}
            </div>
          )}

          {adminPage === "admin-cities" && (
            <div className="page fade-in">
              {topCities.length === 0 ? (
                <div className="empty-state"><div className="icon">🏙️</div><h3>No data yet</h3><p>Cities will appear here once users create trips.</p></div>
              ) : (
                <>
                  <div className="card" style={{ padding: 24, marginBottom: 24 }}>
                    <h3 style={{ fontWeight: 600, marginBottom: 20, fontSize: 15 }}>City Chart</h3>
                    <div className="chart-bar-wrap">
                      {topCities.map(([city, count]) => (
                        <div key={city} className="chart-bar-col">
                          <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 4 }}>{count}</div>
                          <div style={{ width: "100%", flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                            <div className="chart-bar" style={{ height: `${Math.max(8, Math.round((count / maxCity) * 100))}px` }} />
                          </div>
                          <div className="chart-bar-label">{city.slice(0, 8)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="card">
                    {topCities.map(([city, count], i) => (
                      <div key={city} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 24px", borderBottom: i < topCities.length - 1 ? "1px solid var(--border)" : "none" }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{i + 1}</div>
                        <div style={{ flex: 1, fontWeight: 500, fontSize: 14 }}>{city}</div>
                        <div style={{ minWidth: 120 }}>
                          <div className="progress-bar"><div className="progress-fill" style={{ width: `${Math.round((count / maxCity) * 100)}%` }} /></div>
                        </div>
                        <div style={{ fontWeight: 600, color: "var(--accent)", fontSize: 14, minWidth: 40, textAlign: "right" }}>{count}×</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {adminPage === "admin-activities" && (
            <div className="page fade-in">
              {topActivities.length === 0 ? (
                <div className="empty-state"><div className="icon">🎯</div><h3>No data yet</h3><p>Activities will appear here once users add them to trips.</p></div>
              ) : (
                <>
                  <div className="card" style={{ padding: 24, marginBottom: 24 }}>
                    <h3 style={{ fontWeight: 600, marginBottom: 20, fontSize: 15 }}>Activity Chart</h3>
                    <div className="chart-bar-wrap">
                      {topActivities.map(([act, count]) => (
                        <div key={act} className="chart-bar-col">
                          <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 4 }}>{count}</div>
                          <div style={{ width: "100%", flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                            <div className="chart-bar" style={{ height: `${Math.max(8, Math.round((count / maxAct) * 100))}px`, background: "#667eea" }} />
                          </div>
                          <div className="chart-bar-label">{act.split(" ")[0]}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="card">
                    {topActivities.map(([act, count], i) => (
                      <div key={act} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 24px", borderBottom: i < topActivities.length - 1 ? "1px solid var(--border)" : "none" }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#667eea", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{i + 1}</div>
                        <div style={{ flex: 1, fontWeight: 500, fontSize: 14 }}>{act}</div>
                        <div style={{ minWidth: 120 }}>
                          <div className="progress-bar"><div className="progress-fill" style={{ width: `${Math.round((count / maxAct) * 100)}%`, background: "#667eea" }} /></div>
                        </div>
                        <div style={{ fontWeight: 600, color: "#667eea", fontSize: 14, minWidth: 40, textAlign: "right" }}>{count}×</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {adminPage === "admin-trends" && (
            <div className="page fade-in">
              <div className="grid grid-4" style={{ marginBottom: 28 }}>
                {[
                  { label: "Avg Trips/User", value: users.length ? (allTrips.length / users.length).toFixed(1) : 0, icon: "📊" },
                  { label: "Avg Cities/Trip", value: allTrips.length ? (allTrips.reduce((a, t) => a + (t.stops?.length || 0), 0) / allTrips.length).toFixed(1) : 0, icon: "🏙️" },
                  { label: "Avg Budget/Trip", value: allTrips.length ? `$${Math.round(allTrips.reduce((a, t) => a + (t.budget || 0), 0) / allTrips.length)}` : "$0", icon: "💰" },
                  { label: "Unique Cities", value: Object.keys(cityCount).length, icon: "🌍" },
                ].map(s => (
                  <div key={s.label} className="stat-card">
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                    <div className="stat-value">{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-2">
                <div className="card" style={{ padding: 24 }}>
                  <h3 style={{ fontWeight: 600, marginBottom: 16, fontSize: 15 }}>Users by Trip Count</h3>
                  {users.length === 0 ? (
                    <div style={{ color: "var(--text3)", fontSize: 13, textAlign: "center", padding: "20px 0" }}>No data yet</div>
                  ) : (
                    users.sort((a, b) => b.trips.length - a.trips.length).map((u, i) => (
                      <div key={u.email} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                        <div style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 11, flexShrink: 0 }}>{i + 1}</div>
                        <div style={{ flex: 1, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</div>
                        <span className="badge badge-orange">{u.trips.length} trips</span>
                      </div>
                    ))
                  )}
                </div>
                <div className="card" style={{ padding: 24 }}>
                  <h3 style={{ fontWeight: 600, marginBottom: 16, fontSize: 15 }}>Trip Status Breakdown</h3>
                  {(() => {
                    const now = new Date();
                    const counts = { upcoming: 0, ongoing: 0, completed: 0, draft: 0 };
                    allTrips.forEach(t => {
                      const s = t.startDate ? new Date(t.startDate) : null;
                      const e = t.endDate ? new Date(t.endDate) : null;
                      const status = !s ? "draft" : now < s ? "upcoming" : now <= e ? "ongoing" : "completed";
                      counts[status]++;
                    });
                    const total = allTrips.length || 1;
                    return Object.entries(counts).map(([status, count]) => (
                      <div key={status} style={{ padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
                          <span style={{ fontWeight: 500 }}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                          <span style={{ color: "var(--text3)" }}>{count} ({Math.round((count / total) * 100)}%)</span>
                        </div>
                        <div className="progress-bar"><div className="progress-fill" style={{ width: `${Math.round((count / total) * 100)}%` }} /></div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          )}
        </main>

        <button className="mobile-menu-btn" onClick={() => setSidebarOpen(o => !o)}>
          {sidebarOpen ? "✕" : "☰"}
        </button>
        {sidebarOpen && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 99 }}
            onClick={() => setSidebarOpen(false)} />
        )}
      </div>
    </div>
  );
}

function AuthPage({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [photo, setPhoto] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    city: "", country: "", additionalInfo: "", password: "", confirm: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  function handlePhoto(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPhoto(ev.target.result);
    reader.readAsDataURL(file);
  }

  function submitLogin(e) {
    e.preventDefault();
    const errs = {};
    if (!loginForm.username.trim()) errs.username = "Username or email required";
    if (!loginForm.password || loginForm.password.length < 6) errs.password = "Min 6 characters";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const isAdmin = loginForm.username.trim() === "admin123@gmail.com" && loginForm.password === "123456";
      onLogin({ name: loginForm.username, email: loginForm.username, photo }, isAdmin);
    }, 900);
  }

  function submitSignup(e) {
    e.preventDefault();
    const errs = {};
    if (!signupForm.firstName.trim()) errs.firstName = "Required";
    if (!signupForm.lastName.trim()) errs.lastName = "Required";
    if (!signupForm.email || !/\S+@\S+\.\S+/.test(signupForm.email)) errs.email = "Valid email required";
    if (!signupForm.password || signupForm.password.length < 6) errs.password = "Min 6 characters";
    if (signupForm.password !== signupForm.confirm) errs.confirm = "Passwords don't match";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin({
        name: `${signupForm.firstName} ${signupForm.lastName}`,
        email: signupForm.email,
        phone: signupForm.phone,
        city: signupForm.city,
        country: signupForm.country,
        additionalInfo: signupForm.additionalInfo,
        photo,
      });
    }, 900);
  }

  const setL = f => e => setLoginForm(p => ({ ...p, [f]: e.target.value }));
  const setS = f => e => setSignupForm(p => ({ ...p, [f]: e.target.value }));

  const loginUsername = loginForm.username.trim();

  return (
    <div className="auth-root">
      <style>{css}{authCss}</style>

      {/* Left panel */}
      <div className="auth-panel-left">
        <div className="auth-panel-left-orb" style={{ width: 400, height: 400, top: -100, right: -100, background: "rgba(232,98,42,0.15)" }} />
        <div className="auth-panel-left-orb" style={{ width: 300, height: 300, bottom: 100, left: -80, background: "rgba(245,164,74,0.1)" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>✈ Traveloop</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 42, fontWeight: 700, color: "#fff", lineHeight: 1.2, marginBottom: 16 }}>
            Your world,<br />your journey.✨
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 15, lineHeight: 1.7, maxWidth: 340 }}>
            Plan trips, track budgets, build itineraries and share adventures — all in one beautiful place.
          </p>
          <div style={{ display: "flex", gap: 20, marginTop: 32 }}>
            {["🗺️ 10K+ Trips", "🌍 80+ Countries", "⭐ 4.9 Rating"].map(s => (
              <div key={s} style={{ background: "rgba(255,255,255,0.08)", borderRadius: 10, padding: "8px 14px", fontSize: 12, color: "rgba(255,255,255,0.7)", backdropFilter: "blur(8px)" }}>{s}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-panel-right">
        <div className="auth-logo">Travel<span>oop</span></div>

        {mode === "login" && (
          <form onSubmit={submitLogin}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: "#1a1816", marginBottom: 4 }}>Welcome back 👋</h2>
            <p style={{ fontSize: 14, color: "#6b6560", marginBottom: 28 }}>Sign in to continue your journey</p>

            {/* User photo preview on login */}
            <div className="auth-user-preview">
              <div className="auth-user-preview-avatar">
                {loginUsername ? loginUsername.slice(0, 1).toUpperCase() : "👤"}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1816" }}>
                  {loginUsername || "Enter your username below"}
                </div>
                <div style={{ fontSize: 12, color: "#a09b96" }}>Traveloop member</div>
              </div>
            </div>

            <div className="auth-field">
              <label>Username or Email</label>
              <input type="text" placeholder="you@example.com or @username" value={loginForm.username} onChange={setL("username")} />
              {errors.username && <span className="err">{errors.username}</span>}
            </div>
            <div className="auth-field">
              <label>Password</label>
              <input type="password" placeholder="••••••••" value={loginForm.password} onChange={setL("password")} />
              {errors.password && <span className="err">{errors.password}</span>}
            </div>

            <div style={{ textAlign: "right", marginBottom: 16, marginTop: -6 }}>
              <span className="auth-link" style={{ fontSize: 13 }}>Forgot password?</span>
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Signing in…" : "Sign In →"}
            </button>

            <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#6b6560" }}>
              New here? <span className="auth-link" onClick={() => { setMode("signup"); setErrors({}); }}>Create an account</span>
            </p>
          </form>
        )}

        {mode === "signup" && (
          <form onSubmit={submitSignup}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: "#1a1816", marginBottom: 4 }}>Create your account</h2>
            <p style={{ fontSize: 14, color: "#6b6560", marginBottom: 24 }}>Start planning your dream trips today</p>

            {/* Photo upload */}
            <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24 }}>
              <div className="auth-avatar-ring" onClick={() => fileRef.current.click()}>
                {photo
                  ? <img src={photo} alt="profile" />
                  : <span className="upload-icon">📷</span>
                }
                <span className="upload-label">{photo ? "Change" : "Upload"}</span>
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhoto} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: "#1a1816", marginBottom: 4 }}>Profile Photo</div>
                <div style={{ fontSize: 12, color: "#a09b96", lineHeight: 1.5 }}>Click the circle to upload<br />JPG, PNG or GIF · Max 5MB</div>
              </div>
            </div>

            <div className="auth-row">
              <div className="auth-field">
                <label>First Name</label>
                <input type="text" placeholder="Jane" value={signupForm.firstName} onChange={setS("firstName")} />
                {errors.firstName && <span className="err">{errors.firstName}</span>}
              </div>
              <div className="auth-field">
                <label>Last Name</label>
                <input type="text" placeholder="Doe" value={signupForm.lastName} onChange={setS("lastName")} />
                {errors.lastName && <span className="err">{errors.lastName}</span>}
              </div>
            </div>

            <div className="auth-field">
              <label>Email Address</label>
              <input type="email" placeholder="you@example.com" value={signupForm.email} onChange={setS("email")} />
              {errors.email && <span className="err">{errors.email}</span>}
            </div>

            <div className="auth-field">
              <label>Phone Number</label>
              <input type="tel" placeholder="+1 (555) 000-0000" value={signupForm.phone} onChange={setS("phone")} />
            </div>

            <div className="auth-row">
              <div className="auth-field">
                <label>City</label>
                <input type="text" placeholder="New York" value={signupForm.city} onChange={setS("city")} />
              </div>
              <div className="auth-field">
                <label>Country</label>
                <input type="text" placeholder="United States" value={signupForm.country} onChange={setS("country")} />
              </div>
            </div>

            <div className="auth-row">
              <div className="auth-field">
                <label>Password</label>
                <input type="password" placeholder="••••••••" value={signupForm.password} onChange={setS("password")} />
                {errors.password && <span className="err">{errors.password}</span>}
              </div>
              <div className="auth-field">
                <label>Confirm Password</label>
                <input type="password" placeholder="••••••••" value={signupForm.confirm} onChange={setS("confirm")} />
                {errors.confirm && <span className="err">{errors.confirm}</span>}
              </div>
            </div>

            <div className="auth-field">
              <label>Additional Information</label>
              <textarea placeholder="Tell us about your travel style, interests, or anything else…" value={signupForm.additionalInfo} onChange={setS("additionalInfo")} />
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Creating account…" : "Create Account →"}
            </button>

            <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#6b6560" }}>
              Already have an account? <span className="auth-link" onClick={() => { setMode("login"); setErrors({}); }}>Sign in</span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard({ trips, user, onNavigate }) {
  const upcoming = trips.filter(t => t.startDate && new Date(t.startDate) >= new Date()).slice(0, 3);
  const totalBudget = trips.reduce((a, t) => a + (t.budget || 0), 0);

  return (
    <div className="page fade-in">
      <div className="hero-section shine">
        <div className="pill">✈️ Ready for your next adventure?</div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "#fff", marginBottom: 8, maxWidth: 400 }}>
          Where are you heading next, {user.name.split(" ")[0]}?
        </h2>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, marginBottom: 24 }}>
          {trips.length} trips planned · {upcoming.length} upcoming
        </p>
        <button className="btn" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}
          onClick={() => onNavigate("create")}>
          + Plan New Trip
        </button>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 32 }}>
        {[
          { label: "Total Trips", value: trips.length, icon: "🗺️" },
          { label: "Upcoming", value: upcoming.length, icon: "📅" },
          { label: "Cities Planned", value: trips.reduce((a, t) => a + (t.stops?.length || 0), 0), icon: "🏙️" },
          { label: "Budget Allocated", value: `$${totalBudget.toLocaleString()}`, icon: "💰" },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {upcoming.length > 0 && (
        <>
          <div className="section-header">
            <h3 className="section-title">Upcoming Trips</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("trips")}>View All</button>
          </div>
          <div className="grid grid-3" style={{ marginBottom: 32 }}>
            {upcoming.map(trip => <TripCard key={trip.id} trip={trip} onClick={() => onNavigate("itinerary", trip.id)} />)}
          </div>
        </>
      )}

      <div className="section-header">
        <h3 className="section-title">Recommended Destinations</h3>
      </div>
      <div className="grid grid-4" style={{ marginBottom: 32 }}>
        {DESTINATIONS.slice(0, 4).map(d => (
          <div key={d.id} className="dest-card" style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <img src={d.image} alt={d.name} style={{ width: "100%", height: 160, objectFit: "cover", marginBottom: 12 }} />
            <div style={{ fontWeight: 600, fontSize: 15 }}>{d.name}</div>
            <div style={{ color: "var(--text3)", fontSize: 12, marginBottom: 8 }}>{d.country}</div>
            <span className="badge badge-orange">{d.tag}</span>
            <div style={{ marginTop: 10, fontSize: 13, color: "var(--text2)" }}>
              ~${d.cost}<span style={{ color: "var(--text3)" }}>/day</span>
            </div>
          </div>
        ))}
      </div>

      <div className="section-header" style={{ marginTop: 28 }}>
        <h3 className="section-title">Quick Actions</h3>
      </div>
      <div className="grid grid-4">
        {[
          { label: "Plan a Trip", icon: "🗺️", page: "create" },
          { label: "My Itineraries", icon: "📋", page: "trips" },
          { label: "Budget Tracker", icon: "📊", page: "budget" },
          { label: "Packing List", icon: "🧳", page: "packing" },
        ].map(a => (
          <div key={a.label} className="card" style={{ padding: 20, cursor: "pointer", textAlign: "center", transition: "all 0.2s" }}
            onClick={() => onNavigate(a.page)}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={e => e.currentTarget.style.transform = ""}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>{a.icon}</div>
            <div style={{ fontWeight: 500, fontSize: 14 }}>{a.label}</div>
          </div>
        ))}
      </div>

    </div>
  );
}

// ─── Trip Card ────────────────────────────────────────────────────────────────

function TripCard({ trip, onClick, onEdit, onDelete }) {
  const days = daysBetween(trip.startDate, trip.endDate);
  const gradient = gradients[trip.id % gradients.length];
  const now = new Date();
  const start = trip.startDate ? new Date(trip.startDate) : null;
  const end = trip.endDate ? new Date(trip.endDate) : null;
  const status = !start ? "draft" : now < start ? "upcoming" : now <= end ? "ongoing" : "completed";
  const statusMap = { draft: "badge-gray", upcoming: "badge-blue", ongoing: "badge-green", completed: "badge-orange" };

  return (
    <div className="trip-card" onClick={onClick}>
      <div className="trip-card-banner" style={{ background: gradient }}>
        <div>
          <span className={`badge ${statusMap[status]}`} style={{ marginBottom: 6, display: "block", width: "fit-content" }}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
          <div style={{ color: "#fff", fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, textShadow: "0 1px 8px rgba(0,0,0,0.3)" }}>
            {trip.name}
          </div>
        </div>
      </div>
      <div className="trip-card-body">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontSize: 12, color: "var(--text3)" }}>
            {trip.startDate ? `${fmtDate(trip.startDate)} – ${fmtDate(trip.endDate)}` : "Dates TBD"}
          </span>
          <span style={{ fontSize: 12, color: "var(--text3)" }}>{days ? `${days}d` : ""}</span>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          {(trip.stops || []).slice(0, 3).map((s, i) => (
            <span key={i} style={{ fontSize: 12, color: "var(--text2)", background: "var(--bg2)", padding: "2px 8px", borderRadius: 10 }}>{s.city}</span>
          ))}
          {(trip.stops || []).length > 3 && <span style={{ fontSize: 12, color: "var(--text3)" }}>+{trip.stops.length - 3}</span>}
        </div>
        {(onEdit || onDelete) && (
          <div style={{ display: "flex", gap: 8 }} onClick={e => e.stopPropagation()}>
            {onEdit && <button className="btn btn-ghost btn-sm" onClick={onEdit}>Edit</button>}
            {onDelete && <button className="btn btn-ghost btn-sm" style={{ color: "#e74c3c" }} onClick={onDelete}>Delete</button>}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── My Trips ─────────────────────────────────────────────────────────────────

function MyTrips({ trips, setTrips, onNavigate }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [editTrip, setEditTrip] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const filtered = trips.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase());
    const now = new Date();
    const start = t.startDate ? new Date(t.startDate) : null;
    const end = t.endDate ? new Date(t.endDate) : null;
    const status = !start ? "draft" : now < start ? "upcoming" : now <= end ? "ongoing" : "completed";
    return matchSearch && (filter === "all" || filter === status);
  });

  return (
    <div className="page fade-in">
      <div className="section-header">
        <h2 className="section-title">My Trips</h2>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Trip</button>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <div className="search-input-wrap" style={{ flex: 1, minWidth: 200 }}>
          <span className="search-icon">🔍</span>
          <input className="input" placeholder="Search trips…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="tabs" style={{ minWidth: 340 }}>
          {["all", "upcoming", "ongoing", "completed", "draft"].map(f => (
            <button key={f} className={`tab${filter === f ? " active" : ""}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🗺️</div>
          <h3>No trips found</h3>
          <p>Start planning your next adventure by creating a new trip.</p>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>Plan a Trip</button>
        </div>
      ) : (
        <div className="grid grid-3">
          {filtered.map(trip => (
            <TripCard key={trip.id} trip={trip}
              onClick={() => onNavigate("itinerary", trip.id)}
              onEdit={() => setEditTrip(trip)}
              onDelete={() => setTrips(prev => prev.filter(t => t.id !== trip.id))} />
          ))}
        </div>
      )}

      {showCreate && <CreateTripModal onClose={() => setShowCreate(false)}
        onSave={trip => { setTrips(prev => [...prev, trip]); setShowCreate(false); }} />}

      {editTrip && <CreateTripModal trip={editTrip} onClose={() => setEditTrip(null)}
        onSave={updated => { setTrips(prev => prev.map(t => t.id === updated.id ? updated : t)); setEditTrip(null); }} />}
    </div>
  );
}

// ─── Create Trip Modal ────────────────────────────────────────────────────────

function CreateTripModal({ trip, onClose, onSave }) {
  const [form, setForm] = useState({
    name: trip?.name || "", startDate: trip?.startDate || "", endDate: trip?.endDate || "",
    description: trip?.description || "", budget: trip?.budget || "", preferences: trip?.preferences || [],
  });
  const [errors, setErrors] = useState({});

  const preferences = ["Beach", "Mountains", "City", "Culture", "Food", "Adventure", "Relaxation", "Nightlife"];

  function submit() {
    const e = {};
    if (!form.name.trim()) e.name = "Trip name required";
    if (!form.startDate) e.startDate = "Start date required";
    if (!form.endDate) e.endDate = "End date required";
    if (form.startDate && form.endDate && form.startDate > form.endDate) e.endDate = "End must be after start";
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave({ ...trip, ...form, id: trip?.id || Date.now(), stops: trip?.stops || [], notes: trip?.notes || [], budget: Number(form.budget) || 0 });
  }

  const set = field => e => setForm(f => ({ ...f, [field]: e.target.value }));

  return (
    <Modal title={trip ? "Edit Trip" : "Create New Trip"} onClose={onClose}
      footer={<>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={submit}>{trip ? "Save Changes" : "Create Trip"}</button>
      </>}>
      <FormField label="Trip Name" placeholder="e.g. European Summer 2025" value={form.name} onChange={set("name")} error={errors.name} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <FormField label="Start Date" type="date" value={form.startDate} onChange={set("startDate")} error={errors.startDate} />
        <FormField label="End Date" type="date" value={form.endDate} onChange={set("endDate")} error={errors.endDate} />
      </div>
      <FormField label="Total Budget ($)" type="number" placeholder="2000" value={form.budget} onChange={set("budget")} error={errors.budget} />
      <FormField label="Description" placeholder="What's this trip about?" as="textarea" value={form.description} onChange={set("description")} />
      <div className="input-group">
        <label>Travel Preferences</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {preferences.map(p => (
            <span key={p} className={`tag-chip${form.preferences.includes(p) ? " selected" : ""}`}
              onClick={() => setForm(f => ({
                ...f, preferences: f.preferences.includes(p) ? f.preferences.filter(x => x !== p) : [...f.preferences, p]
              }))}>
              {p}
            </span>
          ))}
        </div>
      </div>
    </Modal>
  );
}

// ─── Itinerary Builder ────────────────────────────────────────────────────────

function ItineraryBuilder({ trips, setTrips, tripId, onNavigate }) {
  const trip = trips.find(t => t.id === tripId);
  const [stops, setStops] = useState(trip?.stops || []);
  const [showAddCity, setShowAddCity] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [view, setView] = useState("list");

  if (!trip) return (
    <div className="page fade-in">
      <div className="empty-state">
        <div className="icon">📋</div>
        <h3>Trip not found</h3>
        <p>This trip doesn't exist or was deleted.</p>
        <button className="btn btn-primary" onClick={() => onNavigate("trips")}>My Trips</button>
      </div>
    </div>
  );

  function saveStops(s) {
    setStops(s);
    setTrips(prev => prev.map(t => t.id === tripId ? { ...t, stops: s } : t));
  }

  function addCity(city) {
    const newStop = { id: Date.now(), city, days: 1, activities: [] };
    saveStops([...stops, newStop]);
    setShowAddCity(false);
    setExpanded(e => ({ ...e, [newStop.id]: true }));
  }

  function removeCity(id) { saveStops(stops.filter(s => s.id !== id)); }

  function updateStop(id, updates) {
    saveStops(stops.map(s => s.id === id ? { ...s, ...updates } : s));
  }

  function addActivity(stopId, activity) {
    const stop = stops.find(s => s.id === stopId);
    updateStop(stopId, { activities: [...(stop.activities || []), { ...activity, id: Date.now() }] });
  }

  function removeActivity(stopId, actId) {
    const stop = stops.find(s => s.id === stopId);
    updateStop(stopId, { activities: stop.activities.filter(a => a.id !== actId) });
  }

  const totalDays = stops.reduce((a, s) => a + (s.days || 1), 0);
  const totalCost = stops.reduce((a, s) => a + (s.activities || []).reduce((b, ac) => b + (ac.cost || 0), 0), 0);

  return (
    <div className="page fade-in">
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("trips")}>← Back</button>
      </div>
      <div className="section-header">
        <div>
          <h2 className="section-title">{trip.name}</h2>
          <p style={{ color: "var(--text3)", fontSize: 13, marginTop: 4 }}>
            {trip.startDate ? `${fmtDate(trip.startDate)} – ${fmtDate(trip.endDate)}` : "Dates not set"}
            {totalDays > 0 && ` · ${totalDays} days · ${stops.length} cities`}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div className="tabs">
            <button className={`tab${view === "list" ? " active" : ""}`} onClick={() => setView("list")}>List</button>
            <button className={`tab${view === "timeline" ? " active" : ""}`} onClick={() => setView("timeline")}>Timeline</button>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAddCity(true)}>+ Add City</button>
        </div>
      </div>

      {stops.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🌍</div>
          <h3>No cities yet</h3>
          <p>Start building your itinerary by adding your first destination.</p>
          <button className="btn btn-primary" onClick={() => setShowAddCity(true)}>Add First City</button>
        </div>
      ) : view === "timeline" ? (
        <TimelineView stops={stops} trip={trip} />
      ) : (
        <>
          {stops.map((stop, idx) => (
            <div key={stop.id} className="city-stop">
              <div className="city-stop-header" onClick={() => setExpanded(e => ({ ...e, [stop.id]: !e[stop.id] }))}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span className="drag-handle">⠿</span>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 }}>
                    {idx + 1}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>{stop.city}</div>
                    <div style={{ fontSize: 12, color: "var(--text3)" }}>
                      {stop.days || 1} day{(stop.days || 1) > 1 ? "s" : ""} · {(stop.activities || []).length} activities
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 12, color: "var(--text3)" }}>
                    ${(stop.activities || []).reduce((a, c) => a + (c.cost || 0), 0)}
                  </span>
                  <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); removeCity(stop.id); }}
                    style={{ color: "#e74c3c", padding: "4px 10px" }}>×</button>
                  <span style={{ color: "var(--text3)" }}>{expanded[stop.id] ? "▲" : "▼"}</span>
                </div>
              </div>

              {expanded[stop.id] && (
                <div className="city-stop-body">
                  <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
                    <label style={{ fontSize: 13, color: "var(--text2)" }}>Days in {stop.city}:</label>
                    <input type="number" min="1" max="30" value={stop.days || 1}
                      onChange={e => updateStop(stop.id, { days: parseInt(e.target.value) || 1 })}
                      style={{ width: 70, padding: "6px 10px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--bg)", color: "var(--text)", fontFamily: "var(--font-body)" }} />
                  </div>

                  {(stop.activities || []).map(act => (
                    <div key={act.id} className="activity-card">
                      <span style={{ fontSize: 24 }}>{act.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500, fontSize: 14 }}>{act.name}</div>
                        <div style={{ fontSize: 12, color: "var(--text3)" }}>{act.category} · {act.duration} · ${act.cost}</div>
                      </div>
                      <button className="btn btn-ghost btn-sm" style={{ color: "#e74c3c" }}
                        onClick={() => removeActivity(stop.id, act.id)}>Remove</button>
                    </div>
                  ))}

                  <ActivityPicker onAdd={act => addActivity(stop.id, act)} />
                </div>
              )}
            </div>
          ))}

          <div className="card" style={{ padding: 20, marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 4 }}>Total Estimated Cost</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "var(--accent)" }}>
                ${totalCost.toLocaleString()}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13, color: "var(--text3)" }}>{totalDays} days across {stops.length} cities</div>
              {trip.budget > 0 && (
                <div style={{ fontSize: 13, marginTop: 4 }}>
                  Budget: ${trip.budget} · <span style={{ color: totalCost > trip.budget ? "#e74c3c" : "#27ae60" }}>
                    {totalCost > trip.budget ? `$${totalCost - trip.budget} over` : `$${trip.budget - totalCost} remaining`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {showAddCity && <AddCityModal onClose={() => setShowAddCity(false)} onAdd={addCity} />}
    </div>
  );
}

function ActivityPicker({ onAdd }) {
  const [show, setShow] = useState(false);
  const [filter, setFilter] = useState("All");
  const categories = ["All", "Culture", "Food", "Adventure", "Relaxation", "Shopping"];
  const filtered = filter === "All" ? ACTIVITIES : ACTIVITIES.filter(a => a.category === filter);

  return (
    <div>
      {!show ? (
        <button className="btn btn-ghost btn-sm" onClick={() => setShow(true)}>+ Add Activity</button>
      ) : (
        <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 16, background: "var(--bg2)" }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
            {categories.map(c => (
              <span key={c} className={`tag-chip${filter === c ? " selected" : ""}`} onClick={() => setFilter(c)}>{c}</span>
            ))}
          </div>
          {filtered.map(act => (
            <div key={act.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontSize: 20 }}>{act.icon}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{act.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text3)" }}>{act.duration} · ${act.cost}</div>
                </div>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => { onAdd(act); setShow(false); }}>Add</button>
            </div>
          ))}
          <button className="btn btn-ghost btn-sm" style={{ marginTop: 10 }} onClick={() => setShow(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
}

function AddCityModal({ onClose, onAdd }) {
  const [search, setSearch] = useState("");
  const [custom, setCustom] = useState("");

  const results = DESTINATIONS.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) || d.country.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Modal title="Add City" onClose={onClose}>
      <div className="search-input-wrap" style={{ marginBottom: 16 }}>
        <span className="search-icon">🔍</span>
        <input className="input" placeholder="Search cities…" value={search} onChange={e => setSearch(e.target.value)} autoFocus />
      </div>
      {results.map(d => (
        <div key={d.id} className="activity-card" style={{ cursor: "pointer" }} onClick={() => onAdd(d.name)}>
          <span style={{ fontSize: 28 }}>{d.emoji}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500 }}>{d.name}</div>
            <div style={{ fontSize: 12, color: "var(--text3)" }}>{d.country} · ~${d.cost}/day</div>
          </div>
          <span className="badge badge-orange">{d.tag}</span>
        </div>
      ))}
      <div className="divider" />
      <div style={{ display: "flex", gap: 10 }}>
        <input className="input" placeholder="Or type a custom city…" value={custom} onChange={e => setCustom(e.target.value)}
          onKeyDown={e => e.key === "Enter" && custom.trim() && onAdd(custom.trim())} />
        <button className="btn btn-primary" disabled={!custom.trim()} onClick={() => onAdd(custom.trim())}>Add</button>
      </div>
    </Modal>
  );
}

function TimelineView({ stops, trip }) {
  let dayCount = 0;
  return (
    <div>
      <div style={{ marginBottom: 24, padding: 16, background: "var(--bg2)", borderRadius: 12, fontSize: 13, color: "var(--text2)" }}>
        {trip.startDate ? `Starting ${fmtDate(trip.startDate)}` : "Start date not set"} · {stops.length} cities · {stops.reduce((a, s) => a + (s.days || 1), 0)} days total
      </div>
      <div className="timeline">
        {stops.map((stop, i) => {
          const startDay = dayCount + 1;
          dayCount += stop.days || 1;
          return (
            <div key={stop.id} className="timeline-item">
              <div className="timeline-dot" />
              <div className="card" style={{ padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{stop.city}</div>
                    <div style={{ fontSize: 12, color: "var(--text3)" }}>
                      Day {startDay}{stop.days > 1 ? `–${dayCount}` : ""} · {stop.days || 1} day{(stop.days || 1) > 1 ? "s" : ""}
                    </div>
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "var(--accent)" }}>
                    #{i + 1}
                  </div>
                </div>
                {(stop.activities || []).length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {(stop.activities || []).map(act => (
                      <div key={act.id} style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 13 }}>
                        <span>{act.icon}</span>
                        <span>{act.name}</span>
                        <span style={{ color: "var(--text3)", marginLeft: "auto" }}>${act.cost}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: "var(--text3)", fontStyle: "italic" }}>No activities planned yet</div>
                )}
              </div>
            </div>
          );
        })}
        <div className="timeline-item">
          <div className="timeline-dot" style={{ background: "#27ae60" }} />
          <div style={{ padding: "8px 0", fontSize: 14, color: "var(--text2)", fontStyle: "italic" }}>Trip ends 🎉</div>
        </div>
      </div>
    </div>
  );
}

// ─── Budget ───────────────────────────────────────────────────────────────────

function BudgetPage({ trips }) {
  const [selTrip, setSelTrip] = useState(trips[0]?.id || null);
  const trip = trips.find(t => t.id === selTrip);
  const stops = trip?.stops || [];

  const byCity = stops.map(s => ({
    city: s.city,
    cost: (s.activities || []).reduce((a, c) => a + (c.cost || 0), 0),
  }));

  const byCat = {};
  stops.forEach(s => (s.activities || []).forEach(a => {
    byCat[a.category] = (byCat[a.category] || 0) + a.cost;
  }));

  const total = byCity.reduce((a, c) => a + c.cost, 0);
  const budget = trip?.budget || 0;
  const pct = budget > 0 ? Math.min(100, Math.round((total / budget) * 100)) : 0;
  const maxCity = Math.max(...byCity.map(c => c.cost), 1);

  const catColors = { Culture: "#667eea", Food: "#f093fb", Adventure: "#f5576c", Relaxation: "#43e97b", Shopping: "#4facfe" };

  return (
    <div className="page fade-in">
      <div className="section-header">
        <h2 className="section-title">Budget & Analytics</h2>
        <select className="input" style={{ width: "auto" }} value={selTrip || ""} onChange={e => setSelTrip(Number(e.target.value))}>
          <option value="" disabled>Select trip</option>
          {trips.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      {!trip ? (
        <div className="empty-state"><div className="icon">📊</div><h3>Select a trip</h3><p>Choose a trip to view its budget breakdown.</p></div>
      ) : (
        <>
          <div className="grid grid-4" style={{ marginBottom: 28 }}>
            {[
              { label: "Total Budget", value: `$${budget.toLocaleString()}`, color: "var(--text)" },
              { label: "Estimated Cost", value: `$${total.toLocaleString()}`, color: total > budget ? "#e74c3c" : "#27ae60" },
              { label: "Remaining", value: `$${Math.abs(budget - total).toLocaleString()}`, color: budget - total < 0 ? "#e74c3c" : "#27ae60" },
              { label: "Cost Per Day", value: `$${trip.startDate && trip.endDate ? Math.round(total / Math.max(1, daysBetween(trip.startDate, trip.endDate))) : "–"}`, color: "var(--text)" },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {budget > 0 && (
            <div className="card" style={{ padding: 24, marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 14 }}>
                <span style={{ fontWeight: 500 }}>Budget utilization</span>
                <span style={{ color: pct > 90 ? "#e74c3c" : "var(--text2)" }}>{pct}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${pct}%`, background: pct > 90 ? "#e74c3c" : "var(--accent)" }} />
              </div>
              {pct > 90 && <div style={{ fontSize: 12, color: "#e74c3c", marginTop: 8 }}>⚠️ You're close to or over budget!</div>}
            </div>
          )}

          <div className="grid grid-2" style={{ marginBottom: 24 }}>
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontWeight: 600, marginBottom: 20, fontSize: 15 }}>Cost by City</h3>
              {byCity.length === 0 ? (
                <div style={{ color: "var(--text3)", fontSize: 13, textAlign: "center", padding: "20px 0" }}>No activities added yet</div>
              ) : (
                <div className="budget-bar">
                  {byCity.map(c => (
                    <div key={c.city} className="budget-row">
                      <div className="budget-row-header">
                        <span style={{ fontWeight: 500, fontSize: 14 }}>{c.city}</span>
                        <span style={{ color: "var(--accent)", fontWeight: 600 }}>${c.cost}</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${Math.round((c.cost / maxCity) * 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontWeight: 600, marginBottom: 20, fontSize: 15 }}>By Category</h3>
              {Object.keys(byCat).length === 0 ? (
                <div style={{ color: "var(--text3)", fontSize: 13, textAlign: "center", padding: "20px 0" }}>No categories yet</div>
              ) : (
                <div>
                  {Object.entries(byCat).map(([cat, cost]) => (
                    <div key={cat} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: catColors[cat] || "var(--accent)" }} />
                        <span style={{ fontSize: 14 }}>{cat}</span>
                      </div>
                      <div>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>${cost}</span>
                        <span style={{ color: "var(--text3)", fontSize: 12, marginLeft: 4 }}>
                          ({total > 0 ? Math.round((cost / total) * 100) : 0}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {byCity.length > 0 && (
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontWeight: 600, marginBottom: 20, fontSize: 15 }}>City Chart</h3>
              <div className="chart-bar-wrap">
                {byCity.map(c => (
                  <div key={c.city} className="chart-bar-col">
                    <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 4 }}>${c.cost}</div>
                    <div style={{ width: "100%", flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                      <div className="chart-bar" style={{ height: `${Math.max(8, Math.round((c.cost / maxCity) * 100))}px`, minHeight: 8 }} />
                    </div>
                    <div className="chart-bar-label">{c.city.slice(0, 8)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Packing ──────────────────────────────────────────────────────────────────

function PackingPage() {
  const [items, setItems] = useLocalStorage("traveloop-packing", PACKING_DEFAULTS);
  const [newItem, setNewItem] = useState("");
  const [newCat, setNewCat] = useState("General");
  const [filter, setFilter] = useState("All");

  const categories = ["All", ...Array.from(new Set(items.map(i => i.category)))];
  const filtered = items.filter(i => filter === "All" || i.category === filter);
  const packed = items.filter(i => i.packed).length;

  function toggle(id) { setItems(prev => prev.map(i => i.id === id ? { ...i, packed: !i.packed } : i)); }
  function remove(id) { setItems(prev => prev.filter(i => i.id !== id)); }
  function add() {
    if (!newItem.trim()) return;
    setItems(prev => [...prev, { id: Date.now(), item: newItem.trim(), category: newCat, packed: false }]);
    setNewItem("");
  }
  function reset() { setItems(prev => prev.map(i => ({ ...i, packed: false }))); }

  return (
    <div className="page fade-in">
      <div className="section-header">
        <h2 className="section-title">Packing Checklist</h2>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-ghost btn-sm" onClick={reset}>Reset All</button>
        </div>
      </div>

      <div className="card" style={{ padding: 20, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 14 }}>
          <span>{packed} of {items.length} packed</span>
          <span style={{ color: "var(--accent)", fontWeight: 600 }}>{items.length > 0 ? Math.round((packed / items.length) * 100) : 0}%</span>
        </div>
        <div className="progress-bar"><div className="progress-fill" style={{ width: `${items.length > 0 ? (packed / items.length) * 100 : 0}%` }} /></div>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <div className="tabs" style={{ flex: 1 }}>
          {categories.map(c => <button key={c} className={`tab${filter === c ? " active" : ""}`} onClick={() => setFilter(c)}>{c}</button>)}
        </div>
      </div>

      {filtered.map(item => (
        <div key={item.id} className={`checklist-item${item.packed ? " packed" : ""}`}>
          <div className={`checkbox${item.packed ? " checked" : ""}`} onClick={() => toggle(item.id)}>
            {item.packed && "✓"}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, textDecoration: item.packed ? "line-through" : "none" }}>{item.item}</div>
            <div style={{ fontSize: 11, color: "var(--text3)" }}>{item.category}</div>
          </div>
          <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text3)", fontSize: 18 }} onClick={() => remove(item.id)}>×</button>
        </div>
      ))}

      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <input className="input" placeholder="Add item…" value={newItem} onChange={e => setNewItem(e.target.value)}
          onKeyDown={e => e.key === "Enter" && add()} style={{ flex: 1 }} />
        <select className="input" style={{ width: 140 }} value={newCat} onChange={e => setNewCat(e.target.value)}>
          {["General", "Documents", "Electronics", "Clothing", "Health", "Toiletries"].map(c => <option key={c}>{c}</option>)}
        </select>
        <button className="btn btn-primary" onClick={add}>Add</button>
      </div>
    </div>
  );
}

// ─── Notes ────────────────────────────────────────────────────────────────────

function NotesPage({ trips }) {
  const [notes, setNotes] = useLocalStorage("traveloop-notes", []);
  const [selTrip, setSelTrip] = useState(trips[0]?.id || null);
  const [newNote, setNewNote] = useState("");
  const [newTitle, setNewTitle] = useState("");

  const tripNotes = notes.filter(n => n.tripId === selTrip);

  function addNote() {
    if (!newNote.trim()) return;
    setNotes(prev => [...prev, { id: Date.now(), tripId: selTrip, title: newTitle || "Untitled Note", content: newNote.trim(), date: new Date().toISOString() }]);
    setNewNote("");
    setNewTitle("");
  }

  return (
    <div className="page fade-in">
      <div className="section-header">
        <h2 className="section-title">Trip Journal</h2>
        <select className="input" style={{ width: "auto" }} value={selTrip || ""} onChange={e => setSelTrip(Number(e.target.value))}>
          <option value="" disabled>Select trip</option>
          {trips.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      {selTrip && (
        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
          <input className="input" placeholder="Note title…" value={newTitle} onChange={e => setNewTitle(e.target.value)} style={{ marginBottom: 12 }} />
          <textarea className="input" placeholder="Write your thoughts, plans, or reminders…" value={newNote} onChange={e => setNewNote(e.target.value)} style={{ marginBottom: 12, minHeight: 100 }} />
          <button className="btn btn-primary" onClick={addNote}>Add Note</button>
        </div>
      )}

      {tripNotes.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📝</div>
          <h3>No notes yet</h3>
          <p>Jot down your ideas, plans, or memories for this trip.</p>
        </div>
      ) : (
        tripNotes.slice().reverse().map(note => (
          <div key={note.id} className="note-card">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{note.title}</div>
              <div style={{ fontSize: 12, color: "var(--text3)" }}>{fmtDate(note.date)}</div>
            </div>
            <div style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.6 }}>{note.content}</div>
            <button style={{ marginTop: 12, background: "none", border: "none", cursor: "pointer", color: "var(--text3)", fontSize: 12 }}
              onClick={() => setNotes(prev => prev.filter(n => n.id !== note.id))}>Delete</button>
          </div>
        ))
      )}
    </div>
  );
}

// ─── Profile ──────────────────────────────────────────────────────────────────

function ProfilePage({ user, setUser, dark, setDark, onLogout, trips, onNavigate }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(user);

  function save() { setUser(form); setEditing(false); }

  const now = new Date();
  const getStatus = t => {
    const s = t.startDate ? new Date(t.startDate) : null;
    const e = t.endDate ? new Date(t.endDate) : null;
    return !s ? "draft" : now < s ? "upcoming" : now <= e ? "ongoing" : "completed";
  };

  const preplanned = trips.filter(t => ["upcoming", "draft"].includes(getStatus(t)));
  const previous   = trips.filter(t => getStatus(t) === "completed");

  const statusColors = { upcoming: "badge-blue", draft: "badge-gray", completed: "badge-orange", ongoing: "badge-green" };

  function TripRow({ trip }) {
    const status = getStatus(trip);
    const days = daysBetween(trip.startDate, trip.endDate);
    const grad = gradients[trip.id % gradients.length];
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 16, padding: "14px 0",
        borderBottom: "1px solid var(--border)",
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12, background: grad,
          flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20,
        }}>✈️</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{trip.name}</div>
          <div style={{ fontSize: 12, color: "var(--text3)" }}>
            {trip.startDate ? `${fmtDate(trip.startDate)} – ${fmtDate(trip.endDate)}` : "Dates TBD"}
            {days > 0 && ` · ${days}d`}
            {(trip.stops || []).length > 0 && ` · ${trip.stops.length} cities`}
          </div>
        </div>
        <span className={`badge ${statusColors[status]}`} style={{ flexShrink: 0 }}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
        <button className="btn btn-ghost btn-sm" style={{ flexShrink: 0 }}
          onClick={() => onNavigate("itinerary", trip.id)}>View</button>
      </div>
    );
  }

  return (
    <div className="page fade-in">
      <h2 className="section-title" style={{ marginBottom: 28 }}>Profile & Settings</h2>

      {/* Top row: profile info + preferences */}
      <div className="grid grid-2" style={{ marginBottom: 28 }}>
        <div className="card" style={{ padding: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24 }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", overflow: "hidden", flexShrink: 0,
              background: "linear-gradient(135deg, var(--accent), var(--accent2))",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 26, fontWeight: 700, color: "#fff" }}>
              {user.photo
                ? <img src={user.photo} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : user.name.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600 }}>{user.name}</div>
              <div style={{ color: "var(--text3)", fontSize: 13 }}>{user.email}</div>
              {user.city && <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>📍 {user.city}{user.country ? `, ${user.country}` : ""}</div>}
            </div>
          </div>

          {editing ? (
            <>
              <div className="input-group"><label>Full Name</label>
                <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="input-group"><label>Email</label>
                <input className="input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="input-group"><label>City</label>
                  <input className="input" placeholder="e.g. London" value={form.city || ""} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
                </div>
                <div className="input-group"><label>Country</label>
                  <input className="input" placeholder="e.g. UK" value={form.country || ""} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} />
                </div>
              </div>
              <div className="input-group"><label>Phone</label>
                <input className="input" placeholder="+1 555 000 0000" value={form.phone || ""} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn btn-primary" onClick={save}>Save</button>
                <button className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </>
          ) : (
            <>
              {[
                ["Phone", user.phone || "Not set"],
                ["City", user.city || "Not set"],
                ["Country", user.country || "Not set"],
                ["Member Since", "2025"],
              ].map(([l, v]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid var(--border)", fontSize: 14 }}>
                  <span style={{ color: "var(--text3)" }}>{l}</span>
                  <span style={{ fontWeight: 500 }}>{v}</span>
                </div>
              ))}
              <button className="btn btn-ghost btn-sm" style={{ marginTop: 16 }} onClick={() => setEditing(true)}>Edit Profile</button>
            </>
          )}
        </div>

        <div className="card" style={{ padding: 28 }}>
          <h3 style={{ fontWeight: 600, marginBottom: 20, fontSize: 15 }}>Preferences</h3>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Dark Mode</div>
              <div style={{ fontSize: 12, color: "var(--text3)" }}>Toggle dark/light theme</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setDark(d => !d)} style={{ minWidth: 64 }}>
              {dark ? "☀️ Light" : "🌙 Dark"}
            </button>
          </div>
          <div style={{ padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>Currency</div>
            <select className="input" style={{ width: 140 }}>
              <option>USD ($)</option><option>EUR (€)</option><option>GBP (£)</option><option>JPY (¥)</option><option>INR (₹)</option>
            </select>
          </div>
          <div style={{ padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>Language</div>
            <select className="input" style={{ width: 140 }}>
              <option>English</option><option>French</option><option>Spanish</option><option>German</option>
            </select>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 20 }}>
            {[
              { label: "Total Trips", value: trips.length, icon: "🗺️" },
              { label: "Pre-planned", value: preplanned.length, icon: "📅" },
              { label: "Completed", value: previous.length, icon: "✅" },
              { label: "Cities", value: trips.reduce((a, t) => a + (t.stops?.length || 0), 0), icon: "🏙️" },
            ].map(s => (
              <div key={s.label} style={{ background: "var(--bg2)", borderRadius: 12, padding: "14px 16px" }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "var(--text3)" }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div className="divider" />
          <button className="btn btn-ghost btn-sm" style={{ color: "#e74c3c" }} onClick={onLogout}>Sign Out</button>
        </div>
      </div>

      {/* Pre-planned Trips */}
      <div className="card" style={{ padding: 28, marginBottom: 24 }}>
        <div className="section-header" style={{ marginBottom: 4 }}>
          <div>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600 }}>📅 Pre-planned Trips</h3>
            <p style={{ fontSize: 13, color: "var(--text3)", marginTop: 4 }}>Upcoming & draft trips you have planned</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("trips")}>View All</button>
        </div>
        {preplanned.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text3)" }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>📋</div>
            <div style={{ fontSize: 14 }}>No pre-planned trips yet.</div>
            <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => onNavigate("trips")}>Plan a Trip</button>
          </div>
        ) : (
          preplanned.map(t => <TripRow key={t.id} trip={t} />)
        )}
      </div>

      {/* Previous Trips */}
      <div className="card" style={{ padding: 28 }}>
        <div className="section-header" style={{ marginBottom: 4 }}>
          <div>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600 }}>🏁 Previous Trips</h3>
            <p style={{ fontSize: 13, color: "var(--text3)", marginTop: 4 }}>Trips you have already completed</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("trips")}>View All</button>
        </div>
        {previous.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text3)" }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🌍</div>
            <div style={{ fontSize: 14 }}>No completed trips yet. Start exploring!</div>
          </div>
        ) : (
          previous.map(t => <TripRow key={t.id} trip={t} />)
        )}
      </div>
    </div>
  );
}

// ─── Explore ──────────────────────────────────────────────────────────────────

function ExplorePage() {
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState("All");
  const tags = ["All", "Romantic", "Cultural", "Tropical", "Urban", "Scenic", "Luxury", "Art", "Beach"];

  const results = DESTINATIONS.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.country.toLowerCase().includes(search.toLowerCase());
    return matchSearch && (tag === "All" || d.tag === tag);
  });

  return (
    <div className="page fade-in">
      <div className="section-header">
        <h2 className="section-title">Explore Destinations</h2>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div className="search-input-wrap" style={{ flex: 1, minWidth: 200 }}>
          <span className="search-icon">🔍</span>
          <input className="input" placeholder="Search destinations…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 24 }}>
        {tags.map(t => <span key={t} className={`tag-chip${tag === t ? " selected" : ""}`} onClick={() => setTag(t)}>{t}</span>)}
      </div>

      <div className="grid grid-4">
        {results.map(d => (
          <div key={d.id} className="dest-card" style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <img src={d.image} alt={d.name} style={{ width: "100%", height: 160, objectFit: "cover", marginBottom: 12 }} />
            <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, marginBottom: 4 }}>{d.name}</div>
            <div style={{ color: "var(--text3)", fontSize: 12, marginBottom: 12 }}>{d.country}</div>
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 12 }}>
              <span className="badge badge-orange">{d.tag}</span>
              <span className="badge badge-gray">⭐ {d.rating}</span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--accent)" }}>${d.cost}<span style={{ fontSize: 12, color: "var(--text3)", fontWeight: 400 }}>/day</span></div>
          </div>
        ))}
      </div>

      {results.length === 0 && (
        <div className="empty-state">
          <div className="icon">🌍</div>
          <h3>No destinations found</h3>
          <p>Try a different search or filter.</p>
        </div>
      )}
    </div>
  );
}

// ─── Share Page ───────────────────────────────────────────────────────────────

function SharePage({ trips }) {
  const [selTrip, setSelTrip] = useState(trips[0]?.id || null);
  const [copied, setCopied] = useState(false);
  const trip = trips.find(t => t.id === selTrip);
  const shareUrl = `https://traveloop.app/share/${selTrip}`;

  function copy() {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="page fade-in">
      <div className="section-header">
        <h2 className="section-title">Share Itinerary</h2>
        <select className="input" style={{ width: "auto" }} value={selTrip || ""} onChange={e => setSelTrip(Number(e.target.value))}>
          <option value="" disabled>Select trip</option>
          {trips.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      {trip ? (
        <>
          <div className="card" style={{ padding: 24, marginBottom: 24 }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, marginBottom: 8 }}>{trip.name}</div>
            <div style={{ color: "var(--text3)", fontSize: 13, marginBottom: 16 }}>
              {trip.startDate ? `${fmtDate(trip.startDate)} – ${fmtDate(trip.endDate)}` : "Dates TBD"} ·{" "}
              {(trip.stops || []).length} cities
            </div>
            <div style={{ background: "var(--bg2)", borderRadius: 10, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 13, color: "var(--text2)", wordBreak: "break-all" }}>{shareUrl}</span>
              <button className="btn btn-primary btn-sm" onClick={copy} style={{ marginLeft: 12, flexShrink: 0 }}>
                {copied ? "✓ Copied!" : "Copy Link"}
              </button>
            </div>
            <div style={{ fontSize: 13, color: "var(--text3)" }}>Anyone with this link can view your trip itinerary in read-only mode.</div>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontWeight: 600, marginBottom: 16, fontSize: 15 }}>Public Preview</h3>
            <div style={{ background: "var(--bg2)", borderRadius: 12, padding: 20 }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{trip.name}</div>
              <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 16 }}>
                {(trip.stops || []).length} destinations · {trip.startDate ? `${fmtDate(trip.startDate)}` : "TBD"}
              </div>
              {(trip.stops || []).map((stop, i) => (
                <div key={stop.id} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{i + 1}</div>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{stop.city}</div>
                    <div style={{ fontSize: 12, color: "var(--text3)" }}>{stop.days || 1} day{(stop.days || 1) > 1 ? "s" : ""} · {(stop.activities || []).length} activities</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="empty-state">
          <div className="icon">🔗</div>
          <h3>Select a trip to share</h3>
          <p>Choose a trip to generate a shareable public link.</p>
        </div>
      )}
    </div>
  );
}

// ─── Navigation Config ────────────────────────────────────────────────────────

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "🏠", group: "main" },
  { id: "trips", label: "My Trips", icon: "🗺️", group: "main" },
  { id: "explore", label: "Explore", icon: "🌍", group: "main" },
  { id: "expenses", label: "Expenses", icon: "💳", group: "tools" },
  { id: "budget", label: "Budget", icon: "📊", group: "tools" },
  { id: "packing", label: "Packing", icon: "🧳", group: "tools" },
  { id: "notes", label: "Journal", icon: "📝", group: "tools" },
  { id: "share", label: "Share", icon: "🔗", group: "tools" },
  { id: "profile", label: "Profile", icon: "👤", group: "account" },
];

// ─── App Shell ────────────────────────────────────────────────────────────────

function ensureSeedExpenses(trips, userEmail) {
  // Seed invoices/expenses into each trip if not already present.
  // Uses deterministic-but-stable data based on trip id.
  if (!Array.isArray(trips)) return trips;
  return trips.map((t) => {
    if (t && t.invoices && Array.isArray(t.invoices) && t.invoices.length) return t;

    const baseId = typeof t?.id === 'number' ? t.id : Number(String(t?.id).replace(/\D/g, '').slice(0, 8)) || 0;
    const seededRand = (n) => {
      // simple LCG
      let x = (baseId + 1) * (n + 17);
      x = (x * 9301 + 49297) % 233280;
      return x / 233280;
    };

    const start = t?.startDate ? new Date(t.startDate) : new Date(Date.now() + 86400000 * 10);
    const end = t?.endDate ? new Date(t.endDate) : new Date(start.getTime() + 86400000 * 5);

    const cities = (t?.stops || []).map((s) => s.city).filter(Boolean);
    const pickCity = (k) => cities[(k + Math.floor(seededRand(k) * 100)) % Math.max(1, cities.length)] || 'Unknown';

    const PLACE_IMAGES = [
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80',
      'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=1200&q=80',
      'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1200&q=80',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80',
    ];

    const invCount = Math.max(1, Math.min(3, 1 + (baseId % 3)));
    const invoices = Array.from({ length: invCount }).map((_, idx) => {
      const createdAt = new Date(start.getTime() + 86400000 * (idx + 1));
      const generatedAt = new Date(createdAt.getTime() + 86400000 * 2);
      const statuses = ['paid', 'unpaid'];
      const status = statuses[(baseId + idx) % statuses.length];

      const categories = ['Transport', 'Accommodation', 'Food', 'Tours', 'Fees', 'Misc'];
      const LINE_ITEMS = [
        { category: 'Transport', description: 'Local transport & metro rides', qty: 3 + (baseId % 5), unitCost: 12 + (idx * 3) },
        { category: 'Accommodation', description: 'Hotel / stay charges', qty: 4 + ((baseId + idx) % 4), unitCost: 55 + (idx * 8) },
        { category: 'Food', description: 'Meals & beverages', qty: 5 + ((baseId + idx) % 5), unitCost: 28 + (idx * 4) },
        { category: 'Tours', description: 'Sightseeing tickets', qty: 1 + (baseId % 2), unitCost: 90 + (idx * 10) },
        { category: 'Fees', description: 'Entry fees & permits', qty: 2 + ((baseId + idx) % 3), unitCost: 18 + (idx * 2) },
        { category: 'Misc', description: 'Tips, souvenirs & contingency', qty: 1 + (idx % 2), unitCost: 35 + (idx * 6) },
      ];

      const sliceCount = 4 + ((baseId + idx) % 3);
      const items = LINE_ITEMS.slice(0, sliceCount).map((it, li) => {
        const qty = it.qty;
        const unitCost = Math.round(it.unitCost * (0.92 + seededRand(li + idx * 7) * 0.25));
        const amount = qty * unitCost;
        return {
          id: `${baseId}-${idx}-li-${li}`,
          category: it.category,
          description: it.description,
          qty: qty,
          unitCost: unitCost,
          amount,
          details: `${qty}x`,
        };
      });

      const subtotal = items.reduce((a, it) => a + it.amount, 0);
      const tax = Math.round(subtotal * (0.06 + (idx % 2) * 0.01));
      const discount = Math.round(subtotal * (status === 'paid' ? 0.04 : 0.02));
      const grandTotal = subtotal + tax - discount;

      const placeCity = pickCity(idx);

      return {
        id: `INV-${userEmail ? userEmail[0].toUpperCase() : 'U'}-${baseId}-${idx + 1}`,
        invoiceId: `INV-${baseId}-${idx + 1}`,
        generatedDate: generatedAt.toISOString(),
        createdBy: userEmail || 'user',
        travelDetails: {
          tripName: t?.name || 'Trip',
          from: t?.startDate || start.toISOString(),
          to: t?.endDate || end.toISOString(),
        },
        place: {
          name: placeCity,
          image: PLACE_IMAGES[(baseId + idx) % PLACE_IMAGES.length],
        },
        paymentStatus: status === 'paid' ? 'Paid' : 'Unpaid',
        totals: {
          subtotal,
          tax,
          discount,
          grandTotal,
        },
        lineItems: items,
        meta: {
          currency: 'USD',
        },
      };
    });

    return { ...t, invoices };
  });
}

export default function App() {
  const [user, setUser] = useLocalStorage("traveloop-user", null);
  const [trips, setTripsRaw] = useLocalStorage("traveloop-trips", []);
  const [adminAuth, setAdminAuth] = useLocalStorage("traveloop-admin-auth", null);
  const [allUsersTrips, setAllUsersTrips] = useLocalStorage("traveloop-users-trips", {});
  const [dark, setDark] = useLocalStorage("traveloop-dark", false);
  const [page, setPage] = useState("dashboard");
  const [activeTripId, setActiveTripId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sync trips to per-user store whenever they change
  function setTrips(updater) {
    setTripsRaw(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (user?.email) {
        setAllUsersTrips(all => ({ ...all, [user.email]: next }));
      }
      return next;
    });
  }

  function handleLogin(u, isAdmin) {
    if (isAdmin) {
      setUser(null);
      setAdminAuth({ email: u.email });
      return;
    }
    // Migrate legacy trips into per-user store on first login
    const legacy = (() => { try { const s = localStorage.getItem("traveloop-trips"); return s ? JSON.parse(s) : []; } catch { return []; } })();
    const stored = (() => { try { const s = localStorage.getItem("traveloop-users-trips"); const all = s ? JSON.parse(s) : {}; return all[u.email] ?? legacy; } catch { return legacy; } })();
    setAllUsersTrips(all => ({ ...all, [u.email]: stored }));
    setTripsRaw(stored);
    setUser(u);
  }

  function navigate(pg, tripId = null) {
    setPage(pg);
    if (tripId) setActiveTripId(tripId);
    setSidebarOpen(false);
  }

  const pageTitles = {
    dashboard: "Dashboard", trips: "My Trips", explore: "Explore", expenses: "Expenses", budget: "Budget",
    packing: "Packing", notes: "Journal", share: "Share", profile: "Profile", itinerary: "Itinerary",
  };

  if (adminAuth) return <AdminShell onLogout={() => setAdminAuth(null)} dark={dark} setDark={setDark} />;
  if (!user) return <AuthPage onLogin={handleLogin} />;

  const groups = [
    { label: "Main", items: NAV.filter(n => n.group === "main") },
    { label: "Tools", items: NAV.filter(n => n.group === "tools") },
    { label: "Account", items: NAV.filter(n => n.group === "account") },
  ];

  return (
    <div className={dark ? "dark" : ""}>
      <style>{css}</style>
      <div className="app">
        {/* Sidebar */}
        <nav className={`sidebar${sidebarOpen ? " open" : ""}`}>
          <div className="sidebar-logo">
            <h1>Travel<span>oop</span></h1>
            <p>Your travel companion</p>
          </div>
          <div className="sidebar-nav">
            {groups.map(g => (
              <div key={g.label}>
                <div className="nav-label">{g.label}</div>
                {g.items.map(item => (
                  <div key={item.id} className={`nav-item${page === item.id || (page === "itinerary" && item.id === "trips") ? " active" : ""}`}
                    onClick={() => navigate(item.id)}>
                    <span className="icon">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="sidebar-footer">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Avatar name={user.name} size={32} photo={user.photo} />
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--sidebar-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</div>
                <div style={{ fontSize: 11, color: "var(--sidebar-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main */}
        <main className="main">
          <div className="topbar">
            <div className="topbar-title">{pageTitles[page] || "Traveloop"}</div>
            <div className="topbar-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => setDark(d => !d)}>{dark ? "☀️" : "🌙"}</button>
              <Avatar name={user.name} size={32} photo={user.photo} />
            </div>
          </div>

          {page === "dashboard" && <Dashboard trips={trips} user={user} onNavigate={navigate} />}
          {page === "trips" && <MyTrips trips={trips} setTrips={setTrips} onNavigate={navigate} />}
          {page === "explore" && <ExplorePage />}
          {page === "itinerary" && <ItineraryBuilder trips={trips} setTrips={setTrips} tripId={activeTripId} onNavigate={navigate} />}
          {page === "expenses" && <ExpensesPage trips={ensureSeedExpenses(trips, user.email)} />}
          {page === "budget" && <BudgetPage trips={trips} />}
          {page === "packing" && <PackingPage />}
          {page === "notes" && <NotesPage trips={trips} />}
          {page === "share" && <SharePage trips={trips} />}
          {page === "profile" && <ProfilePage user={user} setUser={setUser} dark={dark} setDark={setDark} onLogout={() => setUser(null)} trips={trips} onNavigate={navigate} />}
        </main>

        {/* Mobile menu */}
        <button className="mobile-menu-btn" onClick={() => setSidebarOpen(o => !o)}>
          {sidebarOpen ? "✕" : "☰"}
        </button>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 99 }}
            onClick={() => setSidebarOpen(false)} />
        )}
      </div>
    </div>
  );
}