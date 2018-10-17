function GameControl() {
    this.allActors = [];
    var allActions = [];
    this.currentActionIndex = -1;
    this.mode = "live";
    this.base = null;
    this.startTime = 0;
    this.gameIsPaused = true;
    this.localStartTime = 0;
    var spaceW = 0;
    var spaceH = 0;
    this.sky = {};
    this.replaySpeed = 1;

    this.gamePlace = "remote";
    this.localRawData = null;
    this.topText = "Replay";

    var getGameX = this.getGameX = function (fakeX) {
        var smallWidth = game.width / 4 * 3;
        var offset = game.width / 4 / 2;
        return smallWidth * fakeX / spaceW + offset;
    };
    var getGameY = this.getGameY = function (fakeY) {
        var smallHeight = game.height / 4 * 3;
        var offset = game.height / 4 / 2;
        return smallHeight * fakeY / spaceH + offset;
    };
    var getFakeX = this.getFakeX = function (gameX) {
        var smallWidth = game.width / 4 * 3;
        var offset = game.width / 4 / 2;
        return (gameX - offset) * spaceW / smallWidth;
    };
    var getFakeY = this.getFakeY = function (gameY) {
        var smallHeight = game.height / 4 * 3;
        var offset = game.height / 4 / 2;
        return (gameY - offset) * spaceH / smallHeight;
    };

    this.getActorByType = function (type) {
        for (var i = 1; i < this.allActors.length; i++) {
            var actor = this.allActors[i];
            if (actor.type === type) {
                return actor;
            }
        }
        return null;
    };

    this.initGame = function (game) {
        var rawData = null;
        if (this.gamePlace === "remote") {
            $.ajax({
                url: "getGameState",
                type: "post",
                dataType: "text",
                async: false,
                success: function (data) {
                    rawData = data;
                }
            });
        } else {
            rawData = this.localRawData;
        }

        if (rawData === null) {
            toastr.error("No data from server");
            return;
        }
        var r = JSON.parse(rawData);
        if (this.mode === "replay-local") {
            this.gameIsPaused = false;
            showTopText(this.topText);
        } else {
            showTopText("Live");
            this.gameIsPaused = r.gameIsPaused;
            if (r.gameIsPaused) {
                if (this.mode === "live") {
                    centralGamePaused();
                }
            } else {
                if (this.mode === "live") {
                    centralGameStarted();
                }
            }
        }
        GameType = r.gameType;

        if (r.world.beeSignMode) {
            SpaceLine.exists = true;
            BeeSignMode = true;
        }

        setGameStartTime(r.world.startTime, r.world.gameHolder);
        this.startTime = r.gameStartTimeWithDelay;
        this.localStartTime = new Date().getTime();
        spaceW = r.world.xPositions;
        spaceH = r.world.yPositions;

        var map = new HashMap();
        this.allActors = r.current.allActors;
        allActions = r.current.allActions;
        this.currentActionIndex += allActions.length;
        this.base = r.base;
        var lastAction = null;
        if (this.mode !== "live") {
            this.allActors = this.base.allActors;
            this.currentActionIndex = -1;
        } else {
            if (allActions.length > 0) {
                lastAction = allActions[allActions.length - 1];
                if (lastAction.worldCopy !== null) {
                    var diff = lastAction.worldDurationDiff;
                    gameInfo.text.setText(getDurationText(diff / 1000));
                }
            }
        }
        allActions.forEach(function (action) {
            action.fired = false;//placeholder
            action.finished = false;//placeholder
        });

        for (var i = 0; i < this.allActors.length; i++) {
            map.set(this.allActors[i].id, this.allActors[i]);
        }
        this.idMap = map;

        //building UI models
        var x, y;
        var restBoxes = new HashMap();
        var worldScale = 100;
        if (r.world.worldScale) {
            worldScale = r.world.worldScale;
            LastScaleSize = r.world.worldScale;
            console.log("worldScale: " + worldScale);
        }
        this.allActors.forEach(function (actor) {
            if (actor.type === "h") {
                x = getGameX(actor.dyProps.fakeX);
                y = getGameY(actor.dyProps.fakeY);
                actor.model = new Hive(game, actor, x, y);
                if (!restBoxes.has(actor.name)) {
                    restBoxes.set(actor.name, actor.restBox);
                }
                actor.model.reScale(worldScale);

            } else if (actor.type === "f") {
                x = getGameX(actor.dyProps.fakeX);
                y = getGameY(actor.dyProps.fakeY);
                actor.model = new Flower(game, actor, x, y, spaceW);
                //console.log("new Flower: " + actor.id);
                actor.model.reScale(worldScale);

            } else if (actor.type === "b") {
                actor.model = new Bee(game, actor, 450, 200);//default position
                actor.currentAction = null;//placeholder
                //console.log("new Bee: " + actor.id);
                actor.model.reScale(worldScale);

            } else if (actor.type === "a") {
                actor.model = new Ant(game, actor, 450, 200);
                actor.currentAction = null;//placeholder
                actor.model.reScale(worldScale);

                actor.model.sprite.x = getGameX(actor.dyProps.fakeX);
                actor.model.sprite.y = getGameY(actor.dyProps.fakeY);

            } else if (actor.type === "fountain") {
                x = getGameX(actor.dyProps.fakeX);
                y = getGameY(actor.dyProps.fakeY);
                actor.model = new Fountain(game, actor, x, y);

            } else if (actor.type === "hive-exit") {
                x = getGameX(actor.dyProps.fakeX);
                y = getGameY(actor.dyProps.fakeY);
                actor.model = new HiveExit(game, actor, x, y);

            }
        });

        AllHiveStats.clear();
        AllHiveCharts.forEach(function (chart, key) {
            chart.destroy();
            $("#canvas_holder_" + key).remove();
        });
        AllHiveCharts.clear();

        //re-iterate to assign rest boxes and hive stats and bee position
        this.allActors.forEach(function (actor, index) {
            if (actor.type === "b") {
                initHiveStats(actor);//initiate pie chart data

                if (actor.dyProps.positionId) {
                    var positionActor = map.get(actor.dyProps.positionId);
                    if (positionActor.type === "f") {
                        actor.model.sprite.x = positionActor.model.sprite.x - 40;
                        actor.model.sprite.y = positionActor.model.sprite.y - 100;
                        actor.model.sprite.body.velocity.setTo(0, 0);
                        return;
                    }
                }
                if (restBoxes.has(actor.name)) {
                    var box = restBoxes.get(actor.name);
                    actor.restBoxHive = box;
                    actor.model.sprite.x = box.boxX + 50;
                    actor.model.sprite.y = box.boxY + 50;
                    actor.model.sprite.body.velocity.setTo(50 + index * 10, 50 + index * 10);
                }
            }
            if (actor.type === "a") {
                initHiveStats(actor);//initiate pie chart data
            }
        });


        //enable last action's sky
        var weather = null;
        if (lastAction !== null) {
            weather = lastAction.worldCopy.weather;
        } else {
            weather = "makeSun";
        }
        this.sky.model = new Sky(game, weather, 125, 0);
        this.sky.type = "sky";
        this.allActors.push(this.sky);

        this.reArrangeDisplay();

        GAME_REFRESH_TIMER = setInterval(function () {
            gameControl.doNextAction();
        }, 200);

        this.showLiveTime(true);
    };

    this.reArrangeDisplay = function () {
        this.allActors.forEach(function (actor) {
            if (actor.type === "b" || actor.type === "a") {
                actor.model.showAtTop();
            }
        });
    };

    this.doNextAction = function () {
        if (this.isAddingAction) {
            console.log("Waiting for newAction()");
            return;
        }
        //showAllAction();
        if (this.gameIsPaused) {
            console.log("gameIsPaused");
            return;
        }

        if (this.currentActionIndex + 1 >= allActions.length) {
            //console.log("No more actions");
            //console.log("Game Mode: " + this.mode);
            if (this.mode === "replay-local") {
                this.mode = "end";
                if (endReplay !== null) {
                    endReplay();
                }
            }
            return;
        }

        if (this.replaySpeed > 1 && this.mode === "replay-local") {
            this.localStartTime -= 200 * (this.replaySpeed - 1);
            console.log("replay is faster");
        }
        var worldDiff, localDiff, timeDiff;

        //check and fire all available async actions
        var now = new Date().getTime();
        for (var i = this.currentActionIndex + 1; i < allActions.length; i++) {
            if (this.mode !== "live") {
                worldDiff = allActions[i].worldDurationDiff;
                localDiff = now - this.localStartTime;
                timeDiff = localDiff - worldDiff;
                if (timeDiff < 0) {
                    //console.log("Not yet for the next action to fire: " + allActions[i].actionIndex);
                    break;
                }
            }
            var beeActor;
            if (allActions[i].type === "touch") {
                if (!allActions[i].fired && !allActions[i].finished) {
                    beeActor = this.idMap.get(allActions[i].actor);
                    var destActor = this.idMap.get(allActions[i].reactor);
                    if (beeActor.currentAction === undefined) {
                        toastr.error("Error: Actor is not initialized");
                        return;
                    }
                    if (beeActor.currentAction === null) {
                        //console.log("Fire touch action: " + allActions[i].actionIndex);
                        beeActor.currentAction = allActions.splice(i, 1)[0];//remove action
                        beeActor.currentAction.fired = true;
                        beeActor.model.goTo(destActor);
                    }
                }
            } else if (allActions[i].type === "beeOut") {
                beeActor = this.idMap.get(allActions[i].actor);
                beeActor.dyProps.inHive = false;
                if (beeActor.type === "b") {
                    beeActor.model.sprite.loadTexture("bee");
                } else if (beeActor.type === "a") {
                    beeActor.model.sprite.loadTexture("ant");
                }
            }
        }

        var nextAction = allActions[this.currentActionIndex + 1];
        if (nextAction === undefined) {
            //action might be removed
            return;
        }

        //check async finish
        if (nextAction.type === "touch" && !nextAction.finished) {
            console.log("Touch Action is not async-finished yet!");
            return;
        }

        //check action time
        worldDiff = nextAction.worldDurationDiff;
        localDiff = new Date().getTime() - this.localStartTime;
        timeDiff = localDiff - worldDiff;
        //console.log(localDiff + " - " + worldDiff + " = " + timeDiff);
        if (this.mode !== "live") {
            if (timeDiff < 0) {
                //console.log("Not yet for the next action to happen");
                return;
            }
        }

        //check action index
        if (nextAction.actionIndex !== (this.currentActionIndex + 2)) {
            console.log("Waiting for Action: " + (nextAction.actionIndex - 1));
            return;
        }

        this.currentActionIndex += 1;
        this.applyAction(nextAction, true);

        if (this.mode !== "live") {
            getRootScope().pinpointJumper(nextAction.actionIndex);
        }
        gameInfo.text.setText("Action " + nextAction.actionIndex + " [" + nextAction.type + "] at: " + getDurationText(worldDiff / 1000));
        //console.log("Action is processed: " + nextAction.actionIndex + ", " + nextAction.type);
    };

    var path;//keep position data
    this.applyAction = function (nextAction, showVisualFeedback) {
        var actor = this.idMap.get(nextAction.actor);
        var reactor = this.idMap.get(nextAction.reactor);
        if (actor) {
            if (actor.dyProps) {
                if (actor.dyProps.pathGroup) {
                    path = actor.dyProps.pathGroup;//keep position data
                }
            }
        }

        nextAction.fired = false;
        var actorCopy, reactorCopy, actorLocal, i;

        if (nextAction.type === "touch") {
            actorCopy = nextAction.objectsCopy[0];
            reactorCopy = nextAction.objectsCopy[1];

            actor.status = actorCopy.status;
            actor.dyProps = actorCopy.dyProps;
            actor.dyProps.pathGroup = path;
            reactor.status = reactorCopy.status;
            reactor.dyProps = reactorCopy.dyProps;

            if (actor.dyProps.currentEnergy <= 0) {
                if (showVisualFeedback) {
                    toastr.info("Actor died: (" + actor.id + ")");
                }
            }
            if (reactor.type === "f") {
//                if (predator !== null) {
//                    predator.remove();
//                    predator = null;
//                }
//                var getKilled = Math.random() < 0.5;
//                if (getKilled) {
//                    predator = new Predator(game, null, actor.model.sprite.x, actor.model.sprite.y - 80);
//                    soundEat.onStop.addOnce(function () {
//                        if (predator !== null) {
//                            predator.remove();
//                            predator = null;
//                        }
//                    });
//                    soundEat.play();
//                }
                if (!showVisualFeedback) {
                    console.log("positionId: " + actor.dyProps.positionId);
                    console.log("action id: " + reactor.id);
                    actor.model.sprite.x = reactor.model.sprite.x - 40;
                    actor.model.sprite.y = reactor.model.sprite.y - 100;
                    actor.model.sprite.body.velocity.setTo(0, 0);
                }
            }
            if (reactor.type === "h") {
                if (!showVisualFeedback) {
                    console.log("positionId: " + actor.dyProps.positionId);
                    console.log("action id: " + reactor.id);
                    actor.model.sprite.x = reactor.model.sprite.x - 30;
                    actor.model.sprite.y = reactor.model.sprite.y - 40;
                    actor.model.sprite.body.velocity.setTo(0, 0);
                }
            }
        } else if (nextAction.type === "changeSetting") {
            reactorCopy = nextAction.objectsCopy[0];
            reactor.dyProps = reactorCopy.dyProps;
            if (reactor.type === "f") {
                reactor.model.redraw();
                reactor.model.sprite.loadTexture(reactor.dyProps.flowerType);
            }
        } else if (nextAction.type === "reduceEnergy") {
            for (i = 0; i < nextAction.objectsCopy.length; i++) {
                actorLocal = this.idMap.get(nextAction.objectsCopy[i].id);
                path = actorLocal.dyProps.pathGroup;//keep position data

                actorLocal.dyProps = nextAction.objectsCopy[i].dyProps;
                actorLocal.dyProps.pathGroup = path;

                if (actorLocal.dyProps.currentEnergy <= 0) {
                    if (showVisualFeedback) {
                        toastr.info("Actor died: (" + actorLocal.id + ")");
                    }
                }
            }

        } else if (nextAction.type === "addEnergy") {
            for (i = 0; i < nextAction.objectsCopy.length; i++) {
                actorLocal = this.idMap.get(nextAction.objectsCopy[i].id);
                path = actorLocal.dyProps.pathGroup;//keep position data

                actorLocal.dyProps = nextAction.objectsCopy[i].dyProps;
                actorLocal.dyProps.pathGroup = path;
            }
        } else if (nextAction.type === "makeRain") {
            this.sky.model.makeRain();
        } else if (nextAction.type === "makeSun") {
            this.sky.model.makeSun();
        } else if (nextAction.type === "makeSnow") {
            this.sky.model.makeSnow();
        } else if (nextAction.type === "reduceNectar") {
            for (i = 0; i < nextAction.objectsCopy.length; i++) {
                var actorLocal2 = this.idMap.get(nextAction.objectsCopy[i].id);
                actorLocal2.dyProps = nextAction.objectsCopy[i].dyProps;
            }

        } else if (nextAction.type === "reviveBee") {
            actor.dyProps = nextAction.objectsCopy[0].dyProps;
            if (actor.type === "b") {
                actor.model.sprite.loadTexture("bee");
            } else if (actor.type === "a") {
                actor.model.sprite.loadTexture("ant");
            }
            if (showVisualFeedback) {
                toastr.info("Actor is revived");
            }
        } else if (nextAction.type === "beeOut") {
            if (actor.type === "b") {
                actor.model.sprite.loadTexture("bee");
            } else if (actor.type === "a") {
                actor.model.sprite.loadTexture("ant");
            }

            actorCopy = nextAction.objectsCopy[0];
            actor.dyProps = actorCopy.dyProps;
            actor.dyProps.pathGroup = path;
            if (showVisualFeedback) {
                if (ShowGameInfo) {
                    toastr.info("Actor is out");
                }
            }
        } else if (nextAction.type === "checkTrack") {
            trailContext.clearRect(0, 0, GameWidth, GameHeight);

            var done = new HashMap();

            nextAction.objectsCopy.forEach(function (pathUpdatePack) {
                var actorToUpdate = gameControl.idMap.get(pathUpdatePack.actorId);
                actorToUpdate.dyProps.pathGroup = pathUpdatePack.pathGroup;
                actorToUpdate.dyProps.bestX = pathUpdatePack.bestX;
                actorToUpdate.dyProps.bestY = pathUpdatePack.bestY;
                actorToUpdate.dyProps.velocityHeading = pathUpdatePack.velocityHeading;

                if (actorToUpdate.dyProps.velocityHeading >= 0) {
                    actorToUpdate.model.rotateHead(actorToUpdate.dyProps.velocityHeading);
                }
            });

            var homeColors = new HashMap();
            this.allActors.forEach(function (actor) {
                if (actor.type === "a" && actor.dyProps.pathGroup) {
                    var path = actor.dyProps.pathGroup.points;
                    var lastX = null, lastY = null;

                    if (homeColors.count() === 0) {
                        homeColors.set(actor.dyProps.homeHiveId, "0,0,255");
                    } else if (homeColors.count() === 1) {
                        if (!homeColors.has(actor.dyProps.homeHiveId)) {
                            homeColors.set(actor.dyProps.homeHiveId, "0,255,255");
                        }
                    }

                    path.forEach(function (p, index) {
                        var endX = getGameX(p.x);
                        var endY = getGameY(p.y);

                        if (index === path.length - 1) {
                            lastX = endX;
                            lastY = endY;
                        }

                        if (p.marker && !done.has(p.x + "=" + p.y)) {
                            var opa = 1 - (nextAction.worldDurationDiff - p.born) / p.life;
                            opa = opa * PheromoneOpacity / 100;
                            opa = opa.toFixed(2);

//                        trailContext.beginPath();
//                        trailContext.lineWidth = 5;
//                        trailContext.strokeStyle = "rgba(0,0,0," + opa + ")";
//                        trailContext.moveTo(startX, startY);
//                        trailContext.lineTo(endX, endY);
//                        trailContext.stroke();

                            var color = homeColors.get(actor.dyProps.homeHiveId);

                            trailContext.beginPath();
                            trailContext.arc(endX, endY, 35 * PheromoneSize / 100, 0, 2 * Math.PI, false);
                            trailContext.fillStyle = "rgba(" + color + "," + opa + ")";
                            trailContext.fill();

                            done.set(p.x + "=" + p.y, 1);
                        }
                    });

                    if (lastX !== null && lastY !== null) {
                        actor.model.sprite.body.velocity.setTo(0, 0);
                        actor.model.sprite.x = lastX;
                        actor.model.sprite.y = lastY;

                        if (actor.dyProps.bestX >= 0 && actor.dyProps.bestY >= 0) {
//                            trailContext.beginPath();
//                            trailContext.lineWidth = 4;
//                            trailContext.strokeStyle = "rgb(255,255,0)";
//                            trailContext.moveTo(lastX, lastY);
//                            trailContext.lineTo(gameControl.getGameWidthRatio() * actor.dyProps.bestX, gameControl.getGameHeightRatio() * actor.dyProps.bestY);
//                            trailContext.stroke();
//                            console.log("last: " + lastX + " " + lastY);
//                            console.log("best: " + actor.dyProps.bestX + " " + actor.dyProps.bestY);
                        }
                    }

                }
            });

        }
    };

    this.isAddingAction = false;

    this.newAction = function (action) {
        this.isAddingAction = true;
        //console.log("newAction: " + action.actionIndex);
        allActions.push(action);
        allActions.sort(function (a, b) {
            return a.actionIndex - b.actionIndex;
        });
        this.isAddingAction = false;
    };

    this.advanceToNextAction = function () {
        if (this.isAddingAction) {
            toastr.warning("Please wait after the asynchronous action completion");
            return;
        }
        if (this.currentActionIndex + 1 < allActions.length) {
            var nextAction = allActions[this.currentActionIndex + 1];
            var nowDurationDiff = new Date().getTime() - this.localStartTime;
            var targetDurationDiff = nextAction.worldDurationDiff - 200;
            //console.log("next target duration diff: " + targetDurationDiff + ", " + "now duration diff: " + nowDurationDiff);
            if (targetDurationDiff > nowDurationDiff) {
                this.localStartTime -= (targetDurationDiff - nowDurationDiff);
                //console.log("local advance " + (targetDurationDiff - nowDurationDiff) / 1000 + " seconds");
                toastr.success("Advanced to Action-" + nextAction.actionIndex);
            } else {
                toastr.warning("Wait for next action completion");
            }

        } else {
            toastr.warning("No more actions");
        }
    };

    this.showLiveTime = function (forceShow) {
        if (!forceShow) {
            if (this.mode === "end") {
                return;
            } else {
                if (this.startTime <= 0) {
                    return;
                }
                if (this.gameIsPaused) {
                    return;
                }
            }
        }

        var diff = 0;
        if (this.mode === "live") {
            diff = new Date().getTime() - this.startTime;
        } else {
            diff = new Date().getTime() - this.localStartTime;
        }
        var text = getLiveTimeText(diff / 1000);
        $("#timestamp_display").text(text);
    };

    function showAllAction() {
        var s = "";
        allActions.forEach(function (action) {
            s += action.actionIndex + ", ";
        });
        console.log(s);
    }

    this.applyActionsToBaseModel = function (actionIndex) {
        var index = 0;
        var action;
        while (index <= actionIndex && index < allActions.length) {
            action = allActions[index];
            //console.log("Apply action " + action.actionIndex + ": " + action.type);

            this.applyAction(action, false);
            index += 1;
        }

        this.localStartTime = new Date().getTime() - action.worldDurationDiff;
        this.showLiveTime(true);
        this.currentActionIndex = index - 1;
    };

    this.totalAction = function () {
        return allActions.length;
    };

    this.getActionInfo = function (actionNumber) {
        var action = allActions[actionNumber - 1];
        if (!action) {
            return "";
        }
        return "Action " + action.actionIndex + ": " + action.type + ", at " + getLiveTimeText(action.worldDurationDiff / 1000);
    };
}

var GAME_REFRESH_TIMER = null;

function getDurationText(seconds) {
    return moment.duration(seconds, "seconds").format("m [min] s [sec]");
}

function getLiveTimeText(seconds) {
    return moment.duration(seconds, "seconds").format("mm:ss", {trim: false});
}