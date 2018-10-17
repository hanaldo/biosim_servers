if ("WebSocket" in window) {
    var hiveViewWS;
    hiveViewWS = new WebSocket("ws://" + window.location.host + "/hiveView");
    hiveViewWS.onopen = function () {
        console.log("hiveViewWS is open...");
    };
    hiveViewWS.onmessage = function (evt) {
        try {
            var received_msg = evt.data;

            if (received_msg.indexOf("[") > -1 && received_msg.indexOf("]") > -1) {
                return;
            } else if (received_msg.startsWith("mode")) {
                return;
            } else {
                var hive = JSON.parse(received_msg);
                updateHiveChartInGame(hive.name, hive.beeDead, hive.beeIn, hive.beeOut);
            }
        } catch (e) {
            console.log(e);
        }
    };
}

var documentLastX, documentLastY;

$(document).mousemove(function (event) {
    documentLastX = event.pageX;
    documentLastY = event.pageY;
});

function addHiveStatsArea(id) {
    var divId = "hive_stats_area_" + id;
    var divHtml = "<div id='" + divId + "'></div>";
    $("#hive_stats_area").append(divHtml);
}

var AllHiveCharts = new HashMap();
var AllHiveStats = new HashMap();

function updateHiveChartInGame(id, beeDead, beeIn, beeOut) {
    if (AllHiveCharts.has(id)) {
        var chart = AllHiveCharts.get(id);
        chart.segments[0].value = beeDead;
        chart.segments[1].value = beeIn;
        chart.segments[2].value = beeOut;
        chart.update();
    }
    if (AllHiveStats.has(id)) {
        var data = AllHiveStats.get(id);
        data[0] = beeDead;
        data[1] = beeIn;
        data[2] = beeOut;
    }
}

function initHiveStats(actor) {
    try {
        if (!AllHiveStats.has(actor.name)) {
            AllHiveStats.set(actor.name, [0, 0, 0]);
        }
        var data = AllHiveStats.get(actor.name);
        if (actor.dyProps.currentEnergy <= 0) {
            data[0] += 1;
        } else if (actor.dyProps.inHive) {
            data[1] += 1;
        } else if (!actor.dyProps.inHive) {
            data[2] += 1;
        }
    } catch (e) {
        console.error(e);
    }
}

function showHiveStats(id) {
    var data = AllHiveStats.get(id);
    if (!data) {
        toastr.error("No data");
        return;
    }
    var pieData = [
        {
            value: data[0],
            color: "#F7464A",
            highlight: "#FF5A5E",
            label: ""
        },
        {
            value: data[1],
            color: "#14eb14",
            highlight: "#5bf15b",
            label: ""
        },
        {
            value: data[2],
            color: "#3299FF",
            highlight: "#4ca6ff",
            label: ""
        }
    ];


    $("#hive_stats_area_" + id).load("game_ui_hive_stats.html", function () {
        $("#canvas_holder").attr("id", "canvas_holder_" + id);
        $("#chart_area").attr("id", "chart_area_" + id);

        var chartHolder = $("#canvas_holder_" + id);
        chartHolder.draggable();
        chartHolder.css("top", documentLastY + 10);
        chartHolder.css("left", documentLastX + 20);

        var ctx = $("#chart_area_" + id).get(0).getContext("2d");
        var chart = new Chart(ctx).Doughnut(pieData,
                {
                    onAnimationComplete: function () {
                        this.showTooltip(this.segments, true);
                    },
                    tooltipEvents: []
                });
        AllHiveCharts.set(id, chart);
        AllHiveStats.set(id, data);
    });
}