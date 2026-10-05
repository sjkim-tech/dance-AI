// 잔상: 조금 전의 내가 여러 겹으로 따라옵니다
// 残影:刚才的我分成好几层跟过来
// 혼자 추는 춤이 군무처럼 보입니다 / 一个人的舞看起来像群舞

let cam;
let frames = [];
let DELAY = 10;    // 겹 사이 시간 간격, 클수록 늦게 따라옵니다 (2~30) / 层与层之间的时间间隔,越大跟得越慢 (2~30)
let COPIES = 5;    // 몇 겹을 보일지 (1~8) / 显示几层 (1~8)

function setup() {
  createCanvas(640, 480);
  cam = createCapture(VIDEO);
  cam.size(160, 120);   // 작게 저장해서 가볍게 / 用小尺寸保存,更轻
  cam.hide();
  colorMode(HSB, 360, 100, 100, 100);
}

function draw() {
  background(0);
  if (cam.elt.readyState < 2) return;

  frames.push(cam.get());                        // 지금 화면을 기억 / 记住当前画面
  while (frames.length > DELAY * COPIES + 1) frames.shift();   // 오래된 것은 버림 / 丢掉旧的

  let a = constrain(200 / (COPIES + 1), 20, 80);   // 겹이 많을수록 한 겹은 옅게 / 层越多,每层越淡
  for (let k = COPIES; k >= 0; k--) {            // 오래된 것부터 그림 / 从旧的开始画
    let idx = frames.length - 1 - k * DELAY;
    if (idx < 0) continue;
    let hue = (k * 50 + 10) % 360;
    tint(hue, k === 0 ? 0 : 60, 100, a);         // 지금(k=0)은 색 없음 / 现在(k=0)没有颜色
    push();
    translate(width, 0);
    scale(-1, 1);                                // 거울 / 镜像
    image(frames[idx], 0, 0, width, height);
    pop();
  }
  noTint();
}

// 키를 누르기 전에 실행 화면을 한 번 클릭하세요 / 按键前先点击一下运行画面
function keyPressed() {
  if (keyCode === 83) saveCanvas('my-sketch', 'png');   // S 키: 화면 저장 / S 键:保存画面
}
