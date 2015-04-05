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
                images: ['title.png', 'cratfy_logo.png', 'github_logo.png', 'wall01.png', 'backgrounds.png', 'starsky.png', 
                    'audioOn.png', 'audioOff.png', 'musicOn.png', 'musicOff.png'],
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
                    'door_anim.png': {
                        tile: 50,
                        tileh: 54,
                        paddingX: 3,
                        paddingY: 0,
                        map: {DoorAnim: [0, 0]}
                    },
                    'gunner.png': {
                        tile: 50,
                        tileh: 57,
                        map: {Gunner: [0, 0]}
                    },
                    'spikes.png': {
                        tile: 50,
                        tileh: 23,
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
                    },
                   'flares.png': {
                        tile: 18,
                        tileh: 17,
                        map: {Flares: [0, 0]}
                    },
                    'powerups.png': {
                        tile: 19,
                        tileh: 19,
                        map: {HealthRed: [0, 1], HealthGray: [1, 1], EnergyOrange: [0, 0], EnergyBlue: [3, 0]}
                    },
                    'enemy_turret.png': {
                        tile: 50,
                        tileh: 26,
                        map: {EnemyTurretLeft: [0, 0], EnemyTurretRight: [0, 1]}
                    },
                    'enemy_bullet.png': {
                        tile: 10,
                        tileh: 10,
                        map: {EnemyBullet: [0, 0], EnemyBulletBlue: [0, 1]}
                    },
                    'enemy_drone.png': {
                        tile: 50,
                        tileh: 50,
                        paddingX: 1,
                        paddingY: 1,
                        map: {EnemyDrone: [0, 0], EnemyDroneAdvanced: [2, 0], EnemyDroneDestroyer: [0, 1], EnemyDrone2: [2, 1]}
                    },
                    'xhair.png': {
                        tile: 46,
                        tileh: 46,
                        map: {Xhair: [0, 0]}
                    },
                    'explo01.png': {
                        tile: 34,
                        tileh: 30,
                        map: {ExplosionsYB: [0, 0]}
                    },
                    'explo02.png': {
                        tile: 33,
                        tileh: 31,
                        map: {ExplosionHit: [0, 0]}
                    }
                },
                audio: {
                    jump: ["jump.mp3", "jump.ogg", "jump.wav"],
                    push: ["push.mp3", "push.ogg", "push.wav"],
                    star: ["star.mp3", "star.ogg", "star.wav"],
                    dead: ["dead.mp3", "dead.ogg", "dead.wav"]
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