document.addEventListener('DOMContentLoaded', function () {
    // create grid 
    for (let i = 0; i < 210; i++) {
        var div = document.createElement('div');
        document.getElementById('grid').appendChild(div);
    }

    // create display grid
    for (let i = 0; i < 12; i++) {
        var div = document.createElement('div');
        document.getElementById("mini-grid").appendChild(div);
    }

    // variable
    const grid = document.querySelector("#grid");
    let squares = Array.from(document.querySelectorAll('#grid div'));
    const startBtn = document.querySelector("#start-button");
    const pauseBtn = document.querySelector("#pause-button");
    const resetBtn = document.querySelector("#reset-button");
    const game = document.getElementById('game-over');
    const width = 10;
    let timerId;
    let nextRandom = 0;
    let score = 0;
    const scoreDisplay = document.querySelector("#score");
    const color = ['color1', 'color2', 'color3', 'color4', 'color5', 'color6'];
    let stop = true;

    // add class to the last 10 divs
    for (let i = 0; i < 10; i++) {
        squares[200 + i].classList.add('taken');
        squares[200 + i].classList.add('hidden-div');
    }

    // the Tetromines
    const lTetromino = [
        [0, 1, width + 1, width * 2 + 1],
        [2, width, width + 1, width + 2],
        [1, width + 1, width * 2 + 1, width * 2 + 2],
        [width, width + 1, width + 2, width * 2]
    ];

    const zTetromino = [
        [0, width, width + 1, width * 2 + 1],
        [width + 1, width + 2, width * 2, width * 2 + 1],
        [0, width, width + 1, width * 2 + 1],
        [width + 1, width + 2, width * 2, width * 2 + 1]
    ];

    const tTetromino = [
        [1, width, width + 1, width + 2],
        [1, width + 1, width + 2, width * 2 + 1],
        [width, width + 1, width + 2, width * 2 + 1],
        [1, width, width + 1, width * 2 + 1]
    ];

    const oTetromino = [
        [0, 1, width, width + 1],
        [0, 1, width, width + 1],
        [0, 1, width, width + 1],
        [0, 1, width, width + 1]
    ];

    const iTetromino = [
        [0, width, width * 2, width * 3],
        [width, width + 1, width + 2, width + 3],
        [0, width, width * 2, width * 3],
        [width, width + 1, width + 2, width + 3]
    ];

    const theTetromines = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino];

    let currentPosition = 4;
    let currentRotation = 0;

    // randomly select a color
    let currentColor = Math.floor(Math.random() * color.length);

    // randomly select a Tetromino 
    let random = Math.floor(Math.random() * theTetromines.length);
    let currentTetromino = theTetromines[random][currentRotation];

    // draw the Tetromino
    function draw() {
        currentTetromino.forEach(index => {
            squares[currentPosition + index].classList.add('tetromino');
            squares[currentPosition + index].classList.add(color[currentColor]);
        });
    }

    // undraw the Tetromino
    function undraw() {
        currentTetromino.forEach(index => {
            squares[currentPosition + index].classList.remove('tetromino');
            squares[currentPosition + index].classList.remove(color[currentColor]);
        })
    }

    // assign functions to keyCodes
    function control(e) {
        if (!stop) {
            if (e.keyCode === 37) {
                moveLeft();
            } else if (e.keyCode === 38) {
                rotate();
            } else if (e.keyCode === 39) {
                moveRight();
            } else if (e.keyCode === 40) {
                moveDown();
            }
        }
    }
    document.addEventListener('keyup', control);

    // move down 
    function moveDown() {
        undraw();
        currentPosition += width;
        draw();
        freeze();
    }

    // move left 
    function moveLeft() {
        undraw();
        const isAtLeftEdge = currentTetromino.some(index => (currentPosition + index) % width === 0);

        previousPosition = currentPosition;
        if (!isAtLeftEdge) currentPosition--;
        if (currentTetromino.some(index => squares[currentPosition + index].classList.contains('taken'))) currentPosition++;

        draw();
        freeze();
    }

    // move right 
    function moveRight() {
        undraw();
        const isAtRightEdge = currentTetromino.some(index => (currentPosition + index) % width === width - 1);

        previousPosition = currentPosition;
        if (!isAtRightEdge) currentPosition++;
        if (currentTetromino.some(index => squares[currentPosition + index].classList.contains('taken'))) currentPosition--;

        draw();
        freeze();
    }

    // rotate 
    function rotate() {
        undraw();

        let previousRotation = currentRotation;
        currentRotation++;

        if (currentRotation >= currentTetromino.length) currentRotation = 0;
        currentTetromino = theTetromines[random][currentRotation];

        if (currentTetromino.some(index => squares[index + currentPosition].classList.contains('taken'))) {
            currentRotation = previousRotation;
            currentTetromino = theTetromines[random][currentRotation];
        }

        const outOfLeft = currentTetromino.some(index => (currentPosition + index) % width === 0);
        const outOfRight = currentTetromino.some(index => (currentPosition + index) % width === width - 1);

        if (outOfLeft && outOfRight) {
            currentRotation = previousRotation;
            currentTetromino = theTetromines[random][currentRotation];
        }

        draw();
        freeze();
    }

    // freeze function 
    function freeze() {
        if (currentTetromino.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
            currentTetromino.forEach(index => squares[currentPosition + index].classList.add('taken'));
            // start a new tetromino falling
            random = nextRandom;
            nextRandom = Math.floor(Math.random() * theTetromines.length);
            currentTetromino = theTetromines[random][currentRotation];
            currentPosition = 4;
            currentColor = Math.floor(Math.random() * color.length);
            draw();
            displayShape();
            addScore();
            gameOver();
        }
    }

    // show up next tetromino in mini display
    const displaySquares = document.querySelectorAll("#mini-grid div");
    const displayWidth = 3;
    const displayIndex = 0;

    // the Tetrominos without rotations 
    const upNextTetrominos = [
        [0, 1, displayWidth + 1, displayWidth * 2 + 1], // lTetromino 
        [0, displayWidth, displayWidth + 1, displayWidth * 2 + 1], // zTetromino
        [1, displayWidth, displayWidth + 1, displayWidth + 2], // tTetromino
        [1, 2, displayWidth + 1, displayWidth + 2], // oTetromino
        [1, 1 + displayWidth, 1 + displayWidth * 2, 1 + displayWidth * 3] // iTetromino
    ];

    // display the next shape in mini grid
    function displayShape() {
        // remove any trace of tetromino form 
        displaySquares.forEach(square => {
            square.classList.remove('tetromino');
        })

        upNextTetrominos[nextRandom].forEach(index => {
            displaySquares[index + displayIndex].classList.add('tetromino');
        })
    }

    // add functionality to the start button 
    startBtn.addEventListener('click', () => {
        if (!timerId) {
            stop = false;
            draw();
            timerId = setInterval(moveDown, 1000);
            nextRandom = Math.floor(Math.random() * theTetromines.length);
            displayShape();
        }
    })

    // add functionality to the pause button 
    pauseBtn.addEventListener('click', () => {
        if (timerId) {
            clearInterval(timerId);
            timerId = null;
            stop = true;
        }
    })

    // add functionality to the reset button
    resetBtn.addEventListener('click', () => {
        // set default settings 
        clearInterval(timerId);
        score = 0;
        scoreDisplay.innerHTML = score;
        timerId = null;
        stop = true;
        currentPosition = 4;
        currentRotation = 0;
        currentColor = Math.floor(Math.random() * color.length);
        random = Math.floor(Math.random() * theTetromines.length);
        currentTetromino = theTetromines[random][currentRotation];
        game.style.opacity = 0;
        // clear grid
        for (let i = 0; i < 200; i++) {
            squares[i].classList.remove(
                'taken',
                'tetromino',
                'color1',
                'color2',
                'color3',
                'color4',
                'color5',
                'color6'
            );
        }
        // clear display grid
        displaySquares.forEach(d => d.classList.remove('tetromino'));

    })

    // add score 
    function addScore() {
        for (let i = 0; i < 199; i += width) {
            const row = [i, i + 1, i + 2, i + 3, i + 4, i + 5, i + 6, i + 7, i + 8, i + 9];

            if (row.every(index => squares[index].classList.contains('taken'))) {
                row.forEach(index => {
                    squares[index].classList.add('score');
                });
                score += 10;
                scoreDisplay.innerHTML = score;

                setTimeout(() => {
                    row.forEach(index => {
                        squares[index].classList.remove(
                            'taken',
                            'tetromino',
                            'color1',
                            'color2',
                            'color3',
                            'color4',
                            'color5',
                            'color6',
                            'score'
                        )
                    });
                    const squaresRemoved = squares.splice(i, width);
                    squares = squaresRemoved.concat(squares);
                    squares.forEach(cell => grid.appendChild(cell));
                }, 1000);



            }
        }
    }

    // game over 
    function gameOver() {
        if (currentTetromino.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
            clearInterval(timerId);
            stop = true;
            game.style.opacity = 1;
        }
    }


}, false);