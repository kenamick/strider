Octocat Jump
============

Playable on the [gh-pages branch](http://ogoshen.github.com/game-off-2012/)

<img src="http://i.imgur.com/rCRrx.png" style="border:0;">
<img src="http://i.imgur.com/QOGtr.png" style="border:0;">

About
-----
A Doodle Jump clone for the **Github Game Off 2012**.

Use the arrow keys to navigate your ever-jumping Octocat and collect stars for extra points.
Push higher with the green platforms, watch out from the red, they'll be pulled from under you.
Forks will teleport you around 100 lines of code further.


Technicals
----------
Best playable on Chrome, works in FF (less FPS), fails on IE9 (getter\setters) and untested on others...
I've used the Octicons font instead of sprites for the pickups, saves bandwidth and scales better,
at the prices of more CSS3 effects.
Overall, not a lot of canvas is used, which means less performance, as the DOM gets updated often.

Credits
-------
Louis Stowasser for his awesome framework [Crafty](http://craftyjs.com).  
[The Octocat sprite](https://github.com/mozilla/BrowserQuest/blob/master/client/img/3/octocat.png) by [sork](https://github.com/sork).  
[Pow Studio](http://powstudios.com/content/smoke-animation-pack-1) - for the smoke jump sprite.  
Font Diner's [Chewy](http://www.google.com/webfonts/specimen/Chewy).  
And Github's @bryanveloso, @jonrohan, @jsncostello, @kneath, and @cameronmcefee for the [Octicons](https://github.com/styleguide/css/7.0) font.  

Any other assets were either photomanipulated with GIMP or synthesize with SFXR.

To do:
------
* Game doesn't restart when you die, have to refresh the page.
* There's a clone chasing you, but I haven't figured how to deal with that yet... maybe raise an issue or sync to get rid of it...
* Split the .js, follow Crafty's boilerplate
* Scoreboard
* Level editor
