// Create a config object using an anonymous function that is immediately
// called (so as not to plug up the global namespace).
var Config = function() {
	// Start with the basic settings object
	var object =
	{
		// Player one moves with WASD, fires with Space,
		// and starts on the left.
		// Player two moves with the arrow keys, fires with Enter,
		// and starts on the right.
		// If you wish to edit this file and add more human playable ships,
		// change the number_of_player_ships variable and then provide
		// keymaps, ship indices, and relative start positions for each
		// additional ship.
		number_of_player_ships:2,
		player_key_maps:[
			{87:"boost", 65:"left", 83:"brake", 68:"right", 32:"fire"},
			{38:"boost", 37:"left", 40:"brake", 39:"right", 13:"fire"}
		],
		player_ship_indices:[
			0,
			1
		],
		player_relative_start_positions:[
			{x:1/4, y:1/2},
			{x:3/4, y:1/2}
		],
		
		// Text for control mappings and the like
		// (one for each player)
		help_text_player_press_fire:[
			"Press SPACE",
			"Press ENTER"
		],
		help_text_player_control_map:[
			"WASD to steer,\r\nSPACE to fire",
			"Arrows to steer,\r\nENTER to fire"
		],
		help_text_add_delete_cpu:"Press + or - to add or destroy CPU ships",
		help_text_font_color:"#000000",
		help_text_font_baseline:"top",
		help_text_font:"12px Courier New",
		
		// CPUs are added and deleted using the + or - keys, respectively.
		// (A procedure below changes these values if the browser is Firefox)
		cpu_add_key:187,
		cpu_delete_key:189,
		
		// Object sizes.
		wrap_around_size:50,
		ship_size:36,
		bullet_size:6,
		cloud_min_size:3,
		cloud_max_size:12,
		explosion_min_size:3,
		explosion_max_size:96,
		
		// Ship energy amounts and delays
		ship_max_boost_energy:300,
		ship_max_hit_points:10,
		ship_fire_delay:20,
		ship_spawn_delay:100,
		
		// Information for making the cloud trail when a ship is damaged
		ship_cloud_trail_radius:32,
		ship_cloud_trail_speed_reduce_factor:-0.1,
		
		// Ship speeds in different states
		ship_normal_speed:2,
		ship_braking_speed:-1,
		ship_boosting_speed:5,
		ship_speed_change_rate:0.1,
		bullet_added_speed:4,
		ship_rotation_speed:0.06,
		
		// Amount of time various objects stay on the screen
		bullet_life:100,
		cloud_life:50,
		explosion_life:100,
		
		// Team fills for tinting objects and drawing score boxes
		team_fills:["#00e0e0", "#f00000", "#00d000", "#e000e0"],
		
		// Sizes and styles for score boxes
		score_box_x_margin:10,
		score_box_y_margin:10,
		score_box_width:40,
		score_box_height:24,
		score_box_margin_between:8,
		score_box_font:"20px Courier New",
		score_box_font_color:"#000000",
		score_box_text_baseline:"middle"
	};
	
	// If using Firefox, change browser-specific settings
	if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1)
	{
		// + and - have different keys in Firefox, so change them here
		object.cpu_add_key = 61;
		object.cpu_delete_key = 173;
	}
	
	return object;
}();