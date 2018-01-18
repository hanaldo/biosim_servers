function Setting(game, x, y) {
    var icon = game.add.sprite(x, y, "setting");

    this.remove = function () {
        icon.destroy();
    };
}