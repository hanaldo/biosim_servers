var GameWidth = 1280;
var GameHeight = 720;

var game = new Phaser.Game(GameWidth, GameHeight, Phaser.CANVAS, "phaser-example",
    { preload: preload, create: create, update: update, render: render  },
    true, true);


function preload() {
    game.stage.disableVisibilityChange = true;
    game.time.advancedTiming = true;
    game.scale.maxWidth = GameWidth;
    game.scale.maxHeight = GameHeight;

    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

    game.load.image("tile", "images/back.png");
    game.load.image("bee", "images/bee.png");
    game.load.image("tile", "images/grass.jpg");
    game.load.image("flower", "images/flower.png");
    game.load.image("hive", "images/hive.png");
    game.load.image("ball", "images/target1.png");
}

var c0, c1, c2, c3;
var ball1, line1, line2, line3, line4;
var allPs = [];
function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);

    var land = game.add.tileSprite(0, 0, GameWidth, GameHeight, "tile");

    ball1 = game.add.sprite(100, 100, "ball");
    ball1.anchor.set(0.5);
    ball1.scale.setTo(0.3);
    ball1.inputEnabled = true;
    ball1.input.enableDrag(true);
    ball1.events.onDragStop.add(function () {
        console.log("lin1: " + line1.length);
        console.log("lin2: " + line2.length);
        console.log("lin3: " + line3.length);
        console.log("lin4: " + line4.length);

        var useError = $("#use_error").prop("checked");
        var lowError = $("#error_low_number").val();
        var highError = $("#error_high_number").val();

        $.ajax({
            url: "position",
            type: "post",
            data: {
                width: 500,
                height: 500,
                line1: line1.length,
                line2: line2.length,
                line3: line3.length,
                line4: line4.length,
                error: useError,
                errorLow: lowError,
                errorHigh: highError
            },
            dataType: "text",
            success: function (data) {
                var p = JSON.parse(data);
                console.log(p.x);
                console.log(p.y);
                var newX = p.x + 100;
                var newY = p.y + 100;
                var point = new Phaser.Circle(newX, newY, 15);
                allPs.push(point);
            }
        });
    });

    c0 = new Phaser.Circle(100, 100, 100);
    c1 = new Phaser.Circle(600, 100, 100);
    c2 = new Phaser.Circle(600, 600, 100);
    c3 = new Phaser.Circle(100, 600, 100);

    line1 = new Phaser.Line(0, 0, 0, 0);
    line2 = new Phaser.Line(0, 0, 0, 0);
    line3 = new Phaser.Line(0, 0, 0, 0);
    line4 = new Phaser.Line(0, 0, 0, 0);
}


function update() {
    line1.setTo(100, 100, ball1.x, ball1.y);
    line2.setTo(600, 100, ball1.x, ball1.y);
    line3.setTo(600, 600, ball1.x, ball1.y);
    line4.setTo(100, 600, ball1.x, ball1.y);
}


function render() {
    game.debug.cameraInfo(game.camera, 32, 150);
    game.debug.inputInfo(32, 270);

    game.debug.geom(c0, "rgba(0,255,0,0.5)");
    game.debug.geom(c1, "rgba(0,0,255,0.5)");
    game.debug.geom(c2, "rgba(255,255,0,0.5)");
    game.debug.geom(c3, "rgba(255,0,0,0.5)");

    game.debug.geom(line1, "rgba(0,255,0,1)");
    game.debug.geom(line2, "rgba(0,0,255,1)");
    game.debug.geom(line3, "rgba(255,255,0,1)");
    game.debug.geom(line4, "rgba(255,0,0,1)");

    game.debug.lineInfo(line1, 50, 50);
    game.debug.lineInfo(line2, 650, 50);
    game.debug.lineInfo(line3, 650, 650);
    game.debug.lineInfo(line4, 50, 650);

    allPs.forEach(function (p) {
        game.debug.geom(p, "rgba(0,0,0,1)");
    });
}
