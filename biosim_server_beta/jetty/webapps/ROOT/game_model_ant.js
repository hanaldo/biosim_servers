function Ant(game, actor, x, y) {
    var initScale = 0.5;

    var ant = game.add.sprite(x, y, "ant");
    var reviveIcon = game.add.sprite(x, y, "bee-revive");
    reviveIcon.scale.setTo(0.5);
    reviveIcon.inputEnabled = true;
    reviveIcon.events.onInputDown.add(function () {
        ws.send("@new#" + actor.id);
        toastr.info("Send player " + actor.id + " to mini-game");
    });

    var linkDeviceIcon = game.add.sprite(x, y, "no-link");
    linkDeviceIcon.scale.setTo(0.5);

    var arrowIcon = game.add.sprite(x, y, "arrow");
    arrowIcon.scale.setTo(0.5);
    arrowIcon.anchor.setTo(0.5, 0.5);

    ant.scale.setTo(initScale);
    game.physics.enable(ant, Phaser.Physics.ARCADE);
    ant.anchor.setTo(.5, .5);//for flip
    this.sprite = ant;
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

    ant.body.bounce.setTo(1);

    ant.inputEnabled = true;
    ant.input.enableDrag(true);

    var energyShape = null;
    var backShape = null;
    var energyShapeWidth = 10;
    var energyShapeHeight = 80;
    var energyShapePercentage = 1;
    var crop = new Phaser.Rectangle(0, 0, energyShapeWidth, energyShapeHeight * energyShapePercentage);
    makeEnergyShape();

    this.remove = function () {
        ant.destroy();
        text.destroy();
        energyShape.destroy();
        backShape.destroy();
        if (groupIcon !== null) {
            groupIcon.destroy();
        }
        reviveIcon.destroy();
        linkDeviceIcon.destroy();
        arrowIcon.destroy();
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
        ant.body.velocity.setTo(0, 0);
        actorLocal.currentAction.finished = true;
        gameControl.newAction(actorLocal.currentAction);
        actorLocal.currentAction = null;
    }

    function finishScoutAction() {
        nextTargets = null;
        ant.body.velocity.setTo(0, 0);
        var actorLocal = gameControl.idMap.get(actor.currentAction.actor);
        actorLocal.currentAction.finished = true;
        gameControl.newAction(actorLocal.currentAction);
        actorLocal.currentAction = null;
    }

    this.reScale = function (size) {
        var scale = initScale * size / 100;
        ant.scale.setTo(scale);
        ant.rotation = 0.01;

        var per = size / 100;
        energyShape.scale.setTo(per);
        backShape.scale.setTo(per);
    };

    function rotateBee(target) {
        var newRotation = game.physics.arcade.angleBetween(ant, target);
        ant.rotation = newRotation;
        if (newRotation <= -1.6 || newRotation >= 1.6) {
            if (ant.scale.y > 0) {
                ant.scale.y *= -1;
            }
        } else {
            if (ant.scale.y < 0) {
                ant.scale.y *= -1;
            }
        }
    }

    this.rotateHead = function (degree) {
        ant.angle = degree + 90;//translate to Phaser dimension
        if (ant.angle <= -90 || ant.angle >= 120) {
            if (ant.scale.y > 0) {
                ant.scale.y *= -1;
            }
        } else {
            if (ant.scale.y < 0) {
                ant.scale.y *= -1;
            }
        }
    };

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
            speed = speed * gameControl.replaySpeed
        }

//        if (road.length > 0) {
//            game.physics.arcade.moveToXY(ant, road[0].x, road[0].y, speed);
//            if (game.physics.arcade.distanceToXY(ant, road[0].x, road[0].y) < 50) {
//                road.splice(0, 1);
//            }
//        } else {
//            game.physics.arcade.moveToObject(ant, nextStop, speed);
//        }
        game.physics.arcade.moveToObject(ant, nextStop, speed);
    }

    var antId = actor.id;

    this.update = function () {
        if (nextStop !== null && nextStopActor !== null) {
            moveAlongRoad();

            var targetId = nextStopActor.id;
            rotateBee(nextStop);

            gameControl.allActors.forEach(function (actor) {
                if (actor.id === targetId) {
                    reachedActorId = actor.id;
                    var isCollide = game.physics.arcade.collide(ant, actor.model.sprite, finishTouchAction, null, game);
                    if (!isCollide) {
                        if (game.physics.arcade.distanceToXY(ant, actor.model.sprite.x, actor.model.sprite.y) < 50) {
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
                            game.physics.arcade.collide(ant, actor.model.sprite, function () {
                                nextTargets = nextTargets.splice(2, 2);
                                if (gameControl.mode === "live") {
                                    ws.send("@foundFlower#" + actor.id + "#" + antId);
                                }
                            }, null, game);
                        }
                    });
                }

                var x = nextTargets[0];
                var y = nextTargets[1];
                game.physics.arcade.moveToXY(ant, x, y, 400);
                rotateBee({x: x, y: y});
                if (game.physics.arcade.distanceToXY(ant, x, y) < 80) {
                    //console.log("Arrived: " + ant.x + " " + ant.y);
                    nextTargets = nextTargets.splice(2, 2);
                    if (nextTargets.length < 1) {
                        finishScoutAction();
                    }
                }
            }
        } else {
            if (actor.dyProps.currentEnergy > 0) {
                ant.renderable = !actor.dyProps.inHive;
            } else {
                ant.body.velocity.setTo(0, 0);
            }
        }
        var per = LastScaleSize / 100;
        energyShape.x = ant.x;
        energyShape.y = ant.y + (energyShapeHeight - 40) * per;
        backShape.x = ant.x;
        backShape.y = ant.y + (energyShapeHeight - 40) * per;
        this.updateLoad();
        this.updateEnergy();

        if (ShowObjectId) {
            text.x = ant.x + 20;
            text.y = ant.y + 30;
        }
        text.visible = ShowObjectId;

        if (groupIcon !== null) {
            if (ShowActorGroup) {
                groupIcon.x = ant.x;
                groupIcon.y = ant.y;
            }
            groupIcon.exists = ShowActorGroup;
        }

        if (actor.device || !ShowGameInfo) {
            linkDeviceIcon.exists = false;
        } else if (!actor.device && ShowGameInfo) {
            linkDeviceIcon.exists = true;
            linkDeviceIcon.x = ant.x - 30;
            linkDeviceIcon.y = ant.y - 30;
        }

        arrowIcon.exists = false;
//        if (actor.dyProps.velocityHeading && actor.dyProps.velocityHeading >= 0) {
//            arrowIcon.exists = true;
//            arrowIcon.x = ant.x - ant.width / 2;
//            arrowIcon.y = ant.y - ant.height / 2;
//            arrowIcon.angle = actor.dyProps.velocityHeading + 90;//translate to Phaser dimension
//        } else {
//            arrowIcon.exists = false;
//        }
    };

    var currentFood = 0;
    this.updateLoad = function () {
        if (actor.dyProps.currentEnergy <= 0) {
            if (ant.frameName !== "images/ant2-dead.png") {
                ant.loadTexture("ant-dead");
            }
            return;
        }
        if (actor.dyProps.currentNectar > 0) {
            if (actor.dyProps.currentNectar === 1) {
                ant.loadTexture("ant-food1");
            } else if (actor.dyProps.currentNectar === 2) {
                ant.loadTexture("ant-food2");
            } else if (actor.dyProps.currentNectar === 3) {
                ant.loadTexture("ant-food3");
            }
            if (currentFood < actor.dyProps.currentNectar) {
                soundYes.play();
                currentFood = actor.dyProps.currentNectar;
            }
        } else {
            if (currentFood !== -1) {
                ant.loadTexture("ant");
                currentFood = -1;
            }
        }
    };

    this.goTo = function (target) {
        if (nextStop === null) {
            nextStop = target.model.sprite;
            nextStopActor = target;
            plotRoad(ant.x, ant.y, nextStop.x, nextStop.y);
        } else {
            console.log("Last stop not reached yet");
        }
    };

    this.showAtTop = function () {
        if (groupIcon !== null) {
            game.world.bringToTop(groupIcon);
        }
        game.world.bringToTop(ant);
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
                reviveIcon.x = ant.x - 20 + ant.body.width;
                reviveIcon.y = ant.y - 20 + ant.body.height;
            } else {
                reviveIcon.exists = false;
            }
        } else {
            reviveIcon.exists = false;
        }

    };
}