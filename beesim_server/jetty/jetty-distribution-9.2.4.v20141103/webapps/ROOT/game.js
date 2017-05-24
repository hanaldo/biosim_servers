var GameWidth = 1280;
var GameHeight = 720;

var game = new Phaser.Game(GameWidth, GameHeight, Phaser.CANVAS, "phaser-example",
    { preload: preload, create: create, update: update, render: render  },
    true, true);

var soundStart, soundEnd, soundStartMini , soundEndMini, soundYes, soundEat;
var cells = [];

var predator = null;
var paintBitmap = null, paintContext = null, paintSprite = null;

var gameTopText = null, gameTopTextTween = null;
var SpaceLine = null;

//function resizeGame() {
//    var width = $(window).width();
//    var height = width / GameWidth * GameHeight;
//
//    //game.width = width;
//    //game.height = height;
////    game.stage.bounds.width = width;
////    game.stage.bounds.height = height;
//
//    //game.renderer.resize(width, height);
//    //game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
//    game.scale.setGameSize(width, height);
//    game.scale.refresh();
//}

function preload() {
    game.stage.disableVisibilityChange = true;
    game.time.advancedTiming = true;
    game.scale.maxWidth = GameWidth;
    game.scale.maxHeight = GameHeight;

    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

    game.load.image("bee", "images/bee_new.png");
    game.load.image("tile", "images/grass.jpg");
    game.load.image("back2", "images/back2.png");
    game.load.image("back3", "images/back3.png");
    game.load.image("back4", "images/back4.png");
    game.load.image("flower", "images/flower.png");
    game.load.image("flower-2", "images/flower2.png");
    game.load.image("flower-3", "images/flower3.png");
    game.load.image("flower-4", "images/flower4.png");
    game.load.image("flower-5", "images/flower5.png");
    game.load.image("flower-6", "images/flower6.png");
    game.load.image("flower-7", "images/flower7.png");
    game.load.image("flower-8", "images/flower8.png");
    game.load.image("flower-9", "images/flower9.png");
    game.load.image("flower-10", "images/flower10.png");
    game.load.image("hive", "images/hive2.png");
    game.load.image("other-hive", "images/hive3.png");
    game.load.image("nectar", "images/nectar.png");
    game.load.image("bar", "images/bar.png");
    game.load.image("bar_full", "images/bar_full.png");
    game.load.image("hex", "images/test.png");
    game.load.image("cell", "images/cell3.png");
    game.load.image("circle-blue", "images/circle_blue.png");
    game.load.image("circle-red", "images/circle_red.png");
    game.load.image("circle-green", "images/circle_green.png");
    game.load.image("ant", "images/ant.png");
    game.load.image("setting", "images/e2.png");
    game.load.image("bee-die", "images/bee_die.png");
    game.load.image("bee-out", "images/bee_out.png");
    game.load.image("predator1", "images/badger-1.png");
    game.load.image("sun2", "images/sun2.png");
    game.load.image("rain", "images/droplet.png");
    game.load.image("bee-revive", "images/revive.png");
    game.load.image("no-link", "images/ex.png");
    game.load.image("fountain", "images/fountain.png");
    game.load.image("hive-exit", "images/hive_exit.png");
    game.load.image("hive-stats", "images/stats.png");

    game.load.spritesheet("snowflakes", "images/snowflakes.png", 17, 17);
    game.load.spritesheet("snowflakes_large", "images/snowflakes_large.png", 64, 64);

    game.load.audio("start", "sound/start.mp3");
    game.load.audio("end", "sound/end.mp3");
    game.load.audio("start-mini", "sound/start-mini.mp3");
    game.load.audio("end-mini", "sound/end-mini.mp3");
    game.load.audio("yes", "sound/yes.mp3");
    game.load.audio("eat", "sound/eat.mp3");
    game.load.audio("rain", "sound/rain.mp3");

    gameControl = new GameControl();
}

function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);

    land = game.add.tileSprite(0, 0, GameWidth, GameHeight, "tile");
    //var hex = game.add.sprite(-50, -50, "hex");
    //fillCellsV(99, 69);
    //fillCellsV(98, 149);
    //fillCellsY(171, 29);

//    game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
//    game.input.onDown.add(function () {
//        game.scale.startFullScreen();
//    }, this);

    soundStart = game.add.audio("start");
    soundEnd = game.add.audio("end");
    soundStartMini = game.add.audio("start-mini");
    soundEndMini = game.add.audio("end-mini");
    soundYes = game.add.audio("yes");
    soundEat = game.add.audio("eat");

    var spaceLine = game.add.bitmapData(20, GameHeight);
    spaceLine.ctx.beginPath();
    spaceLine.ctx.rect(0, 0, 20, GameHeight);
    spaceLine.ctx.fillStyle = "#ffff00";
    spaceLine.ctx.fill();
    SpaceLine = game.add.sprite(GameWidth / 2 - 10, 0, spaceLine);
    game.physics.enable(SpaceLine, Phaser.Physics.ARCADE);
    SpaceLine.body.immovable = true;
    SpaceLine.exists = false;

    initModels();

    game.time.events.loop(Phaser.Timer.SECOND, updateCounter, this);

    paintBitmap = game.add.bitmapData(GameWidth, GameHeight);
    paintSprite = game.add.sprite(0, 0, paintBitmap);
    paintContext = paintBitmap.context;

    LineTest = new Phaser.Line(100, 100, 600, 600);
}

function updateCounter() {
    gameControl.showLiveTime(false);
}

function initModels() {
    gameInfo = new GameInfo(game, "", game.width / 2 - 400, 30);
    gameInfo.text.visible = ShowGameInfo;

    gameControl.initGame(game);
}

function showTopText(text) {
    if (gameTopText !== null) {
        console.log("Previous gameTopText not removed");
        return;
    }
    gameTopText = game.add.text(game.width / 2 - 100, 70, text, {fill: "#fff", stroke: "#000", strokeThickness: 3});
    gameTopText.fontSize = 38;
    gameTopText.alpha = 0;
    gameTopTextTween = game.add.tween(gameTopText).to({ alpha: 1 }, 500, Phaser.Easing.Quartic.Out, true, 0, 10, true);
    gameTopTextTween.onComplete.add(function () {
        removeTopText();
    });
}

function removeTopText() {
    if (gameTopText !== null) {
        gameTopTextTween.onComplete.removeAll();
        gameTopTextTween = null;
        gameTopText.destroy();
        gameTopText = null;
        console.log("gameTopText removed");
    }
}

function removeAll() {
    clearInterval(GAME_REFRESH_TIMER);
    gameControl.allActors.forEach(function (actor) {
        if (actor.id > 0 || actor.type === "sky") {
            actor.model.remove();
        }
    });
    while (gameControl.allActors.length > 0) {
        gameControl.allActors.pop();
    }
    gameInfo.remove();
    removeTopText();
}

function update() {
    gameControl.allActors.forEach(function (actor) {
        if (actor.id > 0) {
            actor.model.update();
        }
    });
}
//    if (game.input.mousePointer.isDown) {
//        //  400 is the speed it will move towards the mouse
//        game.physics.arcade.moveToPointer(bee.sprite, 400);
//
//        //  if it's overlapping the mouse, don't move any more
//        if (Phaser.Rectangle.contains(bee.sprite.body, game.input.x, game.input.y)) {
//            bee.sprite.body.velocity.setTo(0, 0);
//        }
//    }
//    else {
//        bee.sprite.body.velocity.setTo(0, 0);
//    }

var LineTest;

function render() {
//    game.debug.spriteInfo(bee.sprite, 32, 30);
//    game.debug.cameraInfo(game.camera, 32, 150);
    //game.debug.inputInfo(30, 30);
    //game.debug.body(gameControl.allActors[2].model.sprite);
    if (ShowGameInfo) {
        game.debug.text(game.time.fps || '--', 2, 14, "#00ff00");
    }
    //game.debug.geom(LineTest);
    //game.debug.lineInfo(LineTest, 32, 32);
//    gameControl.allActors.forEach(function (actor) {
//        if (actor.type === "b") {
//            game.debug.body(actor.model.sprite);
//        }
////        if (actor.type === "h") {
////            game.debug.body(actor.restBox.sprites[0]);
////            game.debug.body(actor.restBox.sprites[1]);
////            game.debug.body(actor.restBox.sprites[2]);
////            game.debug.body(actor.restBox.sprites[3]);
////        }
//    });
}

function fillCellsV(x, y) {
    for (var i = 0; i < 4; i++) {
        var cell = game.add.sprite(x + i * 140, y, "cell");
        cell.inputEnabled = true;
        cell.events.onInputDown.add(function (sprite) {
            sprite.destroy();
        }, this);
        cells.push(cell);
    }
}
function fillCellsY(x, y) {
    for (var i = 0; i < 4; i++) {
        var cell = game.add.sprite(x - i * 2, y + i * 80, "cell");
        cell.inputEnabled = true;
        cell.events.onInputDown.add(function (sprite) {
            sprite.destroy();
        }, this);
        cells.push(cell);
    }
}

var info = null;
function showInfo(text) {
    if (info === null) {
        info = game.add.text(game.world.centerX, game.world.centerY, text, { font: "65px Arial", fill: "#ff0044", align: "center" });
        info.anchor.setTo(0.5, 0.5);
    }
}

function closeInfo() {
    if (info != null) {
        info.destroy();
        info = null;
    }
}

//function startControl() {
//    showToast("You can start");
//    soundStart.play();
//    control = 2;
//}
//
//function stopControl() {
//    showToast("Bye Bye");
//    soundEnd.play();
//    control = 1;
//}
//
//var t = null;
//function showToast(text) {
//    if (t === null) {
//        t = game.add.text(game.world.centerX, game.world.centerY, text, { font: "65px Arial", fill: "#ff0044", align: "center" });
//        t.anchor.setTo(0.5, 0.5);
//        game.time.events.add(Phaser.Timer.SECOND * 2, close, this);
//    }
//}
//
//function close() {
//    t.destroy();
//    t = null;
//}
