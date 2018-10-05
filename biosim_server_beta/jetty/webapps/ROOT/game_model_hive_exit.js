function HiveExit(game, actor, x, y) {
    var initScale = 0.8;

    var exit = game.add.sprite(x, y, "hive-exit");
    exit.scale.setTo(initScale);
    exit.alpha = 0.6;

    game.physics.enable(exit, Phaser.Physics.ARCADE);
    exit.body.immovable = true;
    this.sprite = exit;

    exit.inputEnabled = true;
    exit.input.enableDrag(true);

    var linkDeviceIcon = game.add.sprite(x, y, "no-link");
    linkDeviceIcon.scale.setTo(0.5);
    linkDeviceIcon.inputEnabled = true;
    linkDeviceIcon.events.onInputDown.add(function () {
        var root = getRootScope();
        if (!root.xbeeIsOn) {
            toastr.error("You must connect your XBee module first");
            return;
        }
        ws.send("@searchOne#" + actor.id);
    });

    var text = game.add.text(x, y, actor.id.toString(), {fill: "#fff", stroke: "#000", strokeThickness: 3});
    if (actor.device) {
        text.setText(actor.id.toString() + "::" + actor.device);
    }
    this.idText = text;

    this.remove = function () {
        exit.destroy();
        text.destroy();
        linkDeviceIcon.destroy();
    };

    this.update = function () {
        exit.visible = ShowGameInfo;
        if (ShowObjectId && ShowGameInfo) {
            text.x = exit.x + 50;
            text.y = exit.y + 30;
        }
        text.visible = ShowObjectId && ShowGameInfo;

        if (actor.device || !ShowGameInfo) {
            linkDeviceIcon.exists = false;
        } else if (!actor.device && ShowGameInfo) {
            linkDeviceIcon.exists = true;
            linkDeviceIcon.x = exit.x - 30 + exit.body.width;
            linkDeviceIcon.y = exit.y - 30;
        }
    };
}