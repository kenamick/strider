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
        isDead = false
        // enemy vars
        ENEMY_TURRET = 1,
        ENEMY_DRONE = 2,
        ENEMY_TURRET_SHOOTDELAY = 3000,
        BULLET_LIVE = 5000,
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
                    powerup: Math.random() > 0.5 ? POWERUP_ENERGY : POWERUP_HEALTH,
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

    Crafty.c("Push", {
        _label: null,
        init: function () {
            this.color("#4F4");
            this._label = Crafty.e("2D, DOM, Text").attr({
                x: this.x,
                y: this.y,
                w: this.w
            }).textColor("#ffffff").text("Push").css({
                "font": "18px Chewy, Arial",
                "text-align": "center",
                // 'textShadow': '0px 1px 2px #000'
                'textShadow': '0px 1px 2px rgba(0,0,0,.5), -1px -1px 0 #484,1px -1px 0 #484,-1px 1px 0 #484,1px 1px 0 #484'
            });
            this.attach(this._label);
        },

        use: function () {
            // this.removeComponent("Push", false);
            this._label.destroy();
            this.tween({
                alpha: 0
            }, 25).bind("TweenEnd", function (k) {
                if('alpha' !== k) {
                    return;
                }
                this.color("#888");
                // this.removeComponent("Push", false);
                this.removeComponent("Push");
            });
            return this;
        }
    });

    Crafty.c("Pull", {
        _label: null,
        init: function () {
            this.color("#F44");
            this._label = Crafty.e("2D, DOM, Text").attr({
                x: this.x,
                y: this.y,
                w: this.w
            }).textColor("#ffffff").text("Pull").css({
                "font": "18px Chewy, Arial",
                "text-align": "center",
                // 'textShadow': '0px 1px 2px #000'
                'textShadow': '0px 1px 2px rgba(0,0,0,.5), -1px -1px 0 #844,1px -1px 0 #844,-1px 1px 0 #844,1px 1px 0 #844'
            });
            this.attach(this._label);
        },

        use: function () {
            // this.removeComponent("Pull", false);
            this._label.destroy();

            this.tween({
                alpha: 0
            }, 25).bind("TweenEnd", function (k) {
                if('alpha' !== k) {
                    return;
                }
                this.color("#888");
                // this.removeComponent("Pull", false);
                this.removeComponent("Pull");
            });
            return this;
        }
    });

    function onHitStar(e) {
        var entity = e[0].obj,
            bgovr = Crafty("BackgroundOverlay");
        // e.removeComponent("Pickup", false);
        bgovr.color("#ffff00").delay(function () {
            this.color("#006064");
        }, 150);

        entity._origin.x = 24;
        entity._origin.y = 42;
        entity.z = 999;


        if(SFX) Crafty.audio.play('star', 1, 0.5);

        entity.removeComponent("Pickup");
        entity.removeComponent("Star", true);
        // entity.removeComponent("Star", false);
        var t0 = Crafty.frame(),
            // x0 = entity.x,
            // y0 = entity.y,
            t = e.frame - t0,
            s = 10;

        /**
         * unitstep
         */
        var u = function (t) {
                // return t < 0 ? 0 : 1;
                return ~~ (t > 0);
            };
        var _frame = Crafty.frame();
        // var _pos = new Crafty.math.Vector2D(entity.x, entity.y);

        function updateStar(e) {
            var Vector2D = Crafty.math.Vector2D,
                dest = new Vector2D(Crafty.viewport.x + 150, -Crafty.viewport.y - 16),
                src = new Vector2D(this.x, this.y),
                d = src.distance(dest),
                v = dest.subtract(src);

            if(d <= 10) {
                this.unbind("EnterFrame");
                stars++;
                Crafty("Stars").replace('<div id="stars" style="position: relative; top: 0px;"><span id="star" style="font: 48px Octicons; color:#FF8; text-shadow: 0px 2px 8px #fc0, -1px -1px 0 #fc0,1px -1px 0 rgba(0,0,0,0.2),-1px 1px 0 rgba(0,0,0,0.2),1px 1px 0 rgba(0,0,0,0.2);">&#xF22A</span><span style="font: 36px Chewy; margin-top: -12px; text-shadow: 0px 2px 4px rgba(0,0,0,.5)"><small>X</small> ' + stars + '</span></div>');
                $("#stars").animate({
                    'top': '+=10px',
                    'zoom': 1.02
                }, 75).delay(50).animate({
                    'top': '-=10px',
                    'zoom': 1
                }, 75);
                $("#stars>span:first").animate({
                    'top': '+=10px',
                    'zoom': 1.05
                }, 75).delay(75).animate({
                    'top': '-=12px',
                    'zoom': 1
                }, 100);605

                this.destroy();

                // this.tween({
                //     // rotation: 0,
                //     alpha: 0
                // }, 25).bind("TweenEnd", function (k) {
                //     if(k === 'alpha') {
                //         // $("#stars").animate({zoom: 1.5}, 150).delay(50).animate({zoom: 1}, 150);
                //         this.destroy();
                //     }
                // });
            }

            v.normalize();
            v.scale(s, s);

            // apply some kind of back easing...
            var df = e.frame - _frame;
            var k = u(df - 25);
            // var r = src.distance(_pos);
            // var q = Math.max(0, Math.min(100, r)) / 100;
            // v.y = k * v.y + 100 * Math.exp(-6*q) * (1 - k);
            // v.y = k * v.y + -0.5 * v.y * q * (1-k);
            v.y = k * v.y - 0.1 * v.y * (1 - k);

            var f = e.frame % 8;
            // this.alpha = ~~ (f < 5);
            this.alpha = 1 - u(f - 5);

            this.x += v.x;
            this.y += v.y;
        }
        entity.bind("EnterFrame", updateStar);
    }

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
        // var bullet;
        // if (typeof e === 'object') {
        //     bullet = e;
        // } else if (e[0] && e[0].obj) {
        //     bullet = e[0].obj;
        // }
        // if (bullet) {
            // bullet.trigger('Kill');
            playerHealth -= 1;
            console.log(playerHealth);
            Crafty.trigger('playerupdatehealth');
            if (playerHealth < 0) {
                Crafty.trigger('playerdead');
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

        var bg = Crafty.e("2D, Canvas, Image, Background").attr({
            x: -100,
            y: 0,
            z: -4,
            w: Crafty.viewport.width + 150,
            h: Crafty.viewport.height
        }).image("assets/images/wall01.png", "repeat");
        var bg1 = Crafty.e("2D, Canvas, Image, Background2").attr({
            x: -100,
            y: 0,
            z: -4,
            w: Crafty.viewport.width + 150,
            h: Crafty.viewport.height
        }).image("assets/images/backgrounds.png", "repeat");
        var bg2 = Crafty.e("2D, Canvas, Image, Background").attr({
            x: -100,
            y: 0,
            z: -4,
            w: Crafty.viewport.width + 150,
            h: Crafty.viewport.height
        }).image("assets/images/starsky.png", "repeat");        
        var bgovr = Crafty.e("2D, Canvas, BackgroundOverlay, Color, Delay").attr({
            x: -100,
            y: 0,
            z: -1,
            w: Crafty.viewport.width + 150,
            h: Crafty.viewport.height,
            alpha: 0.2
        }).color("#006064");

        var octocat = Crafty.e("2D, Canvas, Gunner, SpriteAnimation, Physics, Gravity, Collision, Tween, Delay, Twoway")
        .setName("octocat")
        .attr({
            x: Crafty.viewport.width / 2 - 50,
            y: Crafty.viewport.height / 2,
            z: 990
        })
        .origin('center')
        .twoway(playerSpeed, playerJump)
        .reel('walk_right', playerAnimSpeed, 0, 0, 7)
        .reel('walk_left', playerAnimSpeed, 0, 1, 7)
        .reel('stand', 450, [ [0, 3] ])
        .animate('stand')
        .gravity('Platform')
        .gravityConst(GRAVITY)
        .collision([0, 47], [50, 47], [25, 57])
        .onHit('Spikes', onHitSpikes)
        .onHit('Spaceship', onHitSpaceship)
        .onHit('HealthRed', onHitHealth)
        .onHit('EnergyOrange', onHitEnergy);

        octocat.bind("KeyDown", function (e) {
            if (!this._falling && (e.key === Crafty.keys.UP_ARROW || e.key === Crafty.keys.W)) {
                this._canJumpAgain = true;
            } else if (this._canJumpAgain && (e.key === Crafty.keys.UP_ARROW || e.key === Crafty.keys.W)) {
                this._up = true;
                this._gy = 0;
                this._canJumpAgain = false;
            } else if (e.key === Crafty.keys.RIGHT_ARROW || e.key === Crafty.keys.D) {
                this.animate('walk_right', -1);
            } else if (e.key === Crafty.keys.LEFT_ARROW || e.key === Crafty.keys.A) {
                this.animate('walk_left', -1);
            } else if (e.key === Crafty.keys.Y || e.key === Crafty.keys.Z) {
                Crafty.trigger('playershoot');
                Crafty.trigger('playerupdatejuice');
                console.log('hello');
            }
        });
        octocat.bind("KeyUp", function (e) {
            if ((e.key === Crafty.keys.UP_ARROW || e.key === Crafty.keys.W)) {
                this.pauseAnimation();
            } else {
                this.animate('stand');
            }
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
            /////////        
        });

        Crafty.viewport.follow(octocat, 0, 0);

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
            // console.log('size: ' + Crafty("2D").length);
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
                    x: octocat.x,
                    y: octocat.y + 25
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
        Crafty.bind("playershoot", function() {
            playerEnergy -= 1;
            addAnimation(ANIM_PLAYER_GUNFLARE);
        });
        Crafty.bind('playsmokeanim', function(data) {
            SmokeAnim.x = octocat.x;
            SmokeAnim.y = octocat.y;
            SmokeAnim.visible = true;
            SmokeAnim.animate('smoke');
            console.log('play');
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
                    console.log('distance 50', _dvy, vp.y);

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
                                console.log(this.w);
                                addPowerup({
                                    x: this.x + (Math.random() * (this.w - 20)), 
                                    y: this.y,
                                    type: d.powerup
                                });
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
                entity = Crafty.e("2D, Canvas, SpriteAnimation")
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
                    speed: 3
                })
                .reel('shoot', generalAnimSpeed, 0, 0, 2);
                // .collision();
                bullets_data.push(entity);
            }
            for (i = 0; i < MAX_ANIMATIONS; i++) {
                entity = Crafty.e("2D, Canvas, SpriteAnimation")
                .attr({
                    x: 0, y: 0,
                    z: 991,
                    visible: false,
                    alpha: 0.90
                })
                .origin('center')
                .bind('AnimationEnd', function() {
                    this.visible = false;
                });                
                anims_data.push(entity);                
            }
        })();
        function addPowerup(data) {
            for (var i = 0; i < powerups_data.length; i++) {
                if (!powerups_data[i].visible) {
                    powerups_data[i].x = data.x;
                    powerups_data[i].y = data.y - 19;
                    powerups_data[i].removeComponent('EnergyOrange, HealthRed');
                    powerups_data[i].addComponent(data.type === POWERUP_HEALTH ? 'HealthRed' : 'EnergyOrange')
                    powerups_data[i].visible = true;
                    return powerups_data[i];
                }
            }              
        }
        function addEnemy(data) {
            var component;
            if (data.type === ENEMY_TURRET) {
                data.y -= 50;
                component = 'EnemyTurretLeft';
            } else if (data.type === ENEMY_DRONE) {
                //TODO
            }
            for (var i = 0; i < enemies_data.length; i++) {
                var entity = enemies_data[i];
                if (!entity.visible) {
                    // setup
                    entity.x = data.x;
                    entity.y = data.y;
                    entity.removeComponent('EnemyTurretLeft, EnemyTurretRight');
                    entity.addComponent(component);
                    entity.unbind('Kill');
                    // events
                    if (data.type === ENEMY_TURRET) {
                        entity.reel('shoot', generalAnimSpeed, 0, 0, 2);
                        entity.bind('AnimationEnd', function (reel) {
                            // console.log('new bullet');
                            var ecx = entity.x + entity.w / 2
                              , ecy = entity.y + entity.h / 2;
                            addAnimation(ANIM_GUNFLARE, ecx, ecy + 8);
                            addBullet({
                                x: ecx,
                                y: ecy,
                                dx: octocat.x + octocat.w / 2,
                                dy: octocat.y + octocat.h / 2
                            });
                        });
                        entity.shootFn = function() {
                            entity.animate('shoot');
                        };
                        entity.shootTimer = Crafty.e('Delay').delay(entity.shootFn, ENEMY_TURRET_SHOOTDELAY, -1);
                        entity.bind('Kill', function (data) {
                            this.shootTimer.cancelDelay(entity.shootFn);
                            this.visible = false;

                        });
                    }
                    // go, go, go ....
                    entity.visible = true;
                    return entity;
                }
            }   
        }
        function addBullet(data) {
            for (var i = 0; i < bullets_data.length; i++) {
                var entity = bullets_data[i];
                if (!entity.visible) {
                    // setup
                    entity.x = data.x;
                    entity.y = data.y;
                    entity.direction = Math.atan2(data.dy - entity.y, data.dx - entity.x);
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
                    entity.uniqueBind('HitOn', function (data) {
                        entity.trigger('Kill');
                        onHitBullet();
                    });
                    // go, go, go ....
                    entity.visible = true;
                    entity.animate('shoot', -1);
                    return entity;
                }
            }
        }
        function addAnimation(type, x, y) {
            var animSpeed = ~~(generalAnimSpeed / 2);
            for (var i = 0; i < anims_data.length; i++) {
                var entity = anims_data[i];
                if (!entity.visible) {
                    // reset
                    entity.unbind('EnterFrame');
                    entity.removeComponent('Flares');
                    // setup
                    if (type === ANIM_PLAYER_GUNFLARE) {
                        entity.alpha = 0.9;
                        entity.addComponent('Flares')
                        .reel('play', animSpeed, [ [2, 0], [1, 0], [0, 0], [3, 1], [1, 0], [0, 0]])
                        .bind('EnterFrame', function() {
                            this.x = octocat._x + 24;
                            this.y = octocat._y + 24;
                        });
                    } else if (type === ANIM_GUNFLARE) {
                        entity.alpha = 0.75;
                        entity.addComponent('Flares')
                        .reel('play', animSpeed, [ [2, 0], [1, 0], [0, 0], [3, 1], [1, 0], [0, 0]]);
                    } else {
                        throw "wrong anim type - " + type;
                    }
                    if (typeof x !== 'undefined') {
                        entity.x = x - entity.w / 2;
                        entity.y = y - entity.h / 2;
                    }                    
                    // go, go, go ....
                    entity.visible = true;
                    entity.animate('play');
                    return;
                }
            }
        }

        addEnemy({x: 0, y: 100, type: ENEMY_TURRET});

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