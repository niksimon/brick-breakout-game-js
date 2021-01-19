window.onload = function(){
	var canvas = document.getElementById("canvas"),
		context = canvas.getContext("2d"),
		width = canvas.width = 820,
		height = canvas.height = 560,
		nCols = 7,
		nRows = 5,
		player,
		ball,
		bricks = [],
		brickWidth = 56,
		brickHeight = 28,
		playerWidth = 120,
		playerHeight = 5,
		brickSep = (width - brickWidth*nCols) / (nCols+1),
		brickSpace = (width - brickSep) / nCols,
		mouseX, mouseY,
		trail = [],
		effects = [],
		colors = ["#353941", "#ff6575", "#9be8f9"],
		hitSound = ["audio/piano01.wav", "audio/piano02.wav"],
		endSound = new Audio("audio/end.wav");

		player = vector.create(width/2, 500);
		ball = particle.create(width/2 - 50, 320, 5, Math.random()*Math.PI/6 - Math.PI/12 + 4*Math.PI/9);
		ball.radius = 10;

		var effect = {
			x: 0,
			y: 0,
			t: 0,
			create: function(x, y){
				obj = Object.create(this);
				obj.x = x;
				obj.y = y;
				return obj;
			}
		};

		for(var i=0;i<nRows; i++){
			for(var j=0;j<nCols; j++){
				var brick = vector.create(brickSep + j*brickSpace + Math.random()*20-10, 45+i*40);
				var randomColor = Math.floor(Math.random()*3 + 1);
				brick.color = colors[randomColor - 1];
				bricks.push(brick);
				context.fillStyle = brick.color;
				context.fillRect(brick.getX(), brick.getY(), brickWidth, brickHeight);
			}
		}

		mouseX = player.getX(),
		mouseY = player.getY();

		document.addEventListener("mousemove", function(event){
			mouseX = event.clientX;
			mouseY = event.clientY;
		});
		
		var d, t, f, up, isShaking = false;

		function shake(){
			d = Math.random() * 3 + 1;
			t = f = d;
			up = false;
			isShaking = true;
			shakeScreen();
		}

		function shakeScreen(){
			if(isShaking == true){
				context.save();
				if(up == false){
					d -= t;		
				}
				else{
					d += t;
				}

				if(d < -f){
					up = true;
				}
				else if(d > f){
					up = false;
				}

				if(t >= 0){
					t -= 0.217;
				}
				else{
					isShaking = false;
					t = 0;
					context.translate(0, 0);
				}
				context.translate(d, d);
				requestAnimationFrame(shakeScreen);
			}
		}

		function playSound(){
			var n = Math.floor(Math.random()*2);
			var audio = new Audio(hitSound[n]);
			audio.play();
		}

		function blockCollision(x1, y1, x2, y2, width, height, i){
			if(x1 + ball.radius > x2 && x1 - ball.radius < x2 + width &&
				y1 + ball.radius > y2 && y1 - ball.radius < y2 + height){
					if(y1 > y2 + height && x1 + ball.radius > x2 &&
						x1 - ball.radius < x2 + width){
						bounce("y");
						ball.position.addTo(vector.create(0,5));
					}
					// up
					else if(y1 < y2 && x1 + ball.radius > x2 &&
						x1 - ball.radius < x2 + width){
						bounce("y");
						ball.position.addTo(vector.create(0,-5));
					}
					// left
					else if(x1 < x2 && y1 + ball.radius > y2 &&
						y1 - ball.radius < y2 + height){
						bounce("x");
						ball.position.addTo(vector.create(-5,0));
					}
					// right
					else if(x1 > x2 + width && y1 + ball.radius > y2 &&
						y1 - ball.radius < y2 + height){
						bounce("x");
						ball.position.addTo(vector.create(5,0));
					}
					playSound();
					effects.push(effect.create(x1, y1));
					if(isShaking == false)
						shake();
					return 1;	
			}
			else
				return 0;		
		}

		function windowCollision(){
			if(ball.position.getX() - ball.radius < 0 || ball.position.getX() + ball.radius > width){
				if(ball.position.getX() - ball.radius <= 0){
					ball.position.addTo(vector.create(2,0));
				}
				else{
					ball.position.addTo(vector.create(-2,0));
				}
				playSound();
				effects.push(effect.create(ball.position.getX(), ball.position.getY()));
				if(isShaking == false)
					shake();
				bounce("x");
			}
			else if(ball.position.getY() + ball.radius > height || ball.position.getY() - ball.radius < 0){
				if(ball.position.getY() + ball.radius >= height){
					ball.position.addTo(vector.create(0,-2));
				}
				else{
					ball.position.addTo(vector.create(0,2));
				}
				playSound();
				effects.push(effect.create(ball.position.getX(), ball.position.getY()));
				if(isShaking == false)
					shake();
				bounce("y");
			}
		}
		function bounce(val){
			switch(val){
				case "x":
					ball.velocity.setX(-ball.velocity.getX());
					ball.velocity.setAngle(ball.velocity.getAngle() + Math.random()*0.34 - 0.17); // 0.17rad = 10deg
					break;
				case "y":
					ball.velocity.setY(-ball.velocity.getY());
					ball.velocity.setAngle(ball.velocity.getAngle() + Math.random()*0.34 - 0.17);
					break;
			}
		}

		function leaveTrail(){
			trail.push([ball.position.getX(), ball.position.getY()]);

			for(var i=0;i<trail.length;i++){				
				context.beginPath();	
				var rad = 2 + i/10;
				context.fillStyle = "rgba(228, 47, 69, 0.05)";
				context.arc(trail[i][0], trail[i][1], rad,
					0, Math.PI*2, false);
				context.fill();
			}
			if(trail.length > 50){
				trail.splice(0,1);
			}
		}

		function makeEffect(){
			for(var i = 0; i < effects.length; i++){					
				var item = effects[i];
				context.beginPath();
				context.arc(item.x, item.y, item.t * 15 + 10, 0, Math.PI*2, false);
				context.fillStyle = "rgba(228, 47, 69, " + (item.t * (-0.25) + 0.25) + ")";
				context.fill();
				if(item.t < 1)
					item.t += 0.05;
				if(item.t >= 2) // make splice delay to prevent flickering
					effects.splice(i, 1);
			}
		}

		function update(){
			context.clearRect(0,0,width,height);
			context.fillStyle = "#FFFDE0";
			context.fillRect(0,0,width,height);

			player.setX(Math.min(Math.max(mouseX - playerWidth/2, 0), width-playerWidth));

			for(var i=0; i<bricks.length; i++){
				if(blockCollision(ball.position.getX(), ball.position.getY(),
					bricks[i].getX(), bricks[i].getY(), brickWidth, brickHeight, i) === 1){
					bricks.splice(i, 1);
					if(bricks.length === 0){
						endSound.play();
					}
					break;
				}
			}
			blockCollision(ball.position.getX(), ball.position.getY(), player.getX(), player.getY(), playerWidth, playerHeight, 40);
			windowCollision();

			context.fillStyle = player.color;
			context.fillRect(player.getX(), player.getY(), playerWidth, playerHeight);

			for(var i=0; i<bricks.length; i++){
				context.fillStyle = bricks[i].color;
				context.fillRect(bricks[i].getX(), bricks[i].getY(), brickWidth, brickHeight);
			}

			ball.update();
			leaveTrail();	

			context.beginPath();
			context.fillStyle = "#e42f45";
			
			context.arc(ball.position.getX(), ball.position.getY(), ball.radius,
				0, Math.PI*2, false);
			
			context.fill();

			makeEffect();

			if(bricks.length === 0){
				context.fillStyle = "#000";
				context.font = "65px Oswald";
				context.textAlign = "center";
				for(var i=0;i<4;i++){
					context.fillText("You won!", width/2+i, height/2+i);
				}
				context.fillStyle = "#fff";
				context.fillText("You won!", width/2, height/2);
			}

			context.restore();

			requestAnimationFrame(update);
		}

		update();
};

// Sounds:
// https://www.freesound.org/people/keinzweiter/
// https://www.freesound.org/people/pyzaist/sounds/118655/
//
//