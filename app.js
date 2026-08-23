
const games = [
  { name: 'Valorant', cls: 'val', type: 'FPS', desc: 'Tactical 5v5 competitive shooter.' },
  { name: 'Free Fire', cls: 'ff', type: 'BATTLE ROYALE', desc: 'Fast matches, squads and ranked play.' },
  { name: 'CS2', cls: 'cs', type: 'FPS', desc: 'Classic tactical competitive action.' },
  { name: 'BGMI', cls: 'bg', type: 'BATTLE ROYALE', desc: 'Squads, custom rooms and tournaments.' },
  { name: 'Apex', cls: 'apex', type: 'BATTLE ROYALE', desc: 'Legends, squads and high-speed combat.' },
];

function getUser() {
  return JSON.parse(localStorage.getItem('vansideUser') || 'null');
}
function injectNavbar() {
  // build navbar HTML once and insert/replace into pages
  const u = getUser();
  const adminLink = u && u.isAdmin ? `<a class="nav-link" data-page="admin" href="admin.html">Admin</a>` : '';
  const html = `
  <header class="navbar">
    <div class="container nav-inner">
      <a class="brand" href="index.html">VANSIDE <span>ARENA</span></a>
      <button class="menu-btn" aria-label="Menu">☰</button>
      <nav class="nav-links">
        <a class="nav-link" data-page="home" href="index.html">Home</a>
        <a class="nav-link" data-page="games" href="games.html">Games</a>
        <a class="nav-link" data-page="leaderboard" href="leaderboard.html">Leaderboard</a>
        <a class="nav-link" data-page="matchmaking" href="matchmaking.html">Play</a>
        <a class="nav-link" data-page="more" href="help.html">More</a>
        ${adminLink}
      </nav>
      <div class="nav-actions">
        <a class="coin-pill" href="coins.html"><svg class="coin" aria-hidden="true"><use href="#icon-coin"></use></svg> <span data-coins>0</span></a>
        <a class="btn btn-outline" href="profile.html">Profile</a>
      </div>
    </div>
  </header>`;

  const existing = document.querySelector('header.navbar, #site-navbar');
  if (existing) {
    const wrapper = document.createElement('div'); wrapper.innerHTML = html;
    existing.replaceWith(wrapper.firstElementChild);
  } else {
    document.body.insertAdjacentHTML('afterbegin', html);
  }
}
function setUser(user) { localStorage.setItem('vansideUser', JSON.stringify(user)); document.dispatchEvent(new CustomEvent('vanside:userchange')); }
function coins() {
  const u = getUser(); return u?.coins ?? 0;
}
function updateCoins() {
  document.querySelectorAll('[data-coins]').forEach(e => e.textContent = coins());
}
function toast(msg) {
  let t = document.querySelector('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t) }
  t.textContent = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2200);
}
function initNav() {
  const btn = document.querySelector('.menu-btn'), links = document.querySelector('.nav-links');
  if (btn) btn.addEventListener('click', () => links.classList.toggle('open'));
  const page = document.body.dataset.page;
  document.querySelectorAll('.nav-link').forEach(a => {
    if (a.dataset.page === page) a.classList.add('active');
  });
  updateCoins();
}
function createSlidebar() {
  if (document.querySelector('.slidebar-wrap')) return;
  const wrap = document.createElement('div'); wrap.className = 'slidebar-wrap';
  const bar = document.createElement('aside'); bar.className = 'slidebar';

  function buildContent() {
    const u = getUser();
    const userSection = u ? `
      <div style="display:flex;align-items:center;gap:12px;justify-content:space-between">
        <div><strong style="font-size:1rem">${u.name}</strong><div class="muted">◈ ${u.coins ?? 0}</div></div>
        <button class="btn btn-outline signout">Sign out</button>
      </div>` : `
      <a class="btn btn-primary" href="login.html">Sign in / Sign up</a>`;

    return `<button class="close" aria-label="Close">✕</button>
      <div class="eyebrow">More</div>
      <h3>Quick Links</h3>
      <p class="muted">Navigate quickly to key areas of Vanside Arena.</p>
      <div style="margin:10px 0">${userSection}</div>
      <nav class="menu">
        <a href="index.html">Home</a>
        <a href="games.html">Games</a>
        <a href="leaderboard.html">Leaderboard</a>
        <a href="matchmaking.html">Play</a>
        <a href="host_matches.html">Host Matches</a>
        <a href="coins.html">Coins</a>
        <a href="profile.html">Profile</a>
        <a href="help.html">Help</a>
        <a href="middleman.html">Middleman</a>
        ${u && u.isAdmin ? '<a href="admin.html">Admin Dashboard</a>' : ''}
      </nav>
      <div class="footer-note">Tip: Sign in to claim your rewards and save progress.</div>`;
  }

  bar.innerHTML = buildContent();
  wrap.appendChild(bar); document.body.appendChild(wrap);

  function bind() {
    const close = bar.querySelector('.close'); close?.addEventListener('click', () => wrap.classList.remove('open'));
    wrap.addEventListener('click', e => { if (e.target === wrap) wrap.classList.remove('open') });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') wrap.classList.remove('open') });
    const signout = bar.querySelector('.signout');
    if (signout) { signout.addEventListener('click', () => { localStorage.removeItem('vansideUser'); document.dispatchEvent(new CustomEvent('vanside:userchange')); toast('Signed out'); updateCoins(); }); }
  }

  bind();

  document.addEventListener('vanside:userchange', () => {
    bar.innerHTML = buildContent();
    bind();
  });

  // Intercept More nav links and open the slidebar.
  document.querySelectorAll('.nav-link[data-page="more"]').forEach(a => {
    a.addEventListener('click', e => { e.preventDefault(); wrap.classList.add('open') });
  });
}

// Ensure slidebar exists and open it. Use from delegated handlers.
function openSlidebar() {
  if (!document.querySelector('.slidebar-wrap')) createSlidebar();
  const wrap = document.querySelector('.slidebar-wrap');
  if (wrap) wrap.classList.add('open');
}
function renderGames(targetId = 'gameGrid', filter = '') {
  const el = document.getElementById(targetId); if (!el) return;
  const pageMap = {
    'Valorant': 'valorant.html',
    'Free Fire': 'freefire.html',
    'CS2': 'cs2.html',
    'BGMI': 'bgmi.html',
    'Apex': 'apex.html'
  };

  const normalizedFilter = (filter || '').toString().trim().toLowerCase();
  const items = games.filter(g => {
    if (!normalizedFilter || normalizedFilter === 'all') return true;
    // match common terms (allow 'battle royale' vs 'BATTLE ROYALE')
    return g.type.toLowerCase().includes(normalizedFilter) || g.name.toLowerCase().includes(normalizedFilter);
  });

  el.innerHTML = items.map(g => {
    const href = pageMap[g.name];
    return `
    <article class="portrait-card">
      <a class="portrait-link" href="${href}">
        <div class="portrait-art ${g.cls}" aria-label="${g.name} game art"></div>
        <div class="portrait-body">
          <div class="eyebrow">${g.type}</div>
          <div class="game-name">${g.name}</div>
          <div class="muted small">${g.desc}</div>
        </div>
      </a>
    </article>`;
  }).join('');
}
function auth() {
  const form = document.getElementById('authForm'); if (!form) return;
  const loginBtn = document.getElementById('loginMode'), signupBtn = document.getElementById('signupMode');
  const title = document.getElementById('authTitle'), action = document.getElementById('authAction');
  let mode = 'login';
  function setMode(m) {
    mode = m; loginBtn.classList.toggle('active', m === 'login'); signupBtn.classList.toggle('active', m === 'signup');
    title.textContent = m === 'login' ? 'Welcome back' : 'Create your account';
    action.textContent = m === 'login' ? 'Login' : 'Sign up';
    document.getElementById('nameGroup').style.display = m === 'signup' ? 'block' : 'none';
  }
  loginBtn?.addEventListener('click', () => setMode('login'));
  signupBtn?.addEventListener('click', () => setMode('signup'));
  form.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const nameField = document.getElementById('name');
    const name = nameField ? nameField.value.trim() || email.split('@')[0] : email.split('@')[0];
    if (mode === 'login' && email === 'admin@local' && password === 'admin') {
      setUser({ name: 'Admin', email, coins: 0, rank: 'Admin', wins: 0, matches: 0, isAdmin: true });
      toast('Admin logged in successfully');
      setTimeout(() => location.href = 'admin.html', 500);
      return;
    }
    // if a user already exists in localStorage and matches this email, keep it (don't overwrite coins)
    const existing = getUser();
    if (existing && existing.email === email) {
      setUser(existing);
    } else {
      // give a 1000 coins starter grant for new accounts
      setUser({ name, email, coins: 1000, rank: 'Silver II', wins: 12, matches: 38 });
    }
    toast(mode === 'login' ? 'Logged in successfully' : 'Account created — welcome to Vanside');
    setTimeout(() => location.href = 'index.html', 500);
  });
}
function buyCoins(amount, price) {
  const u = getUser();
  if (!u) {
    toast('Please sign in to buy coins');
    setTimeout(() => { location.href = 'login.html'; }, 400);
    return;
  }
  u.coins = (u.coins || 0) + amount; setUser(u); updateCoins(); toast(`${amount} coins added for ₹${price} (demo)`);
}
function initCoinButtons() {
  document.querySelectorAll('[data-buy]').forEach(b => b.addEventListener('click', () => buyCoins(+b.dataset.buy, +b.dataset.price)));
}
function profile() {
  const u = getUser() || { name: 'Guest Player', email: 'Sign in to save your profile', coins: 0, rank: 'Silver II', wins: 12, matches: 38 };
  document.querySelectorAll('[data-name]').forEach(e => e.textContent = u.name);
  document.querySelectorAll('[data-email]').forEach(e => e.textContent = u.email);
  document.querySelectorAll('[data-rank]').forEach(e => e.textContent = u.rank);
  document.querySelectorAll('[data-wins]').forEach(e => e.textContent = u.wins);
  document.querySelectorAll('[data-matches]').forEach(e => e.textContent = u.matches);
}

// Initialize a game page: clans, leagues, leaderboard and tournaments
function initGamePage(gameKey) {
  const clansEl = document.getElementById('clans');
  const leaguesEl = document.getElementById('leagues');
  const lbEl = document.getElementById('leaderboard');
  const tListEl = document.getElementById('tournamentList');
  const tDetailEl = document.getElementById('tournamentDetail');
  if (!tListEl && !clansEl && !leaguesEl) return;

  // sample data
  const sampleClans = ['Iron Wolves', 'Phantom Squad', 'Nova Elite'].map((n, i) => ({ name: n, members: 10 + i * 3, tag: `#${100 + i}` }));
  const sampleLeagues = ['Open Cup', 'Pro Ladder', 'Amateur Series'];
  const sampleLeaderboard = Array.from({ length: 6 }).map((_, i) => ({ name: `Player${i + 1}`, score: 1200 - i * 30 }));
  const sampleTournaments = [
    { id: gameKey + '-t1', name: `${gameKey.toUpperCase()} Weekly Cup`, fee: 0, slots: 64, date: '2026-09-02', desc: 'Open weekly cup — free to enter.' },
    { id: gameKey + '-t2', name: `${gameKey.toUpperCase()} Ranked Clash`, fee: 50, slots: 32, date: '2026-09-10', desc: 'Ranked format with entry fee.' },
    { id: gameKey + '-t3', name: `${gameKey.toUpperCase()} Invitational`, fee: 100, slots: 16, date: '2026-10-05', desc: 'Invite only showcase (sample).' }
  ];

  // Load persisted clans per game (fallback to sample)
  const allClans = JSON.parse(localStorage.getItem('vanside-clans') || '{}');
  const clansData = allClans[gameKey] || sampleClans;

  // render tournaments first (top)
  if (tListEl) {
    tListEl.innerHTML = sampleTournaments.map(t => `
      <div class="list-row" data-tid="${t.id}" data-fee="${t.fee}">
        <div style="width:42px"><div class="avatar">T</div></div>
        <div><strong>${t.name}</strong><div class="muted small">${t.date} • ${t.slots} slots • ${t.fee ? `Fee ${t.fee} coins` : 'Free'}</div></div>
        <div><button class="btn btn-primary small" data-open="${t.id}">Open</button></div>
      </div>
    `).join('');

    // handle open click (delegated)
    tListEl.addEventListener('click', e => {
      const btn = e.target.closest('button[data-open]');
      if (!btn) return;
      const tid = btn.dataset.open;
      const t = sampleTournaments.find(x => x.id === tid);
      if (t) showTournamentDetails(t, tDetailEl);
    });
  }

  // render leagues (middle)
  if (leaguesEl) leaguesEl.innerHTML = sampleLeagues.map(l => `<div class="list-row"><div style="width:42px"></div><div><strong>${l}</strong><div class="muted small">Seasonal league</div></div></div>`).join('');

  // render clans (bottom)
  if (clansEl) {
    clansEl.innerHTML = (clansData || []).map(c => `
      <div class="list-row" data-tag="${c.tag}">
        <div class="avatar">${(c.name || '?')[0]}</div>
        <div><strong>${c.name}</strong><div class="muted">${c.members} members • ${c.tag}</div></div>
        <div><button class="btn btn-outline small view-clan" data-tag="${c.tag}">View</button> <button class="btn btn-primary small join-clan-btn" data-tag="${c.tag}">Join</button></div>
      </div>
    `).join('');
  }

  // render leaderboard
  if (lbEl) lbEl.innerHTML = `<ol>${sampleLeaderboard.map(p => `<li style="margin:8px 0"><strong>${p.name}</strong> <span class="muted">${p.score}</span></li>`).join('')}</ol>`;

  // bind create/join page-level buttons
  document.querySelectorAll('.create-clan').forEach(btn => {
    btn.onclick = () => {
      if (!getUser()) { location.href = 'login.html'; return; }
      const name = prompt('Enter clan name');
      if (!name) return;
      let tag = prompt('Enter clan tag (e.g. #123) (leave blank for auto)');
      if (!tag) tag = `#${Math.floor(100 + Math.random() * 900)}`;
      const obj = JSON.parse(localStorage.getItem('vanside-clans') || '{}');
      obj[gameKey] = obj[gameKey] || [];
      obj[gameKey].push({ name, members: 1, tag });
      localStorage.setItem('vanside-clans', JSON.stringify(obj));
      toast('Clan created');
      initGamePage(gameKey);
    };
  });

  document.querySelectorAll('.join-clan').forEach(btn => {
    btn.onclick = () => {
      if (!getUser()) { location.href = 'login.html'; return; }
      const tag = prompt('Enter clan tag to join (e.g. #100)');
      if (!tag) return;
      const obj = JSON.parse(localStorage.getItem('vanside-clans') || '{}');
      const list = obj[gameKey] || [];
      const clan = list.find(c => c.tag === tag);
      if (!clan) { toast('Clan not found'); return; }
      clan.members = (clan.members || 0) + 1;
      obj[gameKey] = list; localStorage.setItem('vanside-clans', JSON.stringify(obj));
      toast('Joined clan ' + clan.name);
      initGamePage(gameKey);
    };
  });

  // per-clan join/view handlers
  document.querySelectorAll('.join-clan-btn').forEach(b => b.onclick = (e) => {
    if (!getUser()) { location.href = 'login.html'; return; }
    const tag = e.currentTarget.dataset.tag;
    const obj = JSON.parse(localStorage.getItem('vanside-clans') || '{}');
    const list = obj[gameKey] || [];
    const clan = list.find(c => c.tag === tag);
    if (clan) { clan.members = (clan.members || 0) + 1; obj[gameKey] = list; localStorage.setItem('vanside-clans', JSON.stringify(obj)); toast('Joined ' + clan.name); initGamePage(gameKey); }
  });

  document.querySelectorAll('.view-clan').forEach(b => b.onclick = (e) => {
    const tag = e.currentTarget.dataset.tag;
    const obj = JSON.parse(localStorage.getItem('vanside-clans') || '{}');
    const list = obj[gameKey] || [];
    const clan = list.find(c => c.tag === tag);
    if (clan) alert(`${clan.name}\nMembers: ${clan.members}\nTag: ${clan.tag}`);
  });
}

function showTournamentDetails(t, container) {
  if (!container) return;
  container.style.display = 'block';
  container.innerHTML = `
    <h3>${t.name}</h3>
    <p class="muted">${t.date} • ${t.slots} slots</p>
    <p>${t.desc}</p>
    <div style="margin-top:12px">${t.fee ? `<button class="btn btn-primary" data-join="${t.id}" data-fee="${t.fee}">Join tournament ${t.fee} coins</button>` : `<button class="btn btn-primary" data-join="${t.id}" data-fee="0">Join tournament (Free)</button>`} <button class="btn btn-outline" data-close>Close</button></div>
  `;

  container.querySelector('[data-close]')?.addEventListener('click', () => { container.style.display = 'none'; });
  container.querySelector('[data-join]')?.addEventListener('click', e => {
    const fee = +e.target.dataset.fee; const id = e.target.dataset.join;
    if (!getUser()) return location.href = 'login.html';
    if (fee > 0) {
      showConfirm(`Join ${t.name} for ${fee} coins?`, () => joinTournament(id, fee));
    } else {
      joinTournament(id, 0);
    }
  });
}

function showConfirm(message, onConfirm) {
  let modal = document.getElementById('vanside-confirm');
  if (!modal) {
    modal = document.createElement('div'); modal.id = 'vanside-confirm'; modal.className = 'modal';
    modal.innerHTML = `<div class="modal-card"><p id="vanside-confirm-text"></p><div style="display:flex;gap:10px;margin-top:14px"><button class="btn btn-primary" id="vanside-confirm-ok">Confirm</button><button class="btn btn-outline" id="vanside-confirm-cancel">Cancel</button></div></div>`;
    document.body.appendChild(modal);
  }
  document.getElementById('vanside-confirm-text').textContent = message;
  modal.style.display = 'block';
  document.getElementById('vanside-confirm-cancel').onclick = () => { modal.style.display = 'none'; };
  document.getElementById('vanside-confirm-ok').onclick = () => { modal.style.display = 'none'; onConfirm?.(); };
}

function joinTournament(id, fee) {
  const u = getUser();
  if (!u) { location.href = 'login.html'; return; }
  if ((u.coins || 0) < fee) { toast('Insufficient coins to join'); return; }
  u.coins = (u.coins || 0) - fee; setUser(u); updateCoins(); toast('Joined tournament successfully');
}

function updateAuthBoxVisibility() {
  const u = getUser();
  document.querySelectorAll('.auth-box').forEach(el => {
    el.style.display = u ? 'none' : '';
  });
}
document.addEventListener('DOMContentLoaded', () => {
  // inject SVG sprite for coin icon so it scales with font-size (uses currentColor)
  if (!document.getElementById('vanside-sprite')) {
    const s = document.createElement('div');
    s.id = 'vanside-sprite';
    s.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';
    s.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <symbol id="icon-coin" viewBox="0 0 120 120">
          <path fill="currentColor" d="M60 6 L76 48 L118 60 L76 72 L60 114 L44 72 L2 60 L44 48 Z"/>
        </symbol>
      </svg>`;
    document.body.appendChild(s);
  }

  injectNavbar(); initNav(); createSlidebar(); renderGames(); auth(); initCoinButtons(); profile();
  updateAuthBoxVisibility();
  document.addEventListener('vanside:userchange', updateAuthBoxVisibility);
  const g = document.body.dataset.game;
  if (g) initGamePage(g);
  initBanner();
  // filter buttons on games page
  document.querySelectorAll('.filter').forEach(b => {
    b.addEventListener('click', (e) => {
      document.querySelectorAll('.filter').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      const txt = (b.textContent || '').trim();
      renderGames('gameGrid', txt);
      // optional demo toast
      if (b.dataset.demo) toast(b.dataset.demo);
    });
  });
  // delegated handler: open slidebar when any nav anchor or link referencing More is clicked
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    const text = (a.textContent || '').trim().toLowerCase();
    if (a.dataset && a.dataset.page === 'more') { e.preventDefault(); openSlidebar(); }
    else if (text === 'more') { e.preventDefault(); openSlidebar(); }
    else if (href.includes('login.html')) { e.preventDefault(); /* ensure navigation works even if another handler interferes */ location.href = href; }
  });
  document.querySelectorAll('[data-demo]').forEach(b => b.addEventListener('click', () => toast(b.dataset.demo)));
});

// Banner carousel: render slides from `games` and enable navigation + autoplay
function initBanner() {
  const banner = document.getElementById('gameBanner'); if (!banner) return;
  const pageMap = {
    'Valorant': 'valorant.html',
    'Free Fire': 'freefire.html',
    'CS2': 'cs2.html',
    'BGMI': 'bgmi.html',
    'Apex': 'apex.html'
  };

  const track = document.createElement('div'); track.className = 'carousel-track';
  banner.appendChild(track);

  games.forEach(g => {
    const slide = document.createElement('article'); slide.className = 'carousel-slide';
    const art = document.createElement('div'); art.className = 'slide-art';
    // use a subtle gradient + text overlay as a sample image
    art.classList.add(g.cls);
    const body = document.createElement('div'); body.className = 'slide-body';
    body.innerHTML = `<div class="eyebrow">${g.type}</div><h3>${g.name}</h3><p class="muted">${g.desc}</p><div class="slide-cta"><a class="btn btn-primary" href="${pageMap[g.name] || '#'}">Open</a></div>`;
    slide.appendChild(art); slide.appendChild(body);
    track.appendChild(slide);
  });

  let index = 0; const slides = track.children;
  function show(i) {
    index = (i + slides.length) % slides.length;
    const offset = -index * slides[0].getBoundingClientRect().width;
    track.style.transform = `translateX(${offset}px)`;
  }

  const prevBtn = document.querySelector('.banner-carousel .carousel-btn.prev');
  const nextBtn = document.querySelector('.banner-carousel .carousel-btn.next');
  prevBtn?.addEventListener('click', () => { show(index - 1); resetAuto(); });
  nextBtn?.addEventListener('click', () => { show(index + 1); resetAuto(); });

  // autoplay
  let timer = setInterval(() => show(index + 1), 4500);
  function resetAuto() { clearInterval(timer); timer = setInterval(() => show(index + 1), 4500); }

  // initial layout after images load
  window.addEventListener('resize', () => show(index));
  setTimeout(() => show(0), 50);
}
