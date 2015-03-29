/**
 * Strider
 * Github Game-Off 2015 Entry
 * by Petar Petrov / github.com/petarov
 *
 * (A fork of) Octocat Jump
 * A Github Game Off 2012 Entry
 * @copyright Omer Goshen <gershon@goosemoose.com>
 */
(function($, Crafty) {
    $(document).ready(function () {
        var STAGE_WIDTH = 400,
            STAGE_HEIGHT = 640,
            screen = document.getElementById('game');

        Crafty.init(STAGE_WIDTH, STAGE_HEIGHT, screen).canvas.init();
        Crafty.viewport.init(STAGE_WIDTH, STAGE_HEIGHT, screen);
        Crafty.viewport.bounds = { 
            min: { x:-100, y: -Infinity }, 
            max: { x: STAGE_WIDTH + 50, y: Infinity } 
        };
        // Crafty.viewport.clampToEntities = true;
        Crafty.settings.modify("autoPause", true);

        Crafty.scene("loading", function () {
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
            Crafty.paths({ audio: "assets/sounds/", images: "assets/images/" });
            var assets = {
                images: ['title.png', 'cratfy_logo.png', 'github_logo.png', 'wall01.png', 'backgrounds.png', 'starsky.png', 'speaker.png', 'mute.png'],
                sprites: {
                    'ui_energy.png': {
                        tile: 72,
                        tileh: 19,
                        map: {HUDEnergy: [0, 0]}
                    },
                    'ui_health.png': {
                        tile: 69,
                        tileh: 19,
                        map: {HUDHealth4: [0, 0], HUDHealth3: [0, 1], HUDHealth2: [0, 2], HUDHealth1: [0, 3], HUDHealth0: [0, 4]}
                    },
                    'smoke_jump.png': {
                        tile: 64,
                        tileh: 64,
                        map: {SmokeJump: [0, 0]}
                    },
                    'platform.png': {
                        tile: 50,
                        tileh: 26,
                        map: {PlatformBlue: [0, 0], PlatformGreen: [1, 0]}
                    },
                    'platform_big.png': {
                        tile: 150,
                        tileh: 26,
                        map: {PlatformBlueBig: [0, 0], PlatformGreenBig: [0, 1]}
                    },                    
                    'gunner.png': {
                        tile: 50,
                        tileh: 57,
                        map: {Gunner: [0, 0]}
                    },
                    'spikes.png': {
                        tile: 50,
                        tileh: 50,
                        map: {Spikes01: [0, 0], Spikes02: [1, 0]}
                    },
                    'bloodanim.png': {
                        tile: 76,
                        tileh: 45,
                        map: {Splatter: [0, 0]}
                    },
                    'spaceship.png': {
                        tile: 88,
                        tileh: 86,
                        map: {Spaceship: [0, 0]}
                    },
                   'spaceship_engine.png': {
                        tile: 18,
                        tileh: 18,
                        map: {SpaceshipEngine: [0, 0]}
                    }
                },
                audio: {
                    jump: ["jump.mp3", "jump.ogg", "jump.wav"],
                    push: ["push.mp3", "push.ogg", "push.wav"],
                    pull: ["pull.mp3", "pull.ogg", "pull.wav"],
                    fork: ["fork.mp3", "fork.ogg", "fork.wav"],
                    star: ["star.mp3", "star.ogg", "star.wav"],
                    dead: ["dead.mp3", "dead.ogg", "dead.wav"],
                    click: ["click.mp3", "click.ogg", "click.wav"]                    
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