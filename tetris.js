var version = "0.0.1"
var is_playing = false;

init();
function init() {
    background_canvas = document.getElementById("background_canvas");
    background_ctx = background_canvas.getContext("2d");
    main_canvas = document.getElementById("main_canvas");
    main_ctx = main_canvas.getContext("2d");

    document.addEventListener("keydown", key_pressed, false);
    document.addEventListener("keyup", key_released, false);

    requestframe = (function () {
        return window.requestAnimationFrame
    })();

    shape = new Shape;
    load_media();
}

function load_media() {
    square = new Image();
    square.src = "images/square.png";
    background = new Image();
    background.addEventListener("load",function (){
        background_ctx.drawImage(background,0,0);
    },false)
    background.src = "images/background.png";
}

function Shape() {
    this.drawX = 50;
    this.drawY = 50;
    this.speed = 5;
    this.is_downkey = false;
    this.is_spacebar = false;
    this.is_leftkey = false;
    this.is_rightkey = false;
}

Shape.prototype.draw = function () {

    this.check_keys();
    main_ctx.drawImage(square, this.drawX, this.drawY);
};

Shape.prototype.check_keys = function () {
    if (this.is_downkey == true) {
        this.drawY += this.speed;
    }
    if (this.is_spacebar == true) {

    }
    if (this.is_leftkey == true) {
        this.drawX -= this.speed;
    }
    if (this.is_rightkey == true) {
        this.drawX += this.speed;
    }
}

function loop(){
    main_ctx.clearRect(0,0,300,600);
    shape.drawY+=0.5;
    shape.draw();

    if(is_playing) {
        window.requestframe(loop);
    }
}
function start_loop(){
    is_playing =true;
    loop();


}

function key_pressed(e) {
    var key_id = e.keyCode;

    if (key_id == 40) {//down key
        shape.is_downkey = true;
        e.preventDefault();
    }
    if (key_id == 37) {//left key
        shape.is_leftkey = true;
        e.preventDefault();
    }
    if (key_id == 39) {//right key
        shape.is_rightkey = true;
        e.preventDefault();
    }
    if (key_id == 32) {//space bar
        shape.is_spacebar = true;
        e.preventDefault();
    }
}

function key_released(e) {
    var key_id = e.keyCode;

    if (key_id == 40) {//down key
        shape.is_downkey = false;
        e.preventDefault();
    }
    if (key_id == 37) {//left key
        shape.is_leftkey = false;
        e.preventDefault();
    }
    if (key_id == 39) {//right key
        shape.is_rightkey = false;
        e.preventDefault();
    }
    if (key_id == 32) {//space bar
        shape.is_spacebar = false;
        e.preventDefault();
    }
}
start_loop();