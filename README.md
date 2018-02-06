# Squad-Command

Try the game out by going to squad-command.herokuapp.com
If you're by yourself, you'll have to open two tabs of the URL for the game to begin, as it is a two-player game.

If you would rather run this on your local machine, if you navigate to
/Squad-Command/Game
You can run server.js with Node.js to host it on localhost:2000

The specific command to run it is
node server.js

For note, the herokuapp is slightly behind our last push. The big diffence is that the files on github have all units shoot projectiles rather than be melee.

I made this game with a group of 4 members for a class that had us focus on learning and implementing web technologies. Squad Command was written in native JavaScript using a canvas element. There is a supporting web server that used PHP as a backend for matchmaking, accounts, and messaging but it currently isn't running.

The game is a simple RTS-style game where you control squads of units and the objective is to kill the enemy king. The players may take control of the king and use their special powers to wreck havoc among the enemy.

Some basic controls
Left-click on a squad to select or deselect it.
Right-clicking while having a squad selected will move it to cursor location.
Press Space to control the king
WASD to control the king
Press F to release a wall of fire in the direction of the cursor
Press and hold G to charge an area of effect stomp move