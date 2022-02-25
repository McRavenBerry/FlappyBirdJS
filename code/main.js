// Tutorial: https://www.youtube.com/watch?v=hgReGsh5xVU

import kaboom from "kaboom";

// initialize context
kaboom({
    width: 800,
    height: 500,
    font: "sinko",
});

// load assets
loadSprite("birdAnim", "sprites/birdAnim.png", {
    sliceX: 2,
    sliceY: 1,
    anims: {
        down: {
            from: 0,
            to: 0
        },
        up: {
            from: 1,
            to: 1
        },
        flapping: {
            from: 0,
            to: 1
        },
    },
})
loadSprite("bg", "sprites/bg.png");
loadSprite("pipe", "sprites/pipe.png");
loadSprite("bird", "sprites/bird.png");
loadSound("wooosh", "sounds/wooosh.mp3");
loadSound("score", "sounds/score.mp3");
loadSound("off", "sounds/off.mp3");
loadSound("mystic", "sounds/mystic.mp3");
loadSound("bgmusic", "sounds/Tipple Chipper.wav");

var highScore = 0;
var img;

const music = play("bgmusic", {
    volume: 0.6,
    loop: true
})

music.play()

scene("start", () => {
    add([
        sprite("bg", {width: width(), height: height()}), 
    ])
    add([
        text("Flying Bird", {size: 80}),
        origin("center"),
        pos(width()/2, height()/2 - 100),
        
    ])
    add([
        text("Press 'space' to start", {size: 24}),
        origin("center"),
        pos(center())
    ])
    add([
        sprite("bird"),
        origin("center"),
        scale(3),
        pos(width()/2, height()/2 + 100)
    ])

    keyPress("space", () => {
        play("mystic")
        wait(0.5, () => {
            go("game"); 
        });
    });
})

scene("game", () => {

    var score = 0;
    
    add([
        sprite("bg", {width: width(), height: height()}), 
    ]);
    
    function spawnPipes(){
        const pipeGap = 40 + rand(20, 70);
        const offset = rand(0, 100)
        const pipeY = rand(100, height()/2 + offset)
        add([
            sprite("pipe"),
            scale(3, 4),
            area(),
            pos(width(), pipeY + pipeGap),
            "pipe",
            {passed: false},
        ]);

        add([
            sprite("pipe", {flipY: true}),
            scale(3, 4),
            area(),
            pos(width(), pipeY - pipeGap),
            origin("botleft"),
            "pipe",
        ]);
    }

    loop(1.5, () => {
        spawnPipes();
    });
    
    // moves pipes
    action("pipe", (pipe) => {
        pipe.move(-160, 0);

        if (pipe.passed == false && pipe.pos.x < player.pos.x) {
            play("score");
            pipe.passed = true;
            score++;
            scoreText.text = score;
        }
        // debug.log(score);
    });

    const scoreText = add([
        pos(10, 10),
        text(score, {size: 50}),
        {z: 100}
    ]);
    
    // add a character to screen
    const player = add([
    	// list of components
    	sprite("birdAnim"),
    	pos(80, 40),
    	area(),
        body(),
        "player",
    ]);
    
    // collision with pipes
    player.onCollide("pipe", () => {
        img = screenshot();
        loadSprite("gm", img);
        play("off");
        go("gameover", score);
        
    });

    // ends game if player leaves the screen
    player.onUpdate(() => {
        if (player.pos.y > height() + 30 || player.pos.y < -30) {
            img = screenshot();
            loadSprite("gm", img);
            play("off");
            go("gameover", score);
        }
    });
    
    // flap those wings
    keyPress("space", () => {
        play("wooosh");
        player.play("up");
        player.jump(500);
        wait(0.3, () => {
            player.play("down")
        })
    })
});

scene("gameover", (score) => {
    if (score > highScore) {
        highScore = score;    
    };
    
    add([
        sprite("gm"),
        text("Game Over!\n" +
            "Score: " + score +
            "\nHigh Score: " + highScore, {size: 50}),
        origin("center"),
        pos(center())
    ]);
        add([
        text("Press 'space' to play again", {size: 24}),
        origin("center"),
        pos(width()/2, height()/2 + 120)
    ])

    keyPress("space", () => {
        play("mystic")
        wait(0.5, () => {
            go("game"); 
        });
    });
});

go("start");