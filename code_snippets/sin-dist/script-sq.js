let prevInitFrame = 1;
let n = 1;
let baseRadius = 100;
let plotData = [];

function setup() {
    canvas = createCanvas(windowWidth, windowHeight);
}

function draw() {
  clear();
  background(224, 239, 243);

  let x = 0, y = 0;

  push();
  translate(baseRadius + 20, height / 2);
  fill(255); stroke(0); strokeWeight(1);
  ellipse(x, y, baseRadius * 2, baseRadius * 2);

  let m = 4 / PI;
  for (let i = 0; i < n; i ++) {
    let d = 1 + i * 2;
    let rad = radians(frameCount - 1) * 2 * d;
    let radius = baseRadius / d * m;
    let sine = sin(rad);
    let cosine = cos(rad);
    let nx = x + cosine * radius;
    let ny = y - sine * radius;

    line(x, y, nx, ny);
    drawCircleMarker(createVector(nx, ny), 2);
    x = nx;
    y = ny;
  }

  drawCircleMarker(createVector(0, 0), 2);
  line(baseRadius + 20, y, -baseRadius - 20, y);
  drawCircleMarker(createVector(x, y), 4);
  pop();

  let graphW = width - (baseRadius + 20) * 2;
  let graphX = (baseRadius + 20) * 2;

  if (frameCount > prevInitFrame + graphW) {
    plotData = [];
    prevInitFrame += graphW;
  }
  plotData.push({x:frameCount - prevInitFrame, y: -y});

  if (frameCount % 90 == 0) {
    n ++;
    if (n > 40) {
      n = 1;
    }
  }

  plotGraph(plotData, graphX, height / 2, graphW, height - 64, 0, graphW, -height / 2 + 32, height / 2 - 32, "time", "y");

  drawLabel(8, height - 32, "n = " + n, LEFT);
}

function plotGraph(data, ox, oy, w, h, minX, maxX, minY, maxY, xLabel, yLabel) {
  let left = ox - minX / (maxX - minX) * w;
  let top = oy - maxY / (maxY - minY) * h;
  let labelLeft = abs(left - ox) > abs(left + w - ox);
  let labelTop = abs(top - oy) > abs(top + h - oy);

  push();

  noFill(); stroke(0);
  line(left, oy, left + w, oy);
  line(ox, top, ox, top + h);

  beginShape();
  for (let i = 0; i < data.length; i ++) {
    let x = ox + data[i].x / (maxX - minX) * w;
    let y = oy - data[i].y / (maxY - minY) * h;
    vertex(x, y);
  }
  endShape();

  fill(0);
  drawLabel(labelLeft ? left : left + w, oy + (labelTop ? 16 : -8), xLabel, labelLeft ?  LEFT : RIGHT);
  drawLabel(ox, labelTop ? top : top + h, yLabel, labelLeft ?  RIGHT : LEFT);
  pop();
}

function drawLabel(x, y, label, align = CENTER) {
  push();
  strokeWeight(0);
  textFont("monospace");
  textSize(14);
  textAlign(align);
  if (align == LEFT) {x += 6;}
  if (align == RIGHT) {x -= 6;}
  text(label, x, y);
  pop();
}

function drawCircleMarker(p, size) {
  ellipse(p.x, p.y, size * 2, size * 2);
}