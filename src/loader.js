/**
 * Strider
 * Github Game-Off 2015 Entry
 * by Petar Petrov / github.com/petarov
 *
 * (A fork of) Octocat Jump
 * A Github Game Off 2012 Entry
 * @copyright Omer Goshen <gershon@goosemoose.com>
 */
(function(Crafty) {
    document.addEventListener('DOMContentLoaded', function () {

    var STAGE_WIDTH = 400,
        STAGE_HEIGHT = 640,
        screen = document.getElementById('game'),
        skipIntro = true;

    Crafty.init(STAGE_WIDTH, STAGE_HEIGHT, screen).canvas.init();
    Crafty.viewport.init(STAGE_WIDTH, STAGE_HEIGHT, screen);
    Crafty.viewport.bounds = { 
        min: { x:-100, y: -Infinity }, 
        max: { x: STAGE_WIDTH + 50, y: STAGE_HEIGHT } 
    };
    // Crafty.viewport.clampToEntities = true;
    Crafty.settings.modify('autoPause', true);

    /**
     * Octicons font component
     * @see https://github.com/styleguide/css/7.0
     */
    Crafty.c("Octicons", {
        init: function () {
            this.requires("2D, DOM, Text");
            this.css({
                "font-family": "Octicons",
                "font-size": "48px",
                "font-weight": "normal",
                'textShadow': '0px 2px 4px rgba(0,0,0,.5)'
                // 'textShadow': '0px 0px 8px rgba(0,0,0,.5), -1px -1px 0 #444,1px -1px 0 #444,-1px 1px 0 #444,1px 1px 0 #444'
                // 'textShadow': '0px 0px 8px rgba(0,0,0,.5), -1px -1px 0 #fc0,1px -1px 0 #fc0,-1px 1px 0 #fc0,1px 1px 0 #fc0'
            });
            // .text("&#xF220");
        }
    });
    Crafty.c('SpaceFont', {
        init: function () {
            this.requires('2D, DOM, Text');
            this.textFont({ family: 'Jura', size: '11px', weight: 'normal' })
            this.textColor('white')
            this.css({
                // "font-family": "Jura",
                // "font-size": "18px",
                // "font-weight": "normal",
                'textShadow': '0px 2px 4px rgba(0,0,0,.5)'
            });
        }
    });

    /************************************************************************
     * Loading Scene
     */
    Crafty.scene("loading", function () {
        Crafty.background('#005564');

        var text = Crafty.e('2D, DOM, Text, SpaceFont')
        .attr({x: 85, y: 150, w: Crafty.viewport.width })
        .textFont({size: '20px'})
        .textColor('white')
        .text('Establishing secure com...');

        var percent = Crafty.e('2D, DOM, Text, SpaceFont')
        .attr({x: 180, y: 180, w: 150 })
        .textFont({size: '20px'})
        .textColor('white')
        .text('0%');

        var bgovr = Crafty.e('2D, Canvas, Color, Tween, Delay').attr({
            x: 0,
            y: 0,
            z: -1,
            w: Crafty.viewport.width,
            h: Crafty.viewport.height,
            alpha: 0
        }).color('white');

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
        Crafty.paths({ audio: "assets/sfx/", images: "assets/images/" });
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
                    map: {EnemyTurretGreen: [0, 0], EnemyTurretRed: [0, 1], EnemyTurretPurple: [0, 2]}
                },
                'enemy_bullet.png': {
                    tile: 10,
                    tileh: 10,
                    map: {EnemyBullet: [0, 0], EnemyBulletBlue: [0, 1], EnemyBulletGlow: [0, 2]}
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
                jump: ['land.ogg', 'land.m4a'],
                land: ['landfeet.ogg', 'landfeet.m4a'],
                hurt: ['hurt.ogg', 'hurt.m4a'],
                death: ['death.ogg', 'death.m4a'],
                deathsplat: ['deathsplat.ogg', 'deathsplat.m4a'],
                turretshot1: ['turretshot.ogg', 'turretshot.m4a'],
                turretshot2: ['turretshot2.ogg', 'turretshot2.m4a'],
                explode1: ['explode.ogg', 'explode.m4a'],
                explode2: ['explode2.ogg', 'explode2.m4a'],
                droneshot1: ['droneshot.ogg', 'droneshot.m4a'],
                droneshot2: ['droneshot2.ogg', 'droneshot2.m4a'],
                gun1: ['gun01.ogg', 'gun01.m4a'],
                gun2: ['gun02.ogg', 'gun02.m4a'],
                gun3: ['gun03.ogg', 'gun03.m4a'],
                gunclip: ['gunclip.ogg', 'gunclip.m4a'],
                rico1: ['rico01.ogg', 'rico01.m4a'],
                rico2: ['rico02.ogg', 'rico02.m4a'],
                rico3: ['rico03.ogg', 'rico03.m4a'],
                warning: ['warning.ogg', 'warning.m4a'],
                doorshut: ['doorshut.ogg', 'doorshut.m4a'],
                powerup01: ['pup01.ogg', 'pup01.m4a'],
                powerup02: ['pup02.ogg', 'pup02.m4a'],
            }
        };
        Crafty.load(assets, function() {
            if (skipIntro) {
                Crafty.scene('main');
            }
            bgovr.tween({alpha: 1.0}, 3000)
            .bind('TweenEnd', function () {
                Crafty.scene('intro');
            })
            .delay(function() {
                text.visible = false;
                percent.visible = false;
            }, 1500);
        }, function (e) {
            percent.text(~~(e.percent) + '%');
        }, function (e) {
            console.log('ya blew it!');
            console.error(e);
        });
    });

    }); //eof-ready
}(Crafty));