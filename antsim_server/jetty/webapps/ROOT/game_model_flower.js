function Flower(game, actor, x, y, spaceW) {
    var initScale = 0.6;

    var rangeShape = null;
    makeRangeShape();

    var flowerType = "flower";
    if (actor.dyProps.flowerType !== flowerType) {
        flowerType = actor.dyProps.flowerType;
    }
    var flower = game.add.sprite(x, y, flowerType);
    flower.scale.setTo(initScale);

    game.physics.enable(flower, Phaser.Physics.ARCADE);
    flower.body.immovable = true;
    this.sprite = flower;

    var linkDeviceIcon = game.add.sprite(x, y, "no-link");
    linkDeviceIcon.scale.setTo(0.5);
    linkDeviceIcon.inputEnabled = true;
    linkDeviceIcon.events.onInputDown.add(function () {
        ws.send("@searchOne#" + actor.id);
    });

    var teamIcon = game.add.sprite(x, y, "group");
    teamIcon.scale.setTo(0.1);

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

    flower.inputEnabled = true;
    flower.input.enableDrag(true);
    flower.events.onDragStop.add(function () {
        if (gameControl.mode === "end" || gameControl.mode !== "live") {
            return;
        }
        var newX = Math.round(gameControl.getFakeX(flower.x));
        var newY = Math.round(gameControl.getFakeY(flower.y));
        if (gameControl.mode === "live") {
            ws.send("@moveActor#" + actor.id + "#" + newX + "#" + newY);
        }
    });

    var nectarBar = new Bar(game, flower.body.x + flower.body.width, flower.body.y + flower.body.height);
    this.bar = nectarBar;

    var settingIcon = null;
    makeSettingIcon();

    this.remove = function () {
        flower.destroy();
        nectarBar.remove();
        text.destroy();
        if (groupIcon !== null) {
            groupIcon.destroy();
        }
        if (rangeShape !== null) {
            rangeShape.destroy();
        }
        settingIcon.destroy();
        linkDeviceIcon.destroy();
        teamIcon.destroy();
    };

    this.reScale = function (size) {
        var scale = initScale * size / 100;
        flower.scale.setTo(scale);
        nectarBar.reScale(size);

        if (size >= 50) {
            settingIcon.scale.setTo(scale * 0.2);
        }
    };

    this.update = function () {
        this.updateLoad();

        if (ShowObjectId) {
            text.x = flower.x + 55;
            text.y = flower.y + 45;
        }
        text.visible = ShowObjectId;

        if (groupIcon !== null) {
            if (ShowActorGroup) {
                groupIcon.x = flower.x - 20;
                groupIcon.y = flower.y - 20;
            }
            groupIcon.exists = ShowActorGroup;
        }

        if (ShowGameInfo) {
            rangeShape.visible = false;
//            rangeShape.x = flower.body.x + flower.body.width / 2 - rangeShape.body.width / 2;
//            rangeShape.y = flower.body.y + flower.body.height / 2 - rangeShape.body.height / 2;
//            rangeShape.visible = true;
        } else {
            rangeShape.visible = false;
        }


        if (gameControl.mode === "live") {
            settingIcon.exists = true;
            settingIcon.x = flower.x + flower.body.width / 2;
            settingIcon.y = flower.y + flower.body.height;
        } else {
            settingIcon.exists = false;
        }

        if (actor.device || !ShowGameInfo) {
            linkDeviceIcon.exists = false;
        } else if (!actor.device && ShowGameInfo) {
            linkDeviceIcon.exists = true;
            linkDeviceIcon.x = flower.x - 30;
            linkDeviceIcon.y = flower.y - 30;
        }

        if (actor.dyProps.foodPieceSize <= 1) {
            teamIcon.exists = false;
        } else {
            teamIcon.exists = true;
            teamIcon.x = flower.x + flower.body.width - 30;
            teamIcon.y = flower.y + flower.body.height;
        }
    };

    this.updateLoad = function () {
        nectarBar.group.x = flower.body.x + 100 * (LastScaleSize / 100);
        nectarBar.group.y = flower.body.y + flower.body.height;

        var total = actor.dyProps.maxNectar;
        var atFlower = actor.dyProps.currentNectar;

        nectarBar.updateLoad(atFlower / total, atFlower + "/" + total);
    };

    this.previewSetting = function (radius) {
        if (rangeShape !== null) {
            var current = actor.dyProps.range;
            var ratio = radius / current;
            rangeShape.scale.setTo(ratio);
            //alert("radius / current: " + radius + "/" + current);
        }
    };

    this.applySetting = function (radius, current, max, quality, flower) {
        var newActorSetting = {id: actor.id,
            dyProps: {range: radius,
                currentNectar: current,
                maxNectar: max,
                quality: quality,
                flowerType: flower}};

        ws.send("@changeSetting#" + JSON.stringify(newActorSetting));
    };

    function makeRangeShape() {
        if (actor.dyProps.range) {
            var radius = actor.dyProps.range / spaceW * game.width + 5;
            var bmd = game.add.bitmapData(radius * 2, radius * 2);
            bmd.ctx.beginPath();
            bmd.ctx.arc(radius, radius, radius - 1, 0, Math.PI * 2);
            bmd.ctx.globalAlpha = 0.5;
            bmd.ctx.fillStyle = "#f4cce3";
            bmd.ctx.fill();
            bmd.ctx.closePath();

            rangeShape = game.add.sprite(0, 0, bmd);
            game.physics.enable(rangeShape, Phaser.Physics.ARCADE);
        }
    }

    this.redraw = function () {
        if (rangeShape !== null) {
            rangeShape.destroy();
            makeRangeShape();
            game.world.bringToTop(flower);
            game.world.bringToTop(text);
            if (groupIcon !== null) {
                game.world.bringToTop(groupIcon);
            }
            game.world.bringToTop(nectarBar.group);
            game.world.bringToTop(nectarBar.infoText);
            game.world.bringToTop(settingIcon);
            gameControl.reArrangeDisplay();
        }
    };

    function makeSettingIcon() {
        settingIcon = game.add.sprite(0, 0, "setting");
        settingIcon.inputEnabled = true;
        settingIcon.scale.setTo(0.1);
        settingIcon.events.onInputDown.add(function () {
            BootstrapDialog.show({
                //size: BootstrapDialog.SIZE_LARGE,
                type: BootstrapDialog.TYPE_INFO,
                title: "<span class='glyphicon glyphicon-cog'></span>Setting for Food Resource " + actor.id,
                message: $("<div></div>").load("game_ui_setting_flower.html"),
                cssClass: "setting-dialog",
                draggable: true,
                onshown: function () {
                    //$(".modal-backdrop").hide();
                    var content = $("#ui_setting");
                    angular.element(document.getElementById("root_control")).injector().invoke(function ($compile) {
                        var scope = angular.element(content).scope();
                        $compile(content)(scope);

                        scope.flowerType = "flower";
                        scope.setFlowerType = function (type) {
                            scope.flowerType = type;
                        };

                        scope.fRange = actor.dyProps.range;
                        scope.nLevel = actor.dyProps.currentNectar;
                        scope.nMax = actor.dyProps.maxNectar;
                        scope.nQuality = actor.dyProps.quality;
                        scope.isApplyingSetting = false;
                        scope.$apply();
                        ngScope = scope;
                        currentSettingActor = actor;
                        slider.bootstrapSlider("setValue", scope.fRange);

                        //$(".later-ng").show();
                    });
                },
                onhide: function () {
                    if (!ngScope.isApplyingSetting) {
                        currentSettingActor.model.previewSetting(actor.dyProps.range);
                    }
                }
            });
        });
    }
}