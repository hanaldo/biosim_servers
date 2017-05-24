function createWebSocket() {
    if ("WebSocket" in window) {
        var ws;
        ws = new WebSocket("ws://" + window.location.host + "/miniGame");
        ws.onopen = function () {
            console.log("Socket chat is open...");
            ws.send("@init");
        };
        ws.onmessage = function (evt) {
            try {
                var received_msg = evt.data;
                $("#server_output").text(received_msg);
                var m = JSON.parse(received_msg);
                if (m.control === "!init") {
                    cleanAll();
                    var players = m.content;
                    players.forEach(function (player) {
                        if (!player.currentDevice) {
                            addUser(player.playerId, "#area_wait", player.currentGameId, true);
                        } else {
                            var device = player.currentDevice.deviceName;
                            addUser(player.playerId, "#" + device, player.currentGameId, false);
                        }
                    });
                } else if (m.control === "!device-all") {
                    $(".device-info").text("Offline");
                    $(".device-info").addClass("device-info-red");
                    var devices = m.content;
                    devices.forEach(function (device) {
                        var node = $("#" + device.deviceName).parent().find(".device-info");
                        node.text("Online");
                        node.removeClass("device-info-red");
                        node.addClass("device-info-green");
                    });
                } else if (m.control === "!clear") {
                    alert("Player " + m.content + " is cleared!");
                } else if (m.control === "!") {
                    alert(m.content);
                    ws.send("@init");
                }
            } catch (e) {
                $("#server_output").text(e);
            }
        };
        ws.onclose = function () {
            alert("Connection to server is closed, please refresh page");
        };
        return ws;
    }
    else {
        alert("Your browser does not support WebSocket, please change to a modern one");
        return null;
    }
}

function ready() {
    $("#area_pad1, #area_pad2, #area_pad3, #area_wait").sortable({
        connectWith: ".connected-sortable",
        start: function (event, ui) {
            ui.item.addClass("drag-color");
        },
        stop: function (event, ui) {
            ui.item.removeClass("drag-color");
            var user_name = ui.item.find(".user-id").text();
            var device = ui.item.parent().attr("id");
            WS.send("@start#" + user_name + "#" + device);
        }
    }).disableSelection();

}

var USER_STRING1 = "<li class='user-icon'><img src='images/person.png'/><p class='user-id'>";
var USER_STRING2 = "</p><div class='player-info'>";
var USER_STRING3 = "</div><button class='player-start-button' id='@button-1'>start</button><button class='player-kick-button' id='@button-2'>kick</button></li>";
var BUTTON_START_ID = "_player_start_button";
var BUTTON_FINISH_ID = "_player_kick_button";

function addUser(userName, area, game, wait) {
    var gameString;
    if (wait) {
        gameString = "waiting for game-" + game;
    } else {
        gameString = "on game-" + game;
    }
    var string3 = USER_STRING3.replace("@button-1", userName + BUTTON_START_ID);
    string3 = string3.replace("@button-2", userName + BUTTON_FINISH_ID);
    var user = USER_STRING1 + userName + USER_STRING2 + gameString + string3;
    $(area).append(user);

    if (wait) {
        $("#" + userName + BUTTON_FINISH_ID).hide();
        $("#" + userName + BUTTON_START_ID).click(function () {
            WS.send("@try-start#" + userName);
        });
    } else {
        $("#" + userName + BUTTON_START_ID).hide();
        $("#" + userName + BUTTON_FINISH_ID).click(function () {
            WS.send("@kick#" + userName);
        });
    }
}

function cleanAll() {
    $("#area_pad1, #area_pad2, #area_pad3, #area_wait").empty();
}


