function createWebSocket() {
    if ("WebSocket" in window) {
        var ws;
        ws = new WebSocket("ws://" + window.location.host + "/playGame");
        ws.onopen = function () {
            console.log("Game Socket is open...");
        };
        ws.onmessage = function (evt) {
            try {
                var received_msg = evt.data;
                var action = JSON.parse(received_msg);

                //admin messages
                var root = getRootScope();
                switch (action.type) {
                    case "adminLinkXBee":
                        var items = action.temp.split("#");
                        if (items[0] === "ok") {
                            root.xbeeIsOn = true;
                            root.xbeeIsConnecting = false;
                            toastr.success("XBee is connected: " + items[1]);
                            root.xbeeName = items[1];
                        } else {
                            root.xbeeIsOn = false;
                            root.xbeeIsConnecting = false;
                        }
                        root.$apply();
                        return;
                    case "adminStopXBee":
                        root.xbeeIsOn = false;
                        root.xbeeIsConnecting = false;
                        root.$apply();
                        return;
                    default:
                        break;
                }

                if (gameControl.mode !== "live") {
                    console.log("Do not read server messages when not in Live Mode");
                    return;
                }

                //console.log(received_msg);
                switch (action.type) {
                    case "invalid":
                        //toastr.warning(action.temp);
                        console.log("game warning: " + action.temp);
                        break;
                    case "touch":
                        action.fired = false;//placeholder
                        action.finished = false;//placeholder
                        gameControl.newAction(action);
                        break;
                    case "changeSetting":
                        gameControl.newAction(action);
                        if (gameControl.mode === "live" && gameControl.gameIsPaused) {
                            gameControl.applyAction(action, false);
                            console.log("apply changeSetting at pause when live");
                        }
                        break;
                    case "reduceEnergy":
                        gameControl.newAction(action);
                        break;
                    case "addEnergy":
                        gameControl.newAction(action);
                        break;
                    case "makeSun":
                        gameControl.newAction(action);
                        break;
                    case "makeRain":
                        gameControl.newAction(action);
                        break;
                    case "makeSnow":
                        gameControl.newAction(action);
                        break;
                    case "reduceNectar":
                        gameControl.newAction(action);
                        break;
                    case "reviveBee":
                        gameControl.newAction(action);
                        break;
                    case "startGame":
                        gameControl.startTime = action.temp;
                        gameControl.gameIsPaused = false;
                        centralGameStarted();
                        break;
                    case "pauseGame":
                        gameControl.gameIsPaused = true;
                        centralGamePaused();
                        break;
                    case "searchActive":
                        if (action.temp) {
                            toastr.info("Start linking active devices...");
                        } else {
                            toastr.warning("Cannot start linking active devices");
                        }
                        break;
                    case "hasDevice":
                        var actorId = action.actor;
                        var deviceId = action.temp;
                        var actor = gameControl.idMap.get(actorId);
                        actor.device = deviceId;
                        if (actor.dyProps.nameTag) {
                            actor.model.idText.setText(actor.id.toString() + "::" + actor.dyProps.nameTag + "::" + actor.device);
                        } else {
                            actor.model.idText.setText(actor.id.toString() + "::" + actor.device);
                        }
                        if (dialog !== null) {
                            dialog.close();
                        }
                        toastr.info("One device is linked\n" + actor.id.toString() + " - " + actor.device + " - " + actor.dyProps.nameTag);
                        break;
                    case "searchOne":
                        if (action.temp) {
                            dialog = BootstrapDialog.show({
                                type: BootstrapDialog.TYPE_INFO,
                                title: "Link device for Actor " + action.actor,
                                message: "Please touch a passive device (i.e. a RFID tag)",
                                cssClass: "setting-dialog"
                            });
                        } else {
                            toastr.warning("Cannot get a passive device");
                        }
                        break;
                    case "beeOut":
                        gameControl.newAction(action);
                        break;
                    case "moveActor":
                        var fakeX = parseInt(action.temp.split(",")[0]);
                        var fakeY = parseInt(action.temp.split(",")[1]);
                        var newX = gameControl.getGameX(fakeX);
                        var newY = gameControl.getGameY(fakeY);
                        var actorToMove = gameControl.idMap.get(action.actor);
                        actorToMove.model.sprite.x = newX;
                        actorToMove.model.sprite.y = newY;
                        break;
                    case "checkTrack":
                        gameControl.newAction(action);
                        break;
                    case "spaceCopy":
                        game.paused = true;
                        removeAll();
                        gameControl.currentAction = null;
                        gameControl.currentActionFinished = true;
                        initModels();
                        game.paused = false;
                        break;
                    case "beeNotOut":
                        var bee = gameControl.idMap.get(action.actor);
                        bee.model.sprite.loadTexture("bee-out");
                        bee.dyProps.inHive = false;
                        bee.model.sprite.body.velocity.setTo(0, 0);
                        break;
                    case "openFood":
                        var food = gameControl.idMap.get(action.actor);
                        var timer = game.time.create(true);
                        food.model.sprite.loadTexture("small-food");
                        timer.add(2000, function () {
                            food.model.sprite.loadTexture(food.dyProps.flowerType);
                        });
                        timer.start();
                        break;
                    default:
                        console.log("Unkown action type: " + action.type);
                        console.log(action.temp);
                        break;
                }
            } catch (e) {
                console.error(e);
                toastr.error(e);
            }
        };
        ws.onclose = function () {
            alert("Connection to server is closed, please refresh page");
        };
        var dialog = null;
        return ws;
    } else {
        alert("Your browser does not support WebSocket, please change to a modern one");
        return null;
    }
}