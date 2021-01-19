var vector = {
	x: 0,
	y: 0,
	color: "#353941",
	create: function(x, y){
		vec = Object.create(this);
		vec.setX(x);
		vec.setY(y);
		return vec;
	},
	getX: function(){
		return this.x;
	},
	getY: function(){
		return this.y;
	},
	setX: function(x){
		this.x = x;
	},
	setY: function(y){
		this.y = y;
	},
	getLength: function(){
		return Math.sqrt(this.x*this.x + this.y*this.y);
	},
	getAngle: function(){
		return Math.atan2(this.y, this.x);
	},
	setLength: function(length){
		var angle = this.getAngle();
		this.x = Math.cos(angle) * length;
		this.y = Math.sin(angle) * length;
	},
	setAngle: function(angle){
		var length = this.getLength();
		this.x = Math.cos(angle) * length;
		this.y = Math.sin(angle) * length;
	},
	addTo: function(vec2){
		 this.x += vec2.getX();
		 this.y += vec2.getY();
	},
	subtractBy: function(vec2){
		 this.x -= vec2.getX();
		 this.y -= vec2.getY();
	},
	multiplyBy: function(value){
		 this.x *= value;
		 this.y *= value;
	},
	divideBy: function(value){
		 this.x /= value;
		 this.y /= value;
	}
};

var particle = {
	position:null,
	velocity:null,
	mass:null,
	gravity:null,
	radius:0,
	create: function(x, y, speed, direction, grav){
		p = Object.create(this);
		p.position = vector.create(x,y);
		p.velocity = vector.create(0,0);
		p.velocity.setLength(speed);
		p.velocity.setAngle(direction);
		p.gravity = vector.create(0, grav || 0);
		return p;
	},
	accelerate: function(accel){
		this.velocity.addTo(accel);
	},
	update: function(){
		this.position.addTo(this.velocity);
		this.velocity.addTo(this.gravity);
	},
	angleTo: function(p2){
		return Math.atan2(p2.position.getY() - this.position.getY(),
							p2.position.getX() - this.position.getX());
	},
	distanceTo: function(p2){
		var pX = this.position.getX() - p2.position.getX(),
			pY = this.position.getY() - p2.position.getY();
		return Math.sqrt( pX*pX + pY*pY);
	},
	gravitateTo: function(p2){
		var grav = vector.create(0,0),
			dist = this.distanceTo(p2);

		grav.setLength(p2.mass / (dist*dist));
		grav.setAngle(this.angleTo(p2));

		this.velocity.addTo(grav);
	}
};