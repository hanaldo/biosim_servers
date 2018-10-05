function Sky(game, weather, x, y) {
    var sunX = x;
    var sunY = y;
    var sun = game.add.sprite(sunX, sunY, "sun2");
    sun.scale.setTo(0.5);
    game.physics.enable(sun, Phaser.Physics.ARCADE);
    sun.body.immovable = true;
    this.sprite = sun;
    sun.inputEnabled = true;
    sun.input.enableDrag(true);

    var rain = game.add.emitter(game.world.centerX, -200, 400);
    rain.width = game.world.width;
    rain.angle = 10;
    rain.makeParticles("rain");
    rain.minParticleScale = 0.1;
    rain.maxParticleScale = 0.4;
    rain.setYSpeed(300, 500);
    rain.setXSpeed(-5, 5);
    rain.minRotation = 0;
    rain.maxRotation = 0;
    rain.on = false;
    var rainSound = game.add.audio("rain");

    var snowSound = game.add.audio("snow");

    var max = 0;
    var front_emitter;
    var mid_emitter;
    var back_emitter;

    back_emitter = game.add.emitter(game.world.centerX, -32, 600);
    back_emitter.makeParticles('snowflakes', [0, 1, 2, 3, 4, 5]);
    back_emitter.maxParticleScale = 0.6;
    back_emitter.minParticleScale = 0.2;
    back_emitter.setYSpeed(20, 100);
    back_emitter.gravity = 0;
    back_emitter.width = game.world.width * 1.5;
    back_emitter.minRotation = 0;
    back_emitter.maxRotation = 40;

    mid_emitter = game.add.emitter(game.world.centerX, -32, 250);
    mid_emitter.makeParticles('snowflakes', [0, 1, 2, 3, 4, 5]);
    mid_emitter.maxParticleScale = 1.2;
    mid_emitter.minParticleScale = 0.8;
    mid_emitter.setYSpeed(50, 150);
    mid_emitter.gravity = 0;
    mid_emitter.width = game.world.width * 1.5;
    mid_emitter.minRotation = 0;
    mid_emitter.maxRotation = 40;

    front_emitter = game.add.emitter(game.world.centerX, -32, 50);
    front_emitter.makeParticles('snowflakes_large', [0, 1, 2, 3, 4, 5]);
    front_emitter.maxParticleScale = 1;
    front_emitter.minParticleScale = 0.5;
    front_emitter.setYSpeed(100, 200);
    front_emitter.gravity = 0;
    front_emitter.width = game.world.width * 1.5;
    front_emitter.minRotation = 0;
    front_emitter.maxRotation = 40;

    function changeWindDirection() {
        var multi = Math.floor((max + 200) / 4),
                frag = (Math.floor(Math.random() * 100) - multi);
        max = max + frag;

        if (max > 200) {
            max = 150;
        }
        if (max < -200) {
            max = -150;
        }

        setXSpeed(back_emitter, max);
        setXSpeed(mid_emitter, max);
        setXSpeed(front_emitter, max);

        function setXSpeed(emitter, max) {
            emitter.setXSpeed(max - 20, max);
            emitter.forEachAlive(setParticleXSpeed, this, max);
        }

        function setParticleXSpeed(particle, max) {
            particle.body.velocity.x = max - Math.floor(Math.random() * 30);
        }
    }

    this.remove = function () {
        sun.destroy();
        rain.destroy();
        rainSound.destroy();
        snowSound.destroy();
        back_emitter.destroy();
        mid_emitter.destroy();
        front_emitter.destroy();
    };

    this.makeSun = function () {
        rain.on = false;
        rainSound.stop();
        snowSound.stop();
        back_emitter.on = false;
        mid_emitter.on = false;
        front_emitter.on = false;

        sun.x = sunX;
        sun.y = sunY;
    };

    this.makeRain = function () {
        snowSound.stop();
        sun.x = game.world.width;
        sun.y = game.world.height;
        back_emitter.on = false;
        mid_emitter.on = false;
        front_emitter.on = false;

        rain.start(false, 1600, 5, 0);
        rainSound.play("", 0, 1, true);
        game.world.bringToTop(rain);
    };

    this.makeSnow = function () {
        rainSound.stop();
        sun.x = game.world.width;
        sun.y = game.world.height;
        rain.on = false;

        changeWindDirection();
        back_emitter.start(false, 14000, 20);
        mid_emitter.start(false, 12000, 40);
        front_emitter.start(false, 6000, 1000);
        game.world.bringToTop(back_emitter);
        game.world.bringToTop(mid_emitter);
        game.world.bringToTop(front_emitter);
        snowSound.play("", 0, 1, true);
    };

    this.update = function () {
    };

    if (weather === "makeRain") {
        this.makeRain();
    } else if (weather === "makeSnow") {
        this.makeSnow();
    }
}