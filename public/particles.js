var canvas;
var player = {};
var other = {};
var bullet = [];
var otherbullet = {};
var playerSize = 30;
var socket;
var username = getRandomInt(255);
var maxX = 880;
var maxY = 540;
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function setup() {
	player = newPlayer();
    canvas = createCanvas(880, 540);
    canvas.parent('mainCanvas');
    frameRate(60);
	strokeWeight(1);
	stroke(0);
	socket = io.connect('http://localhost:3000');
	socket.emit('setUsername',{name:username});
    socket.on('other', function(data) {
		var no = data.id;
		other[no] = data.data;		
    });	
    socket.on('otherbullet', function(data) {
		var no = data.id;
		otherbullet[no] = data.data;		
    });		
	socket.on('logout', function(data) {
		console.log(data.id);
		delete other[data.id];
		delete otherbullet[data.id];
    });

}
function newPlayer(){
	var player = {
		name:username,
		posX:getRandomInt(maxX+30)-60,
		posY:getRandomInt(maxY+30)-60,
		motionX:0,
		motionY:0,
		heal:20,
		color: username
	}
	return player;
}
function mousePressed(){
	var pos = createVector(player.posX,player.posY);
	var mouse = createVector(mouseX,mouseY);
	var dis = mouse.dist(pos);
	var vec = createVector((mouse.x-pos.x)/dis,(mouse.y-pos.y)/dis);
	var bl = {
		name:username,
		posX:pos.x,
		posY:pos.y,
		motionX:vec.x,
		motionY:vec.y,
		color:player.color		
	}
	bullet.push(bl);
}
function draw() {
	clear();
	playerDraw(player);	
	bulletDraw(bullet);
	playerDrawOther();
	bulletDrawOther();
	bulletUpdate();
	playerUpdate();	
	dameUpdate();
}
var state = {l:false,r:false,u:false,d:false};

function playerUpdate(){	
	var mx = 0;
	var my = 0;
	if(state.u){my-=1;}
	if(state.d){my+=1;}
	if(state.l){mx-=1;}
	if(state.r){mx+=1;}
	player.motionX = mx;
	player.motionY = my;
	if ((player.posX + player.motionX<width-15)&&(player.posX + player.motionX>15)){player.posX += player.motionX;}	
	if ((player.posY + player.motionY<height-15)&&(player.posY + player.motionY>15)){player.posY += player.motionY;}
	socket.emit('other',player);
}
window.addEventListener("keydown", function (e) {
	if (e.which === 38) {
		state.u=true;//up
	} else if (e.which === 39) {
		state.r=true;//rignt
	} else if (e.which === 40) {
		state.d=true;//down
	} else if (e.which === 37) {
		state.l=true;//left
	}
});
window.addEventListener("keyup", function (e) {
	if (e.which === 38) {
		state.u=false;//up
	} else if (e.which === 39) {
		state.r=false;//rignt
	} else if (e.which === 40) {
		state.d=false;//down
	} else if (e.which === 37) {
		state.l=false;//left
	}
});	
function playerDraw(data){
	colorMode(HSB, 255);	
	var name = data.name;
	var posx = data.posX;
	var posy = data.posY;
	var cl = data.color;
	var heath = data.heal;
	textSize(14);
	textAlign(CENTER, CENTER);
	fill(cl,240,140);
	ellipse(posx,posy,playerSize,playerSize);
	rect(posx-playerSize/2,posy + playerSize/2+5,playerSize*((heath/20)) ,playerSize/6);	
	fill(0,0,255);
	text(name, posx, posy - playerSize/2 -10);
}
function playerDrawOther(){
	for(var key in other){
		playerDraw(other[key]);
	}
}
function bulletDraw(data){
	colorMode(HSB, 255);
	for(var i=0;i<data.length;i++){		
		var posx = data[i].posX;
		var posy = data[i].posY;
		var cl = data[i].color;
		fill(cl,240,140);
		ellipse(posx,posy,5,5);
	}
}
function bulletDrawOther(){
	for(var key in otherbullet){
		var bl = otherbullet[key];
		bulletDraw(bl);
	}
}
function bulletUpdate(){
	for(var i=0;i<bullet.length;i++){
		bullet[i].posX += bullet[i].motionX*2;
		bullet[i].posY += bullet[i].motionY*2;
		if((bullet[i].posX<0)||(bullet[i].posX>width)||(bullet[i].posY<0)||(bullet[i].posY>height)){
			bullet.splice(i,1);
		}
	}
	socket.emit('otherbullet',bullet);
}
function dameUpdate(){
	for(var key in other){
		var pl = other[key];
		var px = pl.posX;
		var py = pl.posY;		
		for(var i=0;i<bullet.length;i++){
			var bx = bullet[i].posX;
			var by = bullet[i].posY;
			var dis = createVector(bx,by).dist(createVector(px,py));
			if (dis<=15){
				if (player.heal<20){player.heal+=1;}
				bullet.splice(i,1);
			}
		}
	}
	for(var key in otherbullet){
		var bl = otherbullet[key];
		for(var i=0;i<bl.length;i++){
			var bx = bl[i].posX;
			var by = bl[i].posY;
			var px = player.posX;
			var py = player.posY;
			var dis = createVector(bx,by).dist(createVector(px,py));
			if (dis<=15){
				player.heal -=1;
				if(player.heal<1){
					player = newPlayer();
				}
			}
		}
	}
}