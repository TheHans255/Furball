// Create an interface by which a player can be identified.
// Each player has a ship, a ship input that they control, and the ability to 
// log in and log out.

// When a player logs into the game, they create a ship and a ship input.
// They also register events or timers to allow them to update the ship input
// or the ship's location as needed.

// When a player logs out of the game, the ship is destroyed and all resources
// registered during log in are deregistered. The player may then be removed from
// the player list so that its data may be garbage collected.

// The two local human players set up hooks to the keydown and keyup events
// and never log out unless the game ends (at which point all players of all
// types are logged out).

// Local computer players are logged in and out via the + and - keys,
// respectively. A computer player that logs in sets an interval for logic
// processing.

// Networked players of either type are logged in from a server request,
// and are logged out when they disconnect.