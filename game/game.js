function Game(canvas) {
	"use strict";
	var c = canvas.getContext("2d");
	var ships = [];
	var bullets = [];
	var decorativeObjects = [];
	
	var bgPattern = c.createPattern(Images.background, "repeat");

	this.start = function start() {
		// Update and draw the game at 60 FPS
		setInterval(this.update, 1000 / 60);
		setInterval(this.draw, 1000 / 60);
		
		// Create both player ships with their keymaps and pictures.
		for (var i = 0; i < Config.number_of_player_ships; i++)
		{
			var player_ship = create_player_ship(
				Config.player_key_maps[i],
				Config.player_ship_indices[i]);
			player_ship.x = 
				Config.player_relative_start_positions[i].x * canvas.width;
			player_ship.y = 
				Config.player_relative_start_positions[i].y * canvas.height;
			ships.push(player_ship);
		}
		
		// Add key listeners so that the + and - keys add and
		// destroy CPU ships
		window.addEventListener("keydown", function(event) {
			if (event.keyCode == Config.cpu_add_key) {
				var cpu_ship = create_cpu_ship(
					Math.floor(
						Math.random() * (Images.ships.length 
						- Config.number_of_player_ships)
						) + Config.number_of_player_ships
					);
				cpu_ship.x = Math.random() * canvas.width;
				cpu_ship.y = Math.random() * canvas.height;
				cpu_ship.rot = Math.random() * Math.PI * 2;
				ships.push(cpu_ship);
				Sounds.playSound("cpu_enter_game");
			} else if (event.keyCode == Config.cpu_delete_key) {
				// Take the first living CPU ship and make it a-splode!
				if (ships.length > Config.number_of_player_ships) {
					var i = Config.number_of_player_ships;
					while (!ships[i].alive) i++;
					ships[i].deal_damage(null, ships[i].maxHitPoints);
				}
			}
		});
	};
	
	// Creates a player ship and hooks it up to the provided keymap.
	var create_player_ship = function(keymap, shipIndex) {
		var shipInput = new Input();
		var ship = new Ship(shipInput, shipIndex);
		window.addEventListener("keydown", function(event){
			game_toggle_input(event, keymap, shipInput, true);
		});
		window.addEventListener("keyup", function(event){
			game_toggle_input(event, keymap, shipInput, false);
		});
		window.addEventListener("blur", function(event){
			var key;
			for (key in shipInput) {
				shipInput[key] = false;
			}
		});
		ship.alive = false;
		return ship;
	};
	
	// Creates a CPU ship and give it a simple behavior pattern
	// dependent on its ship index
	var create_cpu_ship = function(shipIndex) {
		var shipInput = new Input();
		var ship = new Ship(shipInput, shipIndex);
		var cpu_input_function = 
			cpu_input_functions[
				shipIndex % cpu_input_functions.length
				];
		var processLogicInterval = setInterval(function() {
			if (!ship.alive) {
				clearInterval(processLogicInterval);
			} else {
				cpu_input_function(ship, shipInput);
			}
		}, 1000 / 30);
		return ship;
	};
	
	// A set of simple CPU strategies. None of them make any attempt
	// to seek out other ships, but do get a lot of bullets out
	// and are typically difficult to hit, and, more importantly,
	// provides players with the *feeling* that they can expect
	// from the completed, multiplayer version of Furball.
	var cpu_input_functions = [
		function(cpu_ship, cpu_ship_input) {
			cpu_ship_input.brake = 
				Math.random() * cpu_ship.maxBoostEnergy < cpu_ship.boostEnergy;
			cpu_ship_input.boost = 
				Math.random() * cpu_ship.maxBoostEnergy < cpu_ship.boostEnergy;
			cpu_ship_input.fire = true;
		},
		function(cpu_ship, cpu_ship_input) {
			cpu_ship_input.left = true;
			cpu_ship_input.boost = 
				Math.random() * cpu_ship.maxBoostEnergy < cpu_ship.boostEnergy;
			cpu_ship_input.fire = true;
		},
		function(cpu_ship, cpu_ship_input) {
			var turnFactor = 
				Math.sin((Date.now() + Math.random() * 500) * Math.PI / 1500);
			cpu_ship_input.left = turnFactor < 0;
			cpu_ship_input.right = turnFactor > 0;
			cpu_ship_input.fire = turnFactor * turnFactor > .4;
			cpu_ship_input.boost = turnFactor * turnFactor > .7;
		}
	];
	
	// Toggles the given player-controlled input in response to a
	// keydown or keyup event
	var game_toggle_input = function(event, keymap, input, keystate) {
		var inputName = keymap[event.keyCode];
		if (inputName) {
			input[inputName] = keystate;
			event.preventDefault();
		}
	};
	
	// Updates the state of the object arrays
	this.update = function update() {
		update_and_clean_game_object_array(bullets, 0);
		update_and_clean_game_object_array(ships, Config.number_of_player_ships);
		update_and_clean_game_object_array(decorativeObjects, 0);
	};
	
	// Updates an object array and cleans out any dead objects
	// The start index is provided so that the cleaning agent
	// does not remove the player controlled ships from the array
	var update_and_clean_game_object_array = function(array, startIndex) {
		if (!startIndex) {
			startIndex = 0;
		}
		var i;
		for (i = 0; i < array.length; i++) {
			array[i].update();
			if (i >= startIndex && !array[i].alive) {
				array.splice(i, 1);
				i--;
			}
		}
	}

	// Draws all objects and score boxes
	this.draw = function draw() {
		var i;
		reset_drawing_defaults(c);
		clear_screen(c);
		for (i = 0; i < Config.number_of_player_ships; i++)	{
			draw_score_box(i, ships[i].score);
			//draw_help_text(i, ships[i].alive);
		}
		for (i in bullets) {
			bullets[i].draw(c);
		}
		for (i in ships) {
			ships[i].draw(c);
		}
		for (i in decorativeObjects) {
			decorativeObjects[i].draw(c);
		}
	};

	// Clears the screen to the graph paper background
	var clear_screen = function(c) {
		var oldFillStyle = c.fillStyle;
		c.fillStyle = bgPattern;
		c.fillRect(0, 0, canvas.width, canvas.height);
		c.fillStyle = oldFillStyle;
	};
	
	// Draws a score box for the given player
	var draw_score_box = function(index, score) {
		c.fillStyle = Config.team_fills[index];
		c.strokeStyle = "#000000";
		var box_x, box_y, box_width, box_height;
		box_width = Config.score_box_width;
		box_height = Config.score_box_height;
		if (index % 2 == 0) {
			box_x = Config.score_box_x_margin;
		} else {
			box_x = canvas.width - box_width - Config.score_box_x_margin;
		}
		if (Math.floor(index / 2) % 2 == 0) {
			box_y = Config.score_box_y_margin;
		} else {
			box_y = canvas.height - box_height - Config.score_box_y_margin;
		}
		c.fillRect(box_x, box_y, box_width, box_height);
		c.strokeRect(box_x, box_y, box_width, box_height);
		var scoreString = score.toString();
		while (scoreString.length < 3)
			scoreString = "0" + scoreString;
		c.fillStyle = Config.score_box_font_color;
		c.font = Config.score_box_font;
		c.textBaseline = Config.score_box_text_baseline;
		c.fillText(scoreString, box_x + 2, box_y + box_height / 2);
	}
	
	// Draws help text for the given player
	var draw_help_text = function(index, player_ship_alive) {
		var text_x, text_y, text_to_draw;
		text_to_draw = player_ship_alive ? 
			Config.help_text_player_control_map[index] :
			Config.help_text_player_press_fire[index];
			
		c.fillStyle = Config.help_text_font_color;
		c.font = Config.help_text_font;
		c.textBaseline = Config.help_text_font_baseline;
		
		if (index % 2 == 0) {
			text_x = Config.score_box_x_margin + Config.score_box_width + 2;
		} else {
			text_x = canvas.width - Config.score_box_width 
				- Config.score_box_x_margin - 2
				- c.measureText(text_to_draw).width;
		}
		if (Math.floor(index / 2) % 2 == 0) {
			text_y = Config.score_box_y_margin;
		} else {
			text_y = canvas.height - Config.score_box_height
				- Config.score_box_y_margin;
		}
		
		c.fillText(text_to_draw, text_x, text_y);
	}
	
	// Resets the defaults for all properties that are changed
	// by drawing methods of objects in this game.
	var reset_drawing_defaults = function(c) {
		c.setTransform(1,0,0,1,0,0);
		c.globalAlpha = 1;
		c.fillStyle = "#000000";
		c.strokeStyle = "#000000";
	};
	
	// Defines a simple input forwarding object
	var Input = function() {
		this.left = false;
		this.right = false;
		this.boost = false;
		this.brake = false;
		this.fire = false;
	};
	
	// The base object for all objects in the game. Provides
	// a position, a velocity, a size, and an alive flag
	// as well as utilities for object updates, wrapping,
	// and collision.
	var GameObject = function() {
		this.x = 0; this.y = 0;
		this.dx = 0; this.dy = 0;
		this.size = 0;
		this.alive = true;
		
		// All game objects implement an update method that calls this
		
		this.updatePosition = function(){
			this.x += this.dx;
			this.y += this.dy;
			if (this.x < -Config.wrap_around_size / 2)
				this.x += canvas.width + Config.wrap_around_size;
			if (this.x > canvas.width + Config.wrap_around_size / 2)
				this.x -= canvas.width + this.size;
			if (this.y < -Config.wrap_around_size / 2)
				this.y += canvas.height + Config.wrap_around_size;
			if (this.y > canvas.height + Config.wrap_around_size / 2)
				this.y -= canvas.height + Config.wrap_around_size;
		};
		this.collidesWith = function(other) {
			var x1 = this.x, y1 = this.y,
				x2 = other.x, y2 = other.y;
			var d = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
			return d < (this.size + other.size) / 2;
		};
		
		// All game objects implement a draw(ctx) method
	};

	// Defines a ship: the main actor in the game. Ships are capable
	// of responding to their input controls (modified outside)
	// and moving around the world, mainly shooting and taking bullets
	// and adding decorations based on ship state.
	var Ship = function(input, shipIndex) {
		GameObject.call(this);
		this.size = Config.ship_size;
		this.rot = 0;
		this.speed = 0;
		var fireDelay = 0;
		this.input = input;
		this.shipIndex = shipIndex;
		this.boostEnergy = this.maxBoostEnergy = Config.ship_max_boost_energy;
		this.hitPoints = this.maxHitPoints = Config.ship_max_hit_points;
		this.score = 0;
		// Updates the ship
		this.update = function(){
			if (this.alive) {
				// Calls in this form are required because simply calling
				// the method triggers quirks with the use of closures
				// and causes "this" to be the global object
				handle_input.call(this);
				handle_collisions.call(this);
				create_decorations.call(this);
				this.dx = Math.sin(this.rot) * this.speed;
				this.dy = -Math.cos(this.rot) * this.speed;
			} else {
				// Once the required spawn time has expired,
				// press fire to reenter the game
				if (this.input.fire && fireDelay <= 0) {
					this.alive = true;
					this.hitPoints = this.maxHitPoints;
					this.boostEnergy = this.maxBoostEnergy;
					this.dx = 0;
					this.dy = 0;
					this.speed = 0;
					Sounds.playSound("enter_game");
				}
				fireDelay--;
			}
			// call the base implementation, which updates position
			this.updatePosition();
		};
		
		// Handle all input actions
		var handle_input = function() {
			// If I can fire a bullet, fire it now
			if (this.input.fire && fireDelay <= 0) {
				fire_bullet.call(this, Bullet);
				fireDelay = Config.ship_fire_delay;
				//fire_bullet(Bullet);
			}
			fireDelay--;
			
			// Rotate when pressing left or right.
			if (this.input.left) {
				this.rot -= Config.ship_rotation_speed;
			}
			if (this.input.right) {
				this.rot += Config.ship_rotation_speed;
			}
			
			// Control boosting and braking
			var desiredSpeed = Config.ship_normal_speed;
			if (this.input.boost) {
				if (this.boostEnergy > 0) {
					this.boostEnergy--;
					desiredSpeed = Config.ship_boosting_speed;
				}
			}
			else if (this.input.brake) {
				if (this.boostEnergy > 0) {
					//this.boostEnergy--;
					desiredSpeed = Config.ship_braking_speed;
				}
			}
			else {
				this.boostEnergy += 
				Math.min(this.maxBoostEnergy - this.boostEnergy, 1);
			}
			this.speed +=
				Math.max(-Config.ship_speed_change_rate,
					Math.min(Config.ship_speed_change_rate,
					desiredSpeed - this.speed));
		}

		// Fire a new bullet
		var fire_bullet = function(bullet_constructor) {
			var bullet = new bullet_constructor(this);
			bullet.x = this.x;
			bullet.y = this.y;
			bullet.dx = Math.sin(this.rot) * 
				(this.speed + Config.bullet_added_speed);
			bullet.dy = -Math.cos(this.rot) * 
				(this.speed + Config.bullet_added_speed);
			bullets.push(bullet);
			Sounds.playSound("shot");
		};
		
		// Detect and handle all collisions with bullets
		var handle_collisions = function() {
			for (var i in bullets) {
				var bullet = bullets[i];
				if (bullet.owner !== this) {
					if (this.collidesWith(bullet)) {
						this.deal_damage(bullet.owner, 1);
						Sounds.playSound("hit");
						bullet.alive = false;
						decorativeObjects.push(
							new Cloud(bullet.x, bullet.y));
					}
				}
			}
		}
		
		// Create decorations such as trailing smoke
		var create_decorations = function() {
			if (Math.random() > (this.hitPoints / this.maxHitPoints)) {
				var r = Config.ship_cloud_trail_radius;
				var cloud = new Cloud(
					Math.random() * r + this.x - r / 2,
					Math.random() * r + this.y - r / 2
					);
				cloud.dx = 
					this.dx * Config.ship_cloud_trail_speed_reduce_factor;
				cloud.dy = 
					this.dy * Config.ship_cloud_trail_speed_reduce_factor;
				decorativeObjects.push(cloud);
			}
		};
		
		// Deal a certain amount of damage from a given source (optional),
		// causing this ship to explode if its hit points reach 0 or below.
		// If the source is another ship (or anything that can have a
		// score), they earn a point if this ship is destroyed. This
		// method is public so that the "-" key may destroy the ship
		// rather than unceremoniously erase it.
		this.deal_damage = function(source, amount) {
			this.hitPoints -= amount;
			if (this.hitPoints <= 0){
				decorativeObjects.push(
					new Explosion(this));
				this.dx = 0;
				this.dy = 0;
				this.speed = 0;
				this.alive = false;
				fireDelay = Config.ship_spawn_delay;
				Sounds.playSound("explosion");
				
				if (source && ("score" in source)) {
					source.score++;
				}
			}
		}
		
		// Draws the ship.
		this.draw = function(c){
			if (this.alive) {
				reset_drawing_defaults(c);
				c.translate(this.x, this.y);
				c.rotate(this.rot);
				c.drawImage(Images.ships[this.shipIndex], 
					-this.size / 2, -this.size / 2, this.size, this.size);
			}
		};
	};
	Ship.prototype = Object.create(new GameObject());
	Ship.prototype.constructor = Ship;
	
	// Creates a bullet, which travels forward and disappears
	// after a certain number of frames. Most of the logic behind
	// the bullet is handled by the ships.
	var Bullet = function(owner) {
		GameObject.call(this);
		this.size = Config.bullet_size;
		this.owner = owner;
		var framesLeft = Config.bullet_life;
		this.update = function() {
			framesLeft--;
			if (framesLeft <= 0) {
				this.alive = false;
			}
			// call the base implementation, which updates position
			this.updatePosition();
		};
		this.draw = function(c) {
			reset_drawing_defaults(c);
			c.translate(this.x, this.y);
			c.drawImage(Images.bullet, 
				-this.size / 2, -this.size / 2, this.size, this.size);
		};
	};
	Bullet.prototype = Object.create(new GameObject());
	Bullet.prototype.constructor = Bullet;
	
	// Represents a cloud that comes up when a ship is damaged
	// that fades out into the air. Clouds do not interact with the game.
	var Cloud = function(x, y) {
		GameObject.call(this);
		this.size = Config.cloud_min_size;
		var framesLeft = Config.cloud_life;
		this.x = x; this.y = y;
		this.update = function() {
			this.size += 
				(Config.cloud_max_size - Config.cloud_min_size) 
				/ Config.cloud_life;
			framesLeft--;
			if (framesLeft <= 0) {
				this.alive = false;
			}
			this.updatePosition();
		};
		this.draw = function(c) {
			reset_drawing_defaults(c);
			c.globalAlpha = framesLeft / Config.cloud_life;
			c.translate(this.x, this.y);
			c.drawImage(Images.cloud,
				-this.size / 2, -this.size / 2, this.size, this.size);
		};
	};
	Cloud.prototype = Object.create(new GameObject());
	Cloud.prototype.constructor = Cloud;
	
	// Represents an explosion that goes off when a ship is destroyed.
	// The ship that exploded is accepted so that it may start in
	// the position and somewhat in the velocity of the exploded ship.
	var Explosion = function(owner) {
		GameObject.call(this);
		this.size = Config.explosion_min_size;
		var framesLeft = Config.explosion_life;
		this.x = owner.x; this.y = owner.y;
		this.dx = owner.dx / 8;
		this.dy = owner.dy / 8;
		this.update = function() {
			this.size += (Config.explosion_max_size - this.size) * 0.3;
			framesLeft--;
			if (framesLeft <= 0) {
				this.alive = false;
			}
			this.updatePosition();
		};
		this.draw = function(c) {
			reset_drawing_defaults(c);
			c.translate(this.x, this.y);
			c.drawImage(Images.explosions[Math.floor(Math.random() * 3)],
				-this.size / 2, -this.size / 2, this.size, this.size);
		};
	};
	Explosion.prototype = Object.create(new GameObject());
	Explosion.prototype.constructor = Explosion;
}



