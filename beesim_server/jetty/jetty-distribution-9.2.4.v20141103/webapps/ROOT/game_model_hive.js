function Hive(game, actor, x, y) {
    var initScale = 0.8;

    var hiveImage = "hive";
    if (actor.name !== "g1") {
        hiveImage = "other-hive";
    }
    var hive = game.add.sprite(x, y, hiveImage);
    hive.scale.setTo(initScale);

    game.physics.enable(hive, Phaser.Physics.ARCADE);
    hive.body.immovable = true;
    this.sprite = hive;

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

    hive.inputEnabled = true;
    hive.input.enableDrag(true);
    hive.events.onDragStop.add(function () {
        if (gameControl.mode === "end" || gameControl.mode !== "live") {
            return;
        }
        var newX = Math.round(hive.x / gameControl.getGameWidthRatio());
        var newY = Math.round(hive.y / gameControl.getGameHeightRatio());
        if (gameControl.mode === "live") {
            ws.send("@moveActor#" + actor.id + "#" + newX + "#" + newY);
        }
    });

    this.bar = new Bar(game, hive.body.x + hive.body.width, hive.body.y + hive.body.height);

    var settingIcon = null;
    makeSettingIcon();

    var statsIcon = null;
    makeStatsIcon();

    actor.restBox = new RestBox(game, hive.body.x, hive.body.y, hive.body.x + 200, hive.body.y + 200);

    this.remove = function () {
        hive.destroy();
        this.bar.remove();
        text.destroy();
        if (groupIcon !== null) {
            groupIcon.destroy();
        }
        settingIcon.destroy();
        linkDeviceIcon.destroy();
        statsIcon.destroy();
        actor.restBox.remove();
    };

    this.reScale = function (size) {
        var scale = initScale * size / 100;
        hive.scale.setTo(scale);
        this.bar.reScale(size);

        if (size >= 50) {
            settingIcon.scale.setTo(scale * 0.2);
            statsIcon.scale.setTo(scale * 0.4);
        }
    };

    this.update = function () {
        this.updateLoad();
        if (ShowObjectId) {
            text.x = hive.x + 45;
            text.y = hive.y + 30;
        }
        text.visible = ShowObjectId;

        if (groupIcon !== null) {
            if (ShowActorGroup) {
                groupIcon.x = hive.x - 20;
                groupIcon.y = hive.y - 20;
            }
            groupIcon.exists = ShowActorGroup;
        }

        if (gameControl.mode === "live") {
            settingIcon.exists = true;
            settingIcon.x = hive.x + hive.body.width;
            settingIcon.y = hive.y + hive.body.height;
        } else {
            settingIcon.exists = false;
        }

        if (actor.device || !ShowGameInfo) {
            linkDeviceIcon.exists = false;
        } else if (!actor.device && ShowGameInfo) {
            linkDeviceIcon.exists = true;
            linkDeviceIcon.x = hive.x - 30 + hive.body.width;
            linkDeviceIcon.y = hive.y - 30;
        }

        if (actor.restBox !== null) {
            actor.restBox.update(hive.x - 30, hive.y - 40);
        }

        statsIcon.exists = ShowGameInfo;
        statsIcon.x = hive.x + hive.body.width / 2 - 20;
        statsIcon.y = hive.y + hive.body.height + 10;
    };

    this.updateLoad = function () {
        this.bar.group.x = hive.body.x + hive.body.width - 40 * (LastScaleSize / 100);
        this.bar.group.y = hive.body.y + hive.body.height;

        var total = actor.dyProps.maxNectar;
        var atHive = actor.dyProps.currentNectar;

        this.bar.updateLoad(atHive / total, atHive + "/" + total);
    };

    this.applySetting = function (current, max, dance, nec) {
        var newActorSetting = {
            id: actor.id,
            dyProps: {
                currentNectar: current,
                maxNectar: max,
                dance: dance,
                nectarQuality: nec
            }
        };

        ws.send("@changeSetting#" + JSON.stringify(newActorSetting));
    };

    function makeSettingIcon() {
        settingIcon = game.add.sprite(0, 0, "setting");
        settingIcon.inputEnabled = true;
        settingIcon.scale.setTo(0.1);
        settingIcon.events.onInputDown.add(function () {
            BootstrapDialog.show({
                //size: BootstrapDialog.SIZE_LARGE,
                type: BootstrapDialog.TYPE_INFO,
                title: "<span class='glyphicon glyphicon-cog'></span>Setting for Hive " + actor.id,
                message: $("<div></div>").load("game_ui_setting_hive.html"),
                cssClass: "setting-dialog",
                draggable: true,
                onshown: function () {
                    var content = $("#ui_setting");
                    angular.element(document.getElementById("root_control")).injector().invoke(function ($compile) {
                        var scope = angular.element(content).scope();
                        $compile(content)(scope);

                        scope.nLevel = actor.dyProps.currentNectar;
                        scope.nMax = actor.dyProps.maxNectar;
                        scope.dance = actor.dyProps.dance;
                        scope.nectarQuality = actor.dyProps.nectarQuality;
                        scope.isApplyingSetting = false;
                        scope.$apply();
                        ngScope = scope;
                        currentSettingActor = actor;
                    });
                }
            });
        });
    }

    function makeStatsIcon() {
        statsIcon = game.add.sprite(0, 0, "hive-stats");
        statsIcon.inputEnabled = true;
        statsIcon.scale.setTo(0.3);
        statsIcon.events.onInputDown.add(function () {
            if (AllHiveCharts.has(actor.name)) {
                var chart = AllHiveCharts.get(actor.name);
                chart.destroy();
                AllHiveCharts.remove(actor.name);
                $("#canvas_holder_" + actor.name).remove();
            } else {
                showHiveStats(actor.name);
            }
        });
    }

    addHiveStatsArea(actor.name);

}