// 몸의 한 부위에서 파티클이 나옵니다
// 从身体的一个部位喷出粒子
// 화면의 관절 점을 클릭하면 그 부위로 바뀝니다
// 点击画面上的关节点,就会换成那个部位

let PART = 'rightWrist';   // 처음 부위 / 起始部位
let dots = [];

function setup() {
  createCanvas(640, 480);
  textSize(16);
}

function draw() {
  background(20, 60);              // 반투명 배경 → 잔상 / 半透明背景 → 残影
  drawSkeleton(90, 2);

  if (J !== null) {
    let p = J[PART];
    for (let i = 0; i < 4; i++) {  // 한 번에 4개씩 / 每次 4 个
      dots.push({ x: p.x, y: p.y, vx: random(-2, 2), vy: random(-3, 1), life: 255 });
    }
    noFill();
    stroke(232, 103, 75);
    strokeWeight(2);
    circle(p.x, p.y, 26);          // 선택한 부위 표시 / 标出选中的部位
  }

  noStroke();
  for (let d of dots) {
    d.x += d.vx;
    d.y += d.vy;
    d.vy += 0.05;                  // 중력 / 重力
    d.life -= 4;
    fill(232, 103, 75, d.life);
    circle(d.x, d.y, 8);
  }
  dots = dots.filter(d => d.life > 0);

  fill(255);
  text('PART = ' + PART, 12, 24);
}

// 클릭한 곳에서 가장 가까운 관절로 바꾸기 / 换成离点击位置最近的关节
function mousePressed() {
  if (J === null) return;
  let best = null;
  let bestDist = 50;
  for (let name in J) {
    let d = dist(mouseX, mouseY, J[name].x, J[name].y);
    if (d < bestDist) {
      bestDist = d;
      best = name;
    }
  }
  if (best) PART = best;
}

// 키를 누르기 전에 실행 화면을 한 번 클릭하세요 / 按键前先点击一下运行画面
// keyCode로 확인해서 한글·중국어 입력 상태에서도 됩니다 / 用 keyCode 判断,中文输入法下也可以使用
function keyPressed() {
  if (keyCode === 83) saveCanvas('my-sketch', 'png');     // S 키: 화면 저장 / S 键:保存画面
}


// ══════════════════════════════════════════════════════════════
// ▼ 여기부터 아래는 고치지 않아도 됩니다 — 카메라 · 관절 찾기 · 예측
// ▼ 从这里往下不需要修改 — 摄像头 · 寻找关节 · 预测
// ══════════════════════════════════════════════════════════════
// now        지금 동작 번호 0=A, 1=B, 2=C, 3=D, 없으면 -1 / 现在的动作编号,没有时为 -1
// conf       확신 정도 0~1 / 确信程度 0~1
// names[k]   동작 이름 / 动作名称
// colors[k]  A~D 색 / A~D 的颜色
// J.이름     관절 위치 {x, y}, 사람이 없으면 null / 关节位置 {x, y},没有人时为 null
//            nose, leftShoulder, rightShoulder, leftElbow, rightElbow, leftWrist, rightWrist,
//            leftHip, rightHip, leftKnee, rightKnee, leftAnkle, rightAnkle
// drawVideo(a)        카메라 영상, a = 투명도 0~1 / 摄像头画面,a = 透明度 0~1
// drawSkeleton(c, w)  뼈대, c = 색, w = 두께 / 骨架,c = 颜色,w = 粗细

var now = -1, conf = 0, names = [], J = null;
var colors = ['#E8674B', '#2A9D8F', '#4F5BD5', '#D99A00'];
var drawVideo, drawSkeleton;

(function () {
  const MP = 'https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/';
  const KEY_IDX = [0, 2, 5, 7, 8, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];
  const KEY_NAMES = ['nose', 'leftEye', 'rightEye', 'leftEar', 'rightEar', 'leftShoulder', 'rightShoulder',
    'leftElbow', 'rightElbow', 'leftWrist', 'rightWrist', 'leftHip', 'rightHip', 'leftKnee', 'rightKnee', 'leftAnkle', 'rightAnkle'];
  const BONES = [['leftShoulder', 'rightShoulder'], ['leftShoulder', 'leftElbow'], ['leftElbow', 'leftWrist'],
    ['rightShoulder', 'rightElbow'], ['rightElbow', 'rightWrist'], ['leftShoulder', 'leftHip'], ['rightShoulder', 'rightHip'],
    ['leftHip', 'rightHip'], ['leftHip', 'leftKnee'], ['leftKnee', 'leftAnkle'], ['rightHip', 'rightKnee'], ['rightKnee', 'rightAnkle']];

  // 상태 표시 / 状态显示
  const st = document.createElement('div');
  st.style.cssText = "position:fixed;left:8px;bottom:8px;z-index:9;font:12px sans-serif;color:#fff;background:rgba(0,0,0,.65);padding:3px 8px;border-radius:4px;display:none";
  if (document.body) document.body.appendChild(st);
  else document.addEventListener('DOMContentLoaded', () => document.body.appendChild(st));
  function status(t) { st.textContent = t; st.style.display = t ? 'block' : 'none'; }

  // 모델 확인 / 检查模型
  let M = (typeof POSE_MODEL !== 'undefined') ? POSE_MODEL : null, K = 0, probs = [];
  try {
    if (M) {
      K = M.classes.length;
      if (M.weights.length !== 34 * K || M.bias.length !== K) throw 0;
      names = M.classes.slice();
      probs = new Array(K).fill(0);
    }
  } catch (e) {
    M = null; K = 0;
    status('모델 형식이 맞지 않습니다. 5주차에서 [모델 복사]를 다시 하세요 / 模型格式不对,请在第5周重新 [复制模型]');
  }

  const video = document.createElement('video');
  video.playsInline = true;
  video.muted = true;
  let lm = null;

  // 영상이 캔버스를 채우도록 맞춤 / 让画面填满画布
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

  drawSkeleton = function (c = 255, w = 3) {
    if (!J) return;
    push();
    stroke(c); strokeWeight(w);
    BONES.forEach(([a, b]) => { if (J[a].v > 0.3 && J[b].v > 0.3) line(J[a].x, J[a].y, J[b].x, J[b].y); });
    noStroke(); fill(c);
    KEY_NAMES.forEach(n => { if (J[n].v > 0.3) circle(J[n].x, J[n].y, w * 3); });
    pop();
  };

  // 5주차와 같은 정규화 / 与第5周相同的标准化
  function feature(l) {
    const lH = l[23], rH = l[24], lS = l[11], rS = l[12];
    const cx = (lH.x + rH.x) / 2, cy = (lH.y + rH.y) / 2;
    const scale = Math.max(Math.hypot(rS.x - lS.x, rS.y - lS.y), Math.hypot((lS.x + rS.x) / 2 - cx, (lS.y + rS.y) / 2 - cy)) || 0.1;
    const f = [];
    KEY_IDX.forEach(i => { f.push((l[i].x - cx) / scale, (l[i].y - cy) / scale); });
    return f;
  }

  // 숫자 34개 × 조절값 → 동작별 확률 / 34个数字 × 参数 → 各动作的概率
  function predict(f) {
    const s = [];
    for (let k = 0; k < K; k++) {
      let v = M.bias[k];
      for (let i = 0; i < 34; i++) v += f[i] * M.weights[i * K + k];
      s.push(v);
    }
    const mx = Math.max(...s), e = s.map(v => Math.exp(v - mx)), sum = e.reduce((a, b) => a + b, 0);
    return e.map(v => v / sum);
  }

  function update() {
    if (!lm) { J = null; now = -1; conf = 0; probs = probs.map(() => 0); status('사람이 안 보입니다 / 看不到人'); return; }
    if (typeof width === 'undefined') return;
    const f = fit(), j = {};
    KEY_IDX.forEach((idx, n) => {
      const p = lm[idx];
      j[KEY_NAMES[n]] = { x: width - (f.ox + p.x * f.dw), y: f.oy + p.y * f.dh, v: p.visibility };  // 거울처럼 / 像镜子
    });
    J = j;
    status('');
    if (!M) return;
    const p = predict(feature(lm));
    probs = probs.map((old, k) => old * 0.5 + p[k] * 0.5);   // 흔들림 줄이기 / 减少抖动
    let best = 0;
    for (let k = 1; k < K; k++) if (probs[k] > probs[best]) best = k;
    now = best;
    conf = probs[best];
  }

  // 카메라 켜기 → MediaPipe 불러오기 / 打开摄像头 → 载入 MediaPipe
  if (!navigator.mediaDevices) { status('카메라를 쓸 수 없습니다. Chrome에서 여세요 / 无法使用摄像头,请用 Chrome 打开'); return; }
  status('카메라 켜는 중 / 正在打开摄像头');
  const tag = document.createElement('script');
  tag.src = MP + 'pose.js';
  document.head.appendChild(tag);
  navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' }, audio: false })
    .then(s => { video.srcObject = s; return video.play(); })
    .then(startPose)
    .catch(e => status('카메라 오류 / 摄像头错误: ' + e.message));

  let waited = 0;
  function startPose() {
    if (typeof Pose === 'undefined') {
      if (++waited > 50) { status('MediaPipe를 불러오지 못했습니다. 인터넷 연결을 확인하세요 / 无法载入 MediaPipe,请检查网络'); return; }
      setTimeout(startPose, 300);
      return;
    }
    status('관절 찾는 중 / 正在寻找关节');
    const pose = new Pose({ locateFile: f => MP + f });
    pose.setOptions({ modelComplexity: 1, smoothLandmarks: true, enableSegmentation: false, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
    pose.onResults(r => { lm = (r.poseLandmarks && r.poseLandmarks.length) ? r.poseLandmarks : null; update(); });
    let busy = false;
    (function loop() {
      if (!busy && video.readyState >= 2) {
        busy = true;
        pose.send({ image: video }).catch(() => {}).finally(() => { busy = false; });
      }
      setTimeout(loop, 40);
    })();
  }
})();
