function createWebSocket() {
    if ("WebSocket" in window) {
        var ws;
        ws = new WebSocket("ws://" + window.location.host + "/playGame");
        ws.onopen = function () {
            console.log("Socket chat is open...");
        };
        ws.onmessage = function (evt) {
            try {
                if (gameControl.mode !== "live") {
                    console.log("Do not read server messages when not in Live Mode");
                    return;
                }

                var received_msg = evt.data;
                //console.log(received_msg);
                var action = JSON.parse(received_msg);
                //var message = JSON.parse(received_msg);
                switch (action.type) {
                    case "invalid":
                        toastr.warning(action.temp);
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
                                title: "Action required!",
                                message: "Please touch a passive device",
                                cssClass: "setting-dialog"
                            });
                        } else {
                            toastr.warning("Cannot get a passive device");
                        }
                        break;
                    case "beeOut":
                        gameControl.newAction(action);
                        break;
                    case "goScout":
                        action.fired = false;//placeholder
                        action.finished = false;//placeholder
                        gameControl.newAction(action);
                        break;
                    case "moveActor":
                        var fakeX = parseInt(action.temp.split(",")[0]);
                        var fakeY = parseInt(action.temp.split(",")[1]);
                        var newX = gameControl.getGameWidthRatio() * fakeX;
                        var newY = gameControl.getGameHeightRatio() * fakeY;
                        var actorToMove = gameControl.idMap.get(action.actor);
                        actorToMove.model.sprite.x = newX;
                        actorToMove.model.sprite.y = newY;
                        break;
                    case "trackMove":
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
                    case "getFlower":
                        gameControl.newAction(action);
                        break;
                    case "beeNotOut":
                        var bee = gameControl.idMap.get(action.actor);
                        bee.model.sprite.loadTexture("bee-out");
                        bee.dyProps.inHive = false;
                        bee.model.sprite.body.velocity.setTo(0, 0);
                        break;
                    default:
                        console.log(action.temp);
                        break;
                }
            } catch (e) {
                toastr.error(e);
            }
        };
        ws.onclose = function () {
            alert("Connection to server is closed, please refresh page");
        };
        var dialog = null;
        return ws;
    }
    else {
        alert("Your browser does not support WebSocket, please change to a modern one");
        return null;
    }
}