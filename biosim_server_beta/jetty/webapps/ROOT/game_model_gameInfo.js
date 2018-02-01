function GameInfo(game, t, x, y) {
    var text = game.add.text(x, y, t, {fill: "#fff", stroke: "#000", strokeThickness: 3});
    text.fontSize = 48;
    this.text = text;

    this.remove = function () {
        text.destroy();
    };
}