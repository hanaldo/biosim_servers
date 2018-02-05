function Bee(game, actor, x, y) {
    var initScale = 0.3;

    var bee = game.add.sprite(x, y, "bee");
    var reviveIcon = game.add.sprite(x, y, "bee-revive");
    reviveIcon.scale.setTo(0.5);
    reviveIcon.inputEnabled = true;
    reviveIcon.events.onInputDown.add(function () {
        ws.send("@new#" + actor.id);
        toastr.info("Send player " + actor.id + " to mini-game");
    });

    var linkDeviceIcon = game.add.sprite(x, y, "no-link");
    linkDeviceIcon.scale.setTo(0.5);

    bee.scale.setTo(initScale);
    game.physics.enable(bee, Phaser.Physics.ARCADE);
    bee.anchor.setTo(.5, .5);//for flip
    this.sprite = bee;
    var nextStop = null;
    var nextStopActor = null;
    var nextTargets = null;

    var text = game.add.text(x + 20, y + 30, actor.id.toString(), {fill: "#fff", stroke: "#000", strokeThickness: 3});
    var idString = actor.id.toString();
    if (actor.dyProps.nameTag) {
        idString += "::" + actor.dyProps.nameTag;
    }
    if (actor.device) {
        idString += "::" + actor.device;
    }
    text.setText(idString);
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
        groupIcon.scale.setTo(0.3);
    }

    bee.body.bounce.setTo(1);

    bee.inputEnabled = true;
    bee.input.enableDrag(true);

    var energyShape = null;
    var backShape = null;
    var energyShapeWidth = 10;
    var energyShapeHeight = 80;
    var energyShapePercentage = 1;
    var crop = new Phaser.Rectangle(0, 0, energyShapeWidth, energyShapeHeight * energyShapePercentage);
    makeEnergyShape();

    var nectarModel = [];

    this.remove = function () {
        bee.destroy();
        text.destroy();
        energyShape.destroy();
        backShape.destroy();
        if (groupIcon !== null) {
            groupIcon.destroy();
        }
        if (nectarModel.length > 0) {
            nectarModel.forEach(function (n) {
                n.remove();
            });
        }
        reviveIcon.destroy();
        linkDeviceIcon.destroy();
    };

    var reachedActorId = -1;

    function finishTouchAction() {
        while (road.length > 0) {
            road.pop();
        }
        if (reachedActorId !== nextStopActor.id) {
            return;
        }

        var actorLocal = gameControl.idMap.get(actor.currentAction.actor);

        nextStop = null;
        nextStopActor = null;
        bee.body.velocity.setTo(0, 0);
        actorLocal.currentAction.finished = true;
        gameControl.newAction(actorLocal.currentAction);
        actorLocal.currentAction = null;
    }

    function finishScoutAction() {
        nextTargets = null;
        bee.body.velocity.setTo(0, 0);
        var actorLocal = gameControl.idMap.get(actor.currentAction.actor);
        actorLocal.currentAction.finished = true;
        gameControl.newAction(actorLocal.currentAction);
        actorLocal.currentAction = null;
    }

    this.reScale = function (size) {
        var scale = initScale * size / 100;
        bee.scale.setTo(scale);
        bee.rotation = 0.01;

        var per = size / 100;
        energyShape.scale.setTo(per);
        backShape.scale.setTo(per);
    };

    function rotateBee(target) {
        var newRotation = game.physics.arcade.angleBetween(bee, target);
        bee.rotation = newRotation;
        if (newRotation <= -1.6 || newRotation >= 1.6) {
            if (bee.scale.y > 0) {
                bee.scale.y *= -1;
            }
        } else {
            if (bee.scale.y < 0) {
                bee.scale.y *= -1;
            }
        }
    }

    var road = [];

    function plotRoad(x, y, x2, y2) {
        var p1 = new Phaser.Point(x, y);
        var p2 = new Phaser.Point(x2, y2);
        var dis = p1.distance(p2, true);
        p1.rotate(p2.x, p2.y, 60, true, dis / 3 * 2);

        var points = {x: [], y: []};
        points.x.push(x);
        points.y.push(y);
        points.x.push(p1.x);
        points.y.push(p1.y);
        points.x.push(x2);
        points.y.push(y2);

        //var img = game.add.bitmapData(game.width, game.height);
        //img.addToWorld();
        //img.rect(p1.x, p1.y, 20, 20, 'rgba(0, 0, 255, 1)');
        //img.rect(p2.x, p2.y, 20, 20, 'rgba(0, 255, 255, 1)');

        var precision = 1 / 10;
        for (var i = 0; i <= 1; i += precision) {
            var px = game.math.bezierInterpolation(points.x, i);
            var py = game.math.bezierInterpolation(points.y, i);

            //img.rect(px, py, 6, 6, 'rgba(255, 255, 255, 1)');
            road.push({x: px, y: py});
        }

//        for (var p = 0; p < points.x.length; p++) {
//            img.rect(points.x[p] - 5, points.y[p] - 5, 10, 10, 'rgba(255, 0, 0, 1)');
//        }
    }

    function moveAlongRoad() {
        var speed = 400;
        if (gameControl.mode === "replay-local") {
            speed = speed * gameControl.replaySpeed;
        }

        if (road.length > 0) {
            game.physics.arcade.moveToXY(bee, road[0].x, road[0].y, speed);
            if (game.physics.arcade.distanceToXY(bee, road[0].x, road[0].y) < 50) {
                road.splice(0, 1);
            }
        } else {
            game.physics.arcade.moveToObject(bee, nextStop, speed);
        }
    }

    var beeId = actor.id;

    this.update = function () {
        if (nextStop !== null && nextStopActor !== null) {
            moveAlongRoad();

            var targetId = nextStopActor.id;
            rotateBee(nextStop);

            gameControl.allActors.forEach(function (actor) {
                if (actor.id === targetId) {
                    reachedActorId = actor.id;
                    var isCollide = game.physics.arcade.collide(bee, actor.model.sprite, finishTouchAction, null, game);
                    if (!isCollide) {
                        if (game.physics.arcade.distanceToXY(bee, actor.model.sprite.x, actor.model.sprite.y) < 50) {
                            finishTouchAction();
                        }
                    }
                }
            });
        } else if (nextTargets !== null) {
            if (nextTargets.length >= 2) {
                if (nextTargets.length > 2) {
                    gameControl.allActors.forEach(function (actor) {
                        if (actor.type === "f") {
                            game.physics.arcade.collide(bee, actor.model.sprite, function () {
                                nextTargets = nextTargets.splice(2, 2);
                                if (gameControl.mode === "live") {
                                    ws.send("@foundFlower#" + actor.id + "#" + beeId);
                                }
                            }, null, game);
                        }
                    });
                }

                var x = nextTargets[0];
                var y = nextTargets[1];
                game.physics.arcade.moveToXY(bee, x, y, 400);
                rotateBee({x: x, y: y});
                if (game.physics.arcade.distanceToXY(bee, x, y) < 80) {
                    //console.log("Arrived: " + bee.x + " " + bee.y);
                    nextTargets = nextTargets.splice(2, 2);
                    if (nextTargets.length < 1) {
                        finishScoutAction();
                    }
                }
            }
        } else {
            if (actor.dyProps.currentEnergy > 0) {
                if (!actor.dyProps.inHive) {
                    bee.renderable = true;
                    randomShake();
                } else {
                    bee.renderable = false;
                }
                var box = actor.restBoxHive;
                if (box) {
                    for (var i = 0; i < box.lines.length; i++) {
                        game.physics.arcade.collide(bee, box.lines[i], function () {
                            bee.body.bounce.x = 0.7 + Math.random() * 0.3;
                            bee.body.bounce.y = 0.7 + Math.random() * 0.3;
                        });
                    }
                }
            } else {
                bee.body.velocity.setTo(0, 0);
            }
        }
        var per = LastScaleSize / 100;
        energyShape.x = bee.x - 40 * per;
        energyShape.y = bee.y + (energyShapeHeight - 40) * per;
        backShape.x = bee.x - 40 * per;
        backShape.y = bee.y + (energyShapeHeight - 40) * per;
        this.updateLoad();
        this.updateEnergy();

        if (ShowObjectId) {
            text.x = bee.x + 20;
            text.y = bee.y + 30;
        }
        text.visible = ShowObjectId;

        if (groupIcon !== null) {
            if (ShowActorGroup) {
                groupIcon.x = bee.x;
                groupIcon.y = bee.y;
            }
            groupIcon.exists = ShowActorGroup;
        }

        if (actor.device || !ShowGameInfo) {
            linkDeviceIcon.exists = false;
        } else if (!actor.device && ShowGameInfo) {
            linkDeviceIcon.exists = true;
            linkDeviceIcon.x = bee.x - 30;
            linkDeviceIcon.y = bee.y - 30;
        }
    };

    this.updateLoad = function () {
        if (actor.dyProps.currentEnergy <= 0) {
            if (bee.frameName !== "images/bee_die.png") {
                bee.loadTexture("bee-die");
            }
        }

        var i;
        if (actor.dyProps.currentNectar > 0) {
            if (nectarModel.length < actor.dyProps.currentNectar) {
                for (i = 0; i < actor.dyProps.currentNectar - nectarModel.length; i++) {
                    nectarModel.push(new Nectar(game, 0, 0));
                }
                soundYes.play();
            }

            for (i = 0; i < nectarModel.length; i++) {
                nectarModel[i].sprite.x = bee.x - 12 * (i + 1);
                nectarModel[i].sprite.y = bee.y + bee.width - 15 * (i + 1) - 10;
            }

        } else {
            if (nectarModel.length > 0) {
                nectarModel.forEach(function (n) {
                    n.remove();
                });
            }
            nectarModel.length = 0;
        }
    };

    this.goTo = function (target) {
        if (nextStop === null) {
            nextStop = target.model.sprite;
            nextStopActor = target;
            plotRoad(bee.x, bee.y, nextStop.x, nextStop.y);
        } else {
            console.log("Last stop not reached yet");
        }
    };

    var randomMoveCounter = 0;
    var step = Math.PI * 2 / 90;

    function randomShake() {
        var steps = Math.sin(randomMoveCounter);
        bee.rotation += Phaser.Math.degToRad(0.8 * steps);
        randomMoveCounter += step;

        if (Math.abs(bee.body.velocity.x) < 50) {
            bee.body.velocity.x = bee.body.velocity.x * 2;
        }
        if (Math.abs(bee.body.velocity.y) < 50) {
            bee.body.velocity.y = bee.body.velocity.y * 2;
        }
    }

    this.showAtTop = function () {
        if (groupIcon !== null) {
            game.world.bringToTop(groupIcon);
        }
        game.world.bringToTop(bee);
        game.world.bringToTop(text);
        game.world.bringToTop(backShape);
        game.world.bringToTop(energyShape);
    };

    function makeEnergyShape() {
        var back = game.add.bitmapData(energyShapeWidth, energyShapeHeight);
        back.ctx.fillStyle = "#ffffff";
        back.ctx.fillRect(0, 0, energyShapeWidth, energyShapeHeight);
        backShape = game.add.sprite(0, 0, back);
        backShape.angle = 180;

        var bmd = game.add.bitmapData(energyShapeWidth, energyShapeHeight);
        bmd.ctx.globalAlpha = 0.8;
        bmd.ctx.fillStyle = "#00ff00";
        bmd.ctx.fillRect(0, 0, energyShapeWidth, energyShapeHeight);

        energyShape = game.add.sprite(0, 0, bmd);
        energyShape.angle = 180;
        energyShape.crop(crop);
    }

    this.updateEnergy = function () {
        if (!HideBars) {
            energyShapePercentage = actor.dyProps.currentEnergy / actor.dyProps.maxEnergy;
            crop.height = energyShapeHeight * energyShapePercentage;
            energyShape.updateCrop();
        }
        energyShape.exists = !HideBars && !actor.dyProps.inHive;
        backShape.exists = !HideBars && !actor.dyProps.inHive;

        reviveIcon.exists = !HideReviveButton;
        if (energyShapePercentage <= 0) {
            if (gameControl.mode === "live") {
                reviveIcon.x = bee.x - 20 + bee.body.width;
                reviveIcon.y = bee.y - 20 + bee.body.height;
            } else {
                reviveIcon.exists = false;
            }
        } else {
            reviveIcon.exists = false;
        }

    };
}