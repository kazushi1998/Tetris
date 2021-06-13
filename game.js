(function () {
    const canvas = document.getElementById("tetris");   // make canvas
    const context = canvas.getContext("2d");
    context.scale(40, 40); // scale the size of a square to fit the canvas size

    let gameLoop; // interval of the loop
    let gameRun = false;

    // Source: https://github.com/Silinator/3dTetris/tree/master/img
    const colors = [ // different colored svg squares
        null, // index 0 are the vacant squares, which shouldn't be colored
        "cube_images/cube_blue.svg",
        "cube_images/cube_cyan.svg",
        "cube_images/cube_green.svg",
        "cube_images/cube_orange.svg",
        "cube_images/cube_purple.svg",
        "cube_images/cube_red.svg",
        "cube_images/cube_yellow.svg"
    ];

    const tetrominoes = [ // the whole tetrominoes
        "tetromino_images/I-prev.svg",
        "tetromino_images/J-prev.svg",
        "tetromino_images/L-prev.svg",
        "tetromino_images/O-prev.svg",
        "tetromino_images/S-prev.svg",
        "tetromino_images/T-prev.svg",
        "tetromino_images/Z-prev.svg",
    ];

    const tetromino = { // playable tetromino
        pos: {x: 0, y: 0},
        matrix: null, // shape of the tetromino (array)
        score: 0
    };

    var audio = new Audio(); // preload the beep sound so it is synced with the elimination
    audio.src = "sounds/beeps.wav";
    audio.preload = 'auto';
    audio.volume = 0.1;

    var gameover = false

    let makeMatrix = function (w, h) { // makes the matrix for the playfield
        const matrix = new Array(h); // playfield height
        for (var i = 0; i < matrix.length; i++) {
            matrix[i] = new Array(w); // adding array of width, creating a multidimensional array
        }
        return matrix;
    };

    const area = makeMatrix(10, 20);

    // Inspiration for Tetris algorithms: https://www.youtube.com/watch?v=HEsAr2Yt2do

    let createTetromino = function (tetrominoType) { // the different shapes of the tetrominoes, displayed as multidimensional arrays
        if (tetrominoType === "t") {
            return [
                [0, 0, 0],
                [5, 5, 5],
                [0, 5, 0]
            ];
        } else if (tetrominoType === "o") {
            return [
                [7, 7],
                [7, 7]
            ];
        } else if (tetrominoType === "l") {
            return [
                [0, 4, 0],
                [0, 4, 0],
                [0, 4, 4]
            ];
        } else if (tetrominoType === "j") {
            return [
                [0, 1, 0],
                [0, 1, 0],
                [1, 1, 0]
            ];
        } else if (tetrominoType === "i") {
            return [
                [0, 2, 0, 0],
                [0, 2, 0, 0],
                [0, 2, 0, 0],
                [0, 2, 0, 0]
            ];
        } else if (tetrominoType === "s") {
            return [
                [0, 3, 3],
                [3, 3, 0],
                [0, 0, 0]
            ];
        } else if (tetrominoType === "z") {
            return [
                [6, 6, 0],
                [0, 6, 6],
                [0, 0, 0]
            ];
        }
    };

    // https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Statements/label#verwenden_eines_continue_mit_labels_in_for-schleifen
    let points = function () {
        let points = 100;
        row:for (let y = area.length - 1; y > 0; y--) {
            for (let x = 0; x < area[y].length; x++) {
                console.log(x + ' ' + y);
                if (area[y][x] === 0) { // when the first 0 is found in a row it will directly skip to the next row, by using the label on our for loop
                    continue row;
                }
            }
            audio.play(); // play beep sound while eliminating column
            // https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Array/splice
            const row = area.splice(y, 1)[0]; // deleting the row
            for (var i = 0; i < row.length; i++) {  // filling in the deleted row with 0
                row[i] = 0;
            }
            area.unshift(row); // pass the deleted row to the top of our playfield array
            y++;
            tetromino.score += points;
            points = points * 2; // every bonus row will be multiplied
        }
    }

    let collide = function (area, tetromino) { // checks if there is a collision
        for (let y = 0; y < tetromino.matrix.length; y++) {
            for (let x = 0; x < tetromino.matrix.length; x++) {
                if (tetromino.matrix[y][x] !== 0 && // checks if the current position in the square of the tetromino array isn't empty
                    (area[y + tetromino.pos.y] && area[y + tetromino.pos.y][x + tetromino.pos.x]) !== 0) { // checks if the current position isn't empty
                    return true;
                }
            }
        }
        return false;
    };

    let drawMatrix = function (matrix, offset) { // draws the actual tetromino
        for (var i = 0; i < matrix.length; i++) {
            for (var j = 0; j < matrix[i].length; j++) {
                if (matrix[i][j] !== 0) { // checks the squares that need to be filled with a color-IMG
                    let imgTag = document.createElement("IMG");
                    imgTag.src = colors[matrix[i][j]];
                    context.drawImage(imgTag, j + offset.x, i + offset.y, 1, 1);
                }
            }
        }
    };

    let merge = function (area, tetromino) { // transfers the collided tetrominoes to the playfield matrix
        for (var i = 0; i < tetromino.matrix.length; i++) {
            for (var j = 0; j < tetromino.matrix[i].length; j++) {
                if (tetromino.matrix[i][j] !== 0) {
                    area[i + tetromino.pos.y][j + tetromino.pos.x] = tetromino.matrix[i][j];
                }
            }
        }
    };

    let rotate = function (matrix, dir) { // mirror the tetromino vertically
        for (let y = 0; y < matrix.length; y++) {
            for (let x = 0; x < y; x++) {
                var point = matrix[x][y]; // https://michael-karen.medium.com/learning-modern-javascript-with-tetris-92d532bcd057
                matrix[x][y] = matrix[y][x];
                matrix[y][x] = point;
            }
        }
        if (dir > 0) {
            matrix.forEach(row => row.reverse()); // mirror the teromino horizontally https://stackoverflow.com/questions/8247386/how-can-i-mirror-a-multidimmensional-array-in-javascript
        } else {
            matrix.reverse();
        }
    };

    let tetrominoReset = function (firstType, first) {
        while (first === true) {    // check if it is the first tetrominoType and use it
            randomtype = firstType;
            first = false;
            console.log(randomtype);
        }
        tetromino.matrix = createTetromino(randomtype);
        tetromino.pos.y = 0;
        tetromino.pos.x = (Math.floor(area[0].length / 2)) - (Math.floor(tetromino.matrix[0].length / 2));
        randomtype = randomType(); // set the next tetrominoType
        console.log(randomtype);
        nextTetromino(randomtype); // pass on the nextType for the preview of Types
        if (tetromino.score >= 100) {   // next Level with setting interval to minimum of 4ms
            document.getElementById("level").innerHTML = "2";
            gameLoop = setInterval(interval, 4);
            console.log(tetromino.score);
        }
        if (collide(area, tetromino)) { // checks if there is a collision when spawning the next tetromino
            for (var i = 0; i < area.length; i++) {
                for (var j = 0; j < area[i].length; j++) {
                    area[i][j] = 0;
                }
            }
            gameRun = false;
        }
    };

    let randomType = function () { // function for getting random tetrominoTypes
        const tetrominoes = "ijlostz";
        random = tetrominoes[Math.floor(Math.random() * tetrominoes.length)];
        return random;
    }

    let nextTetromino = function (type) { // function for setting the preview of the next tetrominoType
        if (type === "i") {
            document.getElementById("nextTetromino").src = tetrominoes[0];
        } else if (type === "j") {
            document.getElementById("nextTetromino").src = tetrominoes[1];
        } else if (type === "l") {
            document.getElementById("nextTetromino").src = tetrominoes[2];
        } else if (type === "o") {
            document.getElementById("nextTetromino").src = tetrominoes[3];
        } else if (type === "s") {
            document.getElementById("nextTetromino").src = tetrominoes[4];
        } else if (type === "t") {
            document.getElementById("nextTetromino").src = tetrominoes[5];
        } else if (type === "z") {
            document.getElementById("nextTetromino").src = tetrominoes[6];
        }
    };

    let tetrominoDrop = function () {
        tetromino.pos.y++;
        if (collide(area, tetromino)) {
            tetromino.pos.y--;
            merge(area, tetromino);
            points();
            tetrominoReset();
            updateScore();
        }
    };

    let tetrominoMove = function (dir) {
        tetromino.pos.x += dir;
        if (collide(area, tetromino)) {
            tetromino.pos.x -= dir;
        }
    };

    let tetrominoRotate = function (dir) {
        const pos = tetromino.pos.x;
        let offset = 1;
        rotate(tetromino.matrix, dir);
        while (collide(area, tetromino)) { // checking if a tetromino glitches out of the playfield or into another tetromino while rotating
            tetromino.pos.x += offset; // https://youtu.be/HEsAr2Yt2do wallkick mechanic
            if (offset > 0) { // check on which side the collision happened
                offset = -(offset + 1);
            } else {
                offset = -(offset - 1);
            }
            if (offset > tetromino.matrix[0].length) {
                rotate(tetromino.matrix, -dir);
                tetromino.pos.x = pos;
                return;
            }
        }
    };

    let draw = function () {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "#000000";
        context.fillRect(0, 0, canvas.width, canvas.height);
        updateScore();
        drawMatrix(area, {x: 0, y: 0});
        drawMatrix(tetromino.matrix, tetromino.pos);
    };

    let dropInter = 100;
    let time = 0;
    let update = function () {
        time++;
        if (time >= dropInter) {
            tetrominoDrop();
            time = 0;
        }
        draw();
    };

    let updateScore = function () {
        document.getElementById("score").innerHTML = tetromino.score; // pass the score to the html
    };

    let gameOver = function () {
        document.getElementById("level").innerHTML = "1";
        tetromino.score = 0;
        context.fillStyle = "#000000";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.font = "1.5px Arial";
        context.fillStyle = "#ffffff";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText("Game Over", (canvas.width / 40) / 2, (canvas.width / 20) / 2);
        context.font = "1px Arial";
        context.fillStyle = "#ffffff";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText("hold ESC to restart", (canvas.width / 40) / 2, (canvas.width / 17) / 2);
        gameover = true; // for disabling other buttons that will create a bug
        document.getElementById("startContainer").style.display = "none";
    };

    document.addEventListener('keydown', function (e) {
        if ((e.keyCode === 13 || e.keyCode === 32) && gameRun === false && gameover === false) { // 13 = enter
            start();
        } else if
        (e.keyCode === 37) { // 37 = left
            tetrominoMove(-1);
        } else if (e.keyCode === 39) { // 39 = right
            tetrominoMove(+1);
        } else if (e.keyCode === 40) { // 40 = down
            if (gameRun) {
                tetrominoDrop();
            }
        } else if ((e.keyCode === 38 || e.keyCode === 32) && gameRun === true) { // 38 = up && 32 = spacebar
            tetrominoRotate(-1);
        } else if (e.keyCode === 27) { // 27 = escape
            location.reload(); // reload to page to reset the intervals
        }
    });

    let interval = function () {
        if (gameRun) {
            update();
        } else {
            gameOver();
        }
    }

    let start = function () {
        first = true;
        random = randomType();
        tetrominoReset(random, first); // pass on the first tetrominoType
        draw();
        tetromino.score = 0;
        gameRun = true;
        gameLoop = setInterval(interval, 10);
        document.getElementById("startButton").disabled = true;
    }

    document.getElementById("startButton").onclick = function () {
        start();
        this.blur(); // removes focus from button --> prevents a restart of the game when pressing space/enter while playing.
    };
})();

