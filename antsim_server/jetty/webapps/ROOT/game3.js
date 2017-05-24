var game = new Phaser.Game(1280, 720, Phaser.AUTO, "phaser-example",
    { preload: preload, create: create, update: update, render: render  },
    true);

var cells = [];
var count = 0;

function preload() {
    game.scale.maxWidth = 1280;
    game.scale.maxHeight = 720;

    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.setScreenSize();

    game.load.image("tile", "images/wood.jpg");
    game.load.image("hex", "images/test.png");
    game.load.image("cell", "images/cell3.png");
}

function create() {
    land = game.add.tileSprite(0, 0, 1280, 720, "tile");
    var hex = game.add.sprite(-50, -50, "hex");
    fillCellsV(99, 69);
    fillCellsV(98, 149);
    fillCellsY(171, 29);
}

function update() {
    //count++;
}

function render() {
    //game.debug.cameraInfo(game.camera, 32, 150);
    //game.debug.inputInfo(32, 270);
    //game.debug.text("Count: " + count, 500, 380);
}

function fillCellsV(x, y) {
    for (var i = 0; i < 4; i++) {
        var cell = game.add.sprite(x + i * 140, y, "cell");
        cell.inputEnabled = true;
        cell.events.onInputDown.add(function (sprite) {
            sprite.destroy();
            ws.send("nectar-put");
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
            ws.send("nectar-put");
        }, this);
        cells.push(cell);
    }
}