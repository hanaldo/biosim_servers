function Ant(game, actor, x, y) {
    var ant = game.add.sprite(x, y, "ant");
    ant.scale.setTo(0.9);

    game.physics.enable(ant, Phaser.Physics.ARCADE);
    ant.body.immovable = true;
    this.sprite = ant;
    var text = game.add.text(x, y, actor.id.toString(), {fill: "#fff", stroke: "#000", strokeThickness: 3});
    var groupIcon = null;
    if (actor.name === "g1") {
        groupIcon = game.add.sprite(x, y, "circle-blue");
    } else if (actor.name === "g2") {
        groupIcon = game.add.sprite(x, y, "circle-red");
    } else if (actor.name === "g3") {
        groupIcon = game.add.sprite(x, y, "circle-green");
    }
    if (groupIcon !== null) {
        groupIcon.scale.setTo(0.5);
    }

    ant.inputEnabled = true;
    ant.input.enableDrag(true);

    this.remove = function () {
        ant.destroy();
        text.destroy();
        if (groupIcon !== null) {
            groupIcon.destroy();
        }
    };

    this.update = function () {
        if (showObjectIds) {
            text.x = ant.x + 45;
            text.y = ant.y + 30;
        } else {
            text.x = game.world.width;
            text.y = game.world.height;
        }

        if (groupIcon !== null) {
            if (ShowActorGroup) {
                groupIcon.x = ant.x - 20;
                groupIcon.y = ant.y - 20;
            } else {
                groupIcon.x = game.world.width;
                groupIcon.y = game.world.height;
            }
        }
    };
}