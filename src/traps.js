
/**
 * Strider
 * Github Game-Off 2015 Entry
 * by Petar Petrov / github.com/petarov
 */
(function ItsATrap(Crafty) {
    'use strict';
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
}());