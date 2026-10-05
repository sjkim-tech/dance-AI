// 손으로 그리기: 엄지와 손가락 끝을 붙이면 그려지고, 떼면 멈춥니다
// 用手画画:拇指和手指尖碰在一起就画,分开就停
// 두 손을 함께 쓸 수 있습니다 / 可以同时用两只手

let FINGER = 8;    // 붓이 될 손가락 끝: 8 검지 · 12 중지 · 16 약지 · 20 새끼 / 当画笔的指尖:8 食指 · 12 中指 · 16 无名指 · 20 小指
let SIZE = 8;      // 선 굵기 / 线的粗细
let PINCH = 40;    // 이만큼 가까우면 붙었다고 봅니다 / 距离小于这个就当作碰在一起

let paper;
let last = [null, null];
let handColors = ['#E8674B', '#2A9D8F'];

function setup() {
  createCanvas(640, 480);
  paper = createGraphics(640, 480);
}

function draw() {
  background(251, 250, 247);
  drawVideo(0.25);
  image(paper, 0, 0);
  drawHands(180, 1);

  for (let h = 0; h < 2; h++) {
    let hand = HANDS[h];
    if (!hand) { last[h] = null; continue; }
    let tip = hand[FINGER];
    let thumb = hand[4];                          // 4 = 엄지 끝 / 拇指尖
    let pinched = dist(tip.x, tip.y, thumb.x, thumb.y) < PINCH;
    let x = (tip.x + thumb.x) / 2, y = (tip.y + thumb.y) / 2;

    if (pinched) {
      paper.stroke(handColors[h]);
      paper.strokeWeight(SIZE);
      if (last[h]) paper.line(last[h].x, last[h].y, x, y);
      last[h] = { x, y };
    } else {
      last[h] = null;
    }
    // 붓 위치 표시 / 标出画笔位置
    noFill();
    stroke(handColors[h]);
    strokeWeight(2);
    circle(x, y, pinched ? SIZE + 6 : 24);
  }
}

// 키를 누르기 전에 실행 화면을 한 번 클릭하세요 / 按键前先点击一下运行画面
function keyPressed() {
  if (keyCode === 83) saveCanvas('my-sketch', 'png');   // S 키: 화면 저장 / S 键:保存画面
  if (keyCode === 67) paper.clear();                    // C 키: 지우기 / C 键:清除
}


// ══════════════════════════════════════════════════════════════
// ▼ 여기부터 아래는 고치지 않아도 됩니다 — 카메라 · 손 찾기
// ▼ 从这里往下不需要修改 — 摄像头 · 寻找手
// ══════════════════════════════════════════════════════════════
// HANDS[0], HANDS[1]   손마다 점 21개 {x, y}, 없으면 비어 있음 / 每只手 21 个点,没有时为空
//                      0 손목 · 4 엄지 끝 · 8 검지 끝 · 12 중지 끝 · 16 약지 끝 · 20 새끼 끝
//                      0 手腕 · 4 拇指尖 · 8 食指尖 · 12 中指尖 · 16 无名指尖 · 20 小指尖
// drawVideo(a)         카메라 영상, a = 투명도 0~1 / 摄像头画面,a = 透明度 0~1
// drawHands(c, w)      손 뼈대, c = 색, w = 두께 / 手的骨架,c = 颜色,w = 粗细

var HANDS = [];
var drawVideo, drawHands;

(function () {
  const MP = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/';
  const LINKS = [[0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8], [5, 9], [9, 10], [10, 11], [11, 12],
    [9, 13], [13, 14], [14, 15], [15, 16], [13, 17], [17, 18], [18, 19], [19, 20], [0, 17]];

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

  drawHands = function (c = 255, w = 2) {
    push();
    stroke(c); strokeWeight(w);
    HANDS.forEach(h => LINKS.forEach(([a, b]) => line(h[a].x, h[a].y, h[b].x, h[b].y)));
    noStroke(); fill(c);
    HANDS.forEach(h => h.forEach(p => circle(p.x, p.y, w * 4)));
    pop();
  };

  function update(r) {
    if (typeof width === 'undefined') return;
    const f = fit();
    HANDS = (r.multiHandLandmarks || []).map(h => h.map(p => ({ x: width - (f.ox + p.x * f.dw), y: f.oy + p.y * f.dh })));  // 거울처럼 / 像镜子
    status(HANDS.length ? '' : '손이 안 보입니다 / 看不到手');
  }

  if (!navigator.mediaDevices) { status('카메라를 쓸 수 없습니다. Chrome에서 여세요 / 无法使用摄像头,请用 Chrome 打开'); return; }
  status('카메라 켜는 중 / 正在打开摄像头');
  const tag = document.createElement('script');
  tag.src = MP + 'hands.js';
  document.head.appendChild(tag);
  navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' }, audio: false })
    .then(s => { video.srcObject = s; return video.play(); })
    .then(start)
    .catch(e => status('카메라 오류 / 摄像头错误: ' + e.message));

  let waited = 0;
  function start() {
    if (typeof Hands === 'undefined') {
      if (++waited > 50) { status('MediaPipe를 불러오지 못했습니다. 인터넷 연결을 확인하세요 / 无法载入 MediaPipe,请检查网络'); return; }
      setTimeout(start, 300);
      return;
    }
    status('손 찾는 중 / 正在寻找手');
    const hands = new Hands({ locateFile: f => MP + f });
    hands.setOptions({ maxNumHands: 2, modelComplexity: 1, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
    hands.onResults(update);
    let busy = false;
    (function loop() {
      if (!busy && video.readyState >= 2) {
        busy = true;
        hands.send({ image: video }).catch(() => {}).finally(() => { busy = false; });
      }
      setTimeout(loop, 40);
    })();
  }
})();
