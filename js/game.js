// Ideas:
// Start with nothing but a completely white
// Then fade to black when you touch it 
// Audio discouraging you from touching it, don't touch it, seriously just dont

// Blocks rotating colour to make it trippy, otherwise all the same
// Different blocks have different patterns, colour coded by patterns

// Rediculous scoring system, goes up so fast it feels like you are really winning

var game = new Phaser.Game(1024, 768, Phaser.AUTO, 'game');
var person;
var black = "#000000";
var white = "#FCFCFC";
var gameState = true;
var gameText = 'You will lose';

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
    var scoreStyle = {
      font: "300px Arial",
      fill: "#808080",
      align: "center",
      shadowColor: "#666666",
      shadowBlur: 24
    };
      var labelStyle = {
      font: "120px Arial",
      fill: "#808080",
      align: "center",
      shadowColor: "#666666",
      shadowBlur: 24
    };
    this.gameMessageText = this.add.text(this.game.world.centerX, (game.world.centerY - 300) , '', labelStyle);
    this.gameMessageText.anchor.setTo(0.5, 0);

    this.labelScore = game.add.text(game.world.centerX, game.world.centerY, gameText,  scoreStyle);
    this.labelScore.anchor.set(0.5);

    this.person = game.add.sprite(700, 210, 'pointer');
    game.debug.geom(this.person, '#CFFFFF');

    game.physics.enable(this.person, Phaser.Physics.ARCADE);
    this.person.inputEnabled = true;
    this.person.input.enableDrag(true);
    this.person.body.collideWorldBounds = true;
    this.person.body.bounce.setTo(1, 1);

    this.baddies = game.add.group();
    this.baddies.enableBody = true;
    this.baddies.createMultiple(36, 'stageOneBlock');

    this.score = 0;
    this.initialSpawnRate = 1600;
    this.spawner = game.time.events.loop(this.initialSpawnRate, this.addBaddy, this);
    this.timer = game.time.events.loop(1000, this.tick, this);
  },


  update: function () {
    //follow mouse pointer offset by 5 to center it
    this.person.x = game.input.x - this.person.width / 2;
    this.person.y = game.input.y - this.person.height / 2;
    if(gameState == true){
      if (game.input.mousePointer.isDown) {
          gameText = "";
          this.runningGame();
      } else {
          this.stoppingGame();
      }
    }else{
      this.gameOver();
    }

    this.gameMessageText.text = gameText;

    game.physics.arcade.overlap(this.person, this.baddies, this.hit, null, this);
  },

  hit: function () {
    this.spawner.delay = this.initialSpawnRate;
    gameState = false;
    game.input.reset();
  },

  tick: function () {
    var minimum = 200;
    if (this.spawner.delay > minimum) {
      var scaler = (this.spawner.delay - minimum) / (this.initialSpawnRate - minimum);
      this.spawner.delay -= Math.floor(Math.random() * (5 + 15 * scaler) + 5 + 25 * scaler);
    }
  },

  resetGame: function () {
    gameText = "Give up..";
    game.state.start('main');
  },

  stoppingGame: function () {
    game.stage.backgroundColor = white;
    this.person.visible = false;
    this.baddies.visible = false;
    //making baddies dissapear currently, not removing properly
  },

  runningGame: function () {
    this.person.visible = true;
    this.baddies.visible = true;
    game.stage.backgroundColor = black;
    this.score += 1;
    this.labelScore.text = this.score;
  },

    gameOver: function () {
             //add text
        game.stage.backgroundColor = black;

        gameText = "GAMEOVER!";
        this.baddies.visible = false;
        if(game.input.mousePointer.isDown){
          gameState = true;
          this.resetGame();
        }
        //add a click handler
    },



  addBaddy: function () {
    // Get the first dead pipe of our group
    var baddy = this.baddies.getFirstDead();
    if (!baddy) {
      return;
    }

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
    var spread = 36;
    var scale = Math.floor(Math.pow(this.score / 40.0, 1.25));
    var actual = 200 + scale;
    var offset = Math.floor(Math.random() * spread - spread / 2);
    baddy.body.velocity.x = actual * side[4] + offset * side[5];
    baddy.body.velocity.y = actual * side[5] + offset * side[4];

    // Kill the baddy when it's no longer visible
    baddy.checkWorldBounds = true;
    baddy.outOfBoundsKill = true;
  }
};

game.state.add('main', mainState);
game.state.start('main');