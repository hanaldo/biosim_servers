(function (ext) {
    var ws;
    var server_ip = "149.160.233.60";
    if ("WebSocket" in window) {
        alert("Support WebSocket");

        ws = new WebSocket("ws://" + server_ip + ":3001");
        ws.onmessage = function (evt) {
            try {
                var received_msg = evt.data;
                if (received_msg === "ok") {
                    console.log(received_msg);
                    isArrivedFlower = true;
                }

            } catch (e) {
                alert(e);
            }
        };
    } else {
        alert("No WebSocket");
    }

    var isArrivedFlower = false;

    function hello() {
        ws.send("hello from scratch");
    }

    ext.test = function (lang) {
        hello();
    };

    ext.isArrivedFlower = function () {
        if (isArrivedFlower) {
            isArrivedFlower = false;
            return true;
        }
        return false;
    };

    var descriptor = {
        blocks: [
            ["", "Collect Nectar", "test" ],
            ["b", "Bee Arrived Flower", "isArrivedFlower"]
        ],
        menus: {
            my: []
        },
        url: ""
    };
    ScratchExtensions.register("BioSim", descriptor, ext);
})({});