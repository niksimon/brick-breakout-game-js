window.onload = function () {
  const canvas = document.getElementById("canvas");
  const context = canvas.getContext("2d");
  const width = (canvas.width = 820);
  const height = (canvas.height = 600);
  const nCols = 7;
  const nRows = 5;
  let player;
  let ball;
  let bricks = [];
  const brickWidth = 56;
  const brickHeight = 28;
  const playerWidth = 120;
  const playerHeight = 5;
  const brickSep = (width - brickWidth * nCols) / (nCols + 1);
  const brickSpace = (width - brickSep) / nCols;
  let trail = [];
  let effects = [];
  const colors = ["#353941", "#ff6575", "#9be8f9"];

  player = vector.create(width / 2, 550);
  ball = particle.create(width / 2, 520, 5, -Math.PI / 2);
  ball.radius = 10;

  let effect = {
    x: 0,
    y: 0,
    t: 0,
    create: function (x, y) {
      obj = Object.create(this);
      obj.x = x;
      obj.y = y;
      return obj;
    },
  };

  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 7; j++) {
      let brick = vector.create(205 + j * (brickWidth + 3), 120 + i * (brickHeight + 3), "#9f9da0");
      bricks.push(brick);
      //   context.fillStyle = brick.color;
      //   context.fillRect(brick.getX(), brick.getY(), brickWidth, brickHeight);
    }
  }

  // Set red brick color
  bricks[8].color = "#fa0008";
  bricks[12].color = "#fa0008";
  bricks[15].color = "#fa0008";
  bricks[19].color = "#fa0008";

  // Make yellow bricks
  bricks.push(vector.create(264, 58, "#f0f03a"));
  bricks.push(vector.create(264, 89, "#f0f03a"));
  bricks.push(vector.create(204, 58, "#f0f03a"));
  bricks.push(vector.create(204, 27, "#f0f03a"));

  bricks.push(vector.create(500, 58, "#f0f03a"));
  bricks.push(vector.create(500, 89, "#f0f03a"));
  bricks.push(vector.create(559, 58, "#f0f03a"));
  bricks.push(vector.create(559, 27, "#f0f03a"));

  // Make bottom bricks
  bricks.push(vector.create(205, 337, "#9f9da0"));
  bricks.push(vector.create(559, 337, "#9f9da0"));

  bricks.push(vector.create(205, 368, "#9f9da0"));
  bricks.push(vector.create(264, 368, "#9f9da0"));

  bricks.push(vector.create(500, 368, "#9f9da0"));
  bricks.push(vector.create(559, 368, "#9f9da0"));

  // Make side bricks
  bricks.push(vector.create(146, 182, "#9f9da0"));
  bricks.push(vector.create(146, 213, "#9f9da0"));
  bricks.push(vector.create(146, 244, "#9f9da0"));

  bricks.push(vector.create(618, 182, "#9f9da0"));
  bricks.push(vector.create(618, 213, "#9f9da0"));
  bricks.push(vector.create(618, 244, "#9f9da0"));

  bricks.push(vector.create(87, 213, "#9f9da0"));
  bricks.push(vector.create(87, 244, "#9f9da0"));
  bricks.push(vector.create(87, 275, "#9f9da0"));
  bricks.push(vector.create(87, 306, "#9f9da0"));
  bricks.push(vector.create(87, 337, "#9f9da0"));

  bricks.push(vector.create(677, 213, "#9f9da0"));
  bricks.push(vector.create(677, 244, "#9f9da0"));
  bricks.push(vector.create(677, 275, "#9f9da0"));
  bricks.push(vector.create(677, 306, "#9f9da0"));
  bricks.push(vector.create(677, 337, "#9f9da0"));

  let mouseX = player.getX();

  let canvasPosition = canvas.getBoundingClientRect();

  document.addEventListener("mousemove", function (event) {
    mouseX = event.x - canvasPosition.left;
  });

  let d,
    t,
    f,
    up,
    isShaking = false;

  function shake() {
    d = Math.random() * 3 + 1;
    t = f = d;
    up = false;
    isShaking = true;
    shakeScreen();
  }

  function shakeScreen() {
    if (isShaking == true) {
      context.save();
      if (up == false) {
        d -= t;
      } else {
        d += t;
      }

      if (d < -f) {
        up = true;
      } else if (d > f) {
        up = false;
      }

      if (t >= 0) {
        t -= 0.217;
      } else {
        isShaking = false;
        t = 0;
        context.translate(0, 0);
      }

      context.translate(d, d);
      requestAnimationFrame(shakeScreen);
    }
  }

  function blockCollision(x1, y1, x2, y2, width, height, i) {
    if (
      x1 + ball.radius > x2 &&
      x1 - ball.radius < x2 + width &&
      y1 + ball.radius > y2 &&
      y1 - ball.radius < y2 + height
    ) {
      if (y1 > y2 + height && x1 + ball.radius > x2 && x1 - ball.radius < x2 + width) {
        bounce("y");
        ball.position.addTo(vector.create(0, 5));
      }
      // up
      else if (y1 < y2 && x1 + ball.radius > x2 && x1 - ball.radius < x2 + width) {
        bounce("y");
        ball.position.addTo(vector.create(0, -5));
      }
      // left
      else if (x1 < x2 && y1 + ball.radius > y2 && y1 - ball.radius < y2 + height) {
        bounce("x");
        ball.position.addTo(vector.create(-5, 0));
      }
      // right
      else if (x1 > x2 + width && y1 + ball.radius > y2 && y1 - ball.radius < y2 + height) {
        bounce("x");
        ball.position.addTo(vector.create(5, 0));
      }
      effects.push(effect.create(x1, y1));
      if (isShaking == false) shake();
      return 1;
    } else return 0;
  }

  function windowCollision() {
    if (ball.position.getX() - ball.radius < 0 || ball.position.getX() + ball.radius > width) {
      if (ball.position.getX() - ball.radius <= 0) {
        ball.position.addTo(vector.create(2, 0));
      } else {
        ball.position.addTo(vector.create(-2, 0));
      }
      effects.push(effect.create(ball.position.getX(), ball.position.getY()));
      if (isShaking == false) shake();
      bounce("x");
    } else if (ball.position.getY() + ball.radius > height || ball.position.getY() - ball.radius < 0) {
      if (ball.position.getY() + ball.radius >= height) {
        ball.position.addTo(vector.create(0, -2));
      } else {
        ball.position.addTo(vector.create(0, 2));
      }
      effects.push(effect.create(ball.position.getX(), ball.position.getY()));
      if (isShaking == false) shake();
      bounce("y");
    }
  }
  function bounce(val) {
    switch (val) {
      case "x":
        ball.velocity.setX(-ball.velocity.getX());
        ball.velocity.setAngle(ball.velocity.getAngle() + Math.random() * 0.34 - 0.17); // 0.17rad = 10deg
        break;
      case "y":
        ball.velocity.setY(-ball.velocity.getY());
        ball.velocity.setAngle(ball.velocity.getAngle() + Math.random() * 0.34 - 0.17);
        break;
    }
  }

  function leaveTrail() {
    trail.push([ball.position.getX(), ball.position.getY()]);

    for (let i = 0; i < trail.length; i++) {
      context.beginPath();
      let rad = 2 + i / 10;
      context.fillStyle = "rgba(228, 47, 69, 0.05)";
      context.arc(trail[i][0], trail[i][1], rad, 0, Math.PI * 2, false);
      context.fill();
    }
    if (trail.length > 50) {
      trail.splice(0, 1);
    }
  }

  function makeEffect() {
    for (let i = 0; i < effects.length; i++) {
      let item = effects[i];
      context.beginPath();
      context.arc(item.x, item.y, item.t * 15 + 10, 0, Math.PI * 2, false);
      context.fillStyle = "rgba(228, 47, 69, " + (item.t * -0.25 + 0.25) + ")";
      context.fill();
      if (item.t < 1) item.t += 0.05;
      if (item.t >= 2) {
        // make splice delay to prevent flickering
        effects.splice(i, 1);
      }
    }
  }

  function update() {
    context.clearRect(0, 0, width, height);

    player.setX(Math.min(Math.max(mouseX - playerWidth / 2, 0), width - playerWidth));

    for (let i = 0; i < bricks.length; i++) {
      if (
        blockCollision(
          ball.position.getX(),
          ball.position.getY(),
          bricks[i].getX(),
          bricks[i].getY(),
          brickWidth,
          brickHeight,
          i
        ) === 1
      ) {
        bricks.splice(i, 1);
        if (bricks.length === 0) {
          endSound.play();
        }
        break;
      }
    }
    blockCollision(
      ball.position.getX(),
      ball.position.getY(),
      player.getX(),
      player.getY(),
      playerWidth,
      playerHeight,
      40
    );
    windowCollision();

    context.fillStyle = player.color;
    context.fillRect(player.getX(), player.getY(), playerWidth, playerHeight);

    for (let i = 0; i < bricks.length; i++) {
      context.fillStyle = "#000";
      context.fillRect(bricks[i].getX() + 2, bricks[i].getY(), brickWidth, brickHeight + 2);
      context.fillStyle = bricks[i].color;
      context.fillRect(bricks[i].getX(), bricks[i].getY(), brickWidth, brickHeight);
    }

    ball.update();
    leaveTrail();

    context.beginPath();
    context.fillStyle = "#e42f45";

    context.arc(ball.position.getX(), ball.position.getY(), ball.radius, 0, Math.PI * 2, false);

    context.fill();

    makeEffect();

    if (bricks.length === 0) {
      context.fillStyle = "#000";
      context.font = "65px Oswald";
      context.textAlign = "center";
      for (let i = 0; i < 4; i++) {
        context.fillText("You won!", width / 2 + i, height / 2 + i);
      }
      context.fillStyle = "#fff";
      context.fillText("You won!", width / 2, height / 2);
    }

    context.restore();

    requestAnimationFrame(update);
  }

  update();
};
