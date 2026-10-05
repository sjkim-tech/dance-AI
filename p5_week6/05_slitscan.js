// 슬릿스캔: 카메라 화면에서 세로줄 하나만 잘라 옆으로 쌓습니다. 시간이 가로로 펼쳐집니다
// 狭缝扫描:从摄像头画面只切下一条竖线,往旁边堆叠。时间被横向展开
// 천천히 움직이면 몸이 길게 늘어나고, 빨리 움직이면 좁아집니다
// 慢慢动身体会被拉长,快速动身体会变窄

let cam;
let paper;
let x = 0;
let SPEED = 2;     // 한 번에 쌓는 폭, 클수록 빨리 지나갑니다 (1~8) / 每次堆叠的宽度,越大越快 (1~8)
let SLIT = 0.5;    // 잘라 오는 줄의 위치 0(왼쪽)~1(오른쪽) / 切取的位置 0(左)~1(右)

function setup() {
  createCanvas(640, 480);
  cam = createCapture(VIDEO);
  cam.hide();
  paper = createGraphics(640, 480);
  paper.background(20);
}

function draw() {
  let v = cam.elt;
  if (v.readyState >= 2 && v.videoWidth > 0) {
    // 거울처럼 보이도록 오른쪽에서부터 위치를 셉니다 / 为了像镜子,从右边开始数位置
    let sx = floor(v.videoWidth * (1 - SLIT));
    paper.drawingContext.drawImage(v, sx, 0, 1, v.videoHeight, x, 0, SPEED, height);
    x += SPEED;
    if (x >= width) x = 0;   // 끝에 닿으면 처음부터 / 到头后从头开始
  }
  image(paper, 0, 0);

  // 지금 쌓고 있는 자리 / 现在堆叠的位置
  stroke(232, 103, 75);
  line(x, 0, x, height);

  // 오른쪽 아래 작은 카메라 화면과 자르는 줄 / 右下角的小画面和切取的线
  push();
  translate(width - 10, height - 130);
  scale(-1, 1);
  image(cam, 0, 0, 160, 120);
  pop();
  let lx = width - 170 + 160 * SLIT;
  line(lx, height - 130, lx, height - 10);
  noStroke();
}

// 키를 누르기 전에 실행 화면을 한 번 클릭하세요 / 按键前先点击一下运行画面
function keyPressed() {
  if (keyCode === 83) saveCanvas('my-sketch', 'png');               // S 키: 화면 저장 / S 键:保存画面
  if (keyCode === 67) { paper.background(20); x = 0; }              // C 키: 지우기 / C 键:清除
}
