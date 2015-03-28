(function($, Crafty) {
    $(document).ready(function () {
        var STAGE_WIDTH = 400,
            STAGE_HEIGHT = 640,
            screen = document.getElementById('game');

        Crafty.init(STAGE_WIDTH, STAGE_HEIGHT, screen).canvas.init();
        Crafty.viewport.init(STAGE_WIDTH, STAGE_HEIGHT, screen);
        Crafty.viewport.bounds = { min: {x:-100, y: -Infinity}, max: {x:STAGE_WIDTH + 50, y: STAGE_HEIGHT} };
        Crafty.settings.modify("autoPause", true);

        Crafty.scene("loading", function () {
            var imgPath = function (x) {
                return "assets/images/" + x;
            };
            var sndPath = function (x) {
                return "assets/sounds/" + x;
            };
            // Crafty.background("#000");
            Crafty.background("#fff");
            // Crafty.background("url('assets/images/octocat-spinner-128.gif') no-repeat center center #fff");
            // Crafty.e("2D, DOM, Color, Tween, Delay").attr({
            //     x: 0,
            //     y: 0,
            //     w: Crafty.viewport.width,
            //     h: Crafty.viewport.height,
            //     alpha: 0,
            //     z: 2
            // }).color("#fff").tween({
            //     alpha: 1
            // }, 50).bind("TweenEnd", function () {
            //     // var spinner = Crafty.e("2D, DOM, Image, Tween").attr({
            //     //     x: Crafty.viewport.width / 2 - 64,
            //     //     y: Crafty.viewport.height / 2 - 64,
            //     //     z: 3,
            //     //     alpha: 0
            //     // }).image('assets/images/octocat-spinner-128.gif').tween({
            //     //     alpha: 1
            //     // }, 50);
            // });
            var assets = {
                images: [
                        'title.png', 'cratfy_logo.png', 'github_logo.png', 'wall01.png', 'speaker.png', 'mute.png'
                    ].map(imgPath),
                sprites: {
                    'assets/images/smoke_jump.png': {
                        tile: 64,
                        tileh: 64,
                        map: {SmokeJump: [0, 0]}
                    },
                    'assets/images/portal.png': {
                        tile: 192,
                        tileh: 192,
                        map: {Portal: [0, 0]}
                    },
                    'assets/images/platform.png': {
                        tile: 50,
                        tileh: 25,
                        map: {PlatformBlue: [0, 0], PlatformGreen: [1, 0]}
                    },
                    'assets/images/gunner.png': {
                        tile: 50,
                        tileh: 57,
                        map: {Gunner: [0, 0]}
                    },
                    'assets/images/spikes.png': {
                        tile: 50,
                        tileh: 50,
                        map: {Spikes01: [0, 0], Spikes02: [1, 0]}
                    },
                    'assets/images/bloodanim.png': {
                        tile: 76,
                        tileh: 45,
                        map: {Splatter: [0, 0]}
                    }
                },
                audio: {
                    jump: ["jump.mp3", "jump.ogg", "jump.wav"].map(sndPath),
                    push: ["push.mp3", "push.ogg", "push.wav"].map(sndPath),
                    pull: ["pull.mp3", "pull.ogg", "pull.wav"].map(sndPath),
                    fork: ["fork.mp3", "fork.ogg", "fork.wav"].map(sndPath),
                    star: ["star.mp3", "star.ogg", "star.wav"].map(sndPath),
                    dead: ["dead.mp3", "dead.ogg", "dead.wav"].map(sndPath),
                    click: ["click.mp3", "click.ogg", "click.wav"].map(sndPath)                    
                }
            };
            Crafty.load(assets, function() {
                //$("#loader").remove();
                // setTimeout(function () {
                //     Crafty.scene("intro");
                // }, 500);
                Crafty.scene("main");
            }, function (e) {
                //TODO
                //console.log(e);
            }, function (e) {
                console.error(e);
            });
        });
    }); //eof-ready
})(jQuery, Crafty);