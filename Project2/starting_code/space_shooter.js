/* 
------------------------------
------- INPUT SECTION -------- 
------------------------------
*/

/**
 * This class binds key listeners to the window and updates the controller in attached player body.
 * 
 * @typedef InputHandler
 */
class InputHandler {
	key_code_mappings = {
		button: {
			32: {key: 'space', state: 'action_1'}
		},
		axis: {
			68: {key: 'right', state: 'move_x', mod: 1},
			65: {key: 'left', state: 'move_x', mod: -1},
			87: {key: 'up', state: 'move_y', mod: -1},
			83: {key: 'down', state: 'move_y', mod: 1}
		}
	};
	player = null;

	constructor(player) {
		this.player = player;

		// bind event listeners
		window.addEventListener("keydown", (event) => this.keydown(event), false);
		window.addEventListener("keyup", (event) => this.keyup(event), false);
	}

	/**
	 * This is called every time a keydown event is thrown on the window.
	 * 
	 * @param {Object} event The keydown event
	 */
	keydown(event) {
		this.player.raw_input[event.keyCode] = true;
	}

	/**
	 * This is called every time a keyup event is thrown on the window.
	 * 
	 * @param {Object} event The keyup event
	 */
	keyup(event) {
		delete this.player.raw_input[event.keyCode];
	}

	resetController() {
		// reset all buttons to false
		for (let mapping of Object.values(this.key_code_mappings.button)) {
			this.player.controller[mapping.state] = false;
		}

		// reset all axis to zero
		for (let mapping of Object.values(this.key_code_mappings.axis)) {
			this.player.controller[mapping.state] = 0;
		}
	}

	pollController() {
		this.resetController();

		// poll all bound buttons
		for (let [key_code, mapping] of Object.entries(this.key_code_mappings.button)) {
			if (this.player.raw_input[key_code] === true) {
				this.player.controller[mapping.state] = true;
			}
		}

		// poll all bound axis
		for (let [key_code, mapping] of Object.entries(this.key_code_mappings.axis)) {
			if (this.player.raw_input[key_code] === true) {
				this.player.controller[mapping.state] += mapping.mod;
			}
		}
	}
}

/* 
------------------------------
------- BODY SECTION  -------- 
------------------------------
*/

/**
 * Represents a basic physics body in the world. It has all of the necessary information to be
 * rendered, checked for collision, updated, and removed.
 * 
 * @typedef Body
 */
class Body {
	position = {x: 0, y: 0};
	velocity = {x: 0, y: 0};
	size = {width: 10, height: 10};
	health = 100;

	/**
	 * Creates a new body with all of the default attributes
	 */
	constructor() {
		// generate and assign the next body id
		this.id = running_id++;
		// add to the entity map
		entities[this.id] = this;
	}

	/**
	 * @type {Object} An object with two properties, width and height. The passed width and height
	 * are equal to half ot the width and height of this body.
	 */
	get half_size() {
		return {
			width: this.size.width / 2,
			height: this.size.height / 2
		};
	}

	/**
	 * @returns {Boolean} true if health is less than or equal to zero, false otherwise.
	 */
	isDead() {
		return this.health <= 0;
	}

	/**
	 * Updates the position of this body using the set velocity.
	 * 
	 * @param {Number} delta_time Seconds since last update
	 */
	update(delta_time) {
		// move body
		this.position.x += delta_time * this.velocity.x;
		this.position.y += delta_time * this.velocity.y;
	}

	/**
	 * This function draws a green line in the direction of the body's velocity. The length of this
	 * line is equal to a tenth of the length of the real velocity
	 * 
	 * @param {CanvasRenderingContext2D} graphics The current graphics context.
	 */
	draw(graphics) {
		graphics.strokeStyle = '#00FF00';
		graphics.beginPath();
		graphics.moveTo(this.position.x, this.position.y);
		graphics.lineTo(this.position.x + this.velocity.x / 10, this.position.y + this.velocity.y / 10);
		graphics.stroke();
	}

	/**
	 * Marks this body to be removed at the end of the update loop
	 */
	remove() {
		queued_entities_for_removal.push(this.id);
	}
}

/**
 * Represents an player body. Extends a Body by handling input binding and controller management.
 * 
 * @typedef Player
 */
class Player extends Body {
	// this controller object is updated by the bound input_handler
	controller = {
		move_x: 0,
		move_y: 0,
		action_1: false
	};
	raw_input = {};
	timeAlive = 0;
	speed = 100;
	input_handler = null;
	

	/**
	 * Creates a new player with the default attributes.
	 */
	constructor() {
		super();

		// bind the input handler to this object
		this.input_handler = new InputHandler(this);

		// we always want our new players to be at this location
		this.position = {
			x: config.canvas_size.width / 2,
			y: config.canvas_size.height - 100
		};
		
	}

	/**
	 * Draws the player as a triangle centered on the player's location.
	 * 
	 * @param {CanvasRenderingContext2D} graphics The current graphics context.
	 */
	draw(graphics) {
		graphics.strokeStyle = '#000000';
		graphics.beginPath();
		graphics.moveTo(
			this.position.x,
			this.position.y - this.half_size.height
		);
		graphics.lineTo(
			this.position.x + this.half_size.width,
			this.position.y + this.half_size.height
		);
		graphics.lineTo(
			this.position.x - this.half_size.width,
			this.position.y + this.half_size.height
		);
		graphics.lineTo(
			this.position.x,
			this.position.y - this.half_size.height
		);
		graphics.stroke();

		// draw velocity lines
		super.draw(graphics);
	}

	/**
	 * Updates the player given the state of the player's controller.
	 * 
	 * @param {Number} delta_time Time in seconds since last update call.
	 */
	update(delta_time) {
		if (player.isDead() == false) {
		this.timeAlive += delta_time;
		}
		
		/*
			implement player movement here!

			I recommend you look at the development console's log to get a hint as to how you can use the
			controllers state to implement movement.

			You can also log the current state of the player's controller with the following code
			console.log(this.controller);
		 */

		 //one key or the other is pressed

		 //if d is presssed move right
		 if (this.controller.move_x == 1) {
			 this.velocity.x = this.speed;
		 }
		 //if a is pressed move left
		 else if (this.controller.move_x == -1) {
			 this.velocity.x = -this.speed;
		 }
		 //if a or d is not pressed then there is no movement either way
		 else if (this.controller.move_x == 0) {
			 this.velocity.x = 0;
		 }
		 //if w is pressed move up
		 if (this.controller.move_y == 1) {
			 this.velocity.y = this.speed;
		 }
		 //if s is pressed move down
		 else if (this.controller.move_y == -1) {
			 this.velocity.y = -this.speed;
		 }
		 //if w or s is not pressed then there is no movement either way
		 else if (this.controller.move_y == 0) {
			 this.velocity.y = 0;
		 }

		 //if w and d are pressed then move in a positive x and y diagonal
		 if (this.controller.move_x == 1 && this.controller.move_y == 1) {
			 this.velocity.x = Math.sqrt((this.speed**2)/2);
			 this.velocity.y = Math.sqrt((this.speed**2)/2);
		 }
		 //if a and d are pressed then move in a negative x and y diagonal
		 if (this.controller.move_x == -1 && this.controller.move_y == -1) {
			 this.velocity.x = -Math.sqrt((this.speed**2)/2);
			 this.velocity.y = -Math.sqrt((this.speed**2)/2);
		 }
		 //if a and w are pressed then move in a negative x and positive y diagonal
		 if (this.controller.move_x == -1 && this.controller.move_y == 1) {
			 this.velocity.x = -Math.sqrt((this.speed**2)/2);
			 this.velocity.y = Math.sqrt((this.speed**2)/2);
		 }
		 //if d and s are pressed then move in a positive x and negative y diagonal
		 if (this.controller.move_x == 1 && this.controller.move_y ==-1) {
			 this.velocity.x = Math.sqrt((this.speed**2)/2);
			 this.velocity.y = -Math.sqrt((this.speed**2)/2);
		 }
		 
		 //counts down the actionCooldown
		 actionCooldown -= delta_time;
		 //if the spacebar is pressed and the appropriate cooldown time has passed, fire a projectile
		 if ((this.controller.action_1 == 1) && (actionCooldown <= 0)) {
			 var nProjectile = new projectile();
			 actionCooldown = 1;
		 } 

		// update position
		super.update(delta_time);

		// clip to screen
		this.position.x = Math.min(Math.max(0, this.position.x), config.canvas_size.width);
		this.position.y = Math.min(Math.max(0, this.position.y), config.canvas_size.height);
	}
}

class enemy extends Body {
	constructor(player) {
		console.log("enemy spawn");
		super();
		//staring postion of enemies and sets enemy speed
		this.position.x = Math.random() * config.canvas_size.width;
		this.position.y = -5;
		this.velocity.y = 50;
	}

	//copied from player, draws the enemies
	draw(graphics) {
		//changed color to red
		graphics.strokeStyle = '#AC2509';
		graphics.fillStyle = '#AC2509';
		graphics.beginPath();
		graphics.moveTo(
			this.position.x,
			this.position.y - this.half_size.height
		);
		graphics.lineTo(
			this.position.x + this.half_size.width,
			this.position.y + this.half_size.height
		);
		graphics.lineTo(
			this.position.x - this.half_size.width,
			this.position.y + this.half_size.height
		);
		graphics.lineTo(
			this.position.x,
			this.position.y - this.half_size.height
		);
		graphics.stroke();
		graphics.fill();
		// draw velocity lines
		super.draw(graphics);

		
		
	}
	
	update(delta_time) {
		super.update(delta_time);
		//if the enemy leaves the screen, remove it
		if (this.position.y >= 500) {
			this.remove();
			console.log("remove");
		}
		//if the enemy collides with the player, reduce player health by 10 and remove the enemy
		if (this.position.x < player.position.x + player.size.width &&
			this.position.x + this.size.width > player.position.x && 
			this.position.y < player.position.y + player.size.height &&
			this.position.y + this.size.height > player.position.y) {
				console.log("collision detected");
				player.health = player.health - 10;
				this.remove();
				console.log(player.health);
				
			}
	}

	
	
}

class enemySpawner {
	
	constructor() {
		
	}
	update(delta_time) {
		//implement when you want to spawn an enemy (TIME INTERVAL)
		spawnEnemyTime -= delta_time;
		//if the player is alive and the apprpriate time has passes, spawn the enemy
		if((spawnEnemyTime <= 0) && (player.isDead() == false)) {
			var nEnemy = new enemy(player);
			spawnEnemyTime = 1;
			totalEnemiesSpawned++;
		}
		//delta_time = time passed since the last time this function was called 

		//(ex: 60 fps, delta_time = 1/60)
		
	}

}

class projectile extends Body {
	constructor() {
		super();
		//the initial position of the projectile is where the player is, the speed is also set here
		this.position.x = player.position.x;
		this.position.y = player.position.y;
		this.velocity.y = -50;
		console.log("projectile spawned");

	}
	//copied from player, draws the projectile
	draw(graphics) {
		//color is blue
		graphics.strokeStyle = '#0961AC';
		graphics.fillStyle = '#0961AC';
		graphics.beginPath();
		graphics.moveTo(
			this.position.x,
			this.position.y - this.half_size.height
		);
		graphics.lineTo(
			this.position.x + this.half_size.width,
			this.position.y + this.half_size.height
		);
		graphics.lineTo(
			this.position.x - this.half_size.width,
			this.position.y + this.half_size.height
		);
		graphics.lineTo(
			this.position.x,
			this.position.y - this.half_size.height
		);
		graphics.stroke();
		graphics.fill();

		// draw velocity lines
		super.draw(graphics);
	}
	
	update(delta_time) {
		super.update(delta_time);
		//iterates through all the entities
		for(let i = 0; i < entities.length; i++) {
			//checks for a collision and if it's between an enemy and projectile
			if(entities[i] instanceof enemy && 
				this.position.x < entities[i].position.x + entities[i].size.width &&
				this.position.x + this.size.width > entities[i].position.x &&
				this.position.y < entities[i].position.y + entities[i].size.height &&
				this.position.y + this.size.height  > entities[i].position.y) {
					console.log("projectile collided with enemy");
					//remove enemy
					entities[i].remove();
					//remove projectile
					this.remove();
					//add to the enemy hit stat
					enemiesHit++;

					
				}
		}

	}
		

	
	

}

/* 
------------------------------
------ CONFIG SECTION -------- 
------------------------------
*/

const config = {
	graphics: {
		// set to false if you are not using a high resolution monitor
		is_hi_dpi: true
	},
	canvas_size: {
		width: 300,
		height: 500
	},
	update_rate: {
		fps: 60,
		seconds: null
	}
};

config.update_rate.seconds = 1 / config.update_rate.fps;

// grab the html span
const game_state = document.getElementById('game_state');

// grab the html canvas
const game_canvas = document.getElementById('game_canvas');
game_canvas.style.width = `${config.canvas_size.width}px`;
game_canvas.style.height = `${config.canvas_size.height}px`;

const graphics = game_canvas.getContext('2d');

// for monitors with a higher dpi
if (config.graphics.is_hi_dpi) {
	game_canvas.width = 2 * config.canvas_size.width;
	game_canvas.height = 2 * config.canvas_size.height;
	graphics.scale(2, 2);
} else {
	game_canvas.width = config.canvas_size.width;
	game_canvas.height = config.canvas_size.height;
	graphics.scale(1, 1);
}

/* 
------------------------------
------- MAIN SECTION  -------- 
------------------------------
*/

/** @type {Number} last frame time in seconds */
var last_time = null;

/** @type {Number} A counter representing the number of update calls */
var loop_count = 0;

/** @type {Number} A counter that is used to assign bodies a unique identifier */
var running_id = 0;

/** @type {Object<Number, Body>} This is a map of body ids to body instances */
var entities = null;

/** @type {Array<Number>} This is an array of body ids to remove at the end of the update */
var queued_entities_for_removal = null;

/** @type {Player} The active player */
var player = null;
var spawnEnemyTime = 1;

/* You must implement this, assign it a value in the start() function */
var enemy_spawner = null;

/* You must implement this, assign it a value in the start() function */
var collision_handler = null;
var actionCooldown = 0;

/* Player stats */
var enemiesHit = 0;
var totalEnemiesSpawned = 0;
var playerScore = 0;

/**
 * This function updates the state of the world given a delta time.
 * 
 * @param {Number} delta_time Time since last update in seconds.
 */
function update(delta_time) {
	// poll input
	player.input_handler.pollController();

	// move entities
	Object.values(entities).forEach(entity => {
		entity.update(delta_time);
	});

	// detect and handle collision events
	if (collision_handler != null) {
		collision_handler.update(delta_time);
	}

	// remove enemies
	queued_entities_for_removal.forEach(id => {
		delete entities[id];
	})
	queued_entities_for_removal = [];

	// spawn enemies
	if (enemy_spawner != null) {
		enemy_spawner.update(delta_time);
	}

	// allow the player to restart when dead
	if (player.isDead() && player.controller.action_1) {
		start();
	}
	
}

/**
 * This function draws the state of the world to the canvas.
 * 
 * @param {CanvasRenderingContext2D} graphics The current graphics context.
 */
function draw(graphics) {
	// default font config
	graphics.font = "10px Arial";
	graphics.textAlign = "left";

	// draw background (this clears the screen for the next frame)
	graphics.fillStyle = '#FFFFFF';
	graphics.fillRect(0, 0, config.canvas_size.width, config.canvas_size.height);

	// for loop over every eneity and draw them
	Object.values(entities).forEach(entity => {
		entity.draw(graphics);
	});

	// game over screen
	if (player.isDead()) {
		//calculates player score
		playerScore =  Math.floor(30 * enemiesHit + player.timeAlive);
		//fills background
		graphics.fillStyle = '#91AEE1';
		graphics.fillRect(0, 0, config.canvas_size.width, config.canvas_size.height);
		//game over message
		graphics.font = "30px Arial";
		graphics.textAlign = "center";
		graphics.fillStyle = "#000000";
		graphics.fillText('Game Over', config.canvas_size.width / 2, config.canvas_size.height / 2);
		

		graphics.font = "12px Arial";
		graphics.textAlign = "center";
		graphics.fillText('press space to restart', config.canvas_size.width / 2, 18 + config.canvas_size.height / 2);
		
		//player stats box
		graphics.font = "12px Arial";
		graphics.textAlign = "center";
		graphics.fillText('Final Stats', config.canvas_size.width / 2, 40 + config.canvas_size.height / 2);
		graphics.fillText('Enemies Hit: ' + enemiesHit, config.canvas_size.width / 2, 55 + config.canvas_size.height / 2);
		graphics.fillText('Time Alive: ' + player.timeAlive, config.canvas_size.width / 2, 70 + config.canvas_size.height / 2);
		graphics.fillText('Enemies Spawned: ' + totalEnemiesSpawned, config.canvas_size.width / 2, 85 + config.canvas_size.height / 2);
		graphics.fillText('Score: ' + playerScore, config.canvas_size.width / 2, 100 + config.canvas_size.height / 2);
		
	}
}

/**
 * This is the main driver of the game. This is called by the window requestAnimationFrame event.
 * This function calls the update and draw methods at static intervals. That means regardless of
 * how much time passed since the last time this function was called by the window the delta time
 * passed to the draw and update functions will be stable.
 * 
 * @param {Number} curr_time Current time in milliseconds
 */
function loop(curr_time) {
	// convert time to seconds
	curr_time /= 1000;

	// edge case on first loop
	if (last_time == null) {
		last_time = curr_time;
	}

	var delta_time = curr_time - last_time;

	// this allows us to make stable steps in our update functions
	while (delta_time > config.update_rate.seconds) {
		update(config.update_rate.seconds);
		draw(graphics);

		delta_time -= config.update_rate.seconds;
		last_time = curr_time;
		loop_count++;

		game_state.innerHTML = `loop count ${loop_count}`;
	}

	window.requestAnimationFrame(loop);
}

function start() {
	entities = [];
	queued_entities_for_removal = [];
	player = new Player();
	
	enemy_spawner = new enemySpawner();
	// collision_handler = your implementation
}

// start the game
start();

// start the loop
window.requestAnimationFrame(loop);