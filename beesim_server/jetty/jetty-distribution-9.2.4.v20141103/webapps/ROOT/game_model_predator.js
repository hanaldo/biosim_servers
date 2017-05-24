function Predator(game, actor, x, y) {
    var predator = game.add.sprite(x, y, "predator1");
    predator.scale.setTo(0.5);

    game.physics.enable(predator, Phaser.Physics.ARCADE);
    predator.body.immovable = true;
    this.sprite = predator;

    predator.inputEnabled = true;
    predator.input.enableDrag(true);

    this.remove = function () {
        predator.destroy();
    };

    this.update = function () {
    };
}