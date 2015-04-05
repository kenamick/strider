/**
 * Strider
 * Github Game-Off 2015 Entry
 * by Petar Petrov / github.com/petarov
 *
 * (A fork of) Octocat Jump
 * A Github Game Off 2012 Entry
 * @copyright Omer Goshen <gershon@goosemoose.com>
 */
(function octocatJump($, Crafty) {
    $(document).ready(function () {

    var GRAVITY = 1,
        SFX = true,
        MUSIC = true,
        enableFPS = true,
        isDebug = true,
        
        METERS_DEPTH = 300,
        METERS_DEPTH_2 = METERS_DEPTH * 0.5,
        METERS_DEPTH_3 = METERS_DEPTH * 0.25,
        meters = METERS_DEPTH,
        total_platforms = METERS_DEPTH / 10 - 1,
        
        MAX_POWERUPS = total_platforms / 2,
        MAX_ENEMIES = total_platforms / 2,
        MAX_BULLETS = MAX_ENEMIES / 4,
        POWERUP_ENERGY = 1,
        POWERUP_HEALTH = 2,
        MAX_ENERGY = 49,
        MAX_HEALTH = 4,
        // animations        
        MAX_ANIMATIONS = 10,
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
        // level vars
        level_data = [],
        powerups_data = [],
        cur_platforms = 0,
        max_platforms = 10,
        step_platforms = 1,
        // player vars
        playerSpeed = 4,
        playerJump = 17,
        playerHealth = 4,
        playerEnergy = 49,
        playerDamage = 1;
        isDead = false,
        playerTargetDist = 150000, // 40000, //TODO
        // enemy vars
        ENEMY_TURRET = 1,
        ENEMY_DRONE = 2,
        ENEMY_DRONE_ADVANCED = 3,
        ENEMY_DRONE_DESTROYER = 4,
        ENEMY_SHOOTDELAY = 3000,
        ENEMY_SHOOTRANGE = 176400, // 420px
        ENEMY_HP = 10, //TODO
        BULLET_NORMAL = 1,
        BULLET_BLUE = 2,
        BULLET_LIVE = 5000,
        BULLET_SPEED = 3,
        enemies_data = [],
        bullets_data = []
        // 
        ;

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

    function initLevel() {
        var luck, platform2add;

        level_data = [{
            x: Crafty.viewport.width / 2 - 50,
            y: Crafty.viewport.height - 60,
            w: 50,
            h: 26,
            num: 0,
            clr: Math.random() > 0.5 ? 'PlatformBlue' : 'PlatformGreen'
        }];

        var vw = (Crafty.viewport.width + 50)
          , vh = -Crafty.viewport.y + Crafty.viewport.height - 150;

        var i = 1, j = 0;
        while (i < total_platforms) {
            if (i % 5 === 0) {
                platform2add = {
                    x: -100 + ~~ (Math.random() * vw),
                    y: vh - i * 100 + (50 * Math.random()),
                    w: 150,
                    h: 26,
                    num: i,
                    clr: Math.random() > 0.5 ? 'PlatformBlueBig' : 'PlatformGreenBig',
                    powerup: Math.random() > 0.5 ? POWERUP_ENERGY : POWERUP_HEALTH
                };
            } else {
                platform2add = {
                    x: -100 + ~~ (Math.random() * vw),
                    y: vh - i * 100 + (50 * Math.random()),
                    w: 50,
                    h: 26,
                    num: i,
                    clr: Math.random() > 0.5 ? 'PlatformBlue' : 'PlatformGreen',
                    powerup: false
                };
            }
            level_data.push(platform2add);
            // j = 0;
            // while(j < 2) {
            //     luck = Math.random();
            //     if (luck > 0.75) {
            //         platform2add = clone(platform2add);
            //         platform2add.x -= 50;
            //         i += 1;
            //         platform2add.i = i;
            //         level_data.push(platform2add);
            //     } else if (luck < 0.25) {
            //         platform2add = clone(platform2add);
            //         platform2add.x += 50;
            //         i += 1;
            //         platform2add.i = i;
            //         level_data.push(platform2add);
            //     } else if (luck > 0.25) {
            //         platform2add = clone(platform2add);
            //         platform2add.x = Crafty.viewport.width - platform2add.x;
            //         i += 1;
            //         platform2add.i = i;
            //         level_data.push(platform2add);
            //     }
            //     j += 1;
            // }
            i += 1;
        }
        // last top platform
        level_data.push({
            x: Crafty.viewport.width / 2 - 150 / 2,
            y: vh - i * 100 + (50 * Math.random()),
            w: 150,
            h: 26,
            num: i,
            clr: 'PlatformBlueBig',
            goal: true
        }); 
    }    
    initLevel();

    function initState() {
        Crafty.background("none");
        Crafty.viewport.y = 0;
        score = 0;
        stars = 0;
        isDead = false;
    }    

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

    function onHitPlatform(e) {
            // Crafty.e("2D, Canvas, SmokeJump, SpriteAnimation, Delay").origin('center').attr({
            //     x: this.x + 16,
            //     y: this.y - 8,
            //     w: 64,
            //     h: 64
            // }).reel("Smoke", 450, 0, 0, 10).animate('Smoke', 0).bind("AnimationEnd", this.destroy);
        return;

        var c = e[0],
            obj = c.obj,
            octocat = Crafty("Player"),
            bgovr = Crafty("BackgroundOverlay"),
            dy = this.y - this._oldpos.y;

        if(dy <= 0 || obj.alpha !== 1) return;

        // if (-1 === c.normal.y) {
        if(-1 === c.normal.y) {

            Crafty.e("2D, DOM, SmokeJump, SpriteAnimation, Delay").origin('center').attr({
                x: this.x + 16,
                y: this.y - 8,
                w: 64,
                h: 64
            }).reel("Smoke", 25, 0, 0, 10).animate('Smoke', 0).bind("AnimationEnd", this.destroy);

            var _y = obj.y;
            obj.tween({
                y: _y + 20
            }, 5).bind("TweenEnd", function (k) {
                if(k === 'y') obj.tween({
                    y: _y
                }, 4);
            });

            if(dy > 0) {

                // this.stopFalling();
                this.y += c.overlap * -c.normal.y;

                this._speed.y = obj.has("Push") ? -this.PUSH_HEIGHT : -this.JUMP_HEIGHT;

                if(c.obj.has("Pull")) {
                    if(obj.use) obj.use();
                    // c.obj.bind("TweenEnd", function(){
                    //     c.obj.use();
                    // });
                    if(SFX) Crafty.audio.play("pull", 1, 0.2);

                    bgovr.color("#ff0000").delay(function () {
                        this.color("#006064");
                    }, 250);
                } else if(c.obj.has("Push")) {
                    if(obj.use) obj.use();

                    if(SFX) Crafty.audio.play("push", 1, 0.2);

                    bgovr.color("#00ff00").delay(function () {
                        this.color("#006064");
                    }, 250);
                } else if(SFX) Crafty.audio.play("jump", 1, 0.1);

            }
        }
    }
    function onHitSpikes(e) {
        Crafty.trigger('playerdead');
    }
    function onHitSpaceship(e) {
        Crafty.trigger('playerwin');
    }
    function onHitHealth(e) {
        if (e[0] && e[0].obj && e[0].obj.visible) {
            var obj = e[0].obj;
            obj.visible = false;
            playerHealth += 1;
            Crafty.trigger('playerupdatehealth');
            Crafty.trigger('playsmokeanim');
        }
    }
    function onHitEnergy(e) {
        if (e[0] && e[0].obj && e[0].obj.visible) {
            var obj = e[0].obj;
            obj.visible = false;
            playerEnergy += ~~(MAX_ENERGY * 0.25);
            Crafty.trigger('playerupdatejuice');
            Crafty.trigger('playsmokeanim');
        }
    }
    function onHitBullet(bullet) {
        var bgovr = Crafty("BackgroundOverlay");
        // var bullet;
        // if (typeof e === 'object') {
        //     bullet = e;
        // } else if (e[0] && e[0].obj) {
        //     bullet = e[0].obj;
        // }
        // if (bullet) {
            // bullet.trigger('Kill');
            playerHealth -= 1;
            Crafty.trigger('playerupdatehealth');
            if (playerHealth < 0) {
                bgovr.color("#ff0000");
                Crafty.trigger('playerdead');
            } else {
                bgovr.color("#ff0000").delay(function () {
                    this.color("#006064");
                }, 500);                
            }
        // }
    }

    /************************************************************************
     * Main scene
     */       

    Crafty.scene('main', function () {
        initState();

        var pi = Math.PI
          , pi_6 = Math.PI / 6
          , pi_4 = Math.PI / 4
          , pi_3 = Math.PI / 3
          , pi_2 = Math.PI / 2
          , pi_23 = 2 * Math.PI / 3
          , pi_34 = 3 * Math.PI / 4
          , pi_56 = 5 * Math.PI / 6;

        /************************************************************************
         * Create entities
         */
        if (enableFPS) {
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
        }

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

        var octocat = Crafty.e('2D, Canvas, Gunner, SpriteAnimation, Physics, Gravity, Collision, Tween, Delay, Twoway')
        .setName('octocat')
        .attr({
            x: Crafty.viewport.width / 2 - 50,
            y: Crafty.viewport.height / 2,
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
        .collision([12, 18], [12, 47], [25, 57], [38, 47], [38, 18], [25, 10])
        .onHit('Spikes', onHitSpikes)
        .onHit('Spaceship', onHitSpaceship)
        .onHit('HealthRed', onHitHealth)
        .onHit('EnergyOrange', onHitEnergy);

        if (isDebug) octocat.addComponent('WiredHitBox');

        octocat.bind('KeyDown', function (e) {
            if (!this._falling && (e.key === Crafty.keys.UP_ARROW || e.key === Crafty.keys.W)) {
                this._canJumpAgain = true;
            } else if (this._canJumpAgain && (e.key === Crafty.keys.UP_ARROW || e.key === Crafty.keys.W)) {
                this._up = true;
                this._gy = 0;
                this._canJumpAgain = false;
            } else if (e.key === Crafty.keys.RIGHT_ARROW || e.key === Crafty.keys.D) {
                this.direction = 'right';
            } else if (e.key === Crafty.keys.LEFT_ARROW || e.key === Crafty.keys.A) {
                this.direction = 'left';
            }
        });
        octocat.bind('KeyUp', function (e) {
            // TEST ////////
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
                addAnimation(ANIM_EXPLOSION_01, 150, 250);
            }
            if (e.key === Crafty.keys.L) {
                addAnimation(ANIM_EXPLOSION_BLUE, 150, 350);                
            }
            ///////// 
        });
        octocat.bind('EnterFrame', function() {
            this.cx = octocat._x + octocat.w / 2;
            this.cy = octocat._y + octocat.h / 2;

            if (this.isDown(Crafty.keys.W) || this.isDown(Crafty.keys.UP_ARROW)) { // && !this.isDown(Crafty.keys.LEFT_ARROW)) {
                this.pauseAnimation();
            } 
            if (this.isDown(Crafty.keys.LEFT_ARROW)) {
                if (!this.isPlaying('walk_left')) {
                    this.animate('walk_left', 10);
                }
            } else if (this.isDown(Crafty.keys.RIGHT_ARROW)) {
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
                if (!reel.id.startsWith('shoot')) { // what a hack ladies & gentleme
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
            if (lastEnemy) {
                xhair.x = lastEnemyX - xhair.w / 2;
                xhair.y = lastEnemyY - xhair.h / 2;
                xhair.visible = true;                
            }
            this.targetEnemy = lastEnemy;
        });
        octocat.bind('Shoot', function() {
            playerEnergy -= 1;
            if (playerEnergy <= 0) {
                // no ammo
                return;
            }
            if (octocat.targetEnemy) {
                var target = octocat.targetEnemy
                  , ecx = target.x + target.w / 2
                  , ecy = target.y + target.h / 2
                  , anim = null
                  // , phi = Math.atan2(ecy - this.cy, ecx - this.cx);
                  , phi = Math.atan2(this.cy - ecy, this.cx - ecx)
                  , px = 0, py = 0;

                target.hp -= playerDamage;
                if (target.hp < 0) {
                    target.trigger('Kill');
                    octocat.trigger('Moved'); // update target
                } else {
                    addAnimation(ANIM_HITENEMY, target.x + target.w * Math.random(), target.y + target.h * Math.random());
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
                    addAnimation(ANIM_PLAYER_GUNFLARE, px, py);
                }
                debug('animation: ', anim);
            } else {
                if (this.direction === 'left') {
                    anim = 'shoot_left';
                    px = -this.w / 2;
                } else {
                    anim = 'shoot_right';
                    px = this.w / 2;
                }
                py = -2;
                addAnimation(ANIM_PLAYER_GUNFLARE, px, py);
                this.animate(anim);
            }
        });

        Crafty.viewport.follow(octocat, 0, 0);

        var xhair = Crafty.e("2D, Canvas, Xhair, Tween")
        .attr({
            x: 0,
            y: 0,
            z: 999,
            alpha: 0.75,
            visible: false
        })
        .origin('center')
        .bind('TweenEnd', function() {
            if (this.alpha <= 0.5) {
                this.tween({alpha: 0.75, y: xhair.y + 10}, 750);
            } else {
                this.tween({alpha: 0.5, y: xhair.y - 10}, 750);
            }
        })
        .tween({alpha: 0.5}, 750);

        // something to die for ...
        for (var i = 0; i < 11; i++) {
            var stype = Math.random() > 0.5 ? "Spikes02" : "Spikes01";
            Crafty.e("2D, Canvas, Spikes, Collision, " + stype)
            .attr({
                x: -100 + i * 50,
                y: Crafty.viewport.height - 50,
                w: 50,
                h: 50
            });
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
        
        Crafty.bind("Pause", function() {
            // Crafty.audio.mute();
            Crafty("BackgroundOverlay").color("#000000");
            Crafty("BackgroundOverlay").alpha = 0.5;
            Crafty("PauseText").destroy();
            Crafty.e("2D, DOM, Text, PauseText").css({
                "width": Crafty.viewport.width + "px",
                "font": "96px Chewy, Impact",
                "color": "#fff",
                "text-align": "center",
                'textShadow': '0px 2px 8px rgba(0,0,0,.9), -1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000,1px 1px 0 #000'
            }).attr({
                x: 0,
                y: Crafty.viewport.height / 2 - Crafty.viewport.y - 64,
                z: 9999
            }).text("Paused");
            // Crafty.DrawManager.draw();
        });
        Crafty.bind("Unpause", function() {
            // Crafty.audio.unmute();
            Crafty("BackgroundOverlay").color("#006064");
            Crafty("BackgroundOverlay").alpha = 0.2;
            Crafty("PauseText").destroy();
            // Crafty.DrawManager.draw();
        });
        Crafty.bind("playerdead", function () {
            if (!isDead) {
                isDead = true;
                Crafty.audio.play('dead', 1, 0.2);

                Crafty.e("2D, Canvas, Splatter, SpriteAnimation")
                .origin('center')
                .attr({
                    x: octocat.cx - 40,
                    y: octocat.cy - 22
                })
                .bind('AnimationEnd', function() {
                    this.destroy();
                })
                .reel('play', generalAnimSpeed, 0, 0, 6).animate('play');
                // die Strider ...
                octocat.destroy();
                setTimeout(function () {
                    Crafty.scene('dead');
                }, 1000);
            }
        });
        Crafty.bind("playerwin", function () {
            // Crafty.unbind("ViewportScroll", recyclePlatforms);
            // good bye Strider
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
            var e1 = Crafty.e("2D, Canvas, SpaceshipEngine, SpriteAnimation").attr({
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
            var e1 = Crafty.e("2D, Canvas, SpaceshipEngine, SpriteAnimation").attr({
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
        });
        Crafty.bind("playerupdatehealth", function () {
            if (!HUDHealth)
                return;

            playerHealth = Math.min(playerHealth, MAX_HEALTH);
            playerHealth = Math.max(playerHealth, -1);
            HUDHealth.removeComponent('HUDHealth4')
                .removeComponent('HUDHealth3')
                .removeComponent('HUDHealth2')
                .removeComponent('HUDHealth0')
                .removeComponent('HUDHealth4');
            switch(playerHealth) {
                case 4: HUDHealth.addComponent('HUDHealth4'); break;
                case 3: HUDHealth.addComponent('HUDHealth3'); break;
                case 2: HUDHealth.addComponent('HUDHealth2'); break;
                case 1: HUDHealth.addComponent('HUDHealth1'); break;
                default: HUDHealth.addComponent('HUDHealth0'); break;
            }
            HUDHealth.trigger('NewComponent');
        });
        Crafty.bind("playerupdatejuice", function () {
            if (!HUDEnergy)
                return;

            playerEnergy = Math.max(playerEnergy, 0);
            playerEnergy = Math.min(playerEnergy, 49);
            HUDEnergy.trigger('Invalidate');
        });
        // Crafty.bind("playershoot", function() {
        //     playerEnergy -= 1;
        //     addAnimation(ANIM_PLAYER_GUNFLARE);
        // });
        Crafty.bind('playsmokeanim', function(data) {
            SmokeAnim.x = octocat.x;
            SmokeAnim.y = octocat.y;
            SmokeAnim.visible = true;
            SmokeAnim.animate('smoke');
        });
 
        /************************************************************************
         * Behaviors and Monitoring
         */

        (function (vp) {
            function updateOctocat(e) {
                var y = this.y;
                // this.animate('walk', 5, - 1);
                // Crafty.viewport.scroll('y', Crafty.viewport.height/2 - octocat.y);
                // isDead = Crafty.viewport.y + this.y > Crafty.canvas._canvas.height;
                isDead = isDead || this._enabled && (vp.y + y > vp.height);
                if(isDead) {
                    Crafty.unbind("EnterFrame", scrollViewport);
                    this.unbind('EnterFrame', updateOctocat);
                    Crafty.trigger('playerdead');
                    return;
                }
            }
            octocat.bind("EnterFrame", updateOctocat);
        })(Crafty.viewport);

        // Create the Platform pool, these entities will be recycled throughout the level
        (function initPlatformPool() {
            var platforms = level_data.slice(cur_platforms, max_platforms);
            for (var i = 0; i < platforms.length; i++) {
                Crafty.e("2D, Canvas, Color, Platform, Collision, Tween, Delay, " + level_data[i].clr).attr(level_data[i])
                // .collision(new Crafty.polygon([0, 0], [attr.w, 0], [attr.w, attr.h], [0, attr.h]))
                .collision();
            };
            cur_platforms = max_platforms - step_platforms;
        })();        

        (function (vp) {
            var _pvy = vp.y,
                _dvy = 0;
            function recyclePlatforms(e) {
                _dvy = vp.y - _pvy;
                if (_dvy * _dvy > 10000) {
                    _pvy = vp.y;
                    debug('distance 50', _dvy, vp.y);

                    if (_dvy > 0) {
                        cur_platforms += step_platforms;
                    } else if (_dvy < 0) {
                        cur_platforms -= step_platforms;
                    }
                    var cur = cur_platforms - max_platforms;

                    var platforms = Crafty("Platform");
                    platforms.each(function (i) {
                        var d = level_data[cur++];
                        if (d) {
                            this.unbind("TweenEnd");

                            if(this._children) {
                                for(var j = 0; j < this._children.length; j++) {
                                    if(this._children[j].destroy) {
                                        this._children[j].destroy();
                                    } else if(this._children[j] instanceof Crafty.polygon) delete this._children[j];
                                }
                                this._children.length = 0; // = [];
                            }

                            //TODO: kill ship, if it had any
                            this.removeComponent(this.clr);


                            this.alpha = 1;
                            this.attr(d);
                            this.addComponent(d.clr);
                            this.collision();

                            // this.attr(d);
                            // this.alpha = 1;
                            // this.bind("TweenEnd", function (k) {
                            //     if('y' === k) {
                            //         this.attr(d);
                            //         this.unbind("TweenEnd");
                            //     }
                            //     if('alpha' === k) {
                            //         this.attr(d);
                            //     }
                            //     // this.alpha = 1;
                            //     // this.collision();
                            //     // this.unbind("TweenEnd");
                            // });
                            var r = ~~ (10 * (1 + Math.random()));
                            if (d.goal && !ship) {
                                ship = Crafty.e("2D, Canvas, Spaceship, Collision, SpriteAnimation").attr({
                                    x: d.x + 50,
                                    y: d.y - 86,
                                    z: -3,
                                    _acc: 0.125
                                })
                                .collision();
                            // } else if(!this.has("Push") && 0 === cur % (r + 1)) {
                            //     this.addComponent("Pull");
                            // } else if(0 === cur % (r + 2)) {
                            //     Crafty.e("Octicons, Pickup, Fork, Tween, Delay").attr({
                            //         x: this.x + (this.w - 48) / 2,
                            //         y: this.y - 64
                            //     }).css('textShadow', '0px 0px 8px rgba(0,0,0,.5), -1px -1px 0 #888,1px -1px 0 #888,-1px 1px 0 #888,1px 1px 0 #888').text("&#xF220");
                            // } else if(0 === cur % 2) {
                            //     Crafty.e("Octicons, Pickup, Star, Tween, Delay").attr({
                            //         x: this.x + (this.w - 48) / 2,
                            //         y: this.y - 64
                            //     }).css('textShadow', '0px 0px 8px rgba(0,0,0,.5), -1px -1px 0 #fc0,1px -1px 0 #fc0,-1px 1px 0 #fc0,1px 1px 0 #fc0').css("color", "#FF8").text("&#xF22A"); // star
                            }

                            if (d.powerup && !d.powerupAdded) {
                                addPowerup(d.powerup, this.x + (Math.random() * (this.w - 20)), this.y);
                                d.powerupAdded = true;
                            }

                            this.trigger("Recycled");
                        }
                    });
                }
            }
            Crafty.bind("ViewportScroll", recyclePlatforms);
        })(Crafty.viewport);

        // Create entities pools
        (function initEntitiesPool() {
            var i, entity;
            for (i = 0; i < MAX_POWERUPS; i++) {
                entity = Crafty.e("2D, Canvas, Powerup, Collision")
                .attr({
                    x: 0, y: 0,
                    z: 899,
                    visible: false,
                    type: ''
                })
                .collision();
                powerups_data.push(entity);
            }
            for (i = 0; i < MAX_ENEMIES; i++) {
                entity = Crafty.e("2D, Canvas, Enemy, SpriteAnimation")
                .attr({
                    x: 0, y: 0,
                    z: 890,
                    visible: false,
                    type: ''
                })
                // .collision();
                enemies_data.push(entity);
            }
            for (i = 0; i < MAX_BULLETS; i++) {
                entity = Crafty.e("2D, Canvas, EnemyBullet, Collision, SpriteAnimation")
                .attr({
                    x: 0, y: 0,
                    z: 892,
                    visible: false,
                    direction: 0,
                    speed: BULLET_SPEED,
                    hp: 0
                })
                .reel('shoot', generalAnimSpeed, 0, 0, 2)
                .reel('shootBlue', generalAnimSpeed, 0, 1, 2);
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
        function addPowerup(type, x, y) {
            for (var i = 0; i < powerups_data.length; i++) {
                if (!powerups_data[i].visible) {
                    powerups_data[i].x = x;
                    powerups_data[i].y = y - 19;
                    powerups_data[i].removeComponent('EnergyOrange, HealthRed');
                    powerups_data[i].addComponent(type === POWERUP_HEALTH ? 'HealthRed' : 'EnergyOrange')
                    powerups_data[i].visible = true;
                    return powerups_data[i];
                }
            }              
        }
        function addEnemy(type, x, y) {
            var component, accel
              , hp = ENEMY_HP
              , shootDelay = ENEMY_SHOOTDELAY
              , shootRange = ENEMY_SHOOTRANGE;

            if (type === ENEMY_TURRET) {
                component = 'EnemyTurretLeft';
                y -= 50;
            } else if (type === ENEMY_DRONE) {
                component = 'EnemyDroneNorth';
                accel = 0.025;
            } else if (type === ENEMY_DRONE_ADVANCED) {
                component = 'EnemyDroneNorth';
                accel = 0.05;
                hp *= 2;
                shootDelay = shootDelay * 0.5;
                shootRange += shootRange * 0.25;
                type = ENEMY_DRONE;
            } else {
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
                    entity.removeComponent('EnemyTurretLeft');
                    entity.removeComponent('EnemyTurretRight');
                    entity.removeComponent('EnemyDroneNorth');
                    entity.removeComponent('EnemyDroneSouth');
                    entity.removeComponent('EnemyDroneWest');
                    entity.removeComponent('EnemyDroneEast');
                    entity.addComponent(component);
                    entity.unbind('Kill');
                    entity.unbind('AnimationEnd');
                    entity.unbind('EnterFrame')
                    entity.origin('center');;
                    // events
                    if (type === ENEMY_TURRET) {
                        /*
                         *  TURRET
                         */
                        entity.reel('shoot', generalAnimSpeed, 0, 0, 2);
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
                        });
                        entity.shootFn = function() {
                            var ecx = this.x + this.w / 2
                              , ecy = this.y + this.h / 2;
                              // console.log(Crafty.math.squaredDistance(ecx, ecy, octocat.cx, octocat.cy));
                            if (Crafty.math.squaredDistance(ecx, ecy, octocat.cx, octocat.cy) < shootRange) {
                                entity.animate('shoot');
                            }
                        }.bind(entity);
                    } else if (type === ENEMY_DRONE) {
                        /*
                         *  DRONE
                         */
                        entity.accel = 0;
                        entity.z = octocat.z + 1; // in front of gunner
                        entity.reel('move', generalAnimSpeed, 0, 0, 2);
                        entity.bind('EnterFrame', function() {
                            var ecx = this.x + this.w / 2
                              , ecy = this.y + this.h / 2;
                            if (!Crafty.math.withinRange(ecx, octocat.cx - 2, octocat.cx + 2)) {
                                this.accel += (ecx < octocat.x) ? accel : -accel; //TOOD: cap speed
                                this.x += this.accel;
                            } else {
                                this.accel = 0;
                            }
                        });
                        entity.animate('move', -1);
                        // shoot
                        entity.shootFn = function() {
                            var ecx = this.x + this.w / 2
                              , ecy = this.y + this.h / 2
                              , dist = Crafty.math.squaredDistance(ecx, ecy, octocat.cx, octocat.cy);
                            
                            if (dist < shootRange) {
                                addBullet(BULLET_BLUE, ecx, ecy, octocat.cx, octocat.cy);
                                addAnimation(ANIM_GUNFLARE, ecx, ecy + 8);
                            }
                        }.bind(entity);
                    }
                    // adjust shoot frequency & die behavior
                    entity.shootTimer = Crafty.e('Delay').delay(entity.shootFn, shootDelay, -1);
                    entity.bind('Kill', function () {
                        addAnimation(this.EnemyType === ENEMY_DRONE ? ANIM_EXPLOSION_BLUE : ANIM_EXPLOSION_01, 
                            this.x + this.w / 2, this.y + this.h / 2);
                        this.shootTimer.cancelDelay(entity.shootFn);
                        this.visible = false;
                        entity.unbind('EnterFrame');
                    });
                    // go, go, go ....
                    entity.visible = true;
                    return entity;
                }
            }   
        }
        function addBullet(type, x, y, dx, dy) {
            for (var i = 0; i < bullets_data.length; i++) {
                var entity = bullets_data[i];
                if (!entity.visible) {
                    // setup
                    entity.x = x;
                    entity.y = y;
                    entity.direction = Math.atan2(dy - y, dx - x);
                    entity.unbind('Kill');
                    entity.unbind('HitOn');
                    // events
                    entity.bind('EnterFrame', function() {
                        this.x += Math.cos(this.direction) * this.speed;
                        this.y += Math.sin(this.direction) * this.speed;
                    });
                    entity.bind('Kill', function () {
                        // console.log('bullet die');
                        this.unbind('EnterFrame');
                        this.ignoreHits();
                        this.visible = false;
                    });
                    Crafty.e('Delay').delay(function() {
                        if (this.visible) {
                            this.trigger('Kill');
                        }
                    }.bind(entity), BULLET_LIVE, 0);
                    entity.checkHits('Gunner');
                    entity.uniqueBind('HitOn', function () {
                        entity.trigger('Kill');
                        onHitBullet();
                    });
                    // go, go, go ....
                    entity.visible = true;
                    entity.animate(type === BULLET_BLUE ? 'shootBlue' : 'shoot', -1);
                    return entity;
                }
            }
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
                    entity.visible = true;
                    // console.log('Play ' + type + ' at slot ' + i);
                    // reset
                    entity.unbind('EnterFrame');
                    entity.unbind('AnimationEnd');
                    // setup
                    entity.alpha = 0.9;
                    if (type === ANIM_PLAYER_GUNFLARE) {
                        x = x || 0;
                        y = y || 0;
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
                    if (typeof x !== 'undefined') {
                        entity.x = x - entity.w / 2;
                        entity.y = y - entity.h / 2;
                    }
                    entity.bind('AnimationEnd', function() {
                        this.visible = false;
                    });
                    // go, go, go ....
                    return;
                }
            }
        }

        // addEnemy(ENEMY_TURRET, 150, 100);
        // addEnemy(ENEMY_DRONE, 150, 100);
        addEnemy(ENEMY_DRONE_ADVANCED, 150, 100);

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
   
    });

    Crafty.scene("loading");

    });
})(jQuery, Crafty);