var requestAnimFrame = (function(){
    return window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(callback){
            window.setTimeout(callback, 1000 / 60);
        };
})();

// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 480;
document.body.appendChild(canvas);

// The main game loop
var lastTime;
function main() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var now = Date.now();
    var dt = (now - lastTime) / 1000.0;

    update(dt);

    draw_back();

    render(dt);

    lastTime = now;
    requestAnimFrame(main);

}

function init() {
    lastTime = Date.now();
   // grassPattern = ctx.createPattern(resources.get('img/grass.png'),'repeat');
   // grassStartPattern = ctx.createPattern(resources.get('img/grass-start.png'),'repeat');

    main();
}

function draw_back() {
    //background color
    ctx.fillStyle = '#9fc5ed';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    //hero health
    ctx.fillStyle = '#423384';
    ctx.fillRect(20, 20, 200, 25);
    //enemy health
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(canvas.width-220, 20, 200, 25);
    //grass start
    ctx.drawImage(grass_start, 0, canvas.height-96);
    //all grass
    for(var c_width = 92; c_width < canvas.width; c_width+=96){
        ctx.drawImage(grass, c_width, canvas.height-96);
    }
    //tree
    ctx.drawImage(tree, canvas.width-300, canvas.height-338);
    //small tree
    ctx.drawImage(tree_small, 200, canvas.height-230);
    //fallen tree
    ctx.drawImage(tree_fallen, 400, canvas.height-125);
    //fallen tree 2
    ctx.drawImage(tree2, 320, canvas.height-128);
    //mushrooms
    ctx.drawImage(mushrooms, 190, canvas.height-118);
    ctx.drawImage(mushrooms, canvas.width-200, canvas.height-118);
}

//resources.load([
//    'img/stay.png',
//    'img/walk.png',
//    'img/run.png',
//    'img/attack.png',
//    'img/terrain.png',
//    'img/grass.png',
//    'img/grass-start.png',
//    'img/tree.png',
//    'img/tree2.png',
//    'img/tree-fallen.png',
//    'img/mushrooms.png'
//]);
//resources.onReady(init);

//var all_images = {
//    grass_start : 'img/grass-start.png',
//    grass : 'img/grass.png',
//    tree : 'img/tree.png',
//    tree_small : 'img/tree-small.png',
//    tree_fallen : 'img/tree-fallen.png',
//    tree2 : 'img/tree2.png',
//    mushrooms : 'img/mushrooms.png'
//};
//for (var key in all_images) {
//    var it = key;
//    var it = new Image();
//    console.log(it);
//    key.src = all_images[key];
//}


var grass_start = new Image();
var grass = new Image();
var tree = new Image();
var tree_small = new Image();
var tree_fallen = new Image();
var tree2 = new Image();
var mushrooms = new Image();
grass_start.src = 'img/background/grass-start.png';
grass.src = 'img/background/grass.png';
tree.src = 'img/background/tree.png';
tree_small.src = 'img/background/tree-small.png';
tree_fallen.src = 'img/background/tree-fallen.png';
tree2.src = 'img/background/tree2.png';
mushrooms.src = 'img/background/mushrooms.png';

// Game state
var player = {
    pos: [20, 262],
    health: 100,
    action: 'stay',
    stay: new Sprite('img/hero/stay.png', [0, 0], [83, 141], 6, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
    walk_right: new Sprite('img/hero/walk.png', [15, 0], [99, 141], 10, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
    walk_left: new Sprite('img/hero/walk.png', [0, 131], [99, 141], 10, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
    run_right: new Sprite('img/hero/run.png', [0, 131], [100, 141], 14, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
    run_left: new Sprite('img/hero/run.png', [0, 0], [100, 141], 14, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
    attack: new Sprite('img/hero/attack.png', [-9, 0], [132.7, 131], 24, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
};
var lastAttack = Date.now();
var playerSpeed = 160;
var actions = player.action;


var enemy = {
    pos: [canvas.width-150, 280],
    action: 'walk',
    walk: new Sprite('img/enemy/skeleton.png', [0, 110], [109, 110], 4, [0,1, 2, 3]),
    attack: new Sprite('img/enemy/skeleton.png', [0, 364], [109, 110], 6, [0, 1, 2, 3]),
    die: new Sprite('img/enemy/skeleton.png', [0, 650], [109, 110], 8, [0, 1, 2, 3, 4],'horizontal',true),
    health: 100
};
var enemySpeed = 80;
var enemy_actions = enemy.action;

function update(dt) {

    updateEntities(dt);

    handleInput(dt);
}

function checkCollisions(dt) {
    //check for text
    checkText();

    //check for enemy position
    if( player.pos[0] + 70 < enemy.pos[0] ){
        enemy_actions = 'walk';
        enemy.pos[0] -= enemySpeed * dt;
    } else{
        enemy_actions = 'attack';
    }
    //check for enemyhealth
    if( enemy.health == 0 ){
        enemy_actions = 'die';
    }
}
function checkText() {
    if( input.isDown('LEFT') && player.pos[0] < 21 ){
        ctx.font = "20px Comic Sans MS";
        ctx.fillStyle = "#ff0000";
        ctx.fillText("I can`t leave!",60,280);
    }
    //hero health text
    ctx.font = "22px Comic Sans MS";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(''+player.health+'%',25,41);
    //enemy health text
    ctx.font = "22px Comic Sans MS";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(''+enemy.health+'%',canvas.width-80,41);
}

function handleInput(dt) {
    if(input.isDown('DOWN') || input.isDown('s')) {
        //player.pos[1] += playerSpeed * dt;
    }

    if(input.isDown('UP') || input.isDown('w')) {
        //player.pos[1] -= playerSpeed * dt;
    }

    if(input.isDown('LEFT') || input.isDown('a')) {
        if(player.pos[0] < 21) {
            player.pos[0] = 20;
            actions = 'stay';
        } else{
            player.pos[0] -= playerSpeed * dt;
            actions = 'walk_left';
        }
    }

    if(input.isDown('RIGHT') || input.isDown('d')) {
        player.pos[0] += playerSpeed * dt;
        actions = 'walk_right';
    }

    if(input.isDown('SPACE') ){
        actions = 'attack';
        if( enemy.pos[0] - player.pos[0] < 120 && Date.now() - lastAttack > 800 ){
            if( enemy.health == 0 ){
               // enemy_actions = 'die';
                console.log(enemy_actions);
            } else{
                enemy.health -=25;
                console.log(enemy.health);
            }
            lastAttack = Date.now();
        }
    }
}

function updateEntities(dt) {
    // Update the player sprite animation
    player[actions].update(dt);

    enemy[enemy_actions].update(dt);

}

// Draw everything
function render(dt) {
    // Render the player if the game isn't over


    checkCollisions(dt);
    // ctx.fillStyle = grassPattern;
    // ctx.fillRect(92, canvas.height-96, canvas.width, 96);
    // ctx.fillStyle = grassStartPattern;
    // ctx.fillRect(0, canvas.height-96, 92, 96);

    //renderGrass();

    renderEntity(player,actions);

    renderEntity(enemy,enemy_actions);

}

// function renderGrass() {
//     for(var c_width = 0; c_width < canvas.width; c_width+=96){
//         ctx.drawImage(im, c_width, canvas.height-96);
//     }
// }

function renderEntity(entity,actions) {
    ctx.save();
    ctx.translate(entity.pos[0], entity.pos[1]);
    entity[actions].render(ctx);
    ctx.restore();
}

init();