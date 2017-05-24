function Nectar(game, x, y) {
    var nectar = game.add.sprite(x, y, "nectar");
    nectar.scale.setTo(0.3);
    this.sprite = nectar;

    this.remove = function () {
        nectar.destroy();
    };
}