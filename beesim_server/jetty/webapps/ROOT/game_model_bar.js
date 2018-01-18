function Bar(game, x, y) {
    var initScale = 0.5;
    var barBack = game.add.sprite(100, 0, "bar");
    var barFull = game.add.sprite(119, 27, "bar_full");
    var bar = game.add.group();
    bar.add(barBack);
    bar.add(barFull);
    bar.scale.setTo(initScale);

    bar.x = x;
    bar.y = y;
    bar.angle = 180;
    this.group = bar;

    var height = barFull.height;
    var crop = new Phaser.Rectangle(0, 0, barFull.width, 0);
    barFull.crop(crop);

    var text = game.add.text(0, 0, "", {font: "16px Arial", fill: "#fff", stroke: "#000", strokeThickness: 2});
    this.infoText = text;

    this.updateLoad = function (percentage, t) {
        crop.height = height * percentage;
        barFull.updateCrop();
        barFull.exists = !HideBars;
        barBack.exists = !HideBars;
        text.text = t;

        var per = LastScaleSize / 100;
        text.x = bar.x - 90 * per;
        text.y = bar.y - 10 * per;
    };

    this.reScale = function (size) {
        var per = size / 100;
        var scale = initScale * per;
        bar.scale.setTo(scale);
    };

    this.remove = function () {
        bar.destroy();
        text.destroy();
    };
}