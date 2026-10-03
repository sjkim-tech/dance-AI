// 실습 페이지 공통 GNB — <body> 바로 아래에서 <script src="gnb.js"></script>로 불러옵니다.
// 새 주차 페이지가 생기면 WORKSHOPS 배열에 한 줄 추가하세요. (index.html의 드롭다운도 함께 수정)
(function () {
    const WORKSHOPS = [
        { href: 'index.html#workshop', label: 'Week 1 · 오리엔테이션' },
        { href: 'Dance_AI_image_learning_week4_0922.html', label: 'Week 4 · 이미지 학습' },
        { href: 'Dance_AI_pose_eye_week5.html', label: 'Week 5 · 컴퓨터의 눈 — 관절' },
        { href: 'Dance_AI_pose_learning_week5.html', label: 'Week 5 · 동작 학습' },
    ];
    const LINKS = [
        { href: 'index.html#overview', label: 'Overview' },
        { href: 'index.html#objectives', label: 'Goals' },
        { href: 'index.html#identity', label: 'Identity' },
        { href: 'index.html#roadmap', label: 'Roadmap' },
    ];

    const current = location.pathname.split('/').pop();

    const style = document.createElement('style');
    style.textContent = `
.gnb{position:sticky;top:0;z-index:50;background:rgba(251,250,247,.92);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border-bottom:1px solid #DDD8CF;font-family:'Gowun Dodum','Malgun Gothic',sans-serif;color:#1B2A41}
.gnb-in{max-width:1180px;margin:0 auto;padding:12px 22px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
.gnb-logo{font-weight:700;font-size:17px;letter-spacing:.08em;color:#1B2A41;text-decoration:none}
.gnb-logo span{color:#E8674B}
.gnb-menu{display:flex;align-items:center;gap:18px;flex-wrap:wrap;font-size:14px}
.gnb-menu a,.gnb-btn{color:#4A5568;text-decoration:none;background:none;border:none;padding:0;font:inherit;cursor:pointer;transition:color .15s}
.gnb-menu a:hover,.gnb-btn:hover,.gnb-btn[aria-expanded="true"]{color:#E8674B}
.gnb-dd{position:relative}
.gnb-btn{display:flex;align-items:center;gap:4px}
.gnb-btn svg{width:12px;height:12px;transition:transform .15s}
.gnb-btn[aria-expanded="true"] svg{transform:rotate(180deg)}
.gnb-list{position:absolute;right:0;top:calc(100% + 10px);min-width:230px;background:#fff;border:1px solid #DDD8CF;border-radius:8px;box-shadow:0 8px 24px rgba(27,42,65,.12);padding:6px 0}
.gnb-list a{display:block;padding:8px 16px;color:#1B2A41}
.gnb-list a:hover{background:#F1EEE7}
.gnb-list a.on{color:#E8674B;font-weight:700}
.gnb-survey{color:#E8674B!important;font-weight:700}
@media(max-width:640px){.gnb-in{justify-content:center}.gnb-menu{justify-content:center;gap:14px}.gnb-list{right:auto;left:50%;transform:translateX(-50%)}}
`;
    document.head.appendChild(style);

    const nav = document.createElement('nav');
    nav.className = 'gnb';
    nav.innerHTML = `
<div class="gnb-in">
  <a class="gnb-logo" href="index.html">DANCE <span>&amp;</span> AI</a>
  <div class="gnb-menu">
    ${LINKS.map(l => `<a href="${l.href}">${l.label}</a>`).join('')}
    <div class="gnb-dd">
      <button type="button" class="gnb-btn" aria-haspopup="true" aria-expanded="false">Workshop
        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
      </button>
      <div class="gnb-list" hidden>
        ${WORKSHOPS.map(w => `<a href="${w.href}"${w.href === current ? ' class="on" aria-current="page"' : ''}>${w.label}</a>`).join('')}
      </div>
    </div>
    <a class="gnb-survey" href="index.html#survey">Survey</a>
  </div>
</div>`;

    const script = document.currentScript;
    script.parentNode.insertBefore(nav, script);

    const btn = nav.querySelector('.gnb-btn');
    const list = nav.querySelector('.gnb-list');
    function setOpen(open) {
        list.hidden = !open;
        btn.setAttribute('aria-expanded', open);
    }
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        setOpen(list.hidden);
    });
    document.addEventListener('click', () => setOpen(false));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
})();
