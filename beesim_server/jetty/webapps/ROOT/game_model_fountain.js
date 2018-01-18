function Fountain(game, actor, x, y) {
    var fountain = game.add.sprite(x, y, "fountain");
    fountain.scale.setTo(0.7);

    game.physics.enable(fountain, Phaser.Physics.ARCADE);
    fountain.body.immovable = true;
    this.sprite = fountain;

    fountain.inputEnabled = true;
    fountain.input.enableDrag(true);

    var linkDeviceIcon = game.add.sprite(x, y, "no-link");
    linkDeviceIcon.scale.setTo(0.5);
    linkDeviceIcon.inputEnabled = true;
    linkDeviceIcon.events.onInputDown.add(function () {
        ws.send("@searchOne#" + actor.id);
    });

    var text = game.add.text(x, y, actor.id.toString(), {fill: "#fff", stroke: "#000", strokeThickness: 3});
    if (actor.device) {
        text.setText(actor.id.toString() + "::" + actor.device);
    }
    this.idText = text;

    this.remove = function () {
        fountain.destroy();
        text.destroy();
        linkDeviceIcon.destroy();
    };

    this.update = function () {
        fountain.visible = ShowGameInfo;
        if (ShowObjectId && ShowGameInfo) {
            text.x = fountain.x + 50;
            text.y = fountain.y + 30;
        }
        text.visible = ShowObjectId && ShowGameInfo;

        if (actor.device || !ShowGameInfo) {
            linkDeviceIcon.exists = false;
        } else if (!actor.device && ShowGameInfo) {
            linkDeviceIcon.exists = true;
            linkDeviceIcon.x = fountain.x - 30 + fountain.body.width;
            linkDeviceIcon.y = fountain.y - 30;
        }
    };
}