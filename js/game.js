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
var thud;
var gameoverImg;
var muteMusic;
var tileBackground;

//heckle array
var heckle = [
  "Give up...",
  "Please stop...",
  "This is humiliating",
  "I hurt for you",
  "Try something new",
  "Why bother",
  "-_-",
  "Sadness",
  "Boooo..."
];

var mainState = {

  preload: function () {
    game.stage.backgroundColor = white;
    game.load.audio('song1', ['assets/music/AttackOnShadow.mp3']);
    game.load.audio('thud', ['assets/sounds/thud.wav']);
    game.load.image('pointer', 'assets/sprites/pointer.png');
    game.load.image('stageOneBlock', 'assets/sprites/stageOneBlock.png');
    game.load.image('backgroundBlack', 'assets/sprites/backgroundBlack.png');

    //fps
    game.time.advancedTiming = true;
  },

  create: function () {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    thud = game.add.audio('thud');

    music = game.add.audio('song1');
    
    var muteKey;
    muteKey = game.input.keyboard.addKey(Phaser.Keyboard.M);
    muteKey.onDown.add(this.muteMusic,this);
    tileBackground = game.add.tileSprite(0, 0, 1024, 768, 'backgroundBlack');
    tileBackground.alpha = 0;

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
    var creditsStyle = {
      font: "36px Arial",
      fill: "#808080",
      align: "center",
      shadowColor: "#666666",
      shadowBlur: 6
    };

    this.gameMessageText = this.add.text(this.game.world.centerX, (game.world.centerY - 300), 'You will lose', labelStyle);
    this.gameMessageText.anchor.setTo(0.5, 0);

    this.labelScore = game.add.text(game.world.centerX, game.world.centerY, '',  scoreStyle);
    this.labelScore.anchor.set(0.5);

    this.creditsText = game.add.text(game.world.centerX, game.world.height * 0.9, 'Paul Heinrichs + Scott MacLellan',  creditsStyle);
    this.creditsText.anchor.set(0.5, 0);

    this.person = game.add.sprite(700, 210, 'pointer');
    game.debug.geom(this.person, '#CFFFFF');

    game.physics.enable(this.person, Phaser.Physics.ARCADE);
    this.person.inputEnabled = true;
    this.person.input.enableDrag(true);
    this.person.body.collideWorldBounds = true;
    this.person.body.bounce.setTo(1, 1);

    this.sides = [
      [0, game.world.width, 0, 0, 0, 1],
      [0, game.world.width, game.world.height, game.world.height, 0, -1],
      [0, 0, 0, game.world.height, 1, 0],
      [game.world.width, game.world.width, 0, game.world.height, -1, 0]
    ];

    //fade to game tween
    this.startgameTween = game.add.tween(tileBackground).to({alpha: 1}, 500, Phaser.Easing.Linear.None, false);
    //fade to gameover tween
    this.backgroundTween = game.add.tween(tileBackground).to({alpha: 0}, 500, Phaser.Easing.Linear.None, false);

    this.initialSpawnRate = 1600;
    this.spawner = game.time.events.loop(this.initialSpawnRate, this.addBaddy, this);
    this.timer = game.time.events.loop(1000, this.tick, this);
    game.time.events.pause();

    var overall = this;
    game.input.onDown.add(function () {
      overall.thudSound();
      if (overall.state.onDown) {
        overall.state.onDown();
      }
    });

    game.input.onUp.add(function () {
      if (overall.state.onUp) {
        overall.state.onUp();
      }
    });

    $.each(this.states, function (s, state) {
      console.log("Binding " + s);
      $.each(state, function (m, method) {
        state.name = s;
        state[m] = method.bind(overall);
      });
    });

    this.changeState(this.states.title);
  },

  changeState: function (nextState) {
    console.log(this.state.name + " to " + nextState.name);
    this.state = nextState;
    if (nextState.onStart) {
      nextState.onStart();
    }
    console.log("Switched to " + nextState.name);
  },

  states: {
    title: {
      onDown: function () {
        game.time.events.resume();
        this.changeState(this.states.begin);
      }
    },

    begin: {
      onStart: function () {
        this.startgameTween.start();

        music.restart();
        if (this.creditsText !== null) {
          this.creditsText.destroy();
          this.creditsText = null;
        }

        this.score = 0;
        this.labelScore.text = '';
        this.initialSpawnRate = 1600;

        this.baddies = game.add.group();
        this.baddies.enableBody = true;
        this.baddies.createMultiple(36, 'stageOneBlock');

        this.gameMessageText.text = "";
        music.volume = 0.3;
        this.changeState(this.states.playing);
      }
    },

    playing: {
      onStart: function () {
        this.person.visible = true;
        this.baddies.visible = true;

        this.backgroundTween.stop();
        this.startgameTween.stop();
      },
      onUpdate: function () {
        var hit = game.physics.arcade.overlap(this.person, this.baddies);
        if (hit) {
          this.changeState(this.states.gameOver);
        }
      },
      onUp: function () {
        this.changeState(this.states.paused);
      }
    },

    paused: {
      onStart: function () {
        tileBackground.alpha = 0;
        this.backgroundTween.start();
        this.person.visible = false;
        this.baddies.visible = false;
      },
      onDown: function () {
        this.startgameTween.start();
        this.changeState(this.states.playing);
      }
    },

    gameOver: {
      onStart: function () {
        this.baddies.visible = false;
        this.backgroundTween.start();
        music.pause();
        music.stop();
        this.spawner.delay = this.initialSpawnRate;
        this.changeState(this.states.giveUp);
      },

      onDown: function () {
        this.changeState(this.states.begin);
      }
    },

    giveUp: {
      onStart: function () {
        //select and display heckle
        var index = Math.floor(Math.random() * heckle.length);
        var select = heckle[index];
        this.gameMessageText.text = select;
      },

      onDown: function () {
        this.changeState(this.states.begin);
      }
    }
  },

  update: function () {
    this.person.x = game.input.x - this.person.width / 2;
    this.person.y = game.input.y - this.person.height / 2;
    if (this.state.onUpdate) {
      this.state.onUpdate();
    }
    //update fps
    game.debug.text(game.time.fps || '--', 2, 14, "#00ff00");
  },

  tick: function () {
    var minimum = 200;
    if (this.spawner.delay > minimum) {
      var scaler = (this.spawner.delay - minimum) / (this.initialSpawnRate - minimum);
      this.spawner.delay -= Math.floor(Math.random() * (5 + 15 * scaler) + 5 + 25 * scaler);
    }
  },

  thudSound: function () {
    thud.play();
  },

  muteMusic: function(key){
    if(music.volume > 0){
      music.volume = 0;
    }else{
      music.volume = 0.3;
    }
  },

  addBaddy: function () {
    // Get the first dead pipe of our group
    var baddy = this.baddies.getFirstDead();
    if (!baddy) {
      return;
    }

    if (this.baddies.visible) {
      this.score += 1;
      this.labelScore.text = this.score;
    }

    var side = this.sides[Math.floor(Math.random() * 4)];

    var x = game.rnd.integerInRange(side[0], side[1]);
    var y = game.rnd.integerInRange(side[2], side[3]);
    baddy.reset(x, y);

    // Add velocity to the baddy to make it move left
    var spread = 36;
    var scale = Math.floor(Math.pow(this.score, 1.10));
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