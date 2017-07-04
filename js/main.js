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
    color: '#481cd5',
    speed: 160,
    action: 'stay',
    stay: new Sprite('img/hero/stay.png', [0, 0], [83, 141], 6, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
    walk_right: new Sprite('img/hero/walk.png', [15, 0], [99, 141], 10, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
    walk_left: new Sprite('img/hero/walk.png', [0, 131], [99, 141], 10, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
    run_right: new Sprite('img/hero/run.png', [0, 131], [100, 141], 14, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
    run_left: new Sprite('img/hero/run.png', [0, 0], [100, 141], 14, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
    attack: new Sprite('img/hero/attack.png', [-9, 0], [132.7, 131], 24, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
    death: new Sprite('img/hero/death.png', [0, 0], [163, 131], 10, [0, 1, 2, 3, 4, 5, 6, 7, 8],'horizontal',true)
};
var lastAttack = Date.now();
var actions = player.action;

var enemy = {
    pos: [canvas.width-150, 280],
    color: '#ff0000',
    health: 100,
    speed: 80,
    action: 'walk',
    stay: new Sprite('img/enemy/skeleton.png', [0, -10], [106, 110], 4, [0,1, 2, 3]),
    walk: new Sprite('img/enemy/skeleton.png', [0, 110], [109, 110], 4, [0,1, 2, 3]),
    attack: new Sprite('img/enemy/skeleton.png', [0, 364], [109, 110], 6, [0, 1, 2, 3]),
    die: new Sprite('img/enemy/skeleton.png', [0, 650], [109, 110], 8, [0, 1, 2, 3, 4],'horizontal',true)
};

var enemy_actions = enemy.action;
var enemyState = 1;
var deathTime;
var lastEnemyAttack = Date.now();
var curentTime = Date.now();

function update(dt) {

    updateEntities(dt);

    handleInput(dt);
}

function checkCollisions(dt) {
    //all enemy logic and actions
    enemyActions(dt);

    //check for text
    checkText();

    //check enemy spawn
    checkEnemySpawn();

}
function enemyActions(dt) {
    //check for Player Health
    if( player.health == 0 ){
        enemy_actions = 'stay';
        actions = 'death';
    } else{
        //check for enemy position
        if( player.pos[0] + 70 < enemy.pos[0] ){
            enemy_actions = 'walk';
            enemy.pos[0] -= enemy.speed * dt;
        } else {
            enemy_actions = 'attack';
            if( player.pos[0] + 70 >= enemy.pos[0] && Date.now() - lastEnemyAttack > 800 ){
                //check for health
                if( player.health != 0 ){
                    //check for state
                    if( enemyState ){
                        player.health -=10;
                        lastEnemyAttack = Date.now();
                    }
                }
            }
        }
    }
    //check for enemy health
    if( enemy.health == 0 ){
        enemy_actions = 'die';
        if( enemyState ){
            deathTime = Date.now();
        }
        enemyState = 0;
    }
}
function checkText() {
    if( input.isDown('LEFT') && player.pos[0] < 21 ){
        ctx.font = "20px Comic Sans MS";
        ctx.fillStyle = "#ff0000";
        ctx.fillText("I can`t leave!",60,280);
    }
}
function checkEnemySpawn() {
    if( !enemyState && Date.now() - deathTime > 3000 ){
        enemy.pos[0] = canvas.width + 100;
        enemy.health = 100;
        enemyState = 1;
    }
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
            player.pos[0] -= player.speed * dt;
            actions = 'walk_left';
        }
    }

    if(input.isDown('RIGHT') || input.isDown('d')) {
        if( enemy.pos[0] - player.pos[0] > 70 ){
            player.pos[0] += player.speed * dt;
            actions = 'walk_right';
        } else{
            actions = 'stay';
        }
    }

    if(input.isDown('SPACE') ){
        actions = 'attack';
        if( enemy.pos[0] - player.pos[0] < 120 && Date.now() - lastAttack > 800 ){
            if( enemy.health != 0 ){
                enemy.health -=25;
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

    renderEntity(player,actions,1);

    renderEntity(enemy,enemy_actions,0);

}

var bar_start,
    bar_text_start;

function renderEntity(entity,actions,type) {
    ctx.save();
    ctx.translate(entity.pos[0], entity.pos[1]);
    entity[actions].render(ctx);
    ctx.restore();
    bar_start = 20;
    bar_text_start = 20;
    if( !type){
        bar_start = canvas.width-220;
        bar_text_start = canvas.width-220;
    }
    //health
    ctx.fillStyle = entity.color;
    ctx.fillRect(bar_start, 35, entity.health*2, 25);
    //health text
    ctx.font = "21px Comic Sans MS";
    ctx.fillStyle = "#000000";
    if( entity.health !=0 ){
        ctx.fillText(''+entity.health+'%',bar_text_start,30);
    }
}

init();