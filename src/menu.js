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
        
        Crafty.scene("intro", function initIntro() {
            Crafty.background("#fff");

            var txt = Crafty.e("2D, DOM, Text, Delay").attr({
                x: 4,
                y: Crafty.viewport.height - 16,
                w: Crafty.viewport.width,
                alpha: 0
            }).css({
                "font": "10px Verdana, Arial",
                "color": "#888",
                "text-align": "center"
            }).text('Press ESC to skip intro');
            txt.bind("EnterFrame", function (e) {
                var f = e.frame % 100;
                this.alpha = ~~ (f < 50);
            });
            Crafty.e('Keyboard').bind('KeyDown', function (e) {
                if(e.keyCode !== Crafty.keys.ESC) return;
                this.destroy();
                Crafty.scene("main");
            });

            //TODO: un-nest this crap
            Crafty.e("2D, DOM, Image, Tween, Delay").attr({
                x: (400 - 174) / 2,
                y: (640 - 174) / 2,
                alpha: 0
            }).image('assets/images/github_logo.png').tween({
            // }).image(R.GITHUB_LOGO_PNG).tween({
                alpha: 1
            }, 50).bind("TweenEnd", function () {
                this.unbind("TweenEnd");
                this.delay(function () {
                    this.tween({
                        alpha: 0
                    }, 50).bind("TweenEnd", function () {
                        this.unbind("TweenEnd");
                        var crafty = Crafty.e("2D, DOM, Image, Tween, Delay").attr({
                            x: (400 - 147) / 2,
                            y: (640 - 120) / 2,
                            alpha: 0
                        // }).image(R.CRATFY_LOGO_PNG).tween({
                        }).image('assets/images/cratfy_logo.png').tween({
                            alpha: 1
                        }, 50).bind("TweenEnd", function () {
                            this.unbind("TweenEnd");
                            this.delay(function () {
                                this.tween({
                                    alpha: 0
                                }, 50).bind("TweenEnd", function () {
                                    Crafty.e("2D, DOM, Image, Tween, Keyboard").attr({
                                        alpha: 0
                                    // }).image(R.TITLE_PNG).tween({
                                    }).image('assets/images/title.png').tween({
                                        alpha: 1
                                    }, 100).bind("TweenEnd", function () {
                                        txt.text('Press any key to start the game').css('color', '#fff');
                                        this.bind("KeyDown", function () {
                                            Crafty.scene("main");
                                        });
                                    });

                                    // setTimeout(function () {
                                    //     Crafty.scene("main");
                                    // }, 250);
                                });
                            }, 500);
                        });
                    });
                }, 500);
            });
        });        

    }); //eof-ready
})(jQuery, Crafty);