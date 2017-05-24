var game = new Phaser.Game(800, 600, Phaser.AUTO, "phaser-example",
    { preload: preload, create: create, update: update, render: render  },
    true);

var sprite;
var counter = 0;
var step = Math.PI * 2 / 360;

var bee, flower, hive;

var go = false;


function preload() {
    game.scale.maxWidth = 800;
    game.scale.maxHeight = 600;

    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.setScreenSize();

    game.load.image('sprite', "images/cell.png");
    game.load.image("bee", "images/bee.png");
    game.load.image("tile", "images/grass.jpg");
    game.load.image("flower", "images/flower.png");
    game.load.image("hive", "images/hive.png");
}

function create() {
    land = game.add.tileSprite(0, 0, 800, 600, "tile");

    sprite = game.add.sprite(0, 0, 'sprite');
    bee = game.add.sprite(game.width / 2, 0, "bee");
    flower = game.add.sprite(game.width - 150, game.height / 2 - 150, "flower");
    //myBee = game.add.sprite(0, game.height / 2, "myBee");
    hive = game.add.sprite(0, game.height / 2 - 150, "hive");

    game.physics.enable(sprite, Phaser.Physics.ARCADE);
    game.physics.enable(bee, Phaser.Physics.ARCADE);

//    sprite.alpha = 1;
//    sprite.x = game.width / 2;
//    sprite.anchor.x = sprite.anchor.y = 0.5;
//    sprite.body.collideWorldBounds = true;
//    sprite.body.bounce.setTo(0.7, 0.4);


    bee.scale.setTo(0.5);
    bee.body.velocity.x = -50;
    bee.body.velocity.y = 50;
    sprite.body.immovable = true;
//    bee.inputEnabled = true;
//    bee.events.onInputDown.add(function click() {
//        flower.scale.setTo(1.2);
//    }, this);

    //myBee.scale.setTo(1.5);
    //myBee.animations.add("fly");
    //myBee.animations.play("fly", 9, true);

    hive.scale.setTo(0.5);
}

function update() {
    game.physics.arcade.collide(sprite, bee);

    // Move sprite up and down smoothly for show
    var tStep = Math.sin(counter);
    sprite.y = (game.height / 2) + tStep * 30;
    sprite.rotation += Phaser.Math.degToRad(0.1 * tStep);
    counter += step;


//    if (go) {
//        bee.body.velocity.x = -50;
//        bee.body.velocity.y = -50;
//    } else {
//        bee.body.velocity.x = 50;
//        bee.body.velocity.y = 50;
//    }
//
//    if (bee.x > 700) {
//        go = true;
//    }
//    if (bee.x < 100) {
//        go = false;
//    }

//    flower.x = game.input.activePointer.x - flower.width / 2;
//    flower.y = game.input.activePointer.y - flower.height / 2;
}

function render() {

    // Sprite debug info
    game.debug.spriteInfo(sprite, 32, 30);
    game.debug.cameraInfo(game.camera, 32, 150);
    game.debug.inputInfo(32, 270);

}