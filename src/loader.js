(function($, Crafty) {
    $(document).ready(function () {
        var STAGE_WIDTH = 400,
            STAGE_HEIGHT = 640,
            screen = document.getElementById('game');

        Crafty.init(STAGE_WIDTH, STAGE_HEIGHT, screen).canvas.init();
        Crafty.viewport.init(STAGE_WIDTH, STAGE_HEIGHT, screen);
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
                    'assets/images/octocat.png': {
                        tile: 96,
                        tileh: 96,
                        map: {Octocat: [0, 0]}
                    },
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

                // // Crafty.sprite(96, R.OCTOCAT_PNG, {
                // Crafty.sprite(96, "assets/images/octocat.png", {
                // // Crafty.sprite(96, "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAYAAAABgBAMAAADm2ri6AAAAG1BMVEUo6Ns3NzdAQEBcXFzDV07zu57/yq/i4uL///+iSnSMAAAAAXRSTlMAQObYZgAAAbtJREFUeNrtmtFOgzAUhts9AZ1ZvB34BMorEO+9qPEBtPHWqz2BC48t5VQoY7KSqOdU/z9kY+Nru28ppaEohSAIgiAIgsTRJqTIk4cAL9/R2yqkTCgjjYcAK089rYpC3+TCQ4Bf4Kqu76pJbur61uTCQ0CCQDXLcgOieAjwC2yrMylNLjwEmHlt4qtdfBU8P4WSxkNAiEBpbBTqhUsNyOEhIEPA7Gzbtq5Pt2MfzHIDgngISBDoOtxT2zRNe3Tutd95993uywZE8RCAAAT+hEDghgJHt9yAIB4CjPzGz5DoXqR9dPGVz71Yuhfpib1UHgLcPO2FJZCd9exz09z7927yRFNwqlcmDwF2gdDt9p+LIlSGaFoO2cRnjEgeAtz8+FmbSYqxxl/mw9E0HgLsAidLs3FUwuL+9/PaHN78trZ+CHAJhANRhxv2kx5Fusjr2e+4yBfKXB9SeQiwC3Qobf1QFQoUKqmBBH51/bF2Cg8BboGxh+lUARrmEvmhE6fWf/JPQUC+wPoC42TrR38QBHITmA9byw/LSuMhwMxrMxnvhtdceAiwC8Tjo0o4Y0TyEGAXQBAEQRAE+Tf5AOPSFLJkyU14AAAAAElFTkSuQmCC", {
                //     Octocat: [0, 0]
                // });

                // // Crafty.sprite(64, R.SMOKE_JUMP_PNG, {
                // Crafty.sprite(64, "assets/images/smoke_jump.png", {
                //     SmokeJump: [0, 0]
                // });

                // Crafty.sprite(192, "assets/images/portal.png", {
                // // Crafty.sprite(192, R.PORTAL_PNG, {
                //     Portal: [0, 0]
                // });

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