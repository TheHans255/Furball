// Create an images object using an anonymous function that is immediately
// called (so as not to plug up the global namespace).
var Images = function() {
	var object = {};
	
	var load_single_image = function(src) {
		var image = new Image();
		image.src = src;
		return image;
	}
	
	var load_image_array = function(srcPrefix, min, max, srcSuffix) {
		var array = [];
		for (var i = min; i <= max; i++) {
			array.push(load_single_image(srcPrefix + i + srcSuffix));
		}
		return array;
	}
	
	object.background = load_single_image("./content/background.png");
	object.ships = load_image_array("./content/ships/ship", 0, 21, ".png");
	object.bullet = load_single_image("./content/bullet.png");
	object.cloud = load_single_image("./content/particles/cloud.png");
	object.explosions = load_image_array(
		"./content/particles/explode", 0, 2, ".png"
		);
	return object;
}();

// Create a sound player object using an anonymous function that is immediately
// called (so as not to plug up the global namespace).
var Sounds = function() {
	var object = {};
	var context;
	var bufferList = {};

	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	if (window.AudioContext) {
		context = new window.AudioContext();
	}
	
	var load_and_add_single_sound = function(list, name, src) {
		var create_audio_element_fallback = function(e) {
			// if anything in the process of creating an AudioBuffer doesn't
			// work, create an audio element instead
			var audioElement = document.createElement("audio");
			var audioSource = document.createElement("source");
			audioSource.src = src;
			audioElement.appendChild(audioSource);
			list[name] = audioElement;
		};
		if (context) {
		var request = new XMLHttpRequest();
		request.open("GET", src, true);
		request.responseType = "arraybuffer";
		request.onload = function() {
			var audioData = request.response;
			context.decodeAudioData(audioData, function(buffer) {
				// Once you've loaded it, add it to the list
				list[name] = buffer;
			}, create_audio_element_fallback);
		};
		request.onerror = function(e) {
			create_audio_element_fallback(e);
		};
		request.send();
		} else {
			create_audio_element_fallback();
		}
	}
		
	
	// TODO: Convert the sounds to MP3s - IE does not support WAV
	// files and it'd be nicer to have smaller files anyway.
	load_and_add_single_sound(
		bufferList, "shot", "./content/sounds/shot.mp3");
	load_and_add_single_sound(
		bufferList, "hit", "./content/sounds/bullethit.mp3");
	load_and_add_single_sound(
		bufferList, "explosion", "./content/sounds/explosion.mp3");
	load_and_add_single_sound(
		bufferList, "enter_game", "./content/sounds/entergame.mp3");
	load_and_add_single_sound(
		bufferList, "cpu_enter_game", "./content/sounds/cpuenter.mp3");
	
	object.playSound = function(soundName) {
		if (!(soundName in bufferList)) return;
		if (window.AudioBuffer 
			&& bufferList[soundName] instanceof window.AudioBuffer) {
			// it's a successfully loaded AudioBuffer
			var bufferToPlay = bufferList[soundName];
			var soundToPlay = context.createBufferSource();
			soundToPlay.buffer = bufferToPlay;
			soundToPlay.connect(context.destination);
			soundToPlay.start(0);
		} else if (bufferList[soundName] instanceof HTMLMediaElement) {
			// it's an AudioElement, so play it.
			// An already playing media element can usually be reset 
			// because the staccato for most of these sounds is 
			// at the beginning
			var audioElement = bufferList[soundName];
			audioElement.play();
			if (audioElement.readyState > 0) {
				audioElement.currentTime = 0;
			}
			window.status = audioElement.readyState;
		}
	}
	
	return object;
}();