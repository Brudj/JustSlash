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

//initialize
var gameOver = true;
function init() {
    lastTime = Date.now();

    document.getElementById('start').addEventListener('click', function() {
        start();
    });

    //start();
    main();
}

// The main game loop
var lastTime;
function main() {
    // ctx.clearRect(0, 0, canvas.width, canvas.height);
    var now = Date.now();
    var dt = (now - lastTime) / 1000.0;

    update(dt);

    draw_back();

    render(dt);

    lastTime = now;
    requestAnimFrame(main);

}

//refresh all function
function start(){
    document.getElementById('start-overlay').style.display = 'none';
    player.health = 100;
    actions = 'stay';
    player.pos = [20, 262];
    enemy.pos = [canvas.width-150, 280];
    enemy.health = 100;
    gameOver = false;
}

//gameOver function
function finish(){
    document.getElementById('start-overlay').style.display = 'block';
    document.getElementById('message-start').style.display = 'none';
    document.getElementById('message-end').style.display = 'block';
    gameOver = true;
}

//draw all background
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

// player object
var player = {
    pos: [20, 262],
    health: 100,
    mana : 100,
    color: '#481cd5',
    speed: 160,
    action: 'stay',
    bar_start: 20,
    stay: new Sprite('img/hero/stay.png', [0, 0], [83, 141], 6, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
    walk_right: new Sprite('img/hero/walk.png', [15, 0], [99, 141], 10, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
    walk_left: new Sprite('img/hero/walk.png', [0, 131], [99, 141], 10, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
    run_right: new Sprite('img/hero/run.png', [0, 131], [100, 141], 14, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
    run_left: new Sprite('img/hero/run.png', [0, 0], [100, 141], 14, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
    attack: new Sprite('img/hero/attack.png', [-9, 0], [132.7, 131], 24, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
    spell: new Sprite('img/hero/summon.png', [0, 0], [111.44, 131], 8, [8, 7, 6, 5, 4, 3, 2, 1, 0]),
    damage: new Sprite('img/hero/hit.png', [0, 0], [113, 131], 3, [0,1]),
    death: new Sprite('img/hero/hero_death.png', [0, 0], [159.6, 131], 10, [0, 1, 2, 3, 4, 5],'horizontal',true,true,PlayerDeathTime,1)
};
var lastAttack = Date.now(),
    actions = player.action,
    PlayerDeathTime;

//enemy object
var enemy = {
    pos: [canvas.width, 280],
    health: 100,
    color: '#ff0000',
    speed: 80,
    action: 'walk',
    state : 1,
    bar_start: canvas.width-220,
    stay: new Sprite('img/enemy/skeleton.png', [0, -10], [106, 110], 4, [0,1, 2, 3]),
    walk: new Sprite('img/enemy/skeleton.png', [0, 110], [109, 110], 4, [0,1, 2, 3]),
    attack: new Sprite('img/enemy/skeleton.png', [0, 364], [109, 110], 6, [0, 1, 2, 3]),
    damage: new Sprite('img/enemy/skeleton.png', [0, 230], [109, 135], 4, [0,1],'vertical'),
    die: new Sprite('img/enemy/skeleton.png', [0, 650], [109, 110], 8, [0,1,2],'horizontal',true,true,deathTime)
};

var lastEnemyAttack = Date.now(),
    enemy_actions = enemy.action,
    deathTime;

var explosions = {
    pos: [enemy.pos[0], 262],
    explosions : new Sprite('img/enemy/skeleton.png', [0, 510], [109, 110], 4, [0,1])
};

function update(dt) {

    updateEntities(dt);

    if( !gameOver ){
        handleInput(dt);
    }

}

function updateEntities(dt) {
    // Update the player sprite animation
    player[actions].update(dt);

    enemy[enemy_actions].update(dt);

    explosions.explosions.update(dt);
}

function handleInput(dt) {
    if(input.isDown('DOWN')) {
        //player.pos[1] += playerSpeed * dt;
    }

    if(input.isDown('UP')) {
        actions = 'spell';
    }

    if(input.isDown('LEFT')) {
        if(player.pos[0] < 21) {
            player.pos[0] = 20;
            actions = 'stay';
        } else{
            player.pos[0] -= player.speed * dt;
            actions = 'walk_left';
        }
    }

    if(input.isDown('RIGHT')) {
        if( enemy.pos[0] - player.pos[0] > 70){
            player.pos[0] += player.speed * dt;
            actions = 'walk_right';
        } else{
            actions = 'stay';
        }
    }

    if(input.isDown('SPACE') ){
        actions = 'attack';
        if( enemy.pos[0] - player.pos[0] < 120 && Date.now() - lastAttack > 800 ){
            if( enemy.health > 0 ){
                enemy.health -=25;
            }
            lastAttack = Date.now();
        }
    }
}

function checkAll(dt) {
    //all enemy logic and actions

    enemyActions(dt);

    //all player actions
    playerActions();

    //check for text
    checkAllText();

    //check enemy spawn
    checkEnemySpawn();

}

//all players actions
function playerActions() {
    //check for player health
    if (player.health > 0) {
        //check for mana
        if( player.mana < 100 && !input.isDown('UP') ){
            player.mana +=0.05;
        }
        //check for spell use
        if( input.isDown('UP') && player.mana > 0 && enemy.state !== 0 && Date.now() - lastAttack > 10 ){
            enemy.health -=2;
            player.mana -=1;
            lastAttack = Date.now();
            renderEntity(explosions,'explosions');
           // console.log(enemy.pos[0]);
          //  explosions.explosions.render(ctx);
        }
    } else{
        if ( actions != 'death' ){
            PlayerDeathTime = Date.now();
            actions = 'death';
        }
        finish();
    }
}

function enemyActions(dt) {
    //check for Player Health
    if( player.health > 0 ){
        //check for enemy health
        if( enemy.health > 0 ){
            if( !gameOver ){
                //check for enemy position
                if( player.pos[0] + 70 < enemy.pos[0] ){
                    enemy_actions = 'walk';
                    explosions.pos[0] = enemy.pos[0];
                     enemy.pos[0] -= enemy.speed * dt;
                } else {
                    if( player.pos[0] + 70 >= enemy.pos[0] && Date.now() - lastEnemyAttack > 800 ){
                        //check for player attack
                        if( input.isDown('SPACE') ){
                            enemy_actions = 'damage';
                        } else{
                            //check for health
                            if( player.health != 0 ){
                                enemy_actions = 'attack';
                                actions = 'damage';
                                player.health -=10;
                                lastEnemyAttack = Date.now();
                            }
                        }

                    }
                }
            }
        } else{
            if( enemy.state ){
                enemy_actions = 'die';
                deathTime = Date.now();
            }
            enemy.state = 0;
        }
    } else{
        enemy_actions = 'stay';
    }
}
function checkAllText() {
    if( !gameOver ){
        if( input.isDown('LEFT') && player.pos[0] < 21 ){
            ctx.font = "20px Comic Sans MS";
            ctx.fillStyle = "#ff0000";
            ctx.fillText("I can`t leave!",60,280);
        }

        ctx.font = "18px Comic Sans MS";
        ctx.fillStyle = "#000000";

        //player text
        if( player.health > 0 ){
            //player health
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(player.bar_start, 35, player.health*2, 25);
            ctx.fillText(''+player.health+'%',player.bar_start,30);
            //player mana
            ctx.fillStyle = player.color;
            ctx.fillRect(player.bar_start, 65, player.mana*2, 15);
            ctx.fillText(''+Math.round(player.mana)+'%',player.bar_start,100);
        }

        //enemy text
        if( enemy.health > 0 ){
            ctx.fillStyle = '#ff0000';
            ctx.fillText(''+enemy.health+'%',enemy.bar_start,30);
            ctx.fillRect(enemy.bar_start, 35, enemy.health*2, 25);
        }
    }
}
//enemy spawn timer
function checkEnemySpawn() {
    if( !enemy.state ){
        if( Date.now() - deathTime > 2900 ){
            enemy.pos[0] = canvas.width;
            enemy.health = 100;
            enemy.state = 1;
        }
    }
}


// Draw everything
function render(dt) {
    // Render the player if the game isn't over

    renderEntity(player,actions);

    renderEntity(enemy,enemy_actions);

    checkAll(dt);


}

function renderEntity(entity,actions) {
    ctx.save();
    ctx.translate(entity.pos[0], entity.pos[1]);
    entity[actions].render(ctx);
    ctx.restore();
}

init();