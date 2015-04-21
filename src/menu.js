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

    var logosTimeout = 250, logosShowTimeout = 2000;
        
    /************************************************************************
     * Game Intro Scene
     */
    Crafty.scene('intro', function () {
        Crafty.background('#f6fafb');
        
        // var txt = Crafty.e('2D, DOM, Canvas, SpaceFont, Delay').attr({
        //     x: 4,
        //     y: Crafty.viewport.height - 16,
        //     w: Crafty.viewport.width,
        //     alpha: 0
        // }).css({
        //     'font': '10px Jura, Arial',
        //     'color': '#888',
        //     'text-align': 'center'
        // })
        // .text('Press ESC to skip intro');
        // txt.bind('EnterFrame', function (e) {
        //     var f = e.frame % 100;
        //     this.alpha = ~~(f < 50);
        // });

        var txt = Crafty.e('2D, DOM, Text, SpaceFont, Delay').attr({
            x: 145,
            y: Crafty.viewport.height - 16,
            w: Crafty.viewport.width,
            alpha: 1
        })
        .textFont({size: '12px'})
        .textColor('#888')
        .text('Press ESC to skip intro');
        // txt.bind('EnterFrame', function (e) {
        //     var f = e.frame % 100;
        //     this.alpha = ~~(f < 50);
        // });

        Crafty.e('Keyboard').bind('KeyDown', function (e) {
            if(e.keyCode !== Crafty.keys.ESC) return;
            this.destroy();
            Crafty.scene('menu');
        });

        //TODO: un-nest this crap
        Crafty.e('2D, Canvas, Image, Tween, Delay').attr({
            x: 0,
            y: (640 - 450) / 2,
            alpha: 0
        }).image('assets/images/gameoff.jpg').tween({
            alpha: 1
        }, logosTimeout).one('TweenEnd', function () {
            this.unbind('TweenEnd');
            this.delay(function () {
                this.tween({
                    alpha: 0
                }, logosTimeout).bind('TweenEnd', function () {
                    this.unbind('TweenEnd');
                    var crafty = Crafty.e('2D, Canvas, Image, Tween, Delay').attr({
                        x: (400 - 147) / 2,
                        y: (640 - 120) / 2,
                        alpha: 0
                    }).image('assets/images/cratfy_logo.png').tween({
                        alpha: 1
                    }, logosTimeout).bind('TweenEnd', function () {
                        this.unbind('TweenEnd');
                        this.delay(function () {
                            this.tween({
                                alpha: 0
                            }, logosTimeout).bind('TweenEnd', function () {
                                Crafty.scene('menu');
                            });
                        }, logosShowTimeout);
                    });
                });
            }, logosShowTimeout );
        });

    });

    /************************************************************************
     * Game Menu Scene
     */
    Crafty.scene('menu', function () {
        Crafty.background('#f6fafb');
        Crafty.viewport.x = 0;
        Crafty.viewport.y = 0;

        // stop all sfx
        Crafty.audio.stop();

        Crafty.e('2D, Canvas, Image, Tween, Keyboard').attr({
            alpha: 0
        }).image('assets/images/splash_screen.jpg').tween({
            alpha: 1
        }, logosTimeout).bind('TweenEnd', function () {
            Crafty.e('2D, DOM, Text, SpaceFont').attr({
                x: 121,
                y: Crafty.viewport.height - 25,
                w: Crafty.viewport.width,
            })
            .textFont({size: '14px'})
            .textColor('white')
            .text("Press 'X' to start the game");

            Crafty.e('2D, DOM, Text, SpaceFont').attr({
                x: 115,
                y: Crafty.viewport.height - 75,
                w: Crafty.viewport.width,
            })
            .textFont({size: '14px'})
            .textColor('white')
            .text("Press 'I' to read instructions");

            this.bind('KeyUp', function (e) {
                if (e.keyCode === Crafty.keys.X) {
                    // go go go ...
                    Crafty.scene('main');
                } else if (e.keyCode === Crafty.keys.I) {
                    Crafty.scene('instructions');
                }
            });
        });
    });

    /************************************************************************
     * Game Instructions Scene
     */
    Crafty.scene('instructions', function () {
        Crafty.background("url('assets/images/splash_screen_blurred.jpg')");
        Crafty.viewport.x = 0;
        Crafty.viewport.y = 0;

        // stop all sfx
        Crafty.audio.stop();

        var sx = 15, sy = 25, txtClr = 'white';

        // Goal
        Crafty.e('2D, DOM, Text, SpaceFont').attr({x: sx, y: sy, w: Crafty.viewport.width})
        .textFont({size: '16px'}).textColor('#888')
        .text('Goal');

        Crafty.e('2D, DOM, Text, SpaceFont').attr({x: sx, y: sy + 25, w: Crafty.viewport.width - 75})
        .textFont({size: '14px'}).textColor(txtClr)
        .text("You are Strider. An agent of a rebel force that needs to deliver some very important intel to HQ. You've got the data and now you need to make your escape. " +
            "A 3 km. deep shaft stands between you and a transport ship waiting to pick you up at 0 m. height. Jump up on the platforms, destroy the defense systems and deliver that intel.");

        // Controls
        sy = sy + 140;
        Crafty.e('2D, DOM, Text, SpaceFont').attr({x: sx, y: sy, w: Crafty.viewport.width})
        .textFont({size: '16px'}).textColor('#888')
        .text('Controls');

        Crafty.e('2D, Canvas, Powerup, Gunner').attr({x: sx - 10, y: sy + 60});

        Crafty.e('2D, DOM, Text, SpaceFont').attr({x: sx + 50, y: sy + 25, w: Crafty.viewport.width - 50})
        .textFont({size: '14px'}).textColor(txtClr)
        .text("Use the arrow or 'WAsD' keys to move and jump.");

        Crafty.e('2D, DOM, Text, SpaceFont').attr({x: sx + 50, y: sy + 50, w: Crafty.viewport.width - 75})
        .textFont({size: '14px'}).textColor(txtClr)
        .text("Press 'Up' or 'W' twice to activate your thrusters and do a double jump.");

        Crafty.e('2D, DOM, Text, SpaceFont').attr({x: sx + 50, y: sy + 90, w: Crafty.viewport.width - 75})
        .textFont({size: '14px'}).textColor(txtClr)
        .text("Press either 'X', 'Z' or 'Y' to shoot. You don't need to aim. Your rifle targets the nearest enemy automatically.");

        Crafty.e('2D, DOM, Text, SpaceFont').attr({x: sx + 50, y: sy + 140, w: Crafty.viewport.width - 75})
        .textFont({size: '14px'}).textColor(txtClr)
        .text("Your rifle needs energy to shoot. You need to either pick up powerups or wait until it recharges.");

        // Powerups
        sy = sy + 180;
        Crafty.e('2D, DOM, Text, SpaceFont').attr({x: sx, y: sy, w: Crafty.viewport.width})
        .textFont({size: '16px'}).textColor('#888')
        .text('Powerups');

        Crafty.e('2D, Canvas, Powerup, HealthRed')
        .attr({x: sx, y: sy + 25});
        Crafty.e('2D, DOM, Text, SpaceFont').attr({x: sx + 30, y: sy + 30, w: Crafty.viewport.width})
        .textFont({size: '14px'}).textColor(txtClr)
        .text("+1 HP");

        Crafty.e('2D, Canvas, Powerup, EnergyOrange')
        .attr({x: sx, y: sy + 50});
        Crafty.e('2D, DOM, Text, SpaceFont').attr({x: sx + 30, y: sy + 55, w: Crafty.viewport.width})
        .textFont({size: '14px'}).textColor(txtClr)
        .text("30% percent energy refill.");

        Crafty.e('2D, Canvas, Powerup, EnergyBlue')
        .attr({x: sx, y: sy + 75});
        Crafty.e('2D, DOM, Text, SpaceFont').attr({x: sx + 30, y: sy + 80, w: Crafty.viewport.width})
        .textFont({size: '14px'}).textColor(txtClr)
        .text("60% percent energy refill.");

        // Enemies
        sy = sy + 135;
        Crafty.e('2D, DOM, Text, SpaceFont').attr({x: sx, y: sy, w: Crafty.viewport.width})
        .textFont({size: '16px'}).textColor('#888')
        .text('Enemies');

        Crafty.e('2D, Canvas, Powerup, EnemyTurretGreen').attr({x: sx, y: sy + 30});
        Crafty.e('2D, DOM, Text, SpaceFont').attr({x: sx + 70, y: sy + 40, w: Crafty.viewport.width - 70})
        .textFont({size: '14px'}).textColor(txtClr)
        .text("Non-moveable enemy turret.");

        Crafty.e('2D, Canvas, Powerup, EnemyDrone').attr({x: sx, y: sy + 80});
        Crafty.e('2D, DOM, Text, SpaceFont').attr({x: sx + 70, y: sy + 100, w: Crafty.viewport.width - 70})
        .textFont({size: '14px'}).textColor(txtClr)
        .text("Moveable enemy drone.");

        Crafty.e('2D, DOM, Text, SpaceFont').attr({x: 130, y: Crafty.viewport.height - 25, w: Crafty.viewport.width})
        .textFont({size: '14px'}).textColor('white')
        .text('Press any key to continue');
        Crafty.e('Keyboard').bind('KeyUp', function (e) {
            this.destroy();
            Crafty.scene('menu');
        });
    });

    /************************************************************************
     * Game End Scene
     */
    Crafty.scene('dead', function (data) {
        data = data || {};
        data.meters = data.meters || 0;

        // stop all sfx
        Crafty.audio.stop();

        Crafty('Delay').each(function() {
            this.destroy();
        });

        Crafty.background('#000');
        Crafty.viewport.x = 0;
        Crafty.viewport.y = 0;
        Crafty.background("url('assets/images/starsky.png') repeat");

        if (data.success) {
            Crafty.e('2D, DOM, Text, SpaceFont')
            .attr({x: 105, y: 150, w: Crafty.viewport.width})
            .textFont({size: '20px'})
            .text('Mission Successful!');
        } else {
            Crafty.e('2D, DOM, Text, SpaceFont')
            .attr({x: 135, y: 150, w: Crafty.viewport.width})
            .textFont({size: '20px'})
            .text('Mission Failed!');

            Crafty.e('2D, DOM, Text, SpaceFont').attr({x: 100, y: 250, w: 250 }).textFont({size: '20px'})
            .text('Strider reached: ' + data.meters + ' m.');
        }

        Crafty.e('2D, DOM, Text, SpaceFont').attr({x: 100, y: 320, w: 250 }).textFont({size: '20px'})
        .text('Turrets destroyed: ' + data.kills.turrets);

        Crafty.e('2D, DOM, Text, SpaceFont').attr({x: 100, y: 350, w: 250 }).textFont({size: '20px'})
        .text('Drones destroyed: ' + data.kills.drones);

        Crafty.e('2D, DOM, Text, SpaceFont')
        .attr({x: 135, y: Crafty.viewport.height - 16, w: Crafty.viewport.width})
        // .textFont({size: '20px'})
        // .textColor('#888')
        .text('Press any key to continue');

        Crafty.e('Keyboard').bind('KeyDown', function (e) {
            this.destroy();
            Crafty.audio.stop('music1');
            // game reset
            Crafty.scene('menu');
        });
    });

    }); //eof-ready
}(Crafty));