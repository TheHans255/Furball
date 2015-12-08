# Furball

Furball is a massively multiplayer space shooter for web browsers in a hand-drawn, indie style. Very simple to learn, but a madhouse to play. Especially with a bunch of people.

See it live at [betafreak.com](http://www.betafreak.com/betafreak/Games/Furball/demo/start.html)!

## Features
- Two human players on the same computer with remarkably simple keyboard controls
- Any number of AI starcraft
- Team scoring
- Sound effects
- Made using pure HTML5 and JavaScript - supports anything that supports Canvas

## Planned Features
- Mobile compatibility - use touch to control a single spaceship on your browser
- Use Socket.io to allow any number of people to play against each other on the same server
  - The computers themselves handle some game logic to allow infinite scalability
  - Multiple game rooms (or not!)
  - All players are sorted into teams (so that it doesn't get to be too much of a mess!)  
- Actual winning
  - Games to 20 or another point value
  - Games that last 5 minutes or another amount of time
  - The background tints to the color of the team in first place
- Powerups
  - Rapid fire, bowling ball bullets, grow and shrink the field, et cetera...

## Installation
The server program is a [Node.js](http://www.nodejs.org) application. Go ahead and install Node if you haven't already, then clone this repository to a directory of your choice. In that directory, open up a command line and run

```
npm install
```

in the directory to install Furball's dependencies (Express and socket.io). Then run

```
npm start
```

to start the game server at [http://localhost:8080]. Enjoy!
