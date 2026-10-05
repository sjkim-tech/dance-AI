// 얼굴로 글자 불기: 입을 벌리면 입에서 글자가 흘러나옵니다
// 用脸吹出文字:张开嘴,文字就从嘴里流出来
// 크게 벌릴수록 많이, 멀리 나갑니다 / 张得越大,出来得越多、越远

let TEXT = '숨을 내쉰다 呼气 ';   // 나올 글자, 내 문장으로 바꿔 보세요 / 出来的文字,换成自己的句子
let OPEN = 0.06;                 // 이만큼 벌려야 나옵니다, 작을수록 쉽게 (0.03~0.15) / 要张这么大才出来,越小越容易

let letters = [];
let n = 0;

function setup() {
  createCanvas(640, 480);
  textAlign(CENTER, CENTER);
}

function draw() {
  background(251, 250, 247);
  drawVideo(0.3);
  drawFace(120, 1.5);

  if (FACE) {
    // 입 벌림 = 윗입술(13)~아랫입술(14) 거리 ÷ 얼굴 길이(10~152)
    // 张嘴程度 = 上唇(13)到下唇(14)的距离 ÷ 脸的长度(10到152)
    let mouth = dist(FACE[13].x, FACE[13].y, FACE[14].x, FACE[14].y);
    let faceLen = dist(FACE[10].x, FACE[10].y, FACE[152].x, FACE[152].y);
    let open = mouth / faceLen;
    let mx = (FACE[13].x + FACE[14].x) / 2;
    let my = (FACE[13].y + FACE[14].y) / 2;

    if (open > OPEN && frameCount % 3 === 0) {
      let power = map(open, OPEN, OPEN * 3, 2, 8, true);
      let angle = random(-PI, 0);                  // 위쪽 반원으로 흩어짐 / 向上半圆散开
      letters.push({ ch: TEXT[n % TEXT.length], x: mx, y: my, vx: cos(angle) * power, vy: sin(angle) * power, life: 255, size: random(16, 30) });
      n++;
    }

    // 입 벌림 막대 / 张嘴程度条
    noStroke();
    fill(220);
    rect(12, 12, 120, 8);
    fill(open > OPEN ? '#E8674B' : '#8A94A6');
    rect(12, 12, constrain(open / (OPEN * 3), 0, 1) * 120, 8);
    stroke(27, 42, 65);
    line(12 + 40, 8, 12 + 40, 24);               // 기준선(OPEN) / 基准线
  }

  noStroke();
  for (let L of letters) {
    L.x += L.vx;
    L.y += L.vy;
    L.vx *= 0.99;
    L.vy *= 0.99;
    L.life -= 2;
    fill(232, 103, 75, L.life);
    textSize(L.size);
    text(L.ch, L.x, L.y);
  }
  letters = letters.filter(L => L.life > 0);
}

// 키를 누르기 전에 실행 화면을 한 번 클릭하세요 / 按键前先点击一下运行画面
function keyPressed() {
  if (keyCode === 83) saveCanvas('my-sketch', 'png');   // S 키: 화면 저장 / S 键:保存画面
  if (keyCode === 67) letters = [];                     // C 키: 지우기 / C 键:清除
}


// ══════════════════════════════════════════════════════════════
// ▼ 여기부터 아래는 고치지 않아도 됩니다 — 카메라 · 얼굴 찾기
// ▼ 从这里往下不需要修改 — 摄像头 · 寻找脸
// ══════════════════════════════════════════════════════════════
// FACE[i]          얼굴 점 468개 {x, y}, 얼굴이 없으면 null / 脸上 468 个点,没有脸时为 null
//                  1 코끝 · 10 이마 · 13 윗입술 · 14 아랫입술 · 33 · 263 눈꼬리 · 152 턱
//                  1 鼻尖 · 10 额头 · 13 上唇 · 14 下唇 · 33 · 263 眼角 · 152 下巴
// drawVideo(a)     카메라 영상, a = 투명도 0~1 / 摄像头画面,a = 透明度 0~1
// drawFace(c, w)   얼굴 점, c = 색, w = 크기 / 脸上的点,c = 颜色,w = 大小

var FACE = null;
var drawVideo, drawFace;

(function () {
  const MP = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/';

  const st = document.createElement('div');
  st.style.cssText = "position:fixed;left:8px;bottom:8px;z-index:9;font:12px sans-serif;color:#fff;background:rgba(0,0,0,.65);padding:3px 8px;border-radius:4px;display:none";
  if (document.body) document.body.appendChild(st);
  else document.addEventListener('DOMContentLoaded', () => document.body.appendChild(st));
  function status(t) { st.textContent = t; st.style.display = t ? 'block' : 'none'; }

  const video = document.createElement('video');
  video.playsInline = true;
  video.muted = true;

  function fit() {
    const vw = video.videoWidth || 640, vh = video.videoHeight || 480;
    const s = Math.max(width / vw, height / vh), dw = vw * s, dh = vh * s;
    return { ox: (width - dw) / 2, oy: (height - dh) / 2, dw, dh };
  }

  drawVideo = function (a = 1) {
    if (!video.videoWidth) return;
    const f = fit(), ctx = drawingContext;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(width, 0); ctx.scale(-1, 1);
    ctx.drawImage(video, f.ox, f.oy, f.dw, f.dh);
    ctx.restore();
  };

  drawFace = function (c = 255, w = 1.5) {
    if (!FACE) return;
    push();
    noStroke(); fill(c);
    FACE.forEach(p => circle(p.x, p.y, w * 2));
    pop();
  };

  function update(r) {
    if (typeof width === 'undefined') return;
    const m = r.multiFaceLandmarks;
    if (!m || !m.length) { FACE = null; status('얼굴이 안 보입니다 / 看不到脸'); return; }
    const f = fit();
    FACE = m[0].map(p => ({ x: width - (f.ox + p.x * f.dw), y: f.oy + p.y * f.dh }));  // 거울처럼 / 像镜子
    status('');
  }

  if (!navigator.mediaDevices) { status('카메라를 쓸 수 없습니다. Chrome에서 여세요 / 无法使用摄像头,请用 Chrome 打开'); return; }
  status('카메라 켜는 중 / 正在打开摄像头');
  const tag = document.createElement('script');
  tag.src = MP + 'face_mesh.js';
  document.head.appendChild(tag);
  navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' }, audio: false })
    .then(s => { video.srcObject = s; return video.play(); })
    .then(start)
    .catch(e => status('카메라 오류 / 摄像头错误: ' + e.message));

  let waited = 0;
  function start() {
    if (typeof FaceMesh === 'undefined') {
      if (++waited > 50) { status('MediaPipe를 불러오지 못했습니다. 인터넷 연결을 확인하세요 / 无法载入 MediaPipe,请检查网络'); return; }
      setTimeout(start, 300);
      return;
    }
    status('얼굴 찾는 중 / 正在寻找脸');
    const fm = new FaceMesh({ locateFile: f => MP + f });
    fm.setOptions({ maxNumFaces: 1, refineLandmarks: false, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
    fm.onResults(update);
    let busy = false;
    (function loop() {
      if (!busy && video.readyState >= 2) {
        busy = true;
        fm.send({ image: video }).catch(() => {}).finally(() => { busy = false; });
      }
      setTimeout(loop, 40);
    })();
  }
})();
