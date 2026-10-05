// 몸이 움직인 자리가 쌓여 그림이 됩니다
// 身体移动过的地方会累积成画
// 컴퓨터는 지금 화면과 바로 전 화면의 밝기 차이를 봅니다
// 计算机看的是当前画面和上一帧画面的亮度差
// C 키: 지우기 / C 键:清除

let cam;
let prev;              // 바로 전 화면 / 上一帧画面
let paper;             // 흔적이 남는 종이 / 留下痕迹的纸
const S = 10;          // 칸 크기 / 格子大小
let MOVE = 40;         // 이보다 많이 바뀌면 움직임으로 봄 / 变化比这个大就当作移动

function setup() {
  createCanvas(640, 480);
  cam = createCapture(VIDEO);
  cam.size(64, 48);
  cam.hide();
  paper = createGraphics(640, 480);
  paper.colorMode(HSB, 360, 100, 100, 100);   // 색상환으로 색 정하기 / 用色相环决定颜色
  paper.noStroke();
}

function draw() {
  background(251, 250, 247);

  // 흐린 영상 / 淡淡的画面
  push();
  translate(width, 0);
  scale(-1, 1);
  tint(255, 40);
  image(cam, 0, 0, width, height);
  pop();

  cam.loadPixels();
  if (prev) {
    let hue = (frameCount * 0.5) % 360;      // 시간에 따라 색이 바뀜 / 颜色随时间改变
    paper.fill(hue, 70, 90, 30);
    for (let y = 0; y < cam.height; y++) {
      for (let x = 0; x < cam.width; x++) {
        let i = (y * cam.width + x) * 4;
        if (abs(cam.pixels[i] - prev[i]) > MOVE) {
          let sx = width - (x * S + S / 2);  // 거울 반전 / 镜像翻转
          let sy = y * S + S / 2;
          paper.circle(sx, sy, S * 1.5);
        }
      }
    }
  }
  prev = cam.pixels.slice();                 // 지금 화면을 기억 / 记住当前画面

  image(paper, 0, 0);
}

// 키를 누르기 전에 실행 화면을 한 번 클릭하세요 / 按键前先点击一下运行画面
// keyCode로 확인해서 한글·중국어 입력 상태에서도 됩니다 / 用 keyCode 判断,中文输入法下也可以使用
function keyPressed() {
  if (keyCode === 83) saveCanvas('my-sketch', 'png');   // S 키: 화면 저장 / S 键:保存画面
  if (keyCode === 67) paper.clear();                    // C 키: 지우기 / C 键:清除
}
