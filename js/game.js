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
var black = "#000000";
var white = "F0FFFF";
var startGame = false;

// Create our 'main' state that will contain the game
var mainState = {

  preload: function () {
    game.stage.backgroundColor = '#A9A9A9';
    game.load.audio('song1', ['assets/music/AttackOnShadow.mp3']);
    game.load.image('pointer', 'assets/sprites/pointer.png');
    game.load.image('stageOneBlock', 'assets/sprites/stageOneBlock.png');
  },

  create: function () {
    game.physics.startSystem(Phaser.Physics.ARCADE);

    this.person = game.add.sprite(700, 210, 'pointer');
    game.debug.geom(this.person, '#CFFFFF');

    game.physics.enable(this.person, Phaser.Physics.ARCADE);
    this.person.inputEnabled = true;
    this.person.input.enableDrag(true);
    this.person.body.collideWorldBounds = true;
    this.person.body.bounce.setTo(1, 1);

    this.baddies = game.add.group();
    this.baddies.enableBody = true;
    this.baddies.createMultiple(50, 'stageOneBlock');

    var scoreStyle = {
      font: "300px Arial",
      fill: "#808080",
      align: "center",
      shadowColor: "#666666",
      shadowBlur: 24
    };

    this.labelScore = game.add.text(game.world.centerX, game.world.centerY, "0", scoreStyle);
    this.labelScore.anchor.set(0.5);

    this.score = 0;

    this.timer = game.time.events.loop(1000, this.tick, this);
  },


  update: function () {
    //follow mouse pointer offset by 5 to center it
    this.person.x = game.input.x - this.person.width / 2;
    this.person.y = game.input.y - this.person.height / 2;

    if (game.input.mousePointer.isDown) {
      this.runningGame();
    } else {
      this.stoppingGame();
    }

    this.labelScore.text = this.score;
    game.physics.arcade.overlap(this.person, this.baddies, this.hit, null, this);
  },

  hit: function () {
    startGame = false;
    this.resetGame();
    //this.timer.destroy();
  },

  tick: function () {
    this.addBaddy();
  },

  resetGame: function () {
    game.state.start('main');
  },

  stoppingGame: function () {
    startGame = false;
    game.stage.backgroundColor = white;
    this.person.visible = false;
    this.baddies.visible = false;
    //making baddies dissapear currently, not removing properly
  },

  runningGame: function () {
    startGame = true;
    this.person.visible = true;
    this.baddies.visible = true;
    game.stage.backgroundColor = black;
    this.score += 1;
    this.labelScore.text = this.score;
  },

  addBaddy: function () {
    // Get the first dead pipe of our group
    var baddy = this.baddies.getFirstDead();

    // Set the new position of the baddy
    var sides = [
      [0, 800, 0, 0, 0, 1],
      [0, 800, 600, 600, 0, -1],
      [0, 0, 0, 600, 1, 0],
      [800, 800, 0, 600, -1, 0]
    ];

    var side = sides[Math.floor(Math.random() * 4)];

    var x = game.rnd.integerInRange(side[0], side[1]);
    var y = game.rnd.integerInRange(side[2], side[3]);
    baddy.reset(x, y);

    // Add velocity to the baddy to make it move left
    var scale = Math.floor(this.score / 50);
    var actual = 200 + scale * scale;
    var offset = Math.floor(Math.random() * 24) - 12;
    baddy.body.velocity.x = actual * side[4] + offset * side[5];
    baddy.body.velocity.y = actual * side[5] + offset * side[4];

    // Kill the baddy when it's no longer visible
    baddy.checkWorldBounds = true;
    baddy.outOfBoundsKill = true;
  }
};

game.state.add('main', mainState);
game.state.start('main');