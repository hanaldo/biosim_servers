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

function updateHiveChart(id) {
    if (AllHiveCharts.has(id)) {
        var data = AllHiveStats.get(id);
        //console.log("updateHiveChart: " + JSON.stringify(data));
        var chart = AllHiveCharts.get(id);
        chart.segments[0].value = data[0];
        chart.segments[1].value = data[1];
        chart.segments[2].value = data[2];
        chart.update();
    }
}

function initHiveStats(beeActor) {
    try {
        if (!AllHiveStats.has(beeActor.name)) {
            AllHiveStats.set(beeActor.name, [0, 0, 0]);
        }
        var data = AllHiveStats.get(beeActor.name);
        if (beeActor.dyProps.currentEnergy <= 0) {
            data[0] += 1;
        } else if (beeActor.dyProps.inHive) {
            data[1] += 1;
        } else if (!beeActor.dyProps.inHive) {
            data[2] += 1;
        }
    } catch (e) {
        toastr.error(e);
    }
}

function chartWhenTouchHive(beeActor) {
    try {
        var data = AllHiveStats.get(beeActor.name);
        data[1] += 1;
        data[2] -= 1;
        updateHiveChart(beeActor.name);
    } catch (e) {
        toastr.error(e);
    }
}

function chartWhenBeeDie(beeActor) {
    try {
        var data = AllHiveStats.get(beeActor.name);
        data[0] += 1;
        if (beeActor.dyProps.inHive) {
            data[1] -= 1;
        } else {
            data[2] -= 1;
        }
        updateHiveChart(beeActor.name);
    } catch (e) {
        toastr.error(e);
    }
}

function chartWhenBeeRevive(beeActor) {
    try {
        var data = AllHiveStats.get(beeActor.name);
        data[0] -= 1;
        if (beeActor.dyProps.inHive) {
            data[1] += 1;
        } else {
            data[2] += 1;
        }
        updateHiveChart(beeActor.name);
    } catch (e) {
        toastr.error(e);
    }
}

function chartWhenBeeOut(beeActor) {
    try {
        var data = AllHiveStats.get(beeActor.name);
        data[1] -= 1;
        data[2] += 1;
        updateHiveChart(beeActor.name);
    } catch (e) {
        toastr.error(e);
    }
}

function showHiveStats(id) {
    var data = AllHiveStats.get(id);
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