// 글자가 위에서 떨어지다가 어두운 곳(몸)에 닿으면 멈춥니다
// 文字从上面落下,碰到暗的地方(身体)就停住
// 참고 / 参考: Text Rain (Camille Utterback & Romy Achituv, 1999)
// 밝은 벽 앞에 서면 잘 됩니다. 잘 안 되면 DARK 값을 바꿔 보세요
// 站在明亮的墙前效果更好。效果不好时试着修改 DARK 的值

let cam;
let TEXT = '몸이 글자를 받는다 身体接住文字 ';   // 내 문장으로 바꿔 보세요 / 换成自己的句子
let DARK = 100;        // 이보다 어두우면 몸으로 봄 (0~255) / 比这个暗就当作身体 (0~255)
let letters = [];
let n = 0;             // 다음에 떨어질 글자 번호 / 下一个落下的字的编号

function setup() {
  createCanvas(640, 480);
  cam = createCapture(VIDEO);
  cam.size(160, 120);  // 작게 받아서 계산을 빠르게 / 用小尺寸接收,计算更快
  cam.hide();
  textAlign(CENTER, CENTER);
  textSize(22);
}

function draw() {
  // 거울처럼 좌우 반전해서 영상 그리기 / 像镜子一样左右翻转画出画面
  push();
  translate(width, 0);
  scale(-1, 1);
  image(cam, 0, 0, width, height);
  pop();

  cam.loadPixels();

  // 새 글자 만들기 / 生成新的字
  if (frameCount % 5 === 0) {
    letters.push({ ch: TEXT[n % TEXT.length], x: random(width), y: -20, speed: random(1.5, 3) });
    n++;
  }

  fill(232, 103, 75);
  noStroke();
  for (let L of letters) {
    if (isDark(L.x, L.y)) {
      L.y -= 2;            // 어두운 곳에 닿으면 위로 밀림 / 碰到暗处就被往上推
    } else {
      L.y += L.speed;      // 아니면 떨어짐 / 否则落下
    }
    text(L.ch, L.x, L.y);
  }
  letters = letters.filter(L => L.y < height + 30);   // 화면 밖 글자 지우기 / 删除画面外的字
}

// 화면의 (x, y) 자리가 어두운지 / 画面上 (x, y) 位置是否暗
function isDark(x, y) {
  if (cam.pixels.length === 0 || y < 0 || y >= height) return false;
  let cx = cam.width - 1 - floor(x / width * cam.width);   // 거울 반전 / 镜像翻转
  let cy = floor(y / height * cam.height);
  let i = (cy * cam.width + cx) * 4;
  let bright = (cam.pixels[i] + cam.pixels[i + 1] + cam.pixels[i + 2]) / 3;   // 밝기 / 亮度
  return bright < DARK;
}

// 키를 누르기 전에 실행 화면을 한 번 클릭하세요 / 按键前先点击一下运行画面
// keyCode로 확인해서 한글·중국어 입력 상태에서도 됩니다 / 用 keyCode 判断,中文输入法下也可以使用
function keyPressed() {
  if (keyCode === 83) saveCanvas('my-sketch', 'png');     // S 키: 화면 저장 / S 键:保存画面
}
