/**
 * Strider
 * Github Game-Off 2015 Entry
 * by Petar Petrov / github.com/petarov
 *
 * (A fork of) Octocat Jump
 * A Github Game Off 2012 Entry
 * @copyright Omer Goshen <gershon@goosemoose.com>
 */
(function octocatJump(Crafty) {
    document.addEventListener('DOMContentLoaded', function () {

    var isDebug = false,
        GRAVITY = 1,
        SFX = true,
        MUSIC = true,
        MUSIC_VOL = 0.8,
        enableFPS = false,
        enableIntroSfx = !isDebug,
        
        METERS_DEPTH = 3000,
        METERS_DEPTH_2 = METERS_DEPTH * 0.6,
        METERS_DEPTH_3 = METERS_DEPTH * 0.3,
        meters = METERS_DEPTH,
        total_platforms = METERS_DEPTH / 10 - 1,
        
        MAX_POWERUPS = total_platforms / 2,
        MAX_ENEMIES = total_platforms / 2,
        MAX_BULLETS = MAX_ENEMIES * 2,
        POWERUP_ENERGY = 1,
        POWERUP_HEALTH = 2,
        POWERUP_ENERGY_BLUE = 3,
        MAX_ENERGY = 49,
        MAX_HEALTH = 4,
        // animations        
        MAX_ANIMATIONS = 15,
        anims_data = [],
        playerAnimSpeed = 450,
        generalAnimSpeed = 450,
        ANIM_GUNFLARE = 1,
        ANIM_PLAYER_GUNFLARE = 2,
        ANIM_EXPLOSION_01 = 3,
        ANIM_EXPLOSION_BLUE = 4,
        ANIM_EXPLOSION_02 = 5,
        ANIM_HITENEMY = 6,
        // objects
        ship = null,
        HUDEnergy = null,
        HUDHealth = null,
        SmokeAnim = null,
        octocat = null,
        PlayerDeadAnim = null,
        // level vars
        level_data = [],
        powerups_data = [],
        cur_platforms = 0,
        max_platforms = 30, //Math.max(METERS_DEPTH / 100, 11),
        step_platforms = 1,
        // player vars
        PLAYER_ENERGY_REPLENISH_TO = 1500,
        playerSpeed = 4,
        playerJump = 18,
        playerHealth = 4,
        playerEnergy = MAX_ENERGY,
        playerDamage = 2,
        playerKills = {},
        isDead = false,
        playerTargetDist = 44100,
        // enemy base vars
        ENEMY_TURRET = 1,
        ENEMY_TURRET_ADVANCED = 2,
        ENEMY_TURRET_DESTROYER = 3,
        ENEMY_DRONE = 4,
        ENEMY_DRONE_ADVANCED = 5,
        ENEMY_DRONE_DESTROYER = 6,
        ENEMY_SHOOTDELAY = 2000,
        ENEMY_SHOOTRANGE = 176400, // 420px
        ENEMY_HP = 10, //TODO
        BULLET_NORMAL = 1,
        BULLET_BLUE = 2,
        // BULLET_LIVE = 3500,
        BULLET_MAX_DIST = ~~(ENEMY_SHOOTRANGE * 0.9);
        BULLET_SPEED = 2.75,
        enemies_data = [],
        bullets_data = [],
        SPREAD8 = calcSpread(10, 8),
        SPREAD8_R = calcSpread(50, 8)
        //
        ;

    var pi = Math.PI
      , pi_6 = Math.PI / 6
      , pi_4 = Math.PI / 4
      , pi_3 = Math.PI / 3
      , pi_2 = Math.PI / 2
      , pi_23 = 2 * Math.PI / 3
      , pi_34 = 3 * Math.PI / 4
      , pi_56 = 5 * Math.PI / 6;

    function clone(obj) {
        if(obj == null || typeof(obj) != 'object')
            return obj;
        var temp = obj.constructor();
        for(var key in obj) {
            if(obj.hasOwnProperty(key)) {
                temp[key] = clone(obj[key]);
            }
        }
        return temp;
    }
    function debug() {
        if (isDebug) {
            if (arguments.length > 1) {
                console.log(arguments);
            } else {
                console.log(arguments[0]);
            }
        }
    }
    function calcSpread(r, size) {
        var x, y
          , phi  = 0
          , step = 2 * Math.PI / size
          , spread = [];
        for (var i = 0; i < size; i++) {
            x = Math.cos(phi) * r;
            y = Math.sin(phi) * r;
            spread.push([x, y]);
            phi += step;
        }
        return spread;
    }
    function getSpread(ox, oy, spread) {
        var result = [];
        for (var i = 0; i < spread.length; i++) {
            result.push([ 
                spread[i][0] + ox,
                spread[i][1] + oy,
                ]);
        }
        return result;
    }
    function sfx(name, repeat, vol) {
        if (SFX) {
            // debug('play sfx', name);
            Crafty.audio.play(name, repeat, vol);
        }
    }
    function music(name, repeat, vol) {
        if (MUSIC) {
            debug('play music', name);
            Crafty.audio.play(name, repeat === true ? -1 : 0, vol);
        }
    }
    function getMeters(y) {
        return METERS_DEPTH - ~~((Crafty.viewport.height - y) * 0.1 - 1);
    }

    function genLevel() {
        var platforms = [];
        var platform2add;

        platforms.push({
            x: Crafty.viewport.width / 2 - 50,
            y: Crafty.viewport.height - 60,
            w: 50,
            h: 26,
            num: 0,
            clr: Math.random() > 0.5 ? 'PlatformBlue' : 'PlatformGreen'
        });

        var vw = (Crafty.viewport.width)
          , vh = -Crafty.viewport.y + Crafty.viewport.height - 150;

        var i = 1, j = 0;
        while (i < total_platforms) {
            platform2add = {
                x: -100 + ~~ (Math.random() * vw),
                y: vh - i * 100 + (50 * Math.random()),
                hasDrone: false,
                hasTurret: false,
                powerup: false
            };
            if (i % 8 == 0 && i > 8) {
                platform2add.w = 150;
                platform2add.h = 26;
                platform2add.clr = Math.random() > 0.5 ? 'PlatformBlueBig' : 'PlatformGreenBig';
                platform2add.powerup = Math.random() > 0.3 ? POWERUP_ENERGY : POWERUP_HEALTH;
                platform2add.hasDrone = true;
            } else if (i % 5 === 0) {
                platform2add.w = 150;
                platform2add.h = 26;
                platform2add.clr = Math.random() > 0.5 ? 'PlatformBlueBig' : 'PlatformGreenBig';
                platform2add.powerup = Math.random() > 0.5 ? POWERUP_ENERGY : POWERUP_HEALTH;
                platform2add.hasTurret = true;
            } else {
                platform2add.w = 50;
                platform2add.h = 26;
                platform2add.clr = Math.random() > 0.5 ? 'PlatformBlue' : 'PlatformGreen';
                platform2add.powerup = Math.random() < 0.2 ? (Math.random() > 0.5 ? POWERUP_ENERGY : POWERUP_HEALTH) : false;
            }
            platform2add.num = i;
            platforms.push(platform2add);
            i += 1;
        }
        // last top platform
        platforms.push({
            x: Crafty.viewport.width / 2 - 150 / 2,
            y: vh - i * 100 + (50 * Math.random()),
            w: 150,
            h: 26,
            num: i,
            clr: 'PlatformBlueBig',
            goal: true,
            hasDrone: true
        });
        return platforms;
    }    

    function initState() {
        /**
         * Reset stuff
         */
        Crafty.background('none');
        MUSIC_VOL = 0.8;
        // Crafty.viewport.y = 0;
        isDead = false;
        playerHealth = MAX_HEALTH;
        playerEnergy = MAX_ENERGY;
        meters = METERS_DEPTH;

        cur_platforms = 0;
        // level_data = [];
        powerups_data = [];
        anims_data = [];
        enemies_data = [];
        bullets_data = [];
        playerKills.drones = 0;
        playerKills.turrets = 0;
        playerKills.powerups = 0;
        ship = null;
        SmokeAnim = null;
        octocat = null;

        level_data = genLevel();
        // crafty
        Crafty.unbind('EnterFrame');
        Crafty.unbind('Pause');
        Crafty.unbind('Unpause');
        Crafty.unbind('ViewportScroll');
    }

    function giveAchievement(what) {
        if (GJAPI && GJAPI.bActive && !what.achieved) {
            what.achieved = true;
            GJAPI.TrophyAchieve(what.id, function (response) {
                if (response && response.success) {
                    Crafty.e("2D, DOM, Text, Tween").attr({
                        x: 5,
                        w: 150,
                        z: 9999
                    }).css({
                        'color': '#fff',
                        'textShadow': '0px 2px 4px rgba(0,0,0,.5)'
                    }).tween({alpha: 0.1}, 1750)
                    .bind("EnterFrame", function () {
                        this.x = 5 - Crafty.viewport.x;
                        this.y = 30 - Crafty.viewport.y;
                        this.text('New achievement unlocked!');
                    })
                    .bind("TweenEnd", function() {
                        this.destroy();
                    });
                } else {
                    // console.log('Could not achieve trophy - ' + what.id + '.' + response.message);
                }
            });
        }
    }
    function updateAchievements(data) {
        if (GJAPI && GJAPI.bActive) {
            var total = data.turrets + data.drones;
            console.log(data, total);
            if (total >= 80) {
                giveAchievement(trophies['platinum01']);
            } else if (total >= 50) {
                giveAchievement(trophies['gold01']);
            } else if (total >= 25) {
                giveAchievement(trophies['silver01']);
            } else if (total >= 20) {
                giveAchievement(trophies['bronze02']);
            }

            if (data.turrets >= 25) {
                giveAchievement(trophies['silver02']);
            } else if (data.turrets >= 5) {
                giveAchievement(trophies['bronze03']);
            }
            if (data.drones >= 25) {
                giveAchievement(trophies['gold02']);
            } else if (data.drones >= 5) {
                giveAchievement(trophies['bronze04']);
            }

            if (data.powerups >= 50) {
                giveAchievement(trophies['silver03']);
            } else if (data.powerups >= 20) {
                giveAchievement(trophies['bronze05']);
            }
        }
    }
    function onHitPlatform(e) {
        sfx('land');
    }
    function onHitSpikes(e) {
        giveAchievement(trophies['bronze01']);
        Crafty.trigger('playerdead');
    }
    function onHitSpaceship(e) {
        giveAchievement(trophies['platinum02']);
        Crafty.trigger('playerwin');
    }
    function onHitHealth(e) {
        if (e[0] && e[0].obj && e[0].obj.visible) {
            var obj = e[0].obj;
            obj.visible = false;
            playerHealth += 1;
            playerKills.powerups += 1;
            updateAchievements(playerKills);
            if (!Crafty.audio.isPlaying('powerup02')) {
                sfx('powerup02');
                Crafty.trigger('flashscreen', {clr: '#20ee20', delay: 175});
            }
            Crafty.trigger('playerupdatehealth');
            Crafty.trigger('playsmokeanim');
        }
    }
    function onHitEnergy(e) {
        var obj = e[0].obj;
        if (obj && obj.visible) {
            obj.trigger('Kill');
            if (obj.energyType === POWERUP_ENERGY_BLUE) {
                playerEnergy += ~~(MAX_ENERGY * 0.6);    
            } else {
                playerEnergy += ~~(MAX_ENERGY * 0.3);    
            }
            playerKills.powerups += 1;
            updateAchievements(playerKills);
            if (!Crafty.audio.isPlaying('powerup01')) {
                sfx('powerup01');
                Crafty.trigger('flashscreen', {clr: '#2020ee', delay: 175});
            }
            Crafty.trigger('playerupdatejuice');
            Crafty.trigger('playsmokeanim');
        }
    }
    function onHitBullet(bullet) {
        // var bullet;
        // if (typeof e === 'object') {
        //     bullet = e;
        // } else if (e[0] && e[0].obj) {
        //     bullet = e[0].obj;
        // }
        // if (bullet) {
            // bullet.trigger('Kill');
            playerHealth -= 1;
            if (playerHealth < 0) {
                Crafty.trigger('playerupdatehealth');
                Crafty('BackgroundOverlay').color('#ff0000');
                Crafty.trigger('playerdead');
            } else {
                Crafty.trigger('playerupdatehealth');
                Crafty.trigger('flashscreen', {clr: '#ff0000', delay: 400});
                sfx('hurt');
            }
        // }
    }

    /************************************************************************
     * Main scene
     */       

    Crafty.scene('main', function () {
        initState();

        /************************************************************************
         * Create entities
         */
        // if (enableFPS) {
            // Crafty.e("2D, DOM, FPS, Text").attr({x: 50, y: 60, maxValues:10})
            // .css({
            //     "font": "96px Chewy, Impact",
            //     "color": "#fff",
            //     "text-align": "center",
            //     'textShadow': '0px 2px 8px rgba(0,0,0,.9), -1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000,1px 1px 0 #000'
            // })
            // .bind("MeasureRenderTime", function(fps) {
            //     this.text(fps);
            // }).text('test');
        // }

        var bg = Crafty.e('2D, Canvas, Image, Background').attr({
            x: -100,
            y: 0,
            z: -4,
            w: Crafty.viewport.width + 150,
            h: Crafty.viewport.height
        }).image('assets/images/wall01.png', 'repeat');
        var bg1 = Crafty.e('2D, Canvas, Image, Background2').attr({
            x: -100,
            y: 0,
            z: -4,
            w: Crafty.viewport.width + 150,
            h: Crafty.viewport.height
        }).image('assets/images/backgrounds.png', 'repeat');
        var bg2 = Crafty.e('2D, Canvas, Image, Background').attr({
            x: -100,
            y: 0,
            z: -4,
            w: Crafty.viewport.width + 150,
            h: Crafty.viewport.height
        }).image('assets/images/starsky.png', 'repeat');
        var bgovr = Crafty.e('2D, Canvas, BackgroundOverlay, Color, Delay').attr({
            x: -100,
            y: 0,
            z: -1,
            w: Crafty.viewport.width + 150,
            h: Crafty.viewport.height,
            alpha: 0.2,
            direction: 'right'
        }).color('#006064');

        octocat = Crafty.e('2D, Canvas, Gunner, SpriteAnimation, Physics, Gravity, Collision, Tween, Delay, Keyboard, Twoway')
        .setName('octocat')
        .attr({
            x: Crafty.viewport.width / 2 - 50,
            y: level_data[0].y, 
            z: 990
        })
        .origin('center')
        .twoway(playerSpeed, playerJump)
        .reel('walk_right', playerAnimSpeed, 0, 0, 7)
        .reel('walk_left', playerAnimSpeed, 0, 1, 7)
        .reel('shoot_left', playerAnimSpeed, 0, 1, 1)
        .reel('shoot_right', playerAnimSpeed, 0, 0, 1)
        .reel('stand_left', playerAnimSpeed, [ [5, 3] ])
        .reel('stand_right', playerAnimSpeed, [ [0, 3] ])
        // aim
        .reel('shoot_n_e', playerAnimSpeed, 2, 2, 1)
        .reel('shoot_n_w', playerAnimSpeed, 3, 2, 1)
        .reel('shoot_ne', playerAnimSpeed, 1, 2, 1)
        .reel('shoot_nw', playerAnimSpeed, 4, 2, 1)
        .reel('shoot_w_n', playerAnimSpeed, 5, 2, 1)
        .reel('shoot_e_n', playerAnimSpeed, 0, 2, 1)
        // aim
        .reel('shoot_s_e', playerAnimSpeed, 2, 3, 1)
        .reel('shoot_s_w', playerAnimSpeed, 3, 3, 1)
        .reel('shoot_se', playerAnimSpeed, 1, 3, 1)
        .reel('shoot_sw', playerAnimSpeed, 4, 3, 1)
        .reel('shoot_w_s', playerAnimSpeed, 5, 3, 1)
        .reel('shoot_e_s', playerAnimSpeed, 0, 3, 1)
        .animate('stand_left')
        .gravity('Platform')
        .gravityConst(GRAVITY)
        .collision(12, 18,  12, 47,  25, 57,  38, 47,  38, 18,  25, 10)
        .onHit('Spikes', onHitSpikes)
        .onHit('Spaceship', onHitSpaceship)
        .onHit('HealthRed', onHitHealth)
        .onHit('EnergyOrange', onHitEnergy)
        .onHit('EnergyBlue', onHitEnergy);
        // .onHit('Platform', function() {}, onHitPlatform);

        if (isDebug) octocat.addComponent('WiredHitBox');

        octocat.bind('CheckLanding', function(ground) {
            // do not land, if not above the platform
            if (octocat.y + octocat.h > ground.y + octocat.vy) {
                octocat.canLand = false;
            }
        });
        octocat.bind('CheckJumping', function(ground) {
            if (!ground && this.hasDoubleJumpPowerUp) {
                this.canJump = true;
                this.hasDoubleJumpPowerUp = false;
                sfx('jumpboost');
                jumpboost.visible = true; // show boost anim
                jumpboost.animate('play')
            } else if (ground) {
                this.hasDoubleJumpPowerUp = true;
                sfx('jump');
            }
        });
        octocat.bind('LandedOnGround', function() {
            sfx('land');
        });

        octocat.bind('KeyDown', function (e) {
            if (e.key === Crafty.keys.RIGHT_ARROW || e.key === Crafty.keys.D) {
                this.direction = 'right';
            } else if (e.key === Crafty.keys.LEFT_ARROW || e.key === Crafty.keys.A) {
                this.direction = 'left';
            }
        });
        octocat.bind('KeyUp', function (e) {
            if (e.key === Crafty.keys.Z) {
                // noop
            }
            if (e.key === 49) {
                // Overcharge
                if (playerHealth > 0) {
                    playerHealth -= 1;
                    Crafty.trigger('playerupdatehealth');
                    playerEnergy += MAX_ENERGY;
                    Crafty.trigger('playerupdatejuice');
                    Crafty.trigger('flashscreen', {clr: '#20ee20', delay: 400});
                    sfx('overcharge');
                    sfx('hurt');
                }
            } else if (e.key === 57) {
                MUSIC_VOL += 0.1;
                MUSIC_VOL = Math.min(MUSIC_VOL, 1);
            } else if (e.key === 56) {
                MUSIC_VOL -= 0.1;
                MUSIC_VOL = Math.max(MUSIC_VOL, 0);
            }
            // TEST ////////
            if (isDebug) {
                if (e.key === Crafty.keys.O) {
                    playerHealth -= 1;
                    Crafty.trigger('playerupdatehealth');
                }
                if (e.key === Crafty.keys.P) {
                    playerHealth += 1;
                    Crafty.trigger('playerupdatehealth');
                    // playerEnergy -= 1;
                    // Crafty.trigger('playerupdatejuice');
                }
                if (e.key === Crafty.keys.K) {
                    addEnemy(ENEMY_TURRET, 150 + Math.random() * 150, 100)
                }
                if (e.key === Crafty.keys.L) {
                    addEnemy(ENEMY_DRONE, 50 + Math.random() * 150, 100)
                }
            }
            ///////// 
        });
        octocat.bind('EnterFrame', function() {
            this.cx = octocat._x + octocat.w / 2;
            this.cy = octocat._y + octocat.h / 2;

            if (this.targetEnemy) {
                xhair.x = this.targetEnemy.x + this.targetEnemy.w / 2 - xhair.w / 2;
                xhair.y = this.targetEnemy.y + this.targetEnemy.h / 2 - xhair.h / 2;
            }

            if (this.isDown(Crafty.keys.W) || this.isDown(Crafty.keys.UP_ARROW)) { // && !this.isDown(Crafty.keys.LEFT_ARROW)) {
                this.pauseAnimation();
            }

            if (this.isDown(Crafty.keys.LEFT_ARROW) || this.isDown(Crafty.keys.A)) {
                if (!this.isPlaying('walk_left')) {
                    this.animate('walk_left', 10);
                }
            } else if (this.isDown(Crafty.keys.RIGHT_ARROW) || this.isDown(Crafty.keys.D)) {
                if (!this.isPlaying('walk_right')) {
                    this.animate('walk_right', 10);
                }
            } else if (this.isDown(Crafty.keys.Y) || this.isDown(Crafty.keys.Z) || this.isDown(Crafty.keys.X)) {
                if (!this.isShooting) {
                    this.isShooting = true;
                    // --- kill't with fire
                    this.trigger('Shoot');
                    Crafty.trigger('playerupdatejuice');
                }
            } else {
                this.isShooting = false;
                var reel = this.getReel();
                if (reel && reel.id.substr(0, 5) !== 'shoot') { // what a hack ladies & gentlemen
                    this.animate(this.direction === 'right' ? 'stand_right' : 'stand_left', 0);
                }
                // if (!this.isPlaying('stand_left') && !this.isPlaying('stand_right')) {
                //     this.animate(this.direction === 'right' ? 'stand_right' : 'stand_left', 0);
                // }
            }
        });
        octocat.bind('Moved', function() {
            // adjust crosshair / target
            xhair.visible = false;
            var lastDist = 9999999
                , lastEnemy = null
                , lastEnemyX, lastEnemyY;
            for (var i = 0; i < enemies_data.length; i++) {
                var enemy = enemies_data[i];
                if (enemy.visible) {
                    var ecx = enemy.x + enemy.w / 2
                      , ecy = enemy.y + enemy.h / 2;
                    var dist = Crafty.math.squaredDistance(ecx, ecy, this.cx, this.cy);
                    if (dist < playerTargetDist && dist < lastDist) {
                        lastDist = dist;
                        lastEnemyX = ecx;
                        lastEnemyY = ecy;
                        lastEnemy = enemy;
                    }
                }
            }
            this.targetEnemy = lastEnemy;
            xhair.visible = !!lastEnemy;
            // if (this.targetEnemy) {
            //     xhair.x = lastEnemyX - xhair.w / 2;
            //     xhair.y = lastEnemyY - xhair.h / 2;
            //     xhair.dy = lastEnemyY + 5;
            //     xhair.tween({y: xhair.dy}, 750);
            // }
            this.moved = true;
        });
        octocat.delay(function() {
            if (!this.moved && !isDebug) {
                sfx('wait4mom');
                this.animate('shoot_n_e');
            }
            this.moved = false;
        }, 5000, -1);
        octocat.bind('Shoot', function() {
            playerEnergy -= 1;
            // if (playerEnergy < 0) {
            //     // no ammo
            //     sfx('gunclip');
            //     return;
            // }
            if (octocat.targetEnemy) {
                var target = octocat.targetEnemy
                  , ecx = target.x + target.w / 2
                  , ecy = target.y + target.h / 2
                  , anim = null
                  // , phi = Math.atan2(ecy - this.cy, ecx - this.cx);
                  , phi = Math.atan2(this.cy - ecy, this.cx - ecx)
                  , px = 0, py = 0;

                if (playerEnergy >= 0) {
                    target.hp -= playerDamage;
                    if (target.hp < 0) {
                        target.trigger('Kill');
                        octocat.trigger('Moved'); // update target
                    } else {
                        addAnimation(ANIM_HITENEMY, target.x + target.w * Math.random(), target.y + target.h * Math.random());
                        var rnd = Math.random();
                        if (rnd > 0.7) {
                            rnd = 'rico3';
                        } else if (rnd > 0.4) {
                            rnd = 'rico2';
                        } else {
                            rnd = 'rico1';
                        }
                        sfx(rnd);
                    }
                }

                // manually adjust shooting anims ...oh my!
                if (Crafty.math.withinRange(phi, 0, pi_6)) {
                    anim = 'shoot_w_n';
                    px = -this.w / 2 + 2;
                    py = -this.h / 2 + 10;
                } else if (Crafty.math.withinRange(phi, pi_6, pi_3)) {
                    anim = 'shoot_nw';
                    px = -this.w / 2 + 3;
                    py = -this.h / 2 + 2;
                } else if (Crafty.math.withinRange(phi, pi_3, pi_23)) {
                    if (this.direction === 'left') {
                        anim = 'shoot_n_w';
                        px = 4;
                    } else {
                        anim = 'shoot_n_e';
                        px = -4;
                    }
                    py = -this.h / 2;
                } else if (Crafty.math.withinRange(phi, pi_23, pi_56)) {
                    anim = 'shoot_ne';
                    px = this.w / 2 - 6;
                    py = -this.h / 2 + 5;
                } else if (Crafty.math.withinRange(phi, pi_56, pi)) {
                    anim = 'shoot_e_n';
                    px = this.w / 2 - 4;
                    py = -this.h / 2 + 12;
                } else if (Crafty.math.withinRange(phi, -pi_6, 0)) {
                    anim = 'shoot_w_s';
                    px = -this.w / 2;
                    py = 11;
                } else if (Crafty.math.withinRange(phi, -pi_3, -pi_6)) {
                    anim = 'shoot_sw';
                    px = -this.w / 2 + 3;
                    py = this.h / 2 - 9;
                } else if (Crafty.math.withinRange(phi, -pi_23, -pi_3)) {
                    if (this.direction === 'left') {
                        anim = 'shoot_s_w';
                        px = 7;
                    } else {
                        anim = 'shoot_s_e';
                        px = -7;
                    }
                    py = this.h / 2 - 4;
                } else if (Crafty.math.withinRange(phi, -pi_56, -pi_23)) {
                    anim = 'shoot_se';
                    px = this.w / 2 - 5;
                    py = this.h / 2 - 8;
                } else if (Crafty.math.withinRange(phi, -pi, -pi_56)) {
                    anim = 'shoot_e_s';
                    px = this.w / 2 - 4;
                    py = 9;
                }
                if (anim) {
                    this.animate(anim);
                }
                // debug('animation: ', anim);
            } else {
                if (this.direction === 'left') {
                    anim = 'shoot_left';
                    px = -this.w / 2;
                } else {
                    anim = 'shoot_right';
                    px = this.w / 2;
                }
                py = -2;
                this.animate(anim);
            }

            if (playerEnergy >= 0) {
                addAnimation(ANIM_PLAYER_GUNFLARE, px, py);
                var rnd = Math.random();
                if (rnd > 0.7) {
                    rnd = 'gun2';
                } else if (rnd > 0.4) {
                    rnd = 'gun3';
                } else {
                    rnd = 'gun1';
                }
                // if (!Crafty.audio.isPlaying(rnd)) {
                    sfx(rnd);
                // }
            } else {
                // no ammo
                sfx('gunclip');
            }
        });
        octocat.delay(function() {
            // replenish energy
            playerEnergy += 1;
            Crafty.trigger('playerupdatejuice');
        }, PLAYER_ENERGY_REPLENISH_TO, -1);

        // jumpboost
        var jumpboost = Crafty.e("2D, Canvas, SpaceshipEngine, SpriteAnimation").attr({
            x: 0,
            y: 0,
            z: octocat.z - 1,
            visible: false
        })
        .reel('play', ~~(generalAnimSpeed / 2.5), 0, 0, 6)
        .bind('EnterFrame', function() {
            this.x = octocat.cx - this.w / 2;
            this.y = octocat.cy + 20
        })
        .bind('AnimationEnd', function() {
            this.visible = false;
        });
        octocat.y = octocat.y - octocat.h - 1;

        var xhair = Crafty.e("2D, Canvas, Xhair, Tween")
        .attr({
            x: 0,
            y: 0,
            z: 999,
            alpha: 0.75,
            visible: false,
            yoff: 0,
            step: 0.15
        })
        .bind('EnterFrame', function() {
            this.x += this.yoff;
            this.y += this.yoff;
            this.yoff += this.step;
            if (this.yoff > 5) {
                this.step = -this.step;
            } else if (this.yoff < -5) {
                this.step = -this.step;
            }
        });
        // .origin('center')
        // .bind('TweenEnd', function() {
        //     this.tween({y: this.dy - 5}, 750);
        // });

        PlayerDeadAnim = Crafty.e('2D, Canvas, Splatter, SpriteAnimation')
        .origin('center')
        .attr({x: -999, y: 0})
        .reel('play', generalAnimSpeed, 0, 0, 6);

        // door
        Crafty.e("2D, Canvas, SpriteAnimation, DoorAnim")
        .attr({
            x: level_data[0].x,
            y: level_data[0].y - 54,
            z: octocat.z - 99,
        })
        .reel('close', generalAnimSpeed * 3.5, 9, 0, -10)
        .animate('close');

        // something to die for ...
        var stype = Math.random() > 0.5 ? "Spikes02" : "Spikes01";
        for (var i = 0; i < 13; i++) {
            var todie4 = Crafty.e("2D, Canvas, Spikes, Collision, " + stype)
            .attr({
                x: -150 + i * 50,
                y: Crafty.viewport.height - 23,
                w: 50,
                h: 23
            });
            if (isDebug) todie4.addComponent('WiredHitBox');
        }

        /************************************************************************
         * Bindings & Events
         */

        function scrollViewport(e) {
            if (meters < METERS_DEPTH_3) {
                bg2.y = -Crafty.viewport.y;
            } else if (meters < METERS_DEPTH_2) {
                bg1.y = -Crafty.viewport.y;
            } else {
                bg.y = -Crafty.viewport.y;
            }
            bgovr.y = -Crafty.viewport.y;
        }
        Crafty.bind("EnterFrame", scrollViewport);
        
        Crafty.uniqueBind("Pause", function() {
            Crafty.audio.mute();
            Crafty('BackgroundOverlay').color("#000000");
            Crafty('BackgroundOverlay').alpha = 0.5;
            Crafty('PauseText').destroy();
            Crafty.e('2D, DOM, Text, SpaceFont, PauseText')
            .attr({x: octocat.x - 15, y: octocat.y - 25, w: Crafty.viewport.width})
            .textFont({size: '16px'})
            .textColor('white')
            .text('Paused');
            // Crafty.DrawManager.draw();
        });
        Crafty.uniqueBind("Unpause", function() {
            Crafty.audio.unmute();
            Crafty('BackgroundOverlay').color("#006064");
            Crafty('BackgroundOverlay').alpha = 0.2;
            Crafty('PauseText').destroy();
            // Crafty.DrawManager.draw();
        });
        Crafty.uniqueBind('flashscreen', function (data) {
            if (data) {
                var bgovr = Crafty('BackgroundOverlay');
                bgovr.color(data.clr).delay(function () {
                    this.color('#006064');
                }, data.delay);
            }
        });
        Crafty.uniqueBind('playerdead', function () {
            if (!isDead) {
                isDead = true;
                sfx('deathsplat');
                sfx('death');

                // die Strider ...
                PlayerDeadAnim.x = octocat.cx - 40;
                PlayerDeadAnim.y = octocat.cy - 22;
                PlayerDeadAnim.animate('play');
                PlayerDeadAnim.one('AnimationEnd', function() {
                    this.destroy();
                });
                octocat.visible = false;
                octocat.destroy();
                // score screen
                Crafty.e('Delay').delay(function () {
                    Crafty.scene('dead', {'meters': meters, 'kills': playerKills});
                }, 1150, 0);
            }
        });
        Crafty.uniqueBind('playerwin', function () {
            // good bye Strider
            octocat.x = -1000;
            octocat.visible = false;
            octocat.destroy();
            HUDHealth.destroy();
            HUDEnergy.destroy();
            // fly away ...
            ship.bind('EnterFrame', function() {
                this._acc += 0.0125;
                this._acc = Math.min(this._acc, 5);
                this.y -= this._acc;
            });            
            Crafty.viewport.follow(ship, 0, 0);
            // engines
            var e1 = Crafty.e('2D, Canvas, SpaceshipEngine, SpriteAnimation').attr({
                x: ship.x + 41,
                y: ship.y + 80,
                z: -3
            })
            .reel('play2', 1500, 3, 0, 3)
            .reel('play', 1500, 0, 0, 6).animate('play')
            .bind('EnterFrame', function() {
                this.x = ship.x + 41;
                this.y = ship.y + 78;
            })
            .bind('AnimationEnd', function(reel) {
                this.animate('play2', -1);
            });
            var e1 = Crafty.e('2D, Canvas, SpaceshipEngine, SpriteAnimation').attr({
                x: ship.x + 28,
                y: ship.y + 80,
                z: -3
            })
            .reel('play2', 1500, 3, 0, 3)
            .reel('play', 1500, 0, 0, 6).animate('play')
            .bind('EnterFrame', function() {
                this.x = ship.x + 28;
                this.y = ship.y + 78;
            })
            .bind('AnimationEnd', function(reel) {
                this.animate('play2', -1);
            });
            sfx('liftoff');
            sfx('liftoff2');
            Crafty.e('Delay').delay(function () {
                sfx('movin');
            }, 1000, 0);
            //TODO: fix delay obj not destroyed bug
            Crafty.e('Delay').delay(function () {
                Crafty.e('2D, DOM, Text, SpaceFont')
                .attr({x: 125, y: 150, w: Crafty.viewport.width })
                .textFont({size: '20px'})
                .textColor('white')
                .text('Mission Successful!')
                .bind('EnterFrame', function() {
                    this.y = ship.y - 100;
                });
            }, 5000, 0);
            Crafty.e('Delay').delay(function () {
                Crafty.e('2D, DOM, Text, SpaceFont')
                .attr({x: 115, y: 150, w: Crafty.viewport.width })
                .textFont({size: '20px'})
                .textColor('white')
                .text('Good job agent Strider!')
                .bind('EnterFrame', function() {
                    this.y = ship.y + 150;
                });
            }, 8000, 0);
            // keyboard
            Crafty.e('Keyboard').bind('KeyDown', function (e) {
                if(e.keyCode !== Crafty.keys.ESC && e.keyCode !== Crafty.keys.ENTER && e.keyCode !== Crafty.keys.SPACE) {
                    return;
                }
                this.destroy();
                // score screen
                Crafty.scene('dead', {'success': true, 'meters': meters, 'kills': playerKills});
            });
        });
        Crafty.uniqueBind("playerupdatehealth", function () {
            if (!HUDHealth)
                return;

            playerHealth = playerHealth > MAX_HEALTH ? MAX_HEALTH : playerHealth;
            playerHealth = playerHealth < 0 ? 0 : playerHealth;

            HUDHealth.removeComponent('HUDHealth4')
                .removeComponent('HUDHealth3')
                .removeComponent('HUDHealth2')
                .removeComponent('HUDHealth1')
                .removeComponent('HUDHealth0');
            switch(playerHealth) {
                case 4: HUDHealth.addComponent('HUDHealth4'); break;
                case 3: HUDHealth.addComponent('HUDHealth3'); break;
                case 2: HUDHealth.addComponent('HUDHealth2'); break;
                case 1: HUDHealth.addComponent('HUDHealth1'); break;
                default: HUDHealth.addComponent('HUDHealth0'); break;
            }
            HUDHealth.trigger('NewComponent');
        });
        Crafty.uniqueBind("playerupdatejuice", function () {
            if (!HUDEnergy)
                return;

            playerEnergy = playerEnergy < 0 ? 0 : playerEnergy;
            playerEnergy = playerEnergy > MAX_ENERGY ? MAX_ENERGY : playerEnergy;
            HUDEnergy.trigger('Invalidate');
        });
        // Crafty.bind("playershoot", function() {
        //     playerEnergy -= 1;
        //     addAnimation(ANIM_PLAYER_GUNFLARE);
        // });
        Crafty.uniqueBind('playsmokeanim', function(data) {
            SmokeAnim.x = octocat.x;
            SmokeAnim.y = octocat.y;
            SmokeAnim.visible = true;
            SmokeAnim.animate('smoke');
        });
 
        /************************************************************************
         * Behaviors and Monitoring
         */

        // Create entities pools
        (function initEntitiesPool() {
            var i, entity;
            for (i = 0; i < MAX_POWERUPS; i++) {
                entity = Crafty.e('2D, Canvas, Powerup, Collision')
                .attr({
                    x: 0, y: 0,
                    z: 889,
                    visible: false,
                    type: ''
                })
                .collision();
                powerups_data.push(entity);
            }
            for (i = 0; i < MAX_ENEMIES; i++) {
                entity = Crafty.e('2D, Canvas, Enemy, SpriteAnimation, Delay')
                .attr({
                    x: 0, y: 0,
                    z: 890,
                    visible: false
                })
                .origin('center')
                .reel('EnemyTurretGreen', generalAnimSpeed, 0, 0, 2)
                .reel('EnemyTurretRed', generalAnimSpeed, 0, 1, 2)
                .reel('EnemyTurretPurple', generalAnimSpeed, 0, 2, 2)
                .reel('EnemyDrone', generalAnimSpeed, 2, 1, 2)
                .reel('EnemyDroneAdvanced', generalAnimSpeed, 0, 0, 2)
                .reel('EnemyDroneDestroyer', generalAnimSpeed, 0, 1, 2);
                enemies_data.push(entity);
            }
            for (i = 0; i < MAX_BULLETS; i++) {
                entity = Crafty.e('2D, Canvas, EnemyBullet, Collision, SpriteAnimation, Delay')
                .attr({
                    x: 0, y: 0,
                    z: 892,
                    visible: false,
                    direction: 0,
                    speed: BULLET_SPEED,
                    hp: 0
                })
                .reel('shoot', generalAnimSpeed, 0, 0, 2)
                .reel('shootBlue', generalAnimSpeed, 0, 1, 2)
                .reel('shootGlow', generalAnimSpeed, 0, 2, 2);
                // .collision();
                bullets_data.push(entity);
            }
            for (i = 0; i < MAX_ANIMATIONS / 3; i++) {
                entity = Crafty.e("2D, Canvas, SpriteAnimation, Flares")
                .attr({
                    x: 0, y: 0,
                    z: 991,
                    visible: false,
                    alpha: 0.90
                })
                .reel('player_gunflare', generalAnimSpeed / 2, [ [2, 0], [1, 0], [0, 0], [3, 1], [1, 0], [0, 0]])
                .reel('gunflare', generalAnimSpeed / 2, [ [2, 0], [1, 0], [0, 0], [3, 1], [1, 0], [0, 0]])
                .origin('center');
                anims_data.push(entity);
                //
                entity = Crafty.e("2D, Canvas, SpriteAnimation, ExplosionsYB")
                .attr({
                    x: 0, y: 0,
                    z: 991,
                    visible: false,
                    alpha: 0.90
                })
                .reel('explo01', generalAnimSpeed, 0, 0, 6)
                .reel('exploBlue', generalAnimSpeed, 0, 1, 6)
                .origin('center')
                .animate('explo01');
                anims_data.push(entity);
                //
                entity = Crafty.e("2D, Canvas, SpriteAnimation, ExplosionHit")
                .attr({
                    x: 0, y: 0,
                    z: 991,
                    visible: false,
                    alpha: 0.90
                })
                .reel('explo02', generalAnimSpeed, 0, 0, 6)
                .reel('exploHitEnemy', generalAnimSpeed / 2, 0, 0, 6)
                .origin('center');
                anims_data.push(entity);
            }
        })();

        // Create the Platform pool, these entities will be recycled throughout the level
        (function initPlatformPool() {
            for (var i = 0; i < level_data.length; i++) {
                var d = level_data[i];
                var entity = Crafty.e('2D, Canvas, Color, Platform, Collision, Tween, Delay, ' + d.clr)
                .attr(d)
                .collision();

                // var d = level_data[cur++];
                // this.unbind('TweenEnd');

                entity.alpha = 1;
                // entity.attr(d);
                // entity.addComponent(d.clr);
                entity.collision();

                var r = ~~ (10 * (1 + Math.random()));
                if (d.goal && !ship) {
                    ship = Crafty.e('2D, Canvas, Spaceship, Collision, SpriteAnimation').attr({
                        x: d.x + 50,
                        y: d.y - 86,
                        z: -3,
                        _acc: 0.125
                    }).collision();
                }

                var meters = getMeters(entity.y);

                if (d.powerup && !d.powerupAdded) {
                    addPowerup(d.powerup, entity.x + (Math.random() * (entity.w - 20)), entity.y);
                    d.powerupAdded = true;
                }
                if (d.hasTurret && !d.turretAdded) {
                    spawnX = entity.x + (Math.random() * (entity.w - 50));
                    if (meters < METERS_DEPTH_3) {
                        addEnemy(ENEMY_TURRET_DESTROYER, spawnX, entity.y - 26);
                        addPowerup(POWERUP_ENERGY_BLUE, spawnX + 12, entity.y);
                    } else if (meters < METERS_DEPTH_2) {
                        addEnemy(ENEMY_TURRET_ADVANCED, spawnX, entity.y - 26);
                        addPowerup(POWERUP_ENERGY_BLUE, spawnX + 12, entity.y);
                    } else  {
                        addEnemy(ENEMY_TURRET, spawnX, entity.y - 26);
                        // 25% to 50% chance to spawn bouns behind turret
                        var chance = Math.random();
                        if (chance < 0.25) {
                            addPowerup(d.powerup, spawnX + 12, entity.y);
                        } else if (chance < 0.5) {
                            addPowerup(POWERUP_ENERGY_BLUE, spawnX + 12, entity.y);
                        }
                    }
                    d.turretAdded = true;
                }
                if (d.hasDrone && !d.droneAdded) {
                    spawnX = entity.x + (Math.random() * (entity.w - 50));
                    if (meters < METERS_DEPTH_3) {
                        addEnemy(ENEMY_DRONE_DESTROYER, spawnX, entity.y - 50);
                    } else if (meters < METERS_DEPTH_2) {
                        addEnemy(ENEMY_DRONE_ADVANCED, spawnX, entity.y - 50);
                    } else if (meters < METERS_DEPTH_2 + 100) {
                        addEnemy(ENEMY_DRONE_DESTROYER, spawnX, entity.y - 50);
                    } else {
                        if (meters < 2000) {
                            // getting scary
                            addEnemy(ENEMY_DRONE_ADVANCED, spawnX, entity.y - 50);
                        } else {
                            addEnemy(ENEMY_DRONE, spawnX, entity.y - 50);
                        }
                    }
                    d.droneAdded = true;
                }
            }
        })();

        function addPowerup(type, x, y) {
            for (var i = 0; i < powerups_data.length; i++) {
                if (!powerups_data[i].visible) {
                    powerups_data[i].x = x;
                    powerups_data[i].y = y - 19;
                    powerups_data[i].energyType = type;
                    powerups_data[i].removeComponent('EnergyOrange');
                    powerups_data[i].removeComponent('EnergyBlue');
                    powerups_data[i].removeComponent('HealthRed');
                    var comp;
                    switch(type) {
                        case POWERUP_HEALTH: comp = 'HealthRed'; break;
                        case POWERUP_ENERGY: comp = 'EnergyOrange'; break;
                        case POWERUP_ENERGY_BLUE: comp = 'EnergyBlue'; break;
                        default: throw 'Invalid powerup type ' + type;
                    }
                    powerups_data[i].addComponent(comp)
                    powerups_data[i].visible = true;
                    powerups_data[i].bind('Kill', function() {
                        this.x = -500; // prevent collisions
                        this.visible = false;
                    });
                    return powerups_data[i];
                }
            }              
        }
        function addEnemy(type, x, y) {
            var component, accel
              , spreadBullet = false
              , hp = ENEMY_HP
              , shootDelay = ENEMY_SHOOTDELAY
              , shootRange = ENEMY_SHOOTRANGE
              , reel = null;

            switch(type) {
                case ENEMY_TURRET:
                    component = 'EnemyTurretGreen';
                    reel = component;
                break;
                case ENEMY_TURRET_ADVANCED:
                    type = ENEMY_TURRET;
                    component = 'EnemyTurretRed';
                    reel = component;
                    hp = ~~(hp * 1.35);
                    shootDelay = ~~(shootDelay * 0.9);
                break;
                case ENEMY_TURRET_DESTROYER:
                    type = ENEMY_TURRET;
                    component = 'EnemyTurretPurple';
                    reel = component;
                    hp = ~~(hp * 1.5);
                    shootDelay = ~~(shootDelay * 0.8);
                    shootRange += ~~(shootRange * 0.10);
                break;
                case ENEMY_DRONE:
                    component = 'EnemyDrone';
                    accel = 0.025;
                    reel = component;
                break;
                case ENEMY_DRONE_ADVANCED:
                    type = ENEMY_DRONE;
                    component = 'EnemyDroneAdvanced';
                    accel = 0.05;
                    hp *= 1.75;
                    shootDelay = ~~(shootDelay * 0.8);
                    shootRange += ~~(shootRange * 0.15);
                    reel = component;
                break;
                case ENEMY_DRONE_DESTROYER:
                    type = ENEMY_DRONE;
                    component = 'EnemyDroneDestroyer';
                    accel = 0.05;
                    hp *= 2;
                    shootDelay = ~~(shootDelay * 0.9);
                    shootRange += ~~(shootRange * 0.1);
                    spreadBullet = true;
                    reel = component;
                break;
                default:
                    throw 'Unknown enemy type ' + type;
            }

            for (var i = 0; i < enemies_data.length; i++) {
                var entity = enemies_data[i];
                if (!entity.visible) {
                    // setup
                    entity.x = x;
                    entity.y = y;
                    entity.hp = hp;
                    entity.EnemyType = type;
                    entity.EnemyReel = reel;
                    entity.sfxExplode = (Math.random() > 0.5) ? 'explode2' : 'explode1';
                    entity.removeComponent('EnemyTurretGreen');
                    entity.removeComponent('EnemyTurretRed');
                    entity.removeComponent('EnemyTurretPurple');
                    entity.removeComponent('EnemyDrone');
                    entity.removeComponent('EnemyDroneAdvanced');
                    entity.removeComponent('EnemyDroneDestroyer');
                    entity.addComponent(component);
                    entity.unbind('Kill');
                    entity.unbind('AnimationEnd');
                    entity.unbind('EnterFrame')
                    if (entity.shootFn) {
                        // entity.cancelDelay(entity.shootFn);
                    }
                    // events
                    if (type === ENEMY_TURRET) {
                        /*
                         *  TURRET
                         */
                        entity.w = 50; entity.h = 26;
                        entity.sfxFire = (Math.random() > 0.5) ? 'turretshot2' : 'turretshot1';
                        // facing
                        entity.bind('EnterFrame', function() {
                            var ecx = this.x + this.w / 2
                              , ecy = this.y + this.h / 2;
                            if (ecx < octocat.cx) {
                                this.flip('X');
                                this.direction = 'left';
                            } else if (ecx > octocat.cx) {
                                this.unflip();
                                this.direction = 'right';
                            }
                        });
                        // shoot
                        entity.bind('AnimationEnd', function (reel) {
                            // console.log('new bullet');
                            var ecx = entity.x + entity.w / 2
                              , ecy = entity.y + entity.h / 2;
                            if (this.direction === 'left') {
                                ecx += 24;
                            } else {
                                ecx -= 24;
                            }
                            addBullet(BULLET_NORMAL, ecx, ecy, octocat.cx, octocat.cy);
                            addAnimation(ANIM_GUNFLARE, ecx, ecy + 8);
                            sfx(entity.sfxFire);
                        });
                        entity.shootFn = function() {
                            var ecx = this.x + this.w / 2
                              , ecy = this.y + this.h / 2;
                              // console.log(Crafty.math.squaredDistance(ecx, ecy, octocat.cx, octocat.cy));
                            if (Crafty.math.squaredDistance(ecx, ecy, octocat.cx, octocat.cy) < shootRange) {
                                this.animate(this.EnemyReel);
                            }
                        }.bind(entity);
                    } else if (type === ENEMY_DRONE) {
                        /*
                         *  DRONE
                         */
                        entity.w = 50; entity.h = 50;
                        entity.accel = 0;
                        entity.z = octocat.z + 1; // in front of gunner
                        entity.sfxFire = (Math.random() > 0.5) ? 'droneshot2' : 'droneshot1';
                        entity.bind('EnterFrame', function() {
                            var ecx = this.x + this.w / 2
                              , ecy = this.y + this.h / 2;
                            if (!Crafty.math.withinRange(ecx, octocat.cx - 2, octocat.cx + 2)) {
                                if (ecx < octocat.x) {
                                    this.accel += accel;
                                    this.accel = Math.min(this.accel, 6);
                                } else {
                                    this.accel -= accel;
                                    this.accel = Math.max(this.accel, -6);
                                }
                                this.x += this.accel;
                            } else {
                                this.accel = 0;
                            }
                        });
                        entity.animate(reel, -1);
                        // shoot
                        entity.shootFn = function() {
                            if (octocat.visible) {
                                var ecx = this.x + this.w / 2
                                  , ecy = this.y + this.h / 2
                                  , dist = Crafty.math.squaredDistance(ecx, ecy, octocat.cx, octocat.cy);
                                
                                if (dist < shootRange) {
                                    if (spreadBullet) {
                                        var spread = getSpread(ecx, ecy, SPREAD8);
                                        var spread_r = getSpread(ecx, ecy, SPREAD8_R);
                                        for (var i = 0; i < spread.length; i++) {
                                            addBullet(BULLET_BLUE, spread[i][0], spread[i][1], spread_r[i][0], spread_r[i][1]);
                                        }
                                    } else {
                                        addBullet(BULLET_BLUE, ecx, ecy, octocat.cx, octocat.cy);
                                    }
                                    addAnimation(ANIM_GUNFLARE, ecx, ecy + 7);
                                    sfx(entity.sfxFire);
                                }
                            }
                        }.bind(entity);
                    }
                    // adjust shoot frequency & die behavior
                    // entity.delay(entity.shootFn, shootDelay, -1); // wtf does this not work?
                    entity.shootDleay = Crafty.e('Delay').delay(entity.shootFn, shootDelay, -1);
                    entity.bind('Kill', function () {
                        switch(this.EnemyType) {
                            case ENEMY_TURRET: 
                                playerKills.turrets += 1;
                                updateAchievements(playerKills);
                                break;
                            case ENEMY_DRONE: 
                                playerKills.drones += 1;
                                updateAchievements(playerKills);
                                break;
                            default: throw 'Unknown enemy type ' + type; break;
                        }
                        addAnimation(this.EnemyType === ENEMY_DRONE ? ANIM_EXPLOSION_BLUE : ANIM_EXPLOSION_01, 
                            this.x + this.w / 2, this.y + this.h / 2);
                        entity.shootDleay.cancelDelay(entity.shootFn);
                        this.visible = false;
                        entity.unbind('EnterFrame');
                        sfx(entity.sfxExplode);
                    });
                    // go, go, go ....
                    entity.visible = true;
                    return entity;
                }
            }
            debug('*** No free enemy slots found!');
        }
        function addBullet(type, x, y, dx, dy, speed) {
            for (var i = 0; i < bullets_data.length; i++) {
                var entity = bullets_data[i];
                if (!entity.visible) {
                    // setup
                    entity.ox = x;
                    entity.oy = y;
                    entity.x = x;
                    entity.y = y;
                    // entity.i = i;
                    if (speed) {
                        entity.speed = speed;
                    }
                    entity.direction = Math.atan2(dy - y, dx - x);
                    entity.unbind('Kill');
                    entity.unbind('HitOn');
                    if (entity.fn) {
                        entity.cancelDelay(entity.fn);
                    }
                    // events
                    entity.bind('EnterFrame', function() {
                        this.x += Math.cos(this.direction) * this.speed;
                        this.y += Math.sin(this.direction) * this.speed;
                        if (Crafty.math.squaredDistance(this.x, this.y, this.ox, this.oy) > BULLET_MAX_DIST) {
                            this.trigger('Kill');
                        }
                    });
                    entity.bind('Kill', function () {
                        // debug('--- bullet die ---', this.i);
                        entity.unbind('EnterFrame');
                        entity.ignoreHits();
                        entity.visible = false;
                    });
                    entity.checkHits('Gunner');
                    entity.uniqueBind('HitOn', function () {
                        this.trigger('Kill');
                        onHitBullet();
                    });
                    // go, go, go ....
                    entity.visible = true;
                    if (meters < METERS_DEPTH_3) {
                        entity.animate('shootGlow', -1);
                    } else {
                        entity.animate(type === BULLET_BLUE ? 'shootBlue' : 'shoot', -1);    
                    }
                    return entity;
                }
            }
            debug('*** No free bullet slots found!');
        }
        function addAnimation(type, x, y) {
            var animSpeed = ~~(generalAnimSpeed / 2);
            var component;
            switch(type) {
                case ANIM_PLAYER_GUNFLARE: component = 'Flares'; break;
                case ANIM_GUNFLARE: component = 'Flares'; break;
                case ANIM_EXPLOSION_01: component = 'ExplosionsYB'; break;
                case ANIM_EXPLOSION_BLUE: component = 'ExplosionsYB'; break;
                case ANIM_EXPLOSION_02: component = 'ExplosionHit'; break;
                case ANIM_HITENEMY: component = 'ExplosionHit'; break;
            }
            for (var i = 0; i < anims_data.length; i++) {
                var entity = anims_data[i];
                if (!entity.visible && entity.has(component)) {
                    // console.log('Play ' + type + ' at slot ' + i);
                    // reset
                    entity.unbind('EnterFrame');
                    entity.unbind('AnimationEnd');
                    // setup
                    entity.alpha = 0.9;
                    if (typeof x !== 'undefined') {
                        entity.x = x - entity.w / 2;
                        entity.y = y - entity.h / 2;
                    }
                    if (type === ANIM_PLAYER_GUNFLARE) {
                        x = x || 0;
                        y = y || 0;
                        entity.x = octocat.cx - 9 + x;
                        entity.y = octocat.cy - 9 + y;
                        entity.bind('EnterFrame', function() {
                            this.x = octocat.cx - 9 + x;
                            this.y = octocat.cy - 9 + y;
                        });
                        entity.animate('player_gunflare');
                    } else if (type === ANIM_GUNFLARE) {
                        entity.animate('gunflare');
                    } else if (type === ANIM_EXPLOSION_01) {
                        entity.animate('explo01');
                    } else if (type === ANIM_EXPLOSION_BLUE) {
                        entity.animate('exploBlue');
                    } else if (type === ANIM_EXPLOSION_02) {
                        entity.animate('explo02');
                    } else if (type === ANIM_HITENEMY) {
                        entity.alpha = 0.75;
                        entity.animate('exploHitEnemy');
                    } else {
                        throw "wrong anim type - " + type;
                    }
                    entity.bind('AnimationEnd', function() {
                        this.visible = false;
                        this.unbind('EnterFrame');
                    });
                    // go, go, go ....
                    entity.visible = true;
                    return;
                }
            }
        }

        // all purpose smoke animation
        SmokeAnim = Crafty.e("2D, Canvas, SmokeJump, SpriteAnimation")
        .origin('center').attr({
            x: this.x + 16,
            y: this.y - 8,
            w: 64,
            h: 64,
            visible: false
        }).reel('smoke', generalAnimSpeed, 0, 0, 10)
        .bind('AnimationEnd', function() {
            this.visible = false;
        });

        /************************************************************************
         * HUD & UI Stuff
         */

        function updateHUD() {
            this.x = Crafty.viewport.width - Crafty.viewport.x - 48;
            this.y = 5 - Crafty.viewport.y;
            meters = METERS_DEPTH - ~~((Crafty.viewport.height - octocat.y) * 0.1 - 1);
            this.text(meters + ' m.');
        }
        Crafty.e("2D, DOM, Text").attr({
            x: 5,
            w: 50,
            z: 9999
        }).css({
            //"font": "48px Chewy, Impact",
            'color': '#fff',
            // 'text-align': 'left',
            'textShadow': '0px 2px 4px rgba(0,0,0,.5)'
        }).bind("EnterFrame", updateHUD);

        HUDHealth = Crafty.e("2D, Canvas, HUDHealth4").attr({
            x: 5,
            z: 9999
        }).bind('InvalidateViewport', function() {
            this.x = 5 - Crafty.viewport.x;
            this.y = ~~(2 - Crafty.viewport.y);
        });

        HUDEnergy = Crafty.e("2D, Canvas, HUDEnergy").attr({
            x: 75,
            z: 9999
        }).bind('InvalidateViewport', function() {
            this.x = 75 - Crafty.viewport.x;
            this.y = ~~(2 - Crafty.viewport.y);
        }).bind('Draw', function(e) {
            var ctx = e.ctx;
            var xpos = 19 + MAX_ENERGY - (MAX_ENERGY - playerEnergy);
            ctx.beginPath();
            ctx.rect(e.pos._x + xpos, e.pos._y + 4, (MAX_ENERGY - playerEnergy), 11);
            ctx.fillStyle = 'black';
            ctx.fill();
            // ctx.lineWidth = 1;
            // ctx.strokeStyle = 'none';      
            // ctx.stroke(); 
        });

        function toggleSFX(e) {
            if(e.mouseButton !== Crafty.mouseButtons.LEFT) 
                return;
            SFX = !SFX;
            Crafty("SFX").image('assets/images/' + (SFX ? 'audioOn.png' : 'audioOff.png'));
        }
        Crafty.e("2D, DOM, SFX, Image, Mouse").attr({
            x: Crafty.viewport.width - 52,
            y: -Crafty.viewport.y + 10,
            w: 48,
            h: 48,
            z: 9999
        }).css('cursor', 'pointer')
        .image("assets/images/audioOn.png")
        .bind('InvalidateViewport', function() {
            this.x = Crafty.viewport.width - Crafty.viewport.x - 52;
            this.y = Crafty.viewport.height - 50 - Crafty.viewport.y;            
        })
        .bind('MouseOver', function () {
            this.alpha = 0.8;
            this.bind('MouseDown', toggleSFX);
        }).bind('MouseOut', function () {
            this.alpha = 1;
            this.unbind('MouseDown', toggleSFX);
        });

        function toggleMUSIC(e) {
            if(e.mouseButton !== Crafty.mouseButtons.LEFT) 
                return;
            MUSIC = !MUSIC;
            Crafty("MUSIC").image('assets/images/' + (MUSIC ? 'musicOn.png' : 'musicOff.png'));
            if (MUSIC) {
                if (!Crafty.audio.isPlaying('music1')) {
                    music('music1', true, MUSIC_VOL);
                }
            } else {
                if (Crafty.audio.isPlaying('music1')) {
                    Crafty.audio.stop('music1');
                }
            }
        }
        Crafty.e("2D, DOM, MUSIC, Image, Mouse").attr({
            x: Crafty.viewport.width - 94,
            y: -Crafty.viewport.y + 10,
            w: 48,
            h: 48,
            z: 9999
        }).css('cursor', 'pointer')
        .image("assets/images/musicOn.png")
        .bind('InvalidateViewport', function() {
            this.x = Crafty.viewport.width - Crafty.viewport.x - 96;
            this.y = Crafty.viewport.height - 50 - Crafty.viewport.y;            
        })
        .bind('MouseOver', function () {
            this.alpha = 0.8;
            this.bind('MouseDown', toggleMUSIC);
        }).bind('MouseOut', function () {
            this.alpha = 1;
            this.unbind('MouseDown', toggleMUSIC);
        });

        // camera follow
        Crafty.viewport.follow(octocat, 0, 0);

        /// ----- TEST -----
        // ship = Crafty.e("2D, Canvas, Spaceship, Collision, SpriteAnimation").attr({
        //     x: 50,
        //     y: -86,
        //     z: -3,
        //     _acc: 0.125
        // })
        // .collision();
        // Crafty.trigger('playerwin');
        /// ---------------

        if (enableIntroSfx) {
            sfx('warning');
            sfx('doorshut');
        }
        music('music1', true, MUSIC_VOL);
    });

    Crafty.scene("loading");

    var trophies = {
        'bronze01': {id: 30758, achieved: false},
        'bronze02': {id: 30759, achieved: false},
        'bronze03': {id: 30765, achieved: false},
        'bronze04': {id: 30767, achieved: false},
        'bronze05': {id: 30769, achieved: false},
        'silver01': {id: 30761, achieved: false},
        'silver02': {id: 30766, achieved: false},
        'silver03': {id: 30770, achieved: false},
        'gold01': {id: 30763, achieved: false},
        'gold02': {id: 30768, achieved: false},
        'platinum01': {id: 30764, achieved: false},
        'platinum02': {id: 30782, achieved: false}
    };
    }); //eof-ready
}(Crafty));