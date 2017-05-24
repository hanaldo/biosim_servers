var foodCover = "";
var foodOn = "";

function createWebSocket() {
    if ("WebSocket" in window) {
        var ws;
        ws = new WebSocket("ws://" + window.location.host + "/foodView");
        ws.onopen = function () {
            console.log("Socket chat is open...");
        };
        ws.onmessage = function (evt) {
            try {
                var received_msg = evt.data;
                console.log(received_msg);

                var m = JSON.parse(received_msg);

                var location = $("#location");

                if (m.action === "ok") {
                    registered = true;
                    foodCover = m.content[0];
                    foodOn = m.content[1];
                    $("#back1").attr("src", "images/" + foodCover + "?" + Math.random());
                    $("#back3").attr("src", "images/" + foodOn + "?" + Math.random());

                    $("#my_table").hide();
                    $("#b5").hide();
                    $("#food_id").hide();
                    location.empty().append("ID: " + registeredId);
                } else if (m.action === "openReal") {
                    showRealFood();
                } else if (m.action === "openFake") {
                    showFakeFood();
                } else if (m.action === "update") {
                    if (registered) {
                        return;
                    }

                    location.empty().append("You are now at position: " + m.content[1].x + " -- " + m.content[1].y);

                    $("#my_table_rows").empty();
                    m.content[0].forEach(function (foodInfo) {
                        var onclick = foodInfo.id + "," + m.content[1].x + "," + m.content[1].y;
                        onclick = "onclick='doReg(" + onclick + ")'";

                        var html = "<td><a href='#' " + onclick + ">" + foodInfo.id + "</a></td>";
                        html += "<td>" + foodInfo.x + "</td>";
                        html += "<td>" + foodInfo.y + "</td>";
                        html = "<tr>" + html + "</tr>";
                        $("#my_table_rows").append(html);
                    });


                }

            } catch (e) {
                console.log(e);
            }
        };
        ws.onclose = function () {
            alert("Connection to server is closed, please refresh page");
        };
        return ws;
    } else {
        alert("Your browser does not support WebSocket, please change to a modern one");
        return null;
    }
}