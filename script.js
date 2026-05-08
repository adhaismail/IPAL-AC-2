/* ================================================================
   BUMI — Building Maintenance Integrated
   script.js v1.0
   ================================================================ */

'use strict';

/* ──────────────────────────────────────────────────────────────
   CONFIG — Ganti dengan URL Web App Google Apps Script Anda
   ──────────────────────────────────────────────────────────────
   Setelah deploy Google Apps Script, paste URL-nya di sini:
   Contoh: "https://script.google.com/macros/s/XXXXXXX/exec"
   ────────────────────────────────────────────────────────────── */
const GAS_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';

/* ──────────────────────────────────────────────────────────────
   DUMMY USER DATABASE (hardcoded)
   ────────────────────────────────────────────────────────────── */
const USERS = [
  {
    nik: '1111',
    password: 'ipal123',
    nama: 'Saepul',
    role: 'Teknisi IPAL',
    formTarget: 'ipal',
    avatarLetter: 'S',
  },
  {
    nik: '2222',
    password: 'ac123',
    nama: 'Nasikin',
    role: 'Teknisi AC',
    formTarget: 'ac',
    avatarLetter: 'N',
  },
];

/* ──────────────────────────────────────────────────────────────
   STATE
   ────────────────────────────────────────────────────────────── */
let currentUser = null;
let clockInterval = null;

/* ──────────────────────────────────────────────────────────────
   DOM HELPERS
   ────────────────────────────────────────────────────────────── */
const $ = (id) => document.getElementById(id);
const qs = (sel, ctx = document) => ctx.querySelector(sel);

/* ──────────────────────────────────────────────────────────────
   THEME TOGGLE
   ────────────────────────────────────────────────────────────── */
const html = document.documentElement;

function initTheme() {
  const saved = localStorage.getItem('bumi-theme') || 'light';
  setTheme(saved);
}

function setTheme(theme) {
  html.setAttribute('data-theme', theme);
  localStorage.setItem('bumi-theme', theme);
  const sunIcon  = $('icon-sun');
  const moonIcon = $('icon-moon');
  if (sunIcon && moonIcon) {
    sunIcon.style.display  = theme === 'light' ? 'block' : 'none';
    moonIcon.style.display = theme === 'dark'  ? 'block' : 'none';
  }
}

$('theme-toggle')?.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  setTheme(current === 'dark' ? 'light' : 'dark');
});

/* ──────────────────────────────────────────────────────────────
   CLOCK
   ────────────────────────────────────────────────────────────── */
function startClock() {
  if (clockInterval) clearInterval(clockInterval);
  updateClock();
  clockInterval = setInterval(updateClock, 1000);
}

function updateClock() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  const el = $('topbar-time');
  if (el) el.textContent = `${hh}:${mm}:${ss}`;
}

function getNowTimestamp() {
  return new Date().toLocaleString('id-ID', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  }).replace(/\//g, '-');
}

function getTodayDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function getCurrentTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 11) return 'Selamat pagi,';
  if (h < 15) return 'Selamat siang,';
  if (h < 18) return 'Selamat sore,';
  return 'Selamat malam,';
}

/* ──────────────────────────────────────────────────────────────
   PAGE ROUTER
   ────────────────────────────────────────────────────────────── */
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  $(pageId)?.classList.add('active');
}

/* ──────────────────────────────────────────────────────────────
   LOGIN
   ────────────────────────────────────────────────────────────── */
const loginForm = $('login-form');
const loginBtn  = $('login-btn');
const nikInput  = $('nik');
const passInput = $('password');
const togglePassBtn = $('toggle-pass');

// Toggle password visibility
togglePassBtn?.addEventListener('click', () => {
  const isPass = passInput.type === 'password';
  passInput.type = isPass ? 'text' : 'password';
  $('eye-open').style.display  = isPass ? 'none'  : 'block';
  $('eye-closed').style.display = isPass ? 'block' : 'none';
});

// Clear error on input
nikInput?.addEventListener('input', () => {
  $('nik-error').textContent  = '';
  $('login-error').textContent = '';
  nikInput.classList.remove('has-error');
});
passInput?.addEventListener('input', () => {
  $('pass-error').textContent  = '';
  $('login-error').textContent = '';
  passInput.classList.remove('has-error');
});

loginForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const nik  = nikInput.value.trim();
  const pass = passInput.value;
  let valid  = true;

  // Validation
  if (!nik) {
    $('nik-error').textContent = 'NIK tidak boleh kosong.';
    nikInput.classList.add('has-error');
    valid = false;
  }
  if (!pass) {
    $('pass-error').textContent = 'Password tidak boleh kosong.';
    passInput.classList.add('has-error');
    valid = false;
  }
  if (!valid) return;

  // Loading state
  setButtonLoading(loginBtn, true);

  // Simulate network delay (replace with actual API later)
  await delay(800);

  const user = USERS.find(u => u.nik === nik && u.password === pass);

  if (!user) {
    setButtonLoading(loginBtn, false);
    $('login-error').textContent = 'NIK atau password salah. Silakan coba lagi.';
    nikInput.classList.add('has-error');
    passInput.classList.add('has-error');
    passInput.value = '';
    return;
  }

  // Login success
  currentUser = user;
  setButtonLoading(loginBtn, false);
  initDashboard(user);
  showPage('page-app');
});

/* ──────────────────────────────────────────────────────────────
   DASHBOARD INIT
   ────────────────────────────────────────────────────────────── */
function initDashboard(user) {
  // Set user info everywhere
  $('sidebar-avatar').textContent   = user.avatarLetter;
  $('sidebar-name').textContent     = user.nama;
  $('sidebar-role').textContent     = user.role;
  $('topbar-avatar').textContent    = user.avatarLetter;
  $('topbar-name').textContent      = user.nama;
  $('welcome-name').textContent     = `${user.nama} 👋`;
  $('welcome-greeting').textContent = getGreeting();
  $('welcome-desc').innerHTML       = `Anda login sebagai <strong>${user.role}</strong>. Silakan isi formulir di bawah ini.`;

  // Role-based nav + form
  const navIpal = $('nav-ipal');
  const navAc   = $('nav-ac');

  if (user.formTarget === 'ipal') {
    navIpal.classList.add('active');
    navAc.classList.add('disabled');
    showFormSection('ipal');
    updateTopbarTitle('Monitoring IPAL', 'Form Input Data Real-Time');
    $('welcome-badge').innerHTML = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`;
  } else {
    navAc.classList.add('active');
    navIpal.classList.add('disabled');
    showFormSection('ac');
    updateTopbarTitle('Maintenance AC', 'Form Laporan Kerusakan & Perbaikan');
    $('welcome-badge').innerHTML = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="7" width="20" height="10" rx="3"/><path d="M6 21V7M18 21V7M12 21V7"/></svg>`;
  }

  // Set auto timestamps
  setAutoTimestamps();
  startClock();

  // Populate AC dropdown
  populateACDropdown();
}

function populateACDropdown() {
  const sel = $('ac-unit');
  if (!sel) return;
  for (let i = 1; i <= 126; i++) {
    const opt = document.createElement('option');
    opt.value = `AC ${i}`;
    opt.textContent = `AC ${i}`;
    sel.appendChild(opt);
  }
}

function setAutoTimestamps() {
  const ts = getNowTimestamp();
  const ipalTs = $('ipal-timestamp');
  const acTs   = $('ac-timestamp');
  const ipalD  = $('ipal-tanggal');
  const ipalW  = $('ipal-waktu');
  const acD    = $('ac-tanggal');
  const acW    = $('ac-waktu');

  if (ipalTs) ipalTs.value = ts;
  if (acTs)   acTs.value   = ts;
  if (ipalD && !ipalD.value) ipalD.value = getTodayDate();
  if (ipalW && !ipalW.value) ipalW.value = getCurrentTime();
  if (acD   && !acD.value)   acD.value   = getTodayDate();
  if (acW   && !acW.value)   acW.value   = getCurrentTime();
}

function updateTopbarTitle(title, sub) {
  $('topbar-title').textContent = title;
  $('topbar-sub').textContent   = sub;
}

function showFormSection(target) {
  document.querySelectorAll('.form-section').forEach(s => s.classList.remove('active-section'));
  $(`section-${target}`)?.classList.add('active-section');
}

/* ──────────────────────────────────────────────────────────────
   NAV ITEM CLICKS (disabled for non-role, allowed for own role)
   ────────────────────────────────────────────────────────────── */
$('nav-ipal')?.addEventListener('click', (e) => {
  e.preventDefault();
  if (!currentUser || currentUser.formTarget !== 'ipal') return;
  showFormSection('ipal');
  updateTopbarTitle('Monitoring IPAL', 'Form Input Data Real-Time');
  closeSidebar();
});

$('nav-ac')?.addEventListener('click', (e) => {
  e.preventDefault();
  if (!currentUser || currentUser.formTarget !== 'ac') return;
  showFormSection('ac');
  updateTopbarTitle('Maintenance AC', 'Form Laporan Kerusakan & Perbaikan');
  closeSidebar();
});

/* ──────────────────────────────────────────────────────────────
   SIDEBAR TOGGLE (mobile)
   ────────────────────────────────────────────────────────────── */
$('menu-toggle')?.addEventListener('click', openSidebar);
$('sidebar-close')?.addEventListener('click', closeSidebar);
$('sidebar-overlay')?.addEventListener('click', closeSidebar);

function openSidebar() {
  $('sidebar').classList.add('open');
  $('sidebar-overlay').classList.add('visible');
  document.body.style.overflow = 'hidden';
}

function closeSidebar() {
  $('sidebar').classList.remove('open');
  $('sidebar-overlay').classList.remove('visible');
  document.body.style.overflow = '';
}

/* ──────────────────────────────────────────────────────────────
   LOGOUT
   ────────────────────────────────────────────────────────────── */
$('logout-btn')?.addEventListener('click', () => {
  if (!confirm('Apakah Anda yakin ingin keluar?')) return;
  currentUser = null;
  clearInterval(clockInterval);
  // Reset nav
  $('nav-ipal').classList.remove('active', 'disabled');
  $('nav-ac').classList.remove('active', 'disabled');
  // Clear login form
  loginForm?.reset();
  $('nik-error').textContent   = '';
  $('pass-error').textContent  = '';
  $('login-error').textContent = '';
  nikInput?.classList.remove('has-error');
  passInput?.classList.remove('has-error');
  showPage('page-login');
  closeSidebar();
});

/* ──────────────────────────────────────────────────────────────
   FILE UPLOAD HANDLERS
   ────────────────────────────────────────────────────────────── */
function setupUpload(inputId, previewContainerId, imgId, removeId, uploadAreaId, errorId) {
  const input   = $(inputId);
  const preview = $(previewContainerId);
  const img     = $(imgId);
  const remove  = $(removeId);
  const area    = $(uploadAreaId);
  const errEl   = errorId ? $(errorId) : null;
  const placeholder = area?.querySelector('.upload-placeholder');

  if (!input) return;

  input.addEventListener('change', () => {
    const file = input.files[0];
    if (!file) return;

    // Size check (5MB)
    if (file.size > 5 * 1024 * 1024) {
      if (errEl) errEl.textContent = 'Ukuran file maksimal 5MB.';
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target.result;
      preview.style.display  = 'flex';
      placeholder.style.display = 'none';
      if (errEl) errEl.textContent = '';
    };
    reader.readAsDataURL(file);
  });

  remove?.addEventListener('click', (e) => {
    e.preventDefault(); e.stopPropagation();
    input.value = '';
    img.src = '';
    preview.style.display  = 'none';
    placeholder.style.display = 'flex';
  });

  // Drag & drop
  area?.addEventListener('dragover', (e) => { e.preventDefault(); area.style.borderColor = 'var(--accent)'; });
  area?.addEventListener('dragleave', () => { area.style.borderColor = ''; });
  area?.addEventListener('drop', (e) => {
    e.preventDefault(); area.style.borderColor = '';
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      input.files = e.dataTransfer.files;
      input.dispatchEvent(new Event('change'));
    }
  });
}

// Initialize upload handlers
setupUpload('ipal-svi-foto',  'ipal-svi-preview',  'ipal-svi-img',  'ipal-svi-remove',  'ipal-svi-upload-area',  null);
setupUpload('ac-foto-rusak',  'ac-rusak-preview',  'ac-rusak-img',  'ac-rusak-remove',  'ac-rusak-upload-area',  'err-ac-foto-rusak');
setupUpload('ac-foto-fix',    'ac-fix-preview',    'ac-fix-img',    'ac-fix-remove',    'ac-fix-upload-area',    'err-ac-foto-fix');

/* ──────────────────────────────────────────────────────────────
   FORM VALIDATION HELPERS
   ────────────────────────────────────────────────────────────── */
function validateField(inputEl, errorId, msg) {
  const errEl = $(errorId);
  const val   = inputEl?.value?.trim();
  if (!val || val === '') {
    if (errEl) errEl.textContent = msg || 'Field ini wajib diisi.';
    inputEl?.classList.add('has-error');
    return false;
  }
  if (errEl) errEl.textContent = '';
  inputEl?.classList.remove('has-error');
  return true;
}

function validateSelect(selectEl, errorId, msg) {
  const errEl = $(errorId);
  if (!selectEl?.value) {
    if (errEl) errEl.textContent = msg || 'Silakan pilih salah satu opsi.';
    selectEl?.classList.add('has-error');
    return false;
  }
  if (errEl) errEl.textContent = '';
  selectEl?.classList.remove('has-error');
  return true;
}

function validateFile(inputEl, errorId, msg) {
  const errEl = $(errorId);
  if (!inputEl?.files?.length) {
    if (errEl) errEl.textContent = msg || 'Foto wajib diunggah.';
    return false;
  }
  if (errEl) errEl.textContent = '';
  return true;
}

function validateRadio(name, errorId, msg) {
  const errEl   = $(errorId);
  const checked = document.querySelector(`input[name="${name}"]:checked`);
  if (!checked) {
    if (errEl) errEl.textContent = msg || 'Silakan pilih salah satu.';
    return false;
  }
  if (errEl) errEl.textContent = '';
  return true;
}

// Real-time validation on blur
function attachBlurValidation(inputId, errorId, msg) {
  const el = $(inputId);
  el?.addEventListener('blur', () => validateField(el, errorId, msg));
  el?.addEventListener('input', () => { if (el.value.trim()) { $(errorId).textContent = ''; el.classList.remove('has-error'); } });
}

// IPAL fields
['ipal-tanggal', 'ipal-waktu', 'ipal-inlet-flow', 'ipal-inlet-debit',
 'ipal-outlet-flow', 'ipal-outlet-debit', 'ipal-ras-flow', 'ipal-ras-debit',
 'ipal-rec-flow', 'ipal-rec-debit', 'ipal-eq2-ph', 'ipal-eq2-suhu',
 'ipal-an-ph', 'ipal-an-suhu', 'ipal-ae1-ph', 'ipal-ae1-svi',
 'ipal-ae2-ph', 'ipal-ae2-svi', 'ipal-ae4-ph', 'ipal-ae4-svi',
 'ipal-out-ph', 'ipal-out-suhu', 'ipal-deskripsi'].forEach(id => {
  attachBlurValidation(id, `err-${id}`, 'Field ini wajib diisi.');
});

// AC fields
['ac-tanggal', 'ac-waktu', 'ac-deskripsi-rusak', 'ac-deskripsi-perbaikan'].forEach(id => {
  attachBlurValidation(id, `err-${id}`, 'Field ini wajib diisi.');
});
['ac-unit', 'ac-gangguan', 'ac-tindakan'].forEach(id => {
  const el = $(id);
  el?.addEventListener('blur', () => validateSelect(el, `err-${id}`, 'Silakan pilih salah satu.'));
  el?.addEventListener('change', () => { if (el.value) { $(`err-${id}`).textContent = ''; el.classList.remove('has-error'); } });
});

/* ──────────────────────────────────────────────────────────────
   FILE TO BASE64
   ────────────────────────────────────────────────────────────── */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    if (!file) { resolve(null); return; }
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ──────────────────────────────────────────────────────────────
   IPAL FORM SUBMIT
   ────────────────────────────────────────────────────────────── */
$('form-ipal')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  let ok = true;

  ok &= validateField($('ipal-tanggal'), 'err-ipal-tanggal', 'Tanggal wajib diisi.');
  ok &= validateField($('ipal-waktu'),   'err-ipal-waktu',   'Waktu wajib diisi.');
  ok &= validateField($('ipal-inlet-flow'),   'err-ipal-inlet-flow',   'Wajib diisi.');
  ok &= validateField($('ipal-inlet-debit'),  'err-ipal-inlet-debit',  'Wajib diisi.');
  ok &= validateField($('ipal-outlet-flow'),  'err-ipal-outlet-flow',  'Wajib diisi.');
  ok &= validateField($('ipal-outlet-debit'), 'err-ipal-outlet-debit', 'Wajib diisi.');
  ok &= validateField($('ipal-ras-flow'),   'err-ipal-ras-flow',   'Wajib diisi.');
  ok &= validateField($('ipal-ras-debit'),  'err-ipal-ras-debit',  'Wajib diisi.');
  ok &= validateField($('ipal-rec-flow'),   'err-ipal-rec-flow',   'Wajib diisi.');
  ok &= validateField($('ipal-rec-debit'),  'err-ipal-rec-debit',  'Wajib diisi.');
  ok &= validateField($('ipal-eq2-ph'),   'err-ipal-eq2-ph',   'Wajib diisi.');
  ok &= validateField($('ipal-eq2-suhu'), 'err-ipal-eq2-suhu', 'Wajib diisi.');
  ok &= validateField($('ipal-an-ph'),    'err-ipal-an-ph',    'Wajib diisi.');
  ok &= validateField($('ipal-an-suhu'),  'err-ipal-an-suhu',  'Wajib diisi.');
  ok &= validateField($('ipal-ae1-ph'),  'err-ipal-ae1-ph',  'Wajib diisi.');
  ok &= validateField($('ipal-ae1-svi'), 'err-ipal-ae1-svi', 'Wajib diisi.');
  ok &= validateField($('ipal-ae2-ph'),  'err-ipal-ae2-ph',  'Wajib diisi.');
  ok &= validateField($('ipal-ae2-svi'), 'err-ipal-ae2-svi', 'Wajib diisi.');
  ok &= validateField($('ipal-ae4-ph'),  'err-ipal-ae4-ph',  'Wajib diisi.');
  ok &= validateField($('ipal-ae4-svi'), 'err-ipal-ae4-svi', 'Wajib diisi.');
  ok &= validateField($('ipal-out-ph'),   'err-ipal-out-ph',   'Wajib diisi.');
  ok &= validateField($('ipal-out-suhu'), 'err-ipal-out-suhu', 'Wajib diisi.');
  ok &= validateField($('ipal-deskripsi'), 'err-ipal-deskripsi', 'Deskripsi wajib diisi.');

  if (!ok) {
    scrollToFirstError();
    return;
  }

  const submitBtn = $('ipal-submit-btn');
  setButtonLoading(submitBtn, true);

  // Build payload
  const sviFile   = $('ipal-svi-foto').files[0] || null;
  const sviBase64 = await fileToBase64(sviFile);

  const payload = {
    formType: 'IPAL',
    namaTeknisi:  currentUser.nama,
    nikTeknisi:   currentUser.nik,
    tanggal:      $('ipal-tanggal').value,
    waktu:        $('ipal-waktu').value,
    timestamp:    getNowTimestamp(),
    inletFlow:    $('ipal-inlet-flow').value,
    inletDebit:   $('ipal-inlet-debit').value,
    outletFlow:   $('ipal-outlet-flow').value,
    outletDebit:  $('ipal-outlet-debit').value,
    rasFlow:      $('ipal-ras-flow').value,
    rasDebit:     $('ipal-ras-debit').value,
    recFlow:      $('ipal-rec-flow').value,
    recDebit:     $('ipal-rec-debit').value,
    eq2Ph:        $('ipal-eq2-ph').value,
    eq2Suhu:      $('ipal-eq2-suhu').value,
    anPh:         $('ipal-an-ph').value,
    anSuhu:       $('ipal-an-suhu').value,
    ae1Ph:        $('ipal-ae1-ph').value,
    ae1Svi:       $('ipal-ae1-svi').value,
    ae2Ph:        $('ipal-ae2-ph').value,
    ae2Svi:       $('ipal-ae2-svi').value,
    ae4Ph:        $('ipal-ae4-ph').value,
    ae4Svi:       $('ipal-ae4-svi').value,
    outPh:        $('ipal-out-ph').value,
    outSuhu:      $('ipal-out-suhu').value,
    fotoSvi:      sviBase64 || '',
    namaFotoSvi:  sviFile ? sviFile.name : '',
    deskripsi:    $('ipal-deskripsi').value,
  };

  try {
    await submitToGAS(payload);
    setButtonLoading(submitBtn, false);
    showNotification('success', 'Data Berhasil Dikirim!', 'Data Monitoring IPAL telah tersimpan ke Google Spreadsheet.');
    $('form-ipal').reset();
    setAutoTimestamps();
    scrollToTop();
  } catch (err) {
    setButtonLoading(submitBtn, false);
    showNotification('error', 'Gagal Mengirim Data', err.message || 'Periksa koneksi internet atau konfigurasi Google Apps Script.');
  }
});

/* ──────────────────────────────────────────────────────────────
   AC FORM SUBMIT
   ────────────────────────────────────────────────────────────── */
$('form-ac')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  let ok = true;

  ok &= validateField($('ac-tanggal'), 'err-ac-tanggal', 'Tanggal wajib diisi.');
  ok &= validateField($('ac-waktu'),   'err-ac-waktu',   'Waktu wajib diisi.');
  ok &= validateSelect($('ac-unit'),     'err-ac-unit',     'Pilih unit AC.');
  ok &= validateSelect($('ac-gangguan'), 'err-ac-gangguan', 'Pilih jenis gangguan.');
  ok &= validateField($('ac-waktu-rusak'), 'err-ac-waktu-rusak', 'Waktu mulai kerusakan wajib diisi.');
  ok &= validateFile($('ac-foto-rusak'), 'err-ac-foto-rusak', 'Foto kerusakan wajib diunggah.');
  ok &= validateField($('ac-deskripsi-rusak'), 'err-ac-deskripsi-rusak', 'Deskripsi kerusakan wajib diisi.');
  ok &= validateSelect($('ac-tindakan'), 'err-ac-tindakan', 'Pilih tindakan perbaikan.');
  ok &= validateField($('ac-deskripsi-perbaikan'), 'err-ac-deskripsi-perbaikan', 'Deskripsi perbaikan wajib diisi.');
  ok &= validateFile($('ac-foto-fix'), 'err-ac-foto-fix', 'Foto setelah perbaikan wajib diunggah.');
  ok &= validateRadio('ac-kambuh', 'err-ac-kambuh', 'Pilih apakah gangguan kembali terjadi.');

  if (!ok) {
    scrollToFirstError();
    return;
  }

  const submitBtn = $('ac-submit-btn');
  setButtonLoading(submitBtn, true);

  // Build payload
  const fotoRusakFile = $('ac-foto-rusak').files[0];
  const fotoFixFile   = $('ac-foto-fix').files[0];
  const [fotoRusakB64, fotoFixB64] = await Promise.all([
    fileToBase64(fotoRusakFile),
    fileToBase64(fotoFixFile),
  ]);

  const kambuhVal = document.querySelector('input[name="ac-kambuh"]:checked')?.value || '';

  const payload = {
    formType: 'AC',
    namaTeknisi:      currentUser.nama,
    nikTeknisi:       currentUser.nik,
    tanggal:          $('ac-tanggal').value,
    waktu:            $('ac-waktu').value,
    timestamp:        getNowTimestamp(),
    unitAC:           $('ac-unit').value,
    jenisGangguan:    $('ac-gangguan').value,
    waktuMulaiRusak:  $('ac-waktu-rusak').value,
    fotoRusak:        fotoRusakB64 || '',
    namaFotoRusak:    fotoRusakFile ? fotoRusakFile.name : '',
    deskripsiRusak:   $('ac-deskripsi-rusak').value,
    tindakanPerbaikan:$('ac-tindakan').value,
    deskripsiPerbaikan: $('ac-deskripsi-perbaikan').value,
    fotoFix:          fotoFixB64 || '',
    namaFotoFix:      fotoFixFile ? fotoFixFile.name : '',
    gangguanKambuh:   kambuhVal,
  };

  try {
    await submitToGAS(payload);
    setButtonLoading(submitBtn, false);
    showNotification('success', 'Laporan Berhasil Dikirim!', 'Laporan Maintenance AC telah tersimpan ke Google Spreadsheet.');
    $('form-ac').reset();
    // Re-populate AC dropdown after reset
    populateACDropdown();
    setAutoTimestamps();
    // Reset upload previews
    ['ipal-svi', 'ac-rusak', 'ac-fix'].forEach(prefix => {
      const preview = $(`${prefix}-preview`);
      const placeholder = document.querySelector(`#${prefix}-upload-area .upload-placeholder`);
      if (preview) preview.style.display = 'none';
      if (placeholder) placeholder.style.display = 'flex';
    });
    scrollToTop();
  } catch (err) {
    setButtonLoading(submitBtn, false);
    showNotification('error', 'Gagal Mengirim Laporan', err.message || 'Periksa koneksi internet atau konfigurasi Google Apps Script.');
  }
});

/* ──────────────────────────────────────────────────────────────
   RESET BUTTONS
   ────────────────────────────────────────────────────────────── */
$('ipal-reset-btn')?.addEventListener('click', () => {
  if (!confirm('Reset semua data form IPAL?')) return;
  $('form-ipal').reset();
  setAutoTimestamps();
  clearAllErrors('form-ipal');
  // Reset upload
  const preview = $('ipal-svi-preview');
  const ph = document.querySelector('#ipal-svi-upload-area .upload-placeholder');
  if (preview) preview.style.display = 'none';
  if (ph) ph.style.display = 'flex';
});

$('ac-reset-btn')?.addEventListener('click', () => {
  if (!confirm('Reset semua data form Maintenance AC?')) return;
  $('form-ac').reset();
  // Repopulate select
  const sel = $('ac-unit');
  while (sel.options.length > 1) sel.remove(1);
  populateACDropdown();
  setAutoTimestamps();
  clearAllErrors('form-ac');
  // Reset uploads
  ['ac-rusak', 'ac-fix'].forEach(prefix => {
    const preview = $(`${prefix}-preview`);
    const ph = document.querySelector(`#${prefix}-upload-area .upload-placeholder`);
    if (preview) preview.style.display = 'none';
    if (ph) ph.style.display = 'flex';
  });
});

function clearAllErrors(formId) {
  const form = $(formId);
  form?.querySelectorAll('.field-error').forEach(e => e.textContent = '');
  form?.querySelectorAll('.has-error').forEach(e => e.classList.remove('has-error'));
}

/* ──────────────────────────────────────────────────────────────
   SUBMIT TO GOOGLE APPS SCRIPT
   ────────────────────────────────────────────────────────────── */
async function submitToGAS(payload) {
  // Jika GAS_URL belum dikonfigurasi, simulasi mode demo
  if (!GAS_URL || GAS_URL.includes('YOUR_DEPLOYMENT_ID')) {
    console.log('[DEMO MODE] Data yang akan dikirim:', payload);
    await delay(1500);
    // Simulasi sukses untuk demo
    return { status: 'ok' };
  }

  const response = await fetch(GAS_URL, {
    method: 'POST',
    mode: 'no-cors', // Google Apps Script membutuhkan no-cors
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  // no-cors tidak dapat membaca response body, anggap sukses
  return { status: 'ok' };
}

/* ──────────────────────────────────────────────────────────────
   NOTIFICATION
   ────────────────────────────────────────────────────────────── */
let notifTimeout = null;

function showNotification(type, title, desc) {
  const notif      = $('notification');
  const iconSuccess = $('notif-icon-success');
  const iconError   = $('notif-icon-error');
  const titleEl     = $('notif-title');
  const descEl      = $('notif-desc');

  titleEl.textContent = title;
  descEl.textContent  = desc;

  if (type === 'success') {
    notif.classList.remove('error');
    iconSuccess.style.display = 'block';
    iconError.style.display   = 'none';
  } else {
    notif.classList.add('error');
    iconSuccess.style.display = 'none';
    iconError.style.display   = 'block';
  }

  notif.classList.add('show');

  if (notifTimeout) clearTimeout(notifTimeout);
  notifTimeout = setTimeout(() => hideNotification(), 5000);
}

function hideNotification() {
  $('notification')?.classList.remove('show');
}

$('notif-close')?.addEventListener('click', hideNotification);

/* ──────────────────────────────────────────────────────────────
   UTILITY
   ────────────────────────────────────────────────────────────── */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function setButtonLoading(btn, loading) {
  if (!btn) return;
  const text   = btn.querySelector('.btn-text');
  const loader = btn.querySelector('.btn-loader');
  if (loading) {
    btn.disabled = true;
    if (text)   text.style.display   = 'none';
    if (loader) loader.style.display = 'inline-flex';
  } else {
    btn.disabled = false;
    if (text)   text.style.display   = 'inline';
    if (loader) loader.style.display = 'none';
  }
}

function scrollToFirstError() {
  const firstError = document.querySelector('.has-error, .field-error:not(:empty)');
  firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function scrollToTop() {
  $('main-content')?.scrollTo({ top: 0, behavior: 'smooth' });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ──────────────────────────────────────────────────────────────
   INIT
   ────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  showPage('page-login');
  console.log('%cBUMI v1.0 — Building Maintenance Integrated', 'color:#3B82F6;font-weight:700;font-size:14px;');
  console.log('%cDemo mode aktif. Ganti GAS_URL di script.js untuk koneksi ke Google Spreadsheet.', 'color:#64748B;font-size:11px;');
});
