// 5주차에 학습한 동작마다 다른 효과가 나옵니다
// 第5周训练的每个动作会出现不同的效果
//   A → 텍스트: 글자가 떨어져 몸에 걸림 / 文字:文字落下挂在身上
//   B → 드로잉: 손이 지나간 자리에 선 / 绘画:手经过的地方留下线条
//   C → 파티클: 고른 부위에서 점이 나옴 / 粒子:从选中的部位喷出小点
//   D → 가만히: 그림이 천천히 지워짐 / 静止:画慢慢被擦掉
// 관절 점 클릭: 파티클 부위 바꾸기 / 点击关节点:更换粒子部位
// S 키: 화면 저장 / S 键:保存画面   C 키: 모두 지우기 / C 键:全部清除

// ① 5주차 [모델 복사] 결과를 아래 줄 대신 붙여 넣으세요
// ① 请用第5周 [复制模型] 的结果替换下面这一行
const POSE_MODEL = null;

// ② 여기부터 고쳐 보세요 / 从这里开始修改
let TEXT = '몸이 글자를 받는다 身体接住文字 ';   // A 동작의 글자 / A 动作的文字
let BRUSH = ['leftWrist', 'rightWrist'];         // B 동작의 붓 / B 动作的画笔
let PART = 'rightWrist';                         // C 동작의 파티클 부위 / C 动作的粒子部位

let letters = [];
let n = 0;
let paper;
let last = {};
let dots = [];

function setup() {
  createCanvas(640, 480);
  paper = createGraphics(640, 480);
  textAlign(CENTER, CENTER);
}

function draw() {
  background(251, 250, 247);
  drawVideo(0.15);
  image(paper, 0, 0);
  drawSkeleton(180, 2);

  // A → 텍스트 / 文字
  if (now === 0 && frameCount % 5 === 0) {
    letters.push({ ch: TEXT[n % TEXT.length], x: random(width), y: -20, speed: random(1.5, 3) });
    n++;
  }
  textSize(24);
  noStroke();
  fill(colors[0]);
  for (let L of letters) {
    if (touchBody(L.x, L.y)) L.y -= 2;   // 몸에 닿으면 위로 / 碰到身体就往上
    else L.y += L.speed;                 // 아니면 떨어짐 / 否则落下
    text(L.ch, L.x, L.y);
  }
  letters = letters.filter(L => L.y < height + 30);

  // B → 드로잉 / 绘画
  if (now === 1 && J !== null) {
    paper.stroke(colors[1]);
    paper.strokeWeight(4 + conf * 10);
    for (let name of BRUSH) {
      let p = J[name];
      if (p.v > 0.5 && last[name]) paper.line(last[name].x, last[name].y, p.x, p.y);
      last[name] = (p.v > 0.5) ? p : null;
    }
  } else {
    last = {};
  }

  // C → 파티클 / 粒子
  if (now === 2 && J !== null) {
    let p = J[PART];
    for (let i = 0; i < 4; i++) {
      dots.push({ x: p.x, y: p.y, vx: random(-3, 3), vy: random(-4, 1), life: 255 });
    }
  }
  noStroke();
  for (let d of dots) {
    d.x += d.vx;
    d.y += d.vy;
    d.vy += 0.05;
    d.life -= 4;
    let c = color(colors[2]);
    c.setAlpha(d.life);
    fill(c);
    circle(d.x, d.y, 8);
  }
  dots = dots.filter(d => d.life > 0);

  // D → 가만히: 천천히 지우기 / 静止:慢慢擦掉
  if (now === 3) {
    paper.erase(8);
    paper.rect(0, 0, width, height);
    paper.noErase();
  }

  // 지금 동작 표시 / 显示现在的动作
  textAlign(LEFT, TOP);
  textSize(18);
  if (now >= 0) {
    fill(colors[now]);
    text(['A', 'B', 'C', 'D'][now] + '  ' + names[now] + '  ' + round(conf * 100) + '%', 12, 12);
  } else if (POSE_MODEL === null) {
    fill(60);
    text('모델 없음 / 没有模型', 12, 12);
  }
  textAlign(CENTER, CENTER);
}

// (x, y)가 몸에 닿았는지 / (x, y) 是否碰到身体
function touchBody(x, y) {
  if (J === null) return false;
  let bones = [
    ['leftShoulder', 'rightShoulder'], ['leftShoulder', 'leftElbow'], ['leftElbow', 'leftWrist'],
    ['rightShoulder', 'rightElbow'], ['rightElbow', 'rightWrist'],
    ['leftShoulder', 'leftHip'], ['rightShoulder', 'rightHip'], ['leftHip', 'rightHip'],
    ['leftHip', 'leftKnee'], ['leftKnee', 'leftAnkle'], ['rightHip', 'rightKnee'], ['rightKnee', 'rightAnkle'],
  ];
  for (let [a, b] of bones) {
    let A = J[a], B = J[b];
    let dx = B.x - A.x, dy = B.y - A.y;
    let t = constrain(((x - A.x) * dx + (y - A.y) * dy) / (dx * dx + dy * dy || 1), 0, 1);
    if (dist(x, y, A.x + t * dx, A.y + t * dy) < 20) return true;   // 20 = 몸 두께 / 身体厚度
  }
  return dist(x, y, J.nose.x, J.nose.y) < 40;                         // 머리 / 头
}

// 클릭한 곳에서 가장 가까운 관절을 파티클 부위로 / 把离点击位置最近的关节设为粒子部位
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
  if (keyCode === 83) saveCanvas('pose-sketch', 'png');   // S 키: 화면 저장 / S 键:保存画面
  if (keyCode === 67) { paper.clear(); letters = []; dots = []; }   // C 키: 모두 지우기 / C 键:全部清除
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
