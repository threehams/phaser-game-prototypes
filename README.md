# phaser-game-prototypes

Series of game prototypes made to learn the Phaser game engine.

Note that there are little to no tests for these projects (unlike all the others) - Phaser isn't
designed for testing, so it'll take some time to figure out how to handle a project so reliant on another
framework.

## Memory
Simple memory game using assets from the Death Whimsy project. It's mostly just an array.
 Move along, nothing to see here.
 
## Minesweeper
Slightly more complex because of the more defined rules in (Microsoft's version of) Minesweeper.
Filling in the area requires a flood-fill algorithm - done recursively because of the known max size of the playing field.

## Tetris
More interesting. Involved learning Phaser's game timers, and translating between the board's data structure and
the Canvas coordinates, where the Y coordinate starts upper-left instead of lower-left.

There's probably some improvement possible there.

There's a but where the piece overlaps the top when it first enters the game.
Fixing this involved learning how Phaser handles z-depth when sprites and groups interact.
I decided to move and and learn that for the next game, then apply it to this one later.

## Shmup
A shooter which involved dealing with object pools, physics, collision detection, z-indexes,
more graphics, and sound. Unlike the other three, this one is mostly driven by JSON data, including
sprites, enemy generation, AI, weapons (including bullet patterns), and player ship stats. Sprite sheets are put
together with Texture Packer. It's possible to change all of this without modifying any code.

This was the first project where I hit game-specific design issues. Games often have classes
which need access to lots and lots of other classes. Grown organically, this turns into a giant mess!

Some concepts used here:

- Duplication in data is reduced by allowing strings for weapons and AI types in enemies.json and player.json.
  When parsed, these strings are expanded into the corresponding objects.
- There is a very common need for object pools, since object creation is expensive in Javascript (and garbage collection
  WILL cause skipped frames!). All objects in the game are created once and reused.
- Collision detection in Phaser is expected to be done at the level of the main game state. Because of this, the
  state keeps a list of all bullets and enemies, and delegates handling to the objects. Bullet and enemy object pools
  are injected into other classes as needed.
- Audio is played through Phaser's event system (signals). Event types are kept in a single file for now,
  since there are only a handful of them. Browserify's 'require' statement effectively makes this a singleton (but
  thankfully not a global!). At some point, injecting it might be cleaner, but it's very small right now...
  
  Events are sent to the audio component for processing, to prevent sounds from repeating too often.
  Note: should probably rename "component" to "anything other than component". Overloaded term. Naming is hard.
- Enemies need access to the player's position for weapon targeting, but don't need to know anything else about the
  player. The current-player module handles this. Same question about events.js applies here.
- Player control is done through a separate class, PlayerController. This is nearly identical to Unreal Engine 4. It
  takes control logic out of the already-heavy Game class and allows it to be overridden by AI if needed.
- UI gets its own class to allow some extremely primitive one-way binding (dirty checking). Anything
  else would be overkill right now.
- The weapon class could really use refactoring. This would be the best case for unit tests, since the
  fire() logic isn't tightly coupled to Phaser itself - it's mostly just a lot of conditionals and math.

This was a lot more fun than the others. At some point, I might turn it into something bigger.

All assets are from the old mid-90's PC shooter, Tyrian, which was made public in the mid-2000s.