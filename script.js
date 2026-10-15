const drop = document.getElementById('drop');
const music = document.getElementById('music');
const muteBtn = document.getElementById('mute');
const wipe = document.getElementById('wipe');
const wipeTxt = document.getElementById('wipetxt');

// ---- Damla ve müzik ----
drop.onclick = () => {
  drop.classList.add('fall');
  music.volume = 0;
  music.play();
  const fade = setInterval(() => {
    music.volume = Math.min(music.volume + 0.05, 0.5);
    if (music.volume >= 0.5) clearInterval(fade);
  }, 200);
};
drop.addEventListener('animationend', e => {
  if (e.animationName === 'fall') document.getElementById('cover').classList.add('revealed');
});
muteBtn.onclick = () => {
  music.muted = !music.muted;
  muteBtn.textContent = music.muted ? '🔇' : '🔊';
};

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ---- Kan geçişi (istersen üstüne yazı da koyar) ----
for (let i = 0; i < 20; i++) {
  const d = document.createElement('div');
  d.style.left = i * 5 + '%';
  d.style.setProperty('--d', Math.random() * 0.5 + 's');
  wipe.appendChild(d);
}

let busy = false;
function goTo(sceneId, label) {
  if (busy) return;
  busy = true;
  wipe.classList.add('in');
  setTimeout(async () => {
    document.querySelectorAll('.scene').forEach(s => s.classList.remove('on'));
    document.getElementById(sceneId).classList.add('on');
    if (label) {
      wipeTxt.textContent = label;
      wipeTxt.classList.add('show');
      await sleep(2800);
      wipeTxt.classList.remove('show');
      await sleep(700);
    }
    wipe.classList.remove('in');
    wipe.classList.add('out');
    setTimeout(() => { wipe.classList.remove('out'); busy = false; }, 1400);
  }, 1300);
}

// ---- MUTFAK: CÜMLELER ----
const LINES = {
  intro: 'Dün biriyle tanıştım adı besteymiş bir buluşma ayarlayıp onunla saatlerce Ankaranın ulaşımından konuştuk bu içimdeki karanlık dürtüden çok uzaktı....Ben bilmediğim başka bir şey hissediyordum. Mutluydum sanırım.',
  cake: 'Her neyse kahvaltımı edip departmana geçmeliyim .Kek ve kahve..... en sevdiğim kavhaltı ama sanırım ben bugün farklı bir şey yiyeceğim',
  menemen: 'Evet.... yumurtasız menemen o söylemişti bunu'
};

const dexter = document.getElementById('dexter');
const stage = document.getElementById('stage');
const voice = document.getElementById('vtxt');
let dexterX = 25, walkTimer, typeId = 0, busyK = false;
const done = new Set();

function walkTo(x) {
  return new Promise(res => {
    x = Math.max(-10, Math.min(92, x));
    const sec = Math.abs(x - dexterX) / 30;
    dexter.querySelector('.flip').style.transform = x < dexterX ? 'scaleX(-1)' : 'scaleX(1)';
    dexter.classList.add('walk');
    dexter.style.transitionDuration = sec + 's';
    dexter.style.left = x + '%';
    dexterX = x;
    clearTimeout(walkTimer);
    walkTimer = setTimeout(() => { dexter.classList.remove('walk'); res(); }, sec * 1000);
  });
}

async function say(text) {
  const id = ++typeId;
  voice.textContent = '';
  for (const ch of text) {
    if (id !== typeId) return;
    voice.textContent += ch;
    await sleep(35);
  }
}

function burst(list) {
  const r = dexter.getBoundingClientRect(), s = stage.getBoundingClientRect();
  list.forEach((e, i) => {
    const f = document.createElement('span');
    f.className = 'fx';
    f.textContent = e;
    f.style.left = (r.left + r.width / 2 - s.left) + 'px';
    f.style.top = (r.top - s.top + r.height * 0.15) + 'px';
    f.style.setProperty('--dx', (Math.random() * 80 - 40) + 'px');
    f.style.animationDelay = i * 0.15 + 's';
    document.getElementById('kitchen').appendChild(f);
    setTimeout(() => f.remove(), 2200);
  });
}

document.querySelectorAll('#kitchen .item').forEach(it => it.onclick = async () => {
  if (busyK) return;
  busyK = true;
  document.getElementById('khint').style.opacity = 0;
  const key = it.dataset.k;
  const r = it.getBoundingClientRect(), s = stage.getBoundingClientRect();
  await walkTo((r.left + r.width / 2 - s.left) / s.width * 100 - 7);
  dexter.querySelector('.flip').style.transform = 'scaleX(1)';
  dexter.classList.add('act');
  burst(key === 'cake' ? ['☕', '🍰', '✨'] : ['🍅', '🌶️', '🔥']);
  document.querySelectorAll('.item[data-k="' + key + '"]').forEach(x => x.classList.add('done'));
  setTimeout(() => dexter.classList.remove('act'), 2200);
  await say(LINES[key]);
  done.add(key);
  if (done.size === 2) document.getElementById('knext').style.display = 'block';
  busyK = false;
});

document.getElementById('floor').onclick = e => {
  if (busyK) return;
  const r = stage.getBoundingClientRect();
  walkTo((e.clientX - r.left) / r.width * 100);
};

document.getElementById('enter').onclick = () => {
  goTo('kitchen');
  setTimeout(() => say(LINES.intro), 2400);
};

// ---- DEPARTMAN + ŞÜPHELİ DOSYASI: CÜMLELER ----
const D_LINES = [
  { who: 'DEB', t: "Dexter! Geç kaldın. Masanda yeni bir dosya var." },
  { who: 'DEXTER', t: "Geliyorum. Aklım hâlâ Ankara'nın ulaşımında..." }
];
const S_INTRO = "Masamda yeni bir dosya. Kapağını açalım.";
const S_OPEN = "Şüpheli hakkındaki bilgiler karartılmış. Tek tek açalım.";
const S_FIELDS = [
  { l: 'Ad', v: 'Beste Kaya', t: "Beste Kaya. Dün tanıştığım kız. Adını bu dosyada görmek... İşe koyulmadan önce iyice araştırmalıyım belki de sadece öldürmek istemiyorum , iyi de neden?" },
  { l: 'Suç', v: 'kasten adam öldürme', t: "Kurban: Murat Acar, üç kadını dolandırıp kaçan biri. Kızılay metrosunda, son vagonda bulundu. Kamera bozuk, tanık yok. Tek ipucu: kızıl bir saç teli." },
  { l: 'Saç', v: 'kızıl', t: "Kızıl saç. Tarif tam uyuyor." },
  { l: 'Boy', v: '1.63', t: "Bir altmış üç. Kısa olmasına rağmen nasıl o adamın kafasını kesebildi." }
];
const S_STAMP = "Belki de sadece benim gibidir baba";
const H_LINE = "Dexter, duygularından uzak dur!";

async function typeTo(el, text) {
  const id = ++typeId;
  el.textContent = '';
  for (const ch of text) {
    if (id !== typeId) return;
    el.textContent += ch;
    await sleep(35);
  }
}

// --- Departman ---
let dIdx = 0, dBusy = false, bReady = false;

document.getElementById('knext').onclick = () => {
  goTo('department');
  setTimeout(startDept, 1300);
};

async function startDept() {
  document.getElementById('department').appendChild(dexter);
  dexter.classList.remove('act', 'walk', 'slipin');
  dexter.style.height = '36%';
  dexter.style.transitionDuration = '0s';
  dexter.style.left = '-8%';
  dexterX = -8;
  dexter.querySelector('.flip').style.transform = 'scaleX(1)';
  await sleep(1200);
  await walkTo(16);
  showD(0);
}

async function showD(i) {
  dBusy = true;
  document.getElementById('dlg').style.display = 'flex';
  document.getElementById('dwho').textContent = D_LINES[i].who;
  document.getElementById('dmore').style.visibility = 'hidden';
  await typeTo(document.getElementById('dtxt'), D_LINES[i].t);
  dBusy = false;
  if (i < D_LINES.length - 1) {
    document.getElementById('dmore').style.visibility = 'visible';
  } else {
    bReady = true;
    document.getElementById('bld').classList.add('ready');
    document.getElementById('dhint').style.opacity = 1;
  }
}

document.getElementById('dlg').onclick = () => {
  if (dBusy || dIdx >= D_LINES.length - 1) return;
  showD(++dIdx);
};

document.getElementById('bld').onclick = async () => {
  if (!bReady) return;
  bReady = false;
  const bld = document.getElementById('bld');
  bld.classList.remove('ready');
  document.getElementById('dhint').style.opacity = 0;
  document.getElementById('dlg').style.display = 'none';
  await walkTo(56);
  bld.classList.add('open');
  dexter.classList.add('slipin');
  await sleep(900);
  goTo('suspect');
  setTimeout(() => typeTo(stxt, S_INTRO), 2300);
};

// --- Şüpheli dosyası ---
const stxt = document.getElementById('stxt');
const sheet = document.getElementById('sheet');
let sRev = 0;

document.getElementById('folder').onclick = () => {
  document.getElementById('folder').classList.add('gone');
  sheet.classList.add('open');
  typeTo(stxt, S_OPEN);
};

S_FIELDS.forEach(f => {
  const li = document.createElement('li');
  li.textContent = '▮▮▮▮ gizli (tıkla)';
  li.onclick = () => {
    if (li.classList.contains('r')) return;
    li.classList.add('r');
    li.innerHTML = f.l + ': <b>' + f.v + '</b>';
    typeTo(stxt, f.t);
    if (++sRev === S_FIELDS.length) {
      setTimeout(() => document.getElementById('stampbtn').style.display = 'block', 6000);
    }
  };
  document.getElementById('fields').appendChild(li);
});

document.getElementById('stampbtn').onclick = async () => {
  document.getElementById('stampbtn').style.display = 'none';
  document.getElementById('stamp').classList.add('on');
  await sleep(350);
  sheet.classList.add('shake');
  await typeTo(stxt, S_STAMP);
  await sleep(1800);
  document.getElementById('shade').classList.add('on');
  await sleep(900);
  document.getElementById('harry').classList.add('on');
  await sleep(1400);
  document.getElementById('svoice').dataset.who = 'HARRY';
  await typeTo(stxt, H_LINE);
  await sleep(1500);
  document.getElementById('snext').style.display = 'block';
};

document.getElementById('snext').onclick = () => {
  goTo('hideout', '11 ay sonra...');
  setTimeout(startHide, 1400);
};

// ---- SAKLANMA YERİ (11 ay sonra): CÜMLELER ----
const H_INTRO = [
  { who: 'DEXTER', t: "On bir ay geçti. Metro cinayetinin dosyası hâlâ açık. Ama artık iki kişiyiz." }
];
const H_ITEMS = {
  tv: [
    { who: 'DEXTER', t: "Haberler yine bizi konuşuyor. Murat Acar cinayetinin şüphelisi ve ona yardım eden adli tıp uzmanı aranıyor. O uzman benim." }
  ],
  posters: [
    { who: 'DEXTER', t: "İki afiş, yan yana. Hiç bu kadar çok ortak fotoğrafımız (ORTAK VE GÜZEL FOTOĞRAFLAR) olmamıştı ." }
  ],
  bag: [
    { who: 'DEXTER', t: "Çanta hep hazır. Harry bana kaçmayı öğretmemişti ama hazırlıklı olmayı öğretmişti." }
  ],
  beste: [
    { who: 'BESTE', t: "Hâlâ bana, öldürmeyi unutmuş biri gibi bakıyorsun." },
    { who: 'DEXTER', t: "Dosyayı açtığımda seni bulmam gerekiyordu. Ama sen de bendin: aynı karanlık, aynı sessiz taraf." },
    { who: 'BESTE', t: "Eveeeettt canımm , bugün de kızılaydan bi etek almışım olaaaayyy" },
    { who: 'BESTE', t: "Bi de adaxtan 200 e uzun kollu tişört çözmüşümm çok mutluyuum" },
    { who: 'DEXTER', t: "Seni öldürmeliydim." }
  ]
};
const H_HARRY = [
  { who: 'HARRY', t: "Onu öldürmeliydin, evlat. Kod bunu söylüyordu." },
  { who: 'DEXTER', t: "Kod beni hayatta tuttu baba. Beni rahat bırak artık." },
  { who: 'HARRY', t: "Bunun bedelini ikiniz de ödeyeceksiniz." },
  { who: 'DEXTER', t: "YETER!" }
];

const hv = document.getElementById('hvoice');
const hwho = document.getElementById('hwho');
const htxt = document.getElementById('htxt');
const hmore = document.getElementById('hmore');
const hDone = new Set();
let hBusy = true;

async function hdlg(lines) {
  for (let i = 0; i < lines.length; i++) {
    hwho.textContent = lines[i].who;
    await typeTo(htxt, lines[i].t);
    if (i < lines.length - 1) {
      hmore.style.visibility = 'visible';
      await new Promise(r => {
        hv.onclick = () => { hv.onclick = null; hmore.style.visibility = 'hidden'; r(); };
      });
    }
  }
}

async function startHide() {
  const hs = document.getElementById('hideout');
  hs.appendChild(dexter);
  dexter.classList.remove('act', 'walk', 'slipin');
  dexter.style.height = '64%';
  dexter.style.transitionDuration = '0s';
  dexter.style.left = '27%';
  dexterX = 27;
  dexter.querySelector('.flip').style.transform = 'scaleX(1)';
  const sh = document.getElementById('shade'), hr = document.getElementById('harry');
  sh.classList.remove('on');
  hr.classList.remove('on');
  hs.insertBefore(sh, hs.firstChild);
  hs.appendChild(hr);
  await sleep(4000);
  await hdlg(H_INTRO);
  hBusy = false;
  document.getElementById('hhint').style.opacity = 1;
}

async function hAct(key, x) {
  if (hBusy) return;
  hBusy = true;
  document.getElementById('hhint').style.opacity = 0;
  await walkTo(x);
  document.querySelectorAll('[data-h="' + key + '"]').forEach(e => e.classList.add('done'));
  await hdlg(H_ITEMS[key]);
  hDone.add(key);
  if (hDone.size === 4) return hHarry();
  hBusy = false;
}

document.querySelectorAll('#hideout .item').forEach(it => it.onclick = () => {
  const r = it.getBoundingClientRect(), s = stage.getBoundingClientRect();
  hAct(it.dataset.h, (r.left + r.width / 2 - s.left) / s.width * 100 - 7);
});
document.getElementById('beste').onclick = () => hAct('beste', 44);

async function hHarry() {
  await sleep(1200);
  document.getElementById('shade').classList.add('on');
  await sleep(900);
  document.getElementById('harry').classList.add('on');
  await sleep(1400);
  await hdlg(H_HARRY);
  document.getElementById('hnext').style.display = 'block';
}

document.getElementById('hnext').onclick = () => {
  goTo('kill', 'Herhangi bir akşam...');
  setTimeout(startKill, 1400);
};

// ---- KILL ROOM (herhangi bir akşam): CÜMLELER ----
const K_INTRO = [{ who: 'DEXTER', t: "Tonights , the night ." }];
const K_TALK = [
  { who: 'DEXTER', t: "Sen mi öldüreceksin?" },
  { who: 'BESTE', t: "Evet. Ben öldüreceğim." },
  { who: 'DEXTER', t: "Peki. Seni izliyorum." }
];
const K_AFTER = [{ who: 'DEXTER', t: "Hadi bu anımızı da kill box'a koyalım." }];

const bes = document.getElementById('beste');
const kv = document.getElementById('kvoice');
const kwho = document.getElementById('kwho');
const ktxt = document.getElementById('ktxt');
const kmore = document.getElementById('kmore');
let kTalked = false, kBusy = false;

async function kdlg(lines) {
  for (let i = 0; i < lines.length; i++) {
    kwho.textContent = lines[i].who;
    await typeTo(ktxt, lines[i].t);
    if (i < lines.length - 1) {
      kmore.style.visibility = 'visible';
      await new Promise(r => {
        kv.onclick = () => { kv.onclick = null; kmore.style.visibility = 'hidden'; r(); };
      });
    }
  }
}

function walkFig(el, x) {
  return new Promise(res => {
    const cur = parseFloat(el.style.left);
    const sec = Math.abs(x - cur) / 30;
    el.querySelector('.flip').style.transform = x < cur ? 'scaleX(-1)' : 'scaleX(1)';
    el.classList.add('walk');
    el.style.transitionDuration = sec + 's';
    el.style.left = x + '%';
    setTimeout(() => { el.classList.remove('walk'); res(); }, sec * 1000);
  });
}

async function startKill() {
  const ks = document.getElementById('kill');
  ks.appendChild(dexter);
  ks.appendChild(bes);
  bes.style.pointerEvents = 'none';
  dexter.classList.remove('act', 'walk', 'slipin');
  dexter.style.height = '56%';
  dexter.style.bottom = '20%';
  dexter.style.transitionDuration = '0s';
  dexter.style.left = '12%';
  dexterX = 12;
  dexter.querySelector('.flip').style.transform = 'scaleX(1)';
  bes.classList.remove('act', 'walk');
  bes.style.height = '56%';
  bes.style.bottom = '20%';
  bes.style.transitionDuration = '0s';
  bes.style.left = '88%';
  bes.querySelector('.flip').style.transform = 'scaleX(-1)';
  await sleep(3600);
  await kdlg(K_INTRO);
  document.getElementById('kbtns').style.display = 'flex';
}

document.getElementById('ktalk').onclick = async () => {
  if (kBusy || kTalked) return;
  kBusy = true;
  document.getElementById('ktalk').disabled = true;
  await kdlg(K_TALK);
  kTalked = true;
  document.getElementById('kkill').disabled = false;
  kBusy = false;
};

document.getElementById('kkill').onclick = async () => {
  if (kBusy || !kTalked) return;
  kBusy = true;
  document.getElementById('kkill').disabled = true;
  document.getElementById('kbtns').style.display = 'none';
  kv.style.opacity = 0;
  await walkFig(bes, 33);
  bes.querySelector('.flip').style.transform = 'scaleX(1)';
  const kn = document.getElementById('knife');
  bes.classList.add('raise');
  kn.classList.add('up');
  await sleep(1200);
  kn.classList.remove('up');
  kn.classList.add('stab');
  bes.classList.add('drop');
  const f = document.getElementById('kflash');
  f.classList.add('go');
  document.getElementById('kblood').classList.add('on');
  document.getElementById('ktable').classList.add('shake');
  await sleep(3000);
  kv.style.opacity = 1;
  await kdlg(K_AFTER);
  document.getElementById('kcol').style.display = 'block';
};

document.getElementById('kcol').onclick = async () => {
  document.getElementById('kcol').style.display = 'none';
  document.getElementById('kslide').classList.add('go');
  await sleep(2100);
  goTo('box');
};
// ---- SLAYT KUTUSU ----
const B_INTRO = "Kill box. Buraya sadece en değerli örnekleri koyarım.";
const B_LAST = "On iki örneğin hepsine baktım. Ama kutunun dibinde bir slayt daha var...";

// Fotoğraflar küçükten büyüğe sıralı: ilk=1, iki=2, uc=3, dort=4, bes=5, yedi=7, dokuz=9, on=10, onbir=11, oniki=12, ondort=14, ondokuz=19
const FOTO_KLASOR = 'images/';
const SLIDES = [
  { file: 'ilk.jpeg',     date: '27.10.2012', note: 'Sevgilimm , buraya kadar biraz daha hikayesel olmasını istedim bundan sonraki anılarının hepsi benle. Seni çok seviyorum iyi ki doğdun.' },
  { file: 'iki.jpeg',     date: '18.07.2013', note: 'Zanlının Besteyi öldürmediği gece onu öldürmek yerine kızılayda geceye kadar eğlendiler.' },
  { file: 'uc.jpeg',      date: '18.07.2013', note: 'Dexter mutlu beste üzgün. Beste sadece adam öldürmeyi biliyor. Bilardo oynayamıyor. Sivil halktan biri tarafından görüntülendi.' },
  { file: 'dort.jpeg',    date: '22.04.2015', note: 'Zanlı ilk kez uyum sağlarken görüldü son görülme yeri eğitim fakültesi sallanan bank.' },
  { file: 'bes.jpeg',     date: '02.11.2015', note: 'Zanlı sevgi gördü , zanlı mutlu.' },
  { file: 'yedi.jpeg',    date: '19.08.2016', note: 'Zanlı bestenin hayallerinden birini gerçekleştirdi , beste mutlu , zanlı yorgun.' },
  { file: 'dokuz.jpeg',   date: '09.10.2016', note: 'Zanlı besteyi kısa saçla gördü , tanıyamadı , az kalsın dokundu diye onu öldürecekti.' },
  { file: 'on.jpeg',      date: '09.10.2016', note: 'Zanlı aç . Mısır yerken avm içerisinde görüldü.' },
  { file: 'onbir.jpeg',   date: '14.05.2017', note: 'Beraber kütüphanede görüntülendiler , laf söyleyen şişko kadın o günden sonra bir daha görülmedi.' },
  { file: 'oniki.jpeg',   date: '26.10.2018', note: 'Üniversiteye sızdıkları ortaya çıktı . Tarih: 26.10.2018' },
  { file: 'ondort.jpeg',  date: '06.06.2018', note: 'Ankara müzelerini gezmeye başladılar ve beste az daha ölüyordu (YORGUNLUKTAN ALT TARAFI 2 YOKUŞ ÇIKTIN AŞKIM) Tarih: 06.06.2018' },
  { file: 'ondokuz.jpeg', date: '20.20.2020', note: 'Zanlı yumuşak olmaya başlamış kanıtlar sonradan yok edilmiş.Bugün beraber öldürdükleri bilinen son adam kıyıya vurmuş şekilde bulundu.' }
];

const sl = document.getElementById('slides');
const lens = document.getElementById('lens');
const lensin = document.getElementById('lensin');
const pic = document.getElementById('pic');
const cnote = document.getElementById('cnote');
const btxt = document.getElementById('btxt');
let seenCount = 0;

SLIDES.forEach((s, i) => {
  const d = document.createElement('div');
  d.className = 'slide';
  d.innerHTML = '<i class="dr"></i><span class="lb">#' + String(i + 1).padStart(2, '0') + '<small>DXT-' + String(i + 1).padStart(4, '0') + '</small></span>';
  d.onclick = () => openSlide(s, i, d);
  sl.appendChild(d);
});

document.getElementById('lid').onclick = () => {
  document.getElementById('lid').classList.add('open');
  typeTo(btxt, B_INTRO);
};

function openSlide(s, i, d) {
  document.getElementById('cno').textContent = '#' + String(i + 1).padStart(2, '0');
  document.getElementById('csn').textContent = 'DXT-' + String(i + 1).padStart(4, '0');
  document.getElementById('cdate').textContent = s.date;
  cnote.textContent = '';
  lens.classList.remove('zoomed');
  lensin.style.transition = 'none';
  lensin.classList.remove('focus');
  void lensin.offsetWidth;
  lensin.style.transition = '';
  pic.style.display = 'block';
  lensin.dataset.t = '';
  pic.onerror = () => { pic.style.display = 'none'; lensin.dataset.t = 'FOTO: ' + s.file; };
  pic.src = FOTO_KLASOR + s.file;
  document.getElementById('scope').classList.add('on');
  setTimeout(() => lensin.classList.add('focus'), 300);
  setTimeout(() => typeTo(cnote, s.note), 2200);
  document.getElementById('bback').onclick = () => {
    typeId++;
    document.getElementById('scope').classList.remove('on');
    if (!d.classList.contains('seen') && !d.classList.contains('last')) {
      d.classList.add('seen');
      if (++seenCount === SLIDES.length) lastSlide();
    }
  };
}

lens.onclick = e => {
  const r = lens.getBoundingClientRect();
  pic.style.setProperty('--ox', ((e.clientX - r.left) / r.width * 100) + '%');
  pic.style.setProperty('--oy', ((e.clientY - r.top) / r.height * 100) + '%');
  lens.classList.toggle('zoomed');
};

function lastSlide() {
  const d = document.createElement('div');
  d.className = 'slide last';
  d.innerHTML = '<i class="dr"></i><span class="lb">SON<small>ÖRNEK</small></span>';
  d.onclick = () => { goTo('love'); setTimeout(startLove, 2400); };
  sl.appendChild(d);
  typeTo(btxt, B_LAST);
}
// ---- SON YAZI ----
const LOVE_TEXT = "Aşkım , iyi ki doğdun iyi ki de varsın . Zihnimdeki iyikiler seninle dolu. Seni çok seviyorum ilişkimiz seni öldürmediğim gün başlamış olmasa da bir şekilde başladı beraber birilerini öldürmesekte beraber kalmaya devam ettik devam da edelim. Sana aşığım bitanem..  gününü kutlamak için böyle bir hediye düşündüm umarım beğenirsin , nice yaşlanmalara.";

async function startLove() {
  const el = document.getElementById('lovetxt');
  el.textContent = '';
  await sleep(1500);
  for (const ch of LOVE_TEXT) {
    el.textContent += ch;
    await sleep('.!?'.includes(ch) ? 650 : ',' === ch ? 350 : 60);
  }
}