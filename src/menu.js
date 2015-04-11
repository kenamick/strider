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
        
    /************************************************************************
     * Game Intro Scene
     */
    Crafty.scene('intro', function () {
        Crafty.background('#fff');

        var txt = Crafty.e('2D, DOM, Text, Delay').attr({
            x: 4,
            y: Crafty.viewport.height - 16,
            w: Crafty.viewport.width,
            alpha: 0
        }).css({
            'font': '10px Jura, Arial',
            'color': '#888',
            'text-align': 'center'
        }).text('Press ESC to skip intro');
        txt.bind('EnterFrame', function (e) {
            var f = e.frame % 100;
            this.alpha = ~~ (f < 50);
        });
        Crafty.e('Keyboard').bind('KeyDown', function (e) {
            if(e.keyCode !== Crafty.keys.ESC) return;
            this.destroy();
            Crafty.scene('main');
        });

        //TODO: un-nest this crap
        Crafty.e('2D, DOM, Image, Tween, Delay').attr({
            x: (400 - 174) / 2,
            y: (640 - 174) / 2,
            alpha: 0
        }).image('assets/images/github_logo.png').tween({
            alpha: 1
        }, 250).one('TweenEnd', function () {
            this.unbind('TweenEnd');
            this.delay(function () {
                this.tween({
                    alpha: 0
                }, 250).bind('TweenEnd', function () {
                    this.unbind('TweenEnd');
                    var crafty = Crafty.e('2D, DOM, Image, Tween, Delay').attr({
                        x: (400 - 147) / 2,
                        y: (640 - 120) / 2,
                        alpha: 0
                    }).image('assets/images/cratfy_logo.png').tween({
                        alpha: 1
                    }, 250).bind('TweenEnd', function () {
                        this.unbind('TweenEnd');
                        this.delay(function () {
                            this.tween({
                                alpha: 0
                            }, 250).bind('TweenEnd', function () {
                                Crafty.e('2D, DOM, Image, Tween, Keyboard').attr({
                                    alpha: 0
                                }).image('assets/images/title.png').tween({
                                    alpha: 1
                                }, 250).bind('TweenEnd', function () {
                                    txt.text('Press any key to start the game').css('color', '#fff');
                                    this.bind('KeyDown', function () {
                                        Crafty.scene('main');
                                    });
                                });
                            });
                        }, 1500);
                    });
                });
            }, 1500);
        });
    

    });

    /************************************************************************
     * Game End Scene
     */
    Crafty.scene('dead', function (data) {
        data = data || {};
        data.meters = data.meters || 0;

        Crafty.background('#000');
        Crafty.viewport.x = 0;
        Crafty.viewport.y = 0;
        Crafty.background("url('assets/images/starsky.png') repeat ");

        Crafty.e('2D, DOM, Text, SpaceFont')
        .attr({x: 135, y: 150, w: 150 })
        .textFont({size: '20px'})
        .text('Mission Failed!');

        Crafty.e('2D, DOM, Text, SpaceFont')
        .attr({x: 100, y: 250, w: 250 })
        .textFont({size: '20px'})
        .text('Strider reached: ' + data.meters + ' m.');

        Crafty.e('2D, DOM, Text, SpaceFont')
        .attr({x: 135, y: Crafty.viewport.height - 16, w: Crafty.viewport.width})
        // .textFont({size: '20px'})
        // .textColor('#888')
        .text('Press any key to continue');

        Crafty.e('Keyboard').bind('KeyDown', function (e) {
            this.destroy();
            Crafty.scene('intro');
        });
    });

    }); //eof-ready
}(Crafty));