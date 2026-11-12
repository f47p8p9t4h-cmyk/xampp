'use strict';

const book = document.querySelector('#book');
const status = document.querySelector('#status');
const mobile = matchMedia('(max-width: 740px)');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const byId = id => document.getElementById(id);
const escapeHtml = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const link = (page, label) => '<a href="#' + (page + 1) + '">' + label + '</a>';
const pages = [
  {style:'cover-page', html:'<div class="cover"><div class="cover-top">Электрондық оқу құралы <span>2026</span></div><div><h1><span>WEB</span><br>бағдарламалау</h1><p class="subtitle">HTML, CSS, JavaScript және PHP</p></div><div class="art" aria-hidden="true"><div class="art-bar"><i></i><i></i><i></i><span>index.html</span></div><pre><code>&lt;main&gt;\n  &lt;h1&gt;Сәлем, веб!&lt;/h1&gt;\n&lt;/main&gt;</code></pre></div><div class="author">Тоқтағұл Алина</div></div>'},
  {style:'title-page', html:'<p class="institution">С. Сейфуллин атындағы Қазақ агротехникалық зерттеу университеті</p><div><h2>WEB БАҒДАРЛАМАЛАУ</h2><p>Электрондық оқу құралы</p><p class="credit">Дайындаған: Тоқтағұл Алина Нұрболатқызы<br>Тобы: 24-02<br>Қабылдаған: Найзағараева Ақгүл Аманжолқызы</p></div><p>Астана · 2026</p>'},
  {html:''},
  {html:''}
];

const chapters = window.webChapters;
chapters.forEach(([title, theory, explanation, code, task, expected, questions], i) => {
  const n = i + 1;
  pages.push({html:'<div class="kicker">Дәріс · '+n+'</div><h2>'+title+'</h2><p>'+theory+'</p><p>'+explanation+'</p><h3>Код мысалы</h3><pre><code>'+escapeHtml(code)+'</code></pre>'});
  pages.push({html:'<div class="kicker">Практика · '+n+'</div><h2>'+title+'</h2><h3>Тапсырма</h3><p>'+task+'</p><h3>Күтілетін нәтиже</h3><p>'+expected+'</p><h3>Бақылау сұрақтары</h3><ol>'+questions.map(q=>'<li>'+q+'</li>').join('')+'</ol>'});
});
pages.push({html:'<div class="kicker">Қорытынды жоба</div><h2>Сұлулық салонының сайты</h2><p>Қызметтерді таныстыратын және жазылу формасы бар сайт жасаңыз.</p><ol><li>Басты бет, қызметтер тізімі және жазылу формасын HTML арқылы құрыңыз.</li><li>CSS Grid көмегімен карточкаларды орналастырыңыз. Телефонда бір баған көрсетіңіз.</li><li>JavaScript арқылы таңдалған қызметті және уақытты қорытынды мәтінде шығарыңыз.</li><li>Толтырылмаған форма, дұрыс деректер және шағын экран арқылы тексеріңіз.</li></ol><p>Нәтижені көрсету үшін бастапқы код пен браузер скриншотын дайындаңыз.</p>'});
pages.push({html:'<div class="kicker">Қосымша оқу</div><h2>Пайдаланылған материалдар</h2><ul><li>«WEB бағдарламалау» зертханалық жұмыстар жинағы, С. Сейфуллин атындағы ҚазАТЗУ, 2026.</li><li><a href="https://developer.mozilla.org/en-US/docs/Learn_web_development" target="_blank" rel="noopener">MDN Learn Web Development</a></li><li><a href="https://html.spec.whatwg.org/" target="_blank" rel="noopener">HTML Living Standard</a></li></ul>'});
const toc = chapters.map(([title],i)=>[title,4+i*2]);
toc.push(['Қорытынды жоба',pages.length-2],['Оқу материалдары',pages.length-1]);
for (const [index, group] of [toc.slice(0,Math.ceil(toc.length/2)),toc.slice(Math.ceil(toc.length/2))].entries()) {
  const rows = group.map(([title,page]) => {
    const chapter = page < pages.length - 2;
    return '<li><div class="toc-label">'+link(page,title)+'</div><div class="toc-pages">'
      +(chapter ? '<a href="#'+(page+1)+'" aria-label="'+title+' — дәріс, '+(page+1)+'-бет">Дәріс '+(page+1)+'</a>'
      +'<a href="#'+(page+2)+'" aria-label="'+title+' — практика, '+(page+2)+'-бет">Практика '+(page+2)+'</a>' : link(page,String(page+1)))+'</div></li>';
  }).join('');
  const other = index === 0 ? link(3,'Мазмұнының жалғасы →') : link(2,'← Мазмұнының басы');
  pages[2+index].html = '<div class="kicker">WEB бағдарламалау</div><h2>Мазмұны</h2><ol class="toc">'+rows+'</ol><div class="toc-other">'+other+'</div>';
}

let current = 0;
let selected = 0;
let zoom = 1;
let audio;
let sound = false;
const step = () => mobile.matches ? 1 : 2;
const spread = n => mobile.matches ? n : n - n % 2;
const bounded = n => Math.max(0, Math.min(pages.length - 1, n));

function drawPage(index, side) {
  const data = pages[index];
  const page = document.createElement('article');
  page.className = ['page',side,data?.style].filter(Boolean).join(' ');
  if (!data) { page.setAttribute('aria-hidden','true'); return page; }
  page.tabIndex = -1;
  if (index === selected) page.dataset.selected = '';
  page.innerHTML = data.html + '<footer class="folio">'+link(2,'Мазмұны')+'<span>'+(index+1)+'</span></footer>';
  return page;
}

function playTurn() {
  if (!sound || !audio || audio.state !== 'running') return;
  const duration = .18;
  const data = audio.createBuffer(1, Math.round(audio.sampleRate * duration), audio.sampleRate);
  const wave = data.getChannelData(0);
  for (let i=0; i<wave.length; i++) wave[i] = (Math.random()*2-1)*Math.sin(Math.PI*i/wave.length)*.07;
  const noise = audio.createBufferSource();
  noise.buffer = data;
  const filter = audio.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 1400;
  noise.connect(filter).connect(audio.destination);
  noise.start();
}

function render(target, animate = false) {
  selected = bounded(target);
  const next = spread(bounded(target));
  const direction = next > current ? 'forward' : 'backward';
  const oldPages = book.querySelectorAll(':scope > .page');
  const old = oldPages[direction === 'forward' && !mobile.matches ? 1 : 0];
  const flap = animate && next !== current && old && !reduced.matches ? old.cloneNode(true) : null;
  current = next;
  book.replaceChildren(drawPage(current, 'left'));
  if (!mobile.matches) book.append(drawPage(current+1,'right'));
  if (flap) {
    const overlay = document.createElement('div');
    overlay.className = 'flip '+direction;
    overlay.inert = true;
    overlay.setAttribute('aria-hidden','true');
    overlay.append(flap);
    overlay.addEventListener('animationend', e => { if(e.target === overlay) overlay.remove(); });
    book.append(overlay);
    playTurn();
  }
  const end = Math.min(current + step(), pages.length);
  status.textContent = 'Бет ' + (selected + 1) + ' / ' + pages.length;
  byId('first').disabled = byId('prev').disabled = current === 0;
  byId('next').disabled = byId('last').disabled = end === pages.length;
}

function go(target) {
  const index = bounded(target);
  if (index !== selected) {
    location.hash = String(index+1);
  }
}
function fromHash() {
  const number = Number(location.hash.slice(1));
  return Number.isInteger(number) && number > 0 ? bounded(number-1) : 0;
}

book.addEventListener('click', event => {
  if (event.target.closest('a, button, pre, code') || String(getSelection()).trim()) return;
  if (event.target.closest('.page')) go(current+step());
});
window.addEventListener('hashchange', () => {
  render(fromHash(),true);
  window.scrollTo(0,0);
  book.querySelector('[data-selected]')?.focus({preventScroll:true});
});
mobile.addEventListener('change', () => render(fromHash()));
byId('first').onclick = () => go(0);
byId('last').onclick = () => go(pages.length-1);
byId('prev').onclick = () => go(current-step());
byId('next').onclick = () => go(current+step());
document.addEventListener('keydown', e => {
  if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
  if (e.key === 'ArrowLeft') { e.preventDefault(); go(current-step()); }
  if (e.key === 'ArrowRight') { e.preventDefault(); go(current+step()); }
});
function resizeText(delta) {
  zoom = Math.max(.85,Math.min(1.6,zoom+delta));
  document.documentElement.style.setProperty('--body-size',zoom);
}
byId('larger').onclick = () => resizeText(.15);
byId('smaller').onclick = () => resizeText(-.15);
byId('sound').onclick = async () => {
  sound = !sound;
  if (sound) {
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) { sound = false; return; }
    try { audio ||= new Context(); await audio.resume(); } catch { sound = false; }
  }
  byId('sound').setAttribute('aria-pressed',String(sound));
};
if (!document.fullscreenEnabled) byId('full').hidden = true;
byId('full').onclick = async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch { status.textContent += ' · Толық экран қолжетімсіз'; }
};
render(fromHash());
