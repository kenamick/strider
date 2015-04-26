
/**
 * Strider
 * Github Game-Off 2015 Entry
 * by Petar Petrov / github.com/petarov
 */
(function ItsATrap(Crafty) {
    window.addEventListener('keydown', function(e){
        switch(e.keyCode){
        case 37: 
        case 39: 
        case 38: 
        case 40:
        case 32: 
            e.preventDefault(); 
            break;
        default: 
            break;
        }
    }, false);

    Crafty.c("MyTwoway", {
        _speed: 3,
        _up: false,

        init: function () {
            this.requires("Fourway, Keyboard, Gravity");
        },

        /**@
         * #.twoway
         * @comp Twoway
         * @sign public this .twoway(Number speed[, Number jump])
         * @param speed - Amount of pixels to move left or right
         * @param jump - Vertical jump speed
         *
         * Constructor to initialize the speed and power of jump. Component will
         * listen for key events and move the entity appropriately. This includes
         * `Up Arrow`, `Right Arrow`, `Left Arrow` as well as `W`, `A`, `D`. Used with the
         * `gravity` component to simulate jumping.
         *
         * The key presses will move the entity in that direction by the speed passed in
         * the argument. Pressing the `Up Arrow` or `W` will cause the entity to jump.
         *
         * @see Gravity, Fourway
         */
        twoway: function (speed, jump) {

            this.multiway(speed, {
                RIGHT_ARROW: 0,
                LEFT_ARROW: 180,
                D: 0,
                A: 180,
                Q: 180
            });

            if (speed) this._speed = speed;
            if (arguments.length < 2){
              this._jumpSpeed = this._speed * 2;
            } else{
              this._jumpSpeed = jump;
            }

            this.bind("EnterFrame", function () {
                if (this.disableControls) return;
                if (this._up) {
                    this.y -= this._jumpSpeed;
                    this._falling = true;
                    this.trigger('Moved', { x: this._x, y: this._y + this._jumpSpeed });
                }
            }).bind("KeyDown", function (e) {
                if (!this._falling && (e.key === Crafty.keys.UP_ARROW || e.key === Crafty.keys.W))
                    this._up = true;
            });

            return this;
        }
    });
}(Crafty));