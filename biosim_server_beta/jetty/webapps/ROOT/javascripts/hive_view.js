function createWebSocket() {
    if ("WebSocket" in window) {
        var ws;
        ws = new WebSocket("ws://" + window.location.host + "/hiveView");
        ws.onopen = function () {
            console.log("Socket chat is open...");
            WS.send("@listHive");
        };
        ws.onmessage = function (evt) {
            try {
                var received_msg = evt.data;
                //console.log(received_msg);

                if (received_msg.indexOf("[") > -1 && received_msg.indexOf("]") > -1) {
                    var ids = JSON.parse(received_msg);
                    ids.forEach(function (id) {
                        $("#ids_box").append("<input type='checkbox' class='hive' value='" + id + "'>" + HomeName + "  " + id + "<br/>");
                    });
                } else if (received_msg.startsWith("mode")) {
                    Mode = received_msg.split("@")[1];
                    if (Mode === "ant") {
                        HomeName = "Bivouac";
                    } else if (Mode === "bee") {
                        HomeName = "Hive";
                    }
                } else {
                    var hive = JSON.parse(received_msg);

                    var svg;
                    if (HiveSvg.has(hive.id)) {
                        svg = HiveSvg.get(hive.id);
                        svg.updateNice(hive.total, hive.max, hive.beeDead, hive.beeIn, hive.beeOut);
                        //updateHiveChart(hive.id, hive.beeDead, hive.beeIn, hive.beeOut);
                    } else {
                        svg = new MyPaper(400 * HiveSvg.count(), 0, hive.name, hive.beeDead, hive.beeIn, hive.beeOut);
                        svg.updateNormal(hive.total, hive.max, hive.beeDead, hive.beeIn, hive.beeOut);
                        HiveSvg.set(hive.id, svg);
                    }
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

function changeAmount(p, img) {
    var h = 300 * p;
    var y = 300 - h;
    var att = "0 " + y + " 300 " + h;

    img.attr({
        "clip-rect": att
    });
}

function changeAmountCool(p, img) {
    var h = 300 * p;
    var y = 300 - h;
    var att = "0 " + y + " 300 " + h;

    img.animate({
        "clip-rect": att
    }
    , 1000, "bounce");
}

function MyPaper(x, y, name, beeDead, beeIn, beeOut) {
    var home1image = "";
    var home2image = "";
    if (Mode === "ant") {
        home1image = "hive_view_top2.png";
        home2image = "hive_view_top3.png";
    } else if (Mode === "bee") {
        home1image = "home_view_top1b.png";
        home2image = "home_view_top2b.png";
    }
    var paper = Raphael(x, y, 300, 400);
    //var img1 = paper.image("images/hive_view_bottom.png", 0, 0, 300, 300);
    var hiveImage = "images/" + home1image;
    if (name !== "g1") {
        hiveImage = "images/" + home2image;
    }
    var img2 = paper.image(hiveImage, 0, 0, 300, 300);
    var img3 = paper.image("images/hive_view_bar_bot.png", 0, 0, 50, 300);
    var img4 = paper.image("images/hive_view_bar_top.png", 0, 0, 50, 300);
    var t = paper.text(140, 320, "0/10");
    t.attr({
        "font-size": 40
    });

    var t2 = paper.text(140, 370, "In: Out: Dead:");
    t2.attr({
        "font-size": 24
    });

    /*
     var divId = "hive_stats_area_" + id;
     var divHtml = "<div id='" + divId + "'></div>";
     $("#charts").append(divHtml);
     
     $("#hive_stats_area_" + id).load("game_ui_hive_stats_big.html", function () {
     $("#canvas_holder").attr("id", "canvas_holder_" + id);
     $("#chart_area").attr("id", "chart_area_" + id);
     
     var pieData = [
     {
     value: beeDead,
     color: "#F7464A",
     highlight: "#FF5A5E",
     label: "Dead"
     },
     {
     value: beeIn,
     color: "#14eb14",
     highlight: "#5bf15b",
     label: "In"
     },
     {
     value: beeOut,
     color: "#3299FF",
     highlight: "#4ca6ff",
     label: "Out"
     }
     ];
     
     var chartHolder = $("#canvas_holder_" + id);
     chartHolder.css("top", y + 400);
     chartHolder.css("left", x);
     
     var ctx = $("#chart_area_" + id).get(0).getContext("2d");
     var chart = new Chart(ctx).Doughnut(pieData,
     {
     onAnimationComplete: function () {
     this.showTooltip(this.segments, true);
     },
     tooltipEvents: []
     });
     HiveCharts.set(id, chart);
     });
     */

    this.updateNormal = function (total, max, beeDead, beeIn, beeOut) {
        //changeAmount(total / max, img2);
        changeAmount(total / max, img4);
        t.attr({
            "text": total + "/" + max
        });
        t2.attr({
            "text": "In: " + beeIn + ", Out: " + beeOut + ", Dead: " + beeDead
        });
    };

    this.updateNice = function (total, max, beeDead, beeIn, beeOut) {
        //changeAmountCool(total / max, img2);
        changeAmountCool(total / max, img4);
        t.attr({
            "text": total + "/" + max
        });
        t2.attr({
            "text": "In: " + beeIn + ", Out: " + beeOut + ", Dead: " + beeDead
        });
    };
}

function updateHiveChart(id, beeDead, beeIn, beeOut) {
    if (HiveCharts.has(id)) {
        var chart = HiveCharts.get(id);
        chart.segments[0].value = beeDead;
        chart.segments[1].value = beeIn;
        chart.segments[2].value = beeOut;
        chart.update();
    }
}

//when dom ready
$(function () {
    $("#enter_ids").click(function () {
        var ids = [];

        $(".hive").each(function () {
            if ($(this).prop("checked")) {
                ids.push($(this).attr("value"));
            }
        });

        $("#input").hide();
        for (var i = 0; i < ids.length; i++) {
            WS.send("@getHive#" + ids[i]);
        }
    });
});



