// 픽셀 거울: 카메라 화면을 칸으로 나누고, 밝은 칸일수록 큰 모양으로 다시 그립니다
// 像素镜子:把摄像头画面分成格子,越亮的格子画出越大的形状
// 참고 / 参考: Daniel Rozin, Wooden Mirror (1999)

let cam;
let CELL = 16;          // 칸 크기, 작을수록 촘촘합니다 (8~40) / 格子大小,越小越密 (8~40)
let SHAPE = 'circle';   // 'circle' 원 · 'square' 네모 · 'text' 글자 / 圆 · 方块 · 文字
let TEXT = '춤舞몸身';   // SHAPE가 'text'일 때 쓰는 글자 / SHAPE 为 'text' 时使用的文字

function setup() {
  createCanvas(640, 480);
  cam = createCapture(VIDEO);
  cam.size(160, 120);   // 작게 받아서 계산을 빠르게 / 用小尺寸接收,计算更快
  cam.hide();
  rectMode(CENTER);
  textAlign(CENTER, CENTER);
  noStroke();
}

function draw() {
  background(20);
  cam.loadPixels();
  if (cam.pixels.length === 0) return;

  let cols = floor(width / CELL);
  let rows = floor(height / CELL);
  let n = 0;
  for (let gy = 0; gy < rows; gy++) {
    for (let gx = 0; gx < cols; gx++) {
      // 거울처럼 좌우를 바꿔서 카메라 픽셀 읽기 / 像镜子一样左右翻转读取像素
      let cx = cam.width - 1 - floor(gx * cam.width / cols);
      let cy = floor(gy * cam.height / rows);
      let i = (cy * cam.width + cx) * 4;
      let b = (cam.pixels[i] + cam.pixels[i + 1] + cam.pixels[i + 2]) / 3;   // 밝기 / 亮度
      let size = map(b, 0, 255, 0, CELL * 1.1);

      let x = gx * CELL + CELL / 2;
      let y = gy * CELL + CELL / 2;
      fill(255);
      if (SHAPE === 'circle') circle(x, y, size);
      else if (SHAPE === 'square') square(x, y, size);
      else {
        textSize(max(size, 1));
        text(TEXT[n % TEXT.length], x, y);
      }
      n++;
    }
  }
}

// 키를 누르기 전에 실행 화면을 한 번 클릭하세요 / 按键前先点击一下运行画面
function keyPressed() {
  if (keyCode === 83) saveCanvas('my-sketch', 'png');   // S 키: 화면 저장 / S 键:保存画面
}
