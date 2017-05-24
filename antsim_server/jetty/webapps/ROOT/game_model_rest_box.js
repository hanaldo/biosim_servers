function RestBox(game, x1, y1, x2, y2) {
    this.lines = [];
    var width = x2 - x1;
    var height = y2 - y1;

    //left vertical
    var lineLeft = game.add.bitmapData(1, height);
    lineLeft.ctx.beginPath();
    lineLeft.ctx.rect(0, 0, 1, height);
    lineLeft.ctx.fillStyle = "#ff0000";
    lineLeft.ctx.fill();

    var lineLeftSprite = game.add.sprite(x1, y1, lineLeft);
    game.physics.enable(lineLeftSprite, Phaser.Physics.ARCADE);
    lineLeftSprite.body.immovable = true;
    this.lines.push(lineLeftSprite);

    //right vertical
    var lineRight = game.add.bitmapData(1, height);
    lineRight.ctx.beginPath();
    lineRight.ctx.rect(0, 0, 1, height);
    lineRight.ctx.fillStyle = "#00ff00";
    lineRight.ctx.fill();

    var lineRightSprite = game.add.sprite(x2, y1, lineRight);
    game.physics.enable(lineRightSprite, Phaser.Physics.ARCADE);
    lineRightSprite.body.immovable = true;
    this.lines.push(lineRightSprite);

    //top horizontal
    var lineTop = game.add.bitmapData(width, 1);
    lineTop.ctx.beginPath();
    lineTop.ctx.rect(0, 0, width, 1);
    lineTop.ctx.fillStyle = "#0000ff";
    lineTop.ctx.fill();

    var lineTopSprite = game.add.sprite(x1, y1, lineTop);
    game.physics.enable(lineTopSprite, Phaser.Physics.ARCADE);
    lineTopSprite.body.immovable = true;
    this.lines.push(lineTopSprite);

    //bottom horizontal
    var lineBot = game.add.bitmapData(width, 1);
    lineBot.ctx.beginPath();
    lineBot.ctx.rect(0, 0, width, 1);
    lineBot.ctx.fillStyle = "#000000";
    lineBot.ctx.fill();

    var lineBotSprite = game.add.sprite(x1, y2, lineBot);
    game.physics.enable(lineBotSprite, Phaser.Physics.ARCADE);
    lineBotSprite.body.immovable = true;
    this.lines.push(lineBotSprite);
    //this.sprites = [lineLeftSprite, lineRightSprite, lineTopSprite, lineBotSprite];

    var wOffset = width / 2;
    var hOffset = height / 2 + 50;
    this.boxX = x1 - wOffset;
    this.boxY = y1 - hOffset;

    this.remove = function () {
        lineLeftSprite.destroy();
        lineRightSprite.destroy();
        lineTopSprite.destroy();
        lineBotSprite.destroy();
    };

    this.update = function (hiveX, hiveY) {
        lineLeftSprite.renderable = ShowGameInfo;
        lineRightSprite.renderable = ShowGameInfo;
        lineTopSprite.renderable = ShowGameInfo;
        lineBotSprite.renderable = ShowGameInfo;

        lineLeftSprite.x = hiveX - wOffset;
        lineLeftSprite.y = hiveY - hOffset;

        lineRightSprite.x = hiveX + width - wOffset;
        lineRightSprite.y = hiveY - hOffset;

        lineTopSprite.x = hiveX - wOffset;
        lineTopSprite.y = hiveY - hOffset;

        lineBotSprite.x = hiveX - wOffset;
        lineBotSprite.y = hiveY + height - hOffset;
    }
}