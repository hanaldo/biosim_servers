function RootControl($scope, $upload, $http, $filter) {
    ws = createWebSocket();

    $scope.onGameFileSelect = function ($files) {
        var file = $files[$files.length - 1];

        $upload.upload({
            url: "uploadNewGame",
            method: "POST",
            file: file
        }).success(function () {
            alert("Okay, new game is created");
            location.reload();
        }).error(function () {
            alert("Sometime is wrong, please refresh the web page");
        });
    };

    $scope.newGame = function () {
        var r = confirm("Are you sure?\nThis will discard the current live game.");
        if (r == true) {
            var config = JSON.stringify({gameHolder: $scope.gameHolder,
                actorGroups: $scope.actorGroups,
                spaceW: $scope.spaceW,
                spaceH: $scope.spaceH
            });
            $.ajax({
                url: "newGame",
                type: "post",
                data: {values: config},
                async: false,
                success: function () {
                    location.reload();
                }
            });
        }
    };

    $scope.pauseDisplay = function () {
        game.paused = true;
    };

    $scope.resumeDisplay = function () {
        game.paused = false;
    };

    $scope.getGameFile = function () {
        $.ajax({
            url: "getGameFileCopy",
            type: "post",
            dataType: "text",
            async: false,
            success: function (data) {
                window.open(data, '', 'width=400,height=300');
                BootstrapDialog.closeAll();
            },
            error: function () {
                BootstrapDialog.closeAll();
                toastr.error("No game file available");
            }
        });
    };

    $scope.remakeGame = function () {
        var r = confirm("Are you sure?\nThis will discard the progress of current live game.");
        if (r == true) {
            $.ajax({
                url: "remakeGame",
                type: "post",
                async: false,
                success: function () {
                    alert("Game is restarted");
                    location.reload();
                }
            });
        }
    };

    $scope.goBackToLive = function () {
        location.reload();
    };

    $scope.listActors = function () {
        window.open("game_ui_actor_list.html", "", "width=800,height=600");
    };

    $scope.changeBackground = function (key) {
        land.loadTexture(key);
    };


    /*
     ------------------------------------------------------------------------------------
     UI controls
     */
    $scope.centralGamePause = false;
    $scope.showSunButton = false;
    $scope.showSnowButton = true;

    if (ShowActorGroup) {
        $scope.showGroupButton = "Hide Groups";
    } else {
        $scope.showGroupButton = "Show Groups";
    }
    $scope.showGroups = function () {
        ShowActorGroup = !ShowActorGroup;
        if (ShowActorGroup) {
            $scope.showGroupButton = "Hide Groups";
        } else {
            $scope.showGroupButton = "Show Groups";
        }
    };

    if (ShowObjectId) {
        $scope.showIdsButton = "Hide Object IDs";
    } else {
        $scope.showIdsButton = "Show Object IDs";
    }
    $scope.showIds = function () {
        ShowObjectId = !ShowObjectId;
        if (ShowObjectId) {
            $scope.showIdsButton = "Hide Object IDs";
        } else {
            $scope.showIdsButton = "Show Object IDs";
        }
    };

    $scope.showBarsButton = "Hide Bars";
    $scope.showBars = function () {
        HideBars = !HideBars;
        if (HideBars) {
            $scope.showBarsButton = "Show Bars";
        } else {
            $scope.showBarsButton = "Hide Bars";
        }
    };

    $scope.showReviveButton = "Show Revive Button";
    $scope.showRevive = function () {
        HideReviveButton = !HideReviveButton;
        if (HideReviveButton) {
            $scope.showReviveButton = "Show Revive Button";
        } else {
            $scope.showReviveButton = "Hide Revive Button";
        }
    };

    setGameStartTime = function (time, name) {
        $scope.gameStartTime = time;
        $scope.gameHolder = name;
        //$scope.$apply();
    };

    $scope.actorTypes = [
        {name: "Bee", value: "b"},
        {name: "Hive", value: "h"},
        {name: "Flower", value: "f"},
        {name: "Ant", value: "ant"}
    ];

    $scope.groupNumbers = [
        {name: "Group 1", value: "g1"},
        {name: "Group 2", value: "g2"},
        {name: "Group 3", value: "g3"}
    ];

    $scope.actorGroups = [];
    $scope.addActorGroup = function () {
        $scope.actorGroups.push({type: null,
            number: 0,
            group: null,
            x: -1,
            y: -1,
            maxNectar: 0,
            currentNectar: 0,
            maxEnergy: 0,
            currentEnergy: 0});
    };
    $scope.removeActorGroup = function (index) {
        $scope.actorGroups.splice(index, 1);
    };

    $scope.spaceW = 50;
    $scope.spaceH = 50;

    $scope.applyActorSetting = function () {
        $scope.isApplyingSetting = true;
        if (currentSettingActor) {
            if (currentSettingActor.type === "f") {
                currentSettingActor.model.applySetting($scope.fRange, $scope.nLevel, $scope.nMax, $scope.nQuality, $scope.flowerType);
            } else if (currentSettingActor.type === "h") {
                currentSettingActor.model.applySetting($scope.nLevel,
                        $scope.nMax,
                        $scope.dance,
                        $scope.nectarQuality,
                        $scope.doTrail,
                        $scope.recruitAtHome);
            }
        }
        BootstrapDialog.closeAll();
    };

    $scope.makeSun = function () {
        var weatherMakerId = gameControl.getActorByType("makeSun").id;
        ws.send("@changeWeather#" + weatherMakerId);
    };
    $scope.makeRain = function () {
        var weatherMakerId = gameControl.getActorByType("makeRain").id;
        ws.send("@changeWeather#" + weatherMakerId);
    };
    $scope.makeSnow = function () {
        var weatherMakerId = gameControl.getActorByType("makeSnow").id;
        ws.send("@changeWeather#" + weatherMakerId);
    };

    $scope.isFullscreenNow = false;

    $scope.fullDisplay = function () {
        launchIntoFullscreen(document.documentElement);
        $scope.isFullscreenNow = true;
    };

    $scope.normalDisplay = function () {
        cancelFullscreen();
        $scope.isFullscreenNow = false;
    };

    $scope.revive = function () {
        ws.send("@reviveBee#" + $scope.reviveId);
    };

    $scope.showGameInfo = function () {
        ShowGameInfo = !ShowGameInfo;
        gameInfo.text.visible = ShowGameInfo;
    };

    $scope.showHive = false;
    $scope.switchHiveView = function () {
        game.paused = true;
        $scope.showHive = !$scope.showHive;
        game.paused = false;
    };


    /*
     ------------------------------------------------------------------------------------
     Replay Control
     */
    $scope.canSaveReplay = true;
    $scope.enterReplayMode = function () {
        BootstrapDialog.show({
            type: BootstrapDialog.TYPE_WARNING,
            cssClass: "setting-dialog",
            title: "Entering Replay Mode",
            message: "Are you sure you want to enter the Replay Mode?\nThe current game will be paused.",
            buttons: [
                {
                    label: "Ok",
                    action: function (dialog) {
                        $scope.pauseCentralGame();
                        $.ajax({
                            url: "getGameState",
                            type: "post",
                            dataType: "text",
                            success: function (data) {
                                dialog.close();
                                lastJsonFile = data;
                                $scope.canSaveReplay = true;
                                gameControl.topText = "Replay: Just Now";
                                $scope.createGameReplay(data);
                                $scope.$apply();
                            }
                        });
                    }
                },
                {
                    label: "Maybe not",
                    action: function (dialog) {
                        dialog.close();
                    }
                }
            ]
        });
    };

    endReplay = function () {
        $scope.replayStatus = "end";
        $scope.$apply();
        toastr.success("The End!");
    };

    $scope.gameMode = "Live Game";
    $scope.nowReplayMode = false;
    $scope.nowLiveMode = true;

    $scope.replayStatus = "end";
    $scope.canReplayPause = function () {
        return $scope.replayStatus === "started";
    };
    $scope.canReplayResume = function () {
        return $scope.replayStatus === "paused";
    };
    $scope.canReplayAdvance = function () {
        return $scope.replayStatus !== "end";
    };

    var lastJsonFile = null;
    var jumpSlider = null;
    var speedSlider = null;
    $scope.createGameReplay = function (json) {
        game.paused = true;
        removeAll();
        gameControl.mode = "replay-local";
        $scope.gameMode = "Replay Saved Game";
        gameControl.currentAction = null;
        gameControl.currentActionFinished = true;
        gameControl.gamePlace = "local";
        gameControl.localRawData = json;
        initModels();
        $scope.nowReplayMode = true;
        $scope.nowLiveMode = false;
        $scope.cannotSaveGame = true;
        game.paused = false;
        var timeText = $("#timestamp_display");
        timeText.css("visibility", "visible");
        timeText.addClass("my-orange");
        $scope.replayStatus = "started";


        var actionNumber = -1;
        var waitedTimeout = null;

        function updateActionTarget() {
            if (waitedTimeout !== null) {
                clearTimeout(waitedTimeout);
            }
            $("#jumpSlider .slider-handle").addClass("slider-not-ready");
            actionNumber = jumpSlider.bootstrapSlider("getValue");
            waitedTimeout = setTimeout(function () {
                if (actionNumber > -1) {
                    $scope.jumpLocalReplay(actionNumber - 1);
                    $scope.$apply();
                    clearActionTarget();
                }
            }, 2000);
        }

        function clearActionTarget() {
            actionNumber = -1;
            waitedTimeout = null;
            $("#jumpSlider .slider-handle").removeClass("slider-not-ready");
        }

        if (jumpSlider === null) {
            $("#local_replay_jumper").show();
            jumpSlider = $("#jump_slider").bootstrapSlider({tooltip: "always", min: 1, value: 1,
                formatter: function (actionNumber) {
                    return gameControl.getActionInfo(actionNumber);
                }
            });
            jumpSlider.on("change", function () {
                updateActionTarget();
            });
            jumpSlider.on("slideStart", function () {
                updateActionTarget();
            });
            jumpSlider.on("slideStop", function () {
                if (waitedTimeout !== null) {
                    clearTimeout(waitedTimeout);
                    actionNumber = jumpSlider.bootstrapSlider("getValue");
                    $scope.jumpLocalReplay(actionNumber - 1);
                    $scope.$apply();
                    clearActionTarget();
                }
            });
        }
        jumpSlider.bootstrapSlider("setAttribute", "max", gameControl.totalAction());
        jumpSlider.bootstrapSlider("setValue", 1, false, false);

        if (speedSlider === null) {
            $("#replay_speed_picker").show();
            speedSlider = $("#speed_slider").bootstrapSlider({tooltip: "always", min: 1, value: 1, max: 3,
                formatter: function (speed) {
                    return speed + "x";
                }
            });
            speedSlider.on("slideStop", function (v) {
                console.log("speed: " + v.value);
                gameControl.replaySpeed = v.value;
            });
        }
    };

    $scope.pinpointJumper = function (actionNumber) {
        jumpSlider.bootstrapSlider("setValue", actionNumber, false, false);
    };

    $scope.onFileSelect = function ($files) {
        var file = $files[$files.length - 1];

        var jsonFileName;
        JSZip.loadAsync(file).then(function (zip) {
            jsonFileName = Object.keys(zip.files)[0];
            return zip.file(jsonFileName).async("string");
        }).then(function (jsonReplayString) {
            lastJsonFile = jsonReplayString;
            $scope.canSaveReplay = false;
            gameControl.topText = "Replay: " + jsonFileName;
            $scope.createGameReplay(jsonReplayString);
            $scope.$apply();
        });

        BootstrapDialog.closeAll();
    };

    $scope.restartLocalReplay = function () {
        $scope.createGameReplay(lastJsonFile);
    };
    var pauseStartTime = null;
    $scope.resumeLocalReplay = function () {
        if ($scope.replayStatus === "paused") {
            $scope.replayStatus = "started";
            gameControl.gameIsPaused = false;
            var now = new Date().getTime();
            var diff = now - pauseStartTime;
            gameControl.localStartTime += diff;
            console.log("paused " + diff / 1000 + " seconds");
        }
    };
    $scope.pauseLocalReplay = function () {
        if ($scope.replayStatus === "started") {
            $scope.replayStatus = "paused";
            gameControl.gameIsPaused = true;
            pauseStartTime = new Date().getTime();
        }
    };
    $scope.gameControlIsPaused = function () {
        return gameControl.gameIsPaused;//to-do: button not update when json-gameIsPaused is True
    };
    $scope.advanceLocalReplay = function () {
        gameControl.advanceToNextAction();
        gameControl.showLiveTime(true);
    };

    $scope.jumpLocalReplay = function (actionIndex) {
        game.paused = true;
        removeAll();
        gameControl.mode = "replay-local";
        $scope.gameMode = "Replay Saved Game";
        gameControl.currentAction = null;
        gameControl.currentActionFinished = true;
        gameControl.gamePlace = "local";
        gameControl.localRawData = lastJsonFile;
        initModels();
        gameControl.applyActionsToBaseModel(actionIndex);
        $scope.nowReplayMode = true;
        $scope.nowLiveMode = false;
        $scope.cannotSaveGame = true;
        game.paused = false;
        var timeText = $("#timestamp_display");
        timeText.css("visibility", "visible");
        timeText.addClass("my-orange");
        $scope.replayStatus = "started";
        $scope.pauseLocalReplay();
    };


    /*
     ------------------------------------------------------------------------------------
     Replay Files Control
     */
    $scope.newReplayName = "";
    $scope.replayPostfix = "...";
    $scope.formatPostfix = function () {
        var r = JSON.parse(lastJsonFile);
        var timeLong = r.world.startTime;
        var dateString = $filter("date")(timeLong, "yyyy_M_d_HHmm");
        $scope.replayPostfix = "." + dateString + ".replay";
    };
    $scope.cancelReplayName = function () {
        BootstrapDialog.closeAll();
    };
    $scope.saveReplay = function () {
        var name = $scope.newReplayName + $scope.replayPostfix;
        $.ajax({
            url: "saveReplayFile",
            type: "post",
            async: false,
            data: {name: name},
            success: function () {
                alert("Replay " + name + " is saved");
                BootstrapDialog.closeAll();
            },
            error: function (xhr, status, err) {
                alert(err);
                alert("There might be a replay with the same name already saved before");
            }
        });
    };
    $scope.loadReplayList = function (done) {
        $http({method: "get", url: "showAllReplayFiles"}).success(function (data) {
            $scope.allReplays = data.replays;
            $scope.allReplays.forEach(function (r) {
                var seconds = r.length;
                r.lengthString = moment.duration(seconds, "seconds").format("m[m] s[s]");
            });
            $scope.allReplays.unshift({name: "Just Now"});

            if (done) {
                done();
            }
        });
    };
    $scope.playReplay = function (index) {
        var replay = $scope.allReplays[index];
        var r = confirm("Play \"" + replay.name + "\"?");
        if (r === true) {
            BootstrapDialog.closeAll();
            if (index === 0) {
                $.ajax({
                    url: "getGameState",
                    type: "post",
                    dataType: "text",
                    success: function (data) {
                        lastJsonFile = data;
                        $scope.canSaveReplay = true;
                        gameControl.topText = "Replay: Just Now";
                        $scope.createGameReplay(data);
                        $scope.$apply();
                    }
                });
            } else {
                console.log("load file: " + replay.filePath);
                JSZipUtils.getBinaryContent(replay.filePath, function (err, data) {
                    if (err) {
                        throw err;
                    }

                    JSZip.loadAsync(data).then(function (zip) {
                        return zip.file(replay.name + ".json").async("string");
                    }).then(function (jsonReplayString) {
                        lastJsonFile = jsonReplayString;
                        $scope.canSaveReplay = false;
                        gameControl.topText = "Replay: " + replay.name;
                        $scope.createGameReplay(jsonReplayString);
                        $scope.$apply();
                    });
                });
            }
        }
    };
    $scope.downloadReplay = function (index) {
        var replay = $scope.allReplays[index];
        if (index === 0) {
            $.ajax({
                url: "makeNowReplayZip",
                success: function () {
                    download("saves/now.zip");
                }
            });
        } else {
            download(replay.filePath);
        }
    };


    /*
     ------------------------------------------------------------------------------------
     BeeSign control
     */
    $scope.enterSimMode = function () {
        BeeSignMode = true;
    };

    $scope.isBeeSignMode = function () {
        return BeeSignMode;
    };

    $scope.startSimGame = function () {
        ws.send("@startSim");
        alert("SimGame started");
    };

    $scope.stopSimGame = function () {
        ws.send("@stopSim");
    };


    /*
     ------------------------------------------------------------------------------------
     Server Control
     */
    $scope.xbeeIsOn = false;
    $scope.xbeeIsConnecting = false;
    $scope.startXBee = function () {
        $scope.xbeeIsConnecting = true;
        toastr.success("Connecting XBee...\nPlease plug in your XBee module");
        ws.send("@adminLinkXBee");
    };
    $scope.stopXBee = function () {
        $scope.xbeeIsOn = false;
        $scope.xbeeIsConnecting = false;
        ws.send("@adminStopXBee");
    };

    $scope.getGameType = function () {
        return GameType;
    };


    /*
     ------------------------------------------------------------------------------------
     Tests
     */
    $scope.reset = function () {
        ws.send("@reset");
    };

    $scope.reviveAllBees = function () {
        ws.send("@reviveAll");
        BootstrapDialog.closeAll();
    };

    $scope.fixNorth = function () {
        ws.send("@fixNorth");
    };

    $scope.fakeOther = function () {
        ws.send("@checkDevices");
    };

    $scope.startCentralGame = function () {
        if (BeeSignMode) {
            $scope.startSimGame();
            return;
        }
        ws.send("@startGame");
    };

    $scope.pauseCentralGame = function () {
        if (BeeSignMode) {
            $scope.stopSimGame();
            return;
        }
        ws.send("@pauseGame");
    };

    $scope.startLinkingDevices = function () {
        ws.send("@searchActive");
    };

    $scope.test1 = function () {
        ws.send("@test-action#" + $scope.testActor + "#" + $scope.testReactor);
    };

    $scope.test2 = function () {
        ws.send("@test-action#" + $scope.testActor2 + "#" + $scope.testReactor2);
    };

    $scope.test3 = function () {
        ws.send("@test-action#" + $scope.testActor3 + "#" + $scope.testReactor3);
    };

    $scope.stopPositionServer = function () {
        $http({
            method: "get",
            url: "setPositionPort",
            params: {
                start: false
            }
        }).then(function (res) {
            alert(res.statusText);
        });
    };
    $scope.pServerPort = "";
    $scope.startPositionServer = function () {
        $http({
            method: "get",
            url: "setPositionPort",
            params: {
                start: true,
                newSerial: $scope.pServerPort
            }
        }).then(function (res) {
            alert(res.statusText);
        });
    };

    var brushColor = "#ff0000";
    var penDown = false;

    function doPaint(pointer, x, y) {
        if (penDown) {
            if (pointer.isDown) {
                paintContext.lineTo(x, y);
                paintContext.stroke();
            } else if (pointer.isUp) {
                penDown = false;
            }
        } else {
            if (pointer.isDown) {
                game.world.bringToTop(paintSprite);
                paintContext.strokeStyle = brushColor;
                paintContext.lineWidth = 10;
                paintContext.beginPath();
                penDown = true;
            }
        }
    }

    function doErase(pointer, x, y) {
        if (penDown) {
            if (pointer.isDown) {
                paintContext.clearRect(x, y, 40, 40);
            } else if (pointer.isUp) {
                penDown = false;
            }
        } else {
            if (pointer.isDown) {
                game.world.bringToTop(paintSprite);
                //paintContext.fillStyle = "#00ff00";
                //paintContext.fillRect(x, y, 40, 40);
                paintContext.clearRect(x, y, 40, 40);
                penDown = true;
            }
        }
    }

    $scope.gameCursor = "all-cursor";
    $scope.isPainting = false;
    $scope.isErasing = false;
    $scope.doPaint = function () {
        game.input.deleteMoveCallback(doPaint);
        game.input.deleteMoveCallback(doErase);
        $scope.isPainting = !$scope.isPainting;
        if ($scope.isPainting) {
            $scope.isErasing = false;
            game.input.addMoveCallback(doPaint);
            $scope.gameCursor = "paint-cursor";
        } else {
            $scope.gameCursor = "all-cursor";
        }
    };
    $scope.doErase = function () {
        game.input.deleteMoveCallback(doPaint);
        game.input.deleteMoveCallback(doErase);
        $scope.isErasing = !$scope.isErasing;
        if ($scope.isErasing) {
            $scope.isPainting = false;
            game.input.addMoveCallback(doErase);
            $scope.gameCursor = "eraser-cursor";
        } else {
            $scope.gameCursor = "all-cursor";
        }
    };
    $scope.clearPaint = function () {
        paintBitmap.clear();
    };
}

var endReplay, setGameStartTime;

