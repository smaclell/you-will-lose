// Ideas:
// Start with nothing but a completely white
// Then fade to black when you touch it 
// Audio discouraging you from touching it, don't touch it, seriously just dont

// Blocks rotating colour to make it trippy, otherwise all the same
// Different blocks have different patterns, colour coded by patterns

// Rediculous scoring system, goes up so fast it feels like you are really winning

// Initialize Phaser, and create a 400x490px game
var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game');

var person;

// Create our 'main' state that will contain the game
var mainState = {

    preload: function() { 
        // This function will be executed at the beginning     
        // That's where we load the game's assets  
        game.stage.backgroundColor = '#A9A9A9'
        game.load.image('mushroom', 'assets/sprites/mushroom.png');
        game.load.image('yellow', 'assets/sprites/bird.png');
    
    },

    create: function() { 
        game.physics.startSystem(Phaser.Physics.ARCADE);

        this.person = game.add.sprite(700, 210, 'mushroom');
        game.debug.geom(this.person,'#cfffff');

        game.physics.enable(this.person, Phaser.Physics.ARCADE);
        this.person.inputEnabled = true;
        this.person.input.enableDrag(true);
        this.person.body.collideWorldBounds = true;
        this.person.body.bounce.setTo(1, 1);
        
        this.baddies = game.add.group(); // Create a group  
        this.baddies.enableBody = true;  // Add physics to the group  
        this.baddies.createMultiple(50, 'yellow'); // Create 20 pipes

        // This function is called after the preload function     
        // Here we set up the game, display sprites, etc.

        this.score = 0;  
        this.labelScore = game.add.text(20, 10, "0", { font: "30px Arial", fill: "#ffffff" });
        this.duration = 0;  
        this.labelDuration = game.add.text(20, 50, "0", { font: "30px Arial", fill: "#ffffff" });

        this.timer = game.time.events.loop(1000, this.tick, this);
    },

    update: function() {
        // This function is called 60 times per second    
        // It contains the game's logic
        this.score += 1;
        this.labelScore.text = this.score;

        game.physics.arcade.overlap(this.person, this.baddies, this.hit, null, this);
    },

    hit: function() {
        this.score -= 1;
        this.labelScore.text = this.score;
    },

    tick: function() {
        this.addBaddy();
        this.duration += 1;
        this.labelDuration.text = this.duration;
    },

    addBaddy: function() {
        // Get the first dead pipe of our group
        var baddy = this.baddies.getFirstDead();

        // Set the new position of the baddy
        var sides = [
            [0,800,0,0,0,1],
            [0,800,600,600,0,-1],
            [0,0,0,600,1,0],
            [800,800,0,600,-1,0]
        ];

        var side = sides[Math.floor(Math.random() * 4)];

        var x = game.rnd.integerInRange(side[0], side[1]);
        var y = game.rnd.integerInRange(side[2], side[3]);
        baddy.reset(x, y);

        // Add velocity to the baddy to make it move left
        var actual = 200 + Math.floor(this.score / 50)^2;
        var offset = Math.floor(Math.random() * 24 ) - 12;
        baddy.body.velocity.x = actual*side[4] + offset*side[5];
        baddy.body.velocity.y = actual*side[5] + offset*side[4];

        // Kill the baddy when it's no longer visible 
        baddy.checkWorldBounds = true;
        baddy.outOfBoundsKill = true;
    }
};

// Add and start the 'main' state to start the game
game.state.add('main', mainState);  
game.state.start('main');  