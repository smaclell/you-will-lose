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
var music;
var thud;

var gameoverImg;
var tileBackground;
var bgt,got;
// Create our 'main' state that will contain the game
var mainState = {

  preload: function () {
    game.stage.backgroundColor = white;
    game.load.audio('song1', ['assets/music/AttackOnShadow.mp3']);
    game.load.audio('thud', ['assets/sounds/thud.wav']);
    game.load.image('pointer', 'assets/sprites/pointer.png');
    game.load.image('stageOneBlock', 'assets/sprites/stageOneBlock.png');
    game.load.image('gameover', 'assets/sprites/gameover.png');
    game.load.image('backgroundBlack', 'assets/sprites/backgroundBlack.png');
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
    thud = game.add.audio('thud');
    if( !music ) {
      music = game.add.audio('song1');
      music.play();
    } else {
      music.restart();
    }

    tileBackground = game.add.tileSprite(0, 0, 1024, 768, 'backgroundBlack');
    tileBackground.alpha = 0;

    gameoverImg = game.add.sprite(game.world.centerX / 2.5, game.world.centerY - 300, 'gameover');
    gameoverImg.alpha = 0;

    this.gameMessageText = this.add.text(this.game.world.centerX, (game.world.centerY - 300) , '', labelStyle);
    this.gameMessageText.anchor.setTo(0.5, 0);

    var initialScoreText = this.score !== undefined ? this.score : '';
    this.labelScore = game.add.text(game.world.centerX, game.world.centerY, initialScoreText,  scoreStyle);
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
    this.person.x = game.input.x - this.person.width / 2;
    this.person.y = game.input.y - this.person.height / 2;
    if(gameState == true){
      if (game.input.mousePointer.isDown) {
          this.inputDown();
      } else {
          this.inputUp();
      }
    }else{
      this.gameOver();
    }

    this.gameMessageText.text = gameText;
    game.input.onDown.add(this.thudSound, this);
    game.physics.arcade.overlap(this.person, this.baddies, this.hit, null, this);
  },

  hit: function () {
    music.pause();
    music.stop();
    this.spawner.delay = this.initialSpawnRate;
    gameState = false;
    game.input.reset();

    gameText = "";
    //show gameover message
    game.add.tween(gameoverImg).to({alpha: 1}, 500, Phaser.Easing.Linear.None, true);
    game.add.tween(tileBackground).to({alpha: 0}, 250, Phaser.Easing.Linear.None, true);
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

  inputUp: function () {
    tileBackground.alpha = 0;
    this.person.visible = false;
    this.baddies.visible = false;
  },

  inputDown: function () {
    this.person.visible = true;
    this.baddies.visible = true;
    tileBackground.alpha = 1;
    gameText = "";
    this.score += 1;
    this.labelScore.text = this.score;
  },

  thudSound: function(){
    thud.play();
  },

  gameOver: function () {
      //game.stage.backgroundColor = black;
      //gameText = "GAMEOVER!";
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
      [0, game.world.width, 0, 0, 0, 1],
      [0, game.world.width, game.world.height, game.world.height, 0, -1],
      [0, 0, 0, game.world.height, 1, 0],
      [game.world.width, game.world.width, 0, game.world.height, -1, 0]
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