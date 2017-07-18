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

// player object
var player = {
    pos: [20, 262],
    health: 100,
    mana : 100,
    color: '#481cd5',
    speed: 160,
    action: 'stay',
    bar_start: 20,
    distance: 0,
    kills: 0,
    stay: new Sprite('img/hero/hero.png', [0, 0], [83, 141], 6, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
    walk_right: new Sprite('img/hero/hero.png', [-5, 135], [99, 141], 10, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
    walk_left: new Sprite('img/hero/hero.png', [-10, 270], [99, 141], 10, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
    run_right: new Sprite('img/hero/hero.png', [0, 405], [100, 141], 14, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
    run_left: new Sprite('img/hero/hero.png', [0, 540], [100, 141], 14, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
    spell: new Sprite('img/hero/hero.png', [0, 667], [111.44, 131], 8, [8, 7, 6, 5, 4, 3, 2, 1, 0]),
    attack: new Sprite('img/hero/hero.png', [-8, 800], [132.7, 131], 24, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
    damage: new Sprite('img/hero/hero.png', [0, 935], [113, 131], 3, [0,1]),
    death: new Sprite('img/hero/hero.png', [-5, 1066], [159.6, 131], 10, [0, 1, 2, 3, 4, 5],'horizontal',true,true)
};
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
    die: new Sprite('img/enemy/skeleton.png', [0, 650], [109, 110], 8, [0,1,2],'horizontal',true,true)
};
//explosions
var explosions = {
    pos: [enemy.pos[0], 262],
    explosion : new Sprite('img/enemy/skeleton.png', [0, 510], [109, 110], 4, [0,1])
};

//background object
var background = {
    grass : {
        infinite: true,
        start: 92,
        pos : [92, canvas.height-96],
        src : 'img/background/grass.png'
    },
    grass_start : {
        infinite: false,
        pos : [0,canvas.height-96],
        src : 'img/background/grass-start.png'
    },
    tree : {
        infinite: false,
        pos : [canvas.width - Math.floor((Math.random() * canvas.width) + 1),canvas.height-338],
        src : 'img/background/tree.png'
    },
    tree_small : {
        infinite: false,
        pos : [canvas.width - Math.floor((Math.random() * canvas.width) + 1),canvas.height-230],
        src : 'img/background/tree-small.png'
    },
    tree_fallen : {
        infinite: false,
        pos : [canvas.width - Math.floor((Math.random() * canvas.width) + 1),canvas.height-125],
        src : 'img/background/tree-fallen.png'
    },
    tree2 : {
        infinite: false,
        pos : [canvas.width - Math.floor((Math.random() * canvas.width) + 1),canvas.height-128],
        src : 'img/background/tree2.png'
    },
    mushrooms : {
        infinite: false,
        pos : [canvas.width - Math.floor((Math.random() * canvas.width) + 1),canvas.height-118],
        src : 'img/background/mushrooms.png'
    }
};

//vars
var gameOver = true,
    lastTime,
    item,
    draw_start,
    text_show_time = Date.now(),
    text_show = false,
    text_target = 'player',
    text_type = 'physic',
    //player vars
    lastAttack = Date.now(),
    actions = player.action,
    PlayerDeathTime,
    //enemy vars
    lastEnemyAttack = Date.now(),
    enemy_actions = enemy.action,
    deathTime,
    //drop info
    drop = false,
    drop_type,
    //distance
    half = false;

//Start new game
function start(){
    document.getElementById('start-overlay').style.display = 'none';
    player.health = 100;
    player.mana = 100;
    actions = 'stay';
    player.pos = [20, 262];
    player.distance = 0;
    player.kills = 0;
    enemy.pos = [canvas.width-150, 280];
    enemy.health = 100;
    gameOver = false;
    drop = false;
}

//GameOver function
function finish(){
    document.getElementById('start-overlay').style.display = 'block';
    document.getElementById('message-start').style.display = 'none';
    document.getElementById('message-end').style.display = 'block';
    gameOver = true;
}

//start after load picture
resources.load([
    'img/hero/hero.png',
    'img/enemy/skeleton.png'
]);
resources.onReady(init);

//initialize
function init() {
    lastTime = Date.now();

    document.getElementById('start').addEventListener('click', function() {
        start();
    });
    //start();
    main();
}

// The main game loop
function main() {
    // ctx.clearRect(0, 0, canvas.width, canvas.height);
    var now = Date.now();
    var dt = (now - lastTime) / 1000.0;

    ctx.fillStyle = '#9fc5ed';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    render(dt);
    update(dt);

    lastTime = now;
    requestAnimFrame(main);
}

// Draw everything
function render(dt) {
    // Render the player if the game isn't over
    renderBack();
    renderEntity(player,actions);
    renderEntity(enemy,enemy_actions);
    checkAll(dt);
}
    function renderBack(){
        for (var key in background) {
            item = key;
            item = new Image();
            item.src = background[key].src;
            if( background[key].infinite ){
                draw_start = background[key].start;
                for( draw_start; draw_start < canvas.width+192; draw_start+=96){
                    ctx.drawImage(item, draw_start, background[key].pos[1]);
                }
            } else {
                ctx.drawImage(item, background[key].pos[0], background[key].pos[1]);
            }
        }
    }

    function renderEntity(entity,actions) {
        ctx.save();
        ctx.translate(entity.pos[0], entity.pos[1]);
        entity[actions].render(ctx);
        ctx.restore();
    }

    function checkAll(dt) {
        //all enemy logic and actions
        enemyActions(dt);
        //all player actions
        playerActions();
        //check damage
        checkDamage();
        //check for text
        checkAllText();
        //check drop
        checkDrop();
        //check enemy spawn
        checkEnemySpawn();
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
                            if( enemy_actions !== 'damage' ){
                                enemy_actions = 'attack';
                            }
                        }
                    }
                } else {
                    if( enemy.state ){
                        enemy_actions = 'die';
                        player.kills++;
                        deathTime = Date.now();
                        if( Math.random() >= 0.5 ){
                            drop = true;
                            if( Math.random() >= 0.5 ){
                                drop_type = 'health';
                            } else{
                                drop_type = 'mana';
                            }
                        }
                    }
                    enemy.state = 0;
                }
            } else{
                enemy_actions = 'stay';
            }
        }

        //all players actions
        function playerActions() {
            //check for player health
            if (player.health > 0) {
                //check for mana
                if( player.mana < 100 && !input.isDown('UP') ){
                    player.mana +=0.05;
                }
                //check for drop
                if( drop ){
                    if( player.pos[0] + 30 > enemy.pos[0] ){
                        if( drop_type == 'health' ){
                            player.health += 20;
                            if( player.health > 100 ){
                                player.health = 100;
                            }
                        } else{
                            player.mana += 25;
                            if( player.mana > 100 ){
                                player.mana = 100;
                            }
                        }
                        drop = false;
                    }
                }
                //check for spell use
                if( input.isDown('UP') && player.mana > 0 && enemy.state !== 0 && Date.now() - lastAttack > 10 ){
                    text_show = true;
                    text_target = 'enemy';
                    text_type = 'spell';
                    enemy.health -=2;
                    player.mana -=1;
                    lastAttack = Date.now();
                    renderEntity(explosions,'explosion');
                }
            } else{
                if ( actions !== 'death' ){
                    PlayerDeathTime = Date.now();
                    actions = 'death';
                }
                finish();
            }
        }

        function checkDamage(){
            //main check
            if( enemy.pos[0] - player.pos[0] < 100 && enemy.health > 0 ){
                //enemy_actions = 'attack';
                if( input.isDown('SPACE') ){
                    if( Date.now() - lastAttack > 800 ){
                        if( enemy_actions == 'attack' ){
                            if( Math.random() >= 0.5 ){
                                enemy.health -=25;
                                enemy_actions = 'damage';
                                text_type = 'physical';
                            } else {
                                actions = 'damage';
                                player.health -=10;
                            }
                        } else {
                            enemy.health -=25;
                            enemy_actions = 'damage';
                            text_type = 'physical';
                        }
                        lastAttack = Date.now();
                    }
                } else {
                    if( Date.now() - lastEnemyAttack > 800 && player.health > 0 ){
                        actions = 'damage';
                        player.health -=10;
                        lastEnemyAttack = Date.now();
                    }
                }
            }
        }

        function checkAllText() {
            if( !gameOver ){
                if( input.isDown('LEFT') && player.pos[0] < 21 ){
                    ctx.font = "20px Arial";
                    ctx.fillStyle = "#ff0000";
                    ctx.fillText("I can`t leave!",60,280);
                }

                ctx.font = "18px Arial";
                ctx.fillStyle = "#000000";

                //player text
                if( player.health > 0 ){
                    //player health
                    ctx.fillStyle = '#ff0000';
                    ctx.fillRect(player.bar_start, 35, player.health*2, 25);
                    ctx.fillText(''+player.health+'%',player.bar_start,30);
                    //distance
                    ctx.fillText('Distance: '+Math.round(player.distance)+' m',canvas.width/2-100,30);
                    //kills
                    ctx.fillText('Kills: '+player.kills,canvas.width/2+40,30);
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

                player.watch('health', function (id, oldval, newval) {
                    if( Date.now() - text_show_time > 100 ){
                        text_show = !text_show;
                    }
                    text_target = 'player';
                    text_show_time = Date.now();
                    //console.log('o.' + id + ' changed from ' + oldval + ' to ' + newval);
                    return newval;
                });
                enemy.watch('health', function (id, oldval, newval) {
                    if( Date.now() - text_show_time > 100 ){
                        text_show = !text_show;
                    }
                    text_target = 'enemy';
                    text_show_time = Date.now();
                    return newval;
                });
                if( text_show ){
                    ctx.fillStyle = '#ff0000';
                    if( text_target == 'player' ){
                        if( enemy_actions == 'attack' ){
                            ctx.fillText('-10%',player.pos[0]+15,player.pos[1]+20);
                        }
                    }
                    if( text_target == 'enemy' ){
                        if( actions == 'attack' || actions == 'spell' ){
                            if( text_type == 'physical' ){
                                ctx.fillText('-25%',enemy.pos[0]+45,player.pos[1]+20);
                            } else if( text_type == 'spell' && player.mana > 0 && enemy.health > 0 ) {
                                ctx.fillText('-2%',enemy.pos[0]+Math.floor((Math.random() * 45) + 1),player.pos[1]+Math.floor((Math.random() * 20) + 1));
                            }
                        }
                    }
                }
            }
        }

        //check drop
        function checkDrop(){
            if( drop ){
                var potion = new Image();
                potion.src = 'img/items/potions.png';
                if( drop_type == 'health' ){
                    ctx.drawImage(potion, 0, 0, 20, 30, enemy.pos[0]+10, enemy.pos[1]+85, 20, 30);
                } else {
                    ctx.drawImage(potion, 30, 0, 20, 30, enemy.pos[0]+10, enemy.pos[1]+85, 20, 30);
                }
            }
        }

        //enemy spawn timer
        function checkEnemySpawn() {
            if( !enemy.state ){
                if( Date.now() - deathTime > 2900 ){
                    enemy.die = new Sprite('img/enemy/skeleton.png', [0, 650], [109, 110], 8, [0,1,2],'horizontal',true,true);
                    enemy.pos[0] = canvas.width;
                    enemy.health = 100;
                    enemy.state = 1;
                    drop = false;
                }
            }
        }

function update(dt) {
    //update all background objects
    updateBg(dt);
    //update all sprite objects
    updateEntities(dt);
    //check for keyboard inputs
    if( !gameOver ){
        handleInput(dt);
    }
}

    function updateBg(dt){
        if( input.isDown('RIGHT') && player.pos[0] > canvas.width / 2 ){
            //check for enemy health and position
            if( enemy.pos[0] - player.pos[0] > 70 || enemy.health <= 0 ){
                enemy.pos[0] -= player.speed * dt;
                for (var key in background) {
                    if( background[key].infinite ){
                        background[key].start -= player.speed * dt;
                    } else {
                        background[key].pos[0] -= player.speed * dt;
                        if( background[key].pos[0] < -200 && key !== 'grass_start' ){
                            background[key].pos[0] = canvas.width + Math.floor((Math.random() * 300) + 1);
                        }
                    }
                }
            }
            player.distance += 0.05;
        }
    }

    function updateEntities(dt) {
        // Update the player sprite animation
        player[actions].update(dt);
        // Update the enemy sprite animation
        enemy[enemy_actions].update(dt);
        // Update explosion animation
        explosions.explosion.update(dt);
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
            if( enemy.health > 0 ){
                if( enemy.pos[0] - player.pos[0] > 70 ){
                    if( player.pos[0] < canvas.width / 2 ){
                        player.pos[0] += player.speed * dt;
                    }
                    actions = 'walk_right';
                } else{
                    actions = 'stay';
                }
            } else {
                if( player.pos[0] < canvas.width / 2 ){
                    player.pos[0] += player.speed * dt;
                }
                actions = 'walk_right';
            }
            //update distance
            if ( player.pos[0] < canvas.width / 2 && !half ){
                player.distance += 0.05;
            } else {
                half = true;
            }
        }

        if(input.isDown('SPACE') ){
            actions = 'attack';
        }
    }
