// PLAYERS --------------------------------------
const playerFactory = (mark) => {
    const getMark = () => mark;
    let _ai = 'person';
    let _canMove = false;
    const getAI = () => _ai;
    const toggleAI = () => { _ai = (_ai === 'person') ? 'computer' : 'person'};
    const getMove = () => _canMove;
    const toggleCanMove = () => { _canMove = !(_canMove) };
    return {getMark, getAI, toggleAI, getMove, toggleCanMove}
};

// GAME BOARD ----------------------------------
const gameBoard = ((size = 3) => {
    let board = [
        [' ', ' ', ' '],
        [' ', ' ', ' '],
        [' ', ' ', ' ']
    ];
    let winner = { mark: ' ', line: ''};
    // DOM caching 
    const grid = document.querySelector('.main-grid');
    const winnerDiv = document.querySelector('.winner');
    const playerMarks = [...document.querySelectorAll('.player-mark')];
    playerMarks[1].classList.add('mark-highlight');

    // Board initialization IIFE
    const init = (() => {
        for (let i = 0; i < size; i++)
            for (let j = 0; j < size; j++) {
                const item = document.createElement('div');
                item.setAttribute('class', 'grid-item');
                item.setAttribute('data-id', `${i}${j}`);
                item.textContent = board[i][j];
                grid.appendChild(item);
            }
    })();

    function render() {
        [...grid.children].forEach((el, ind) => {
            el.textContent = board[Math.floor(ind/size)][ind % size];
            el.classList.remove('hint', 'winner-cell');
            playerMarks.forEach(el => el.classList.toggle('mark-highlight'));
        })
    };

    function reset() {
        board = board.map(() => [' ', ' ', ' ']);
        winner = { mark: ' ', line: ''};
        winnerDiv.textContent = `TIC - TAC - TOE`;
        playerMarks.forEach(el => el.classList.remove('mark-tie'));
        render();
    };

    // at hover show if placing mark at cell is possible 
    function hint(id, mark) {
        if (id && board[id[0]][id[1]] === ' ') {
            const element = [...grid.children].find(el => el.dataset.id === id);
            element.classList.add('hint')
            element.textContent = mark;
        }
    }
    function hideHint(id) {
        if (board[id[0]][id[1]] === ' ') {
            const element = [...grid.children].find(el => el.dataset.id === id);
            element.classList.remove('hint')
            element.textContent = ' ';
        }
    }

    // board state update (mark placement / end game determination) on click
    function update(id, mark) {
        if (id && board[id[0]][id[1]] === ' ') {
            board[id[0]][id[1]] = mark;
            render();
            if (gameFlow.getTurn() >= 5) { // 5
                winner = checkWinner();
                if (getWinner() !== ' ') {
                    const line = winner.line.split(',');
                    [...grid.children].filter(el => line.includes(el.dataset.id)).forEach(el => el.classList.add('winner-cell'))
                    winnerDiv.textContent = `Player  ${getWinner()}  wins!` ;
                    playerMarks.forEach(el => el.classList.toggle('mark-highlight'));
                } else if (gameFlow.getTurn() >= 9) {
                    playerMarks.forEach(el => el.classList.add('mark-tie'));
                    winnerDiv.textContent = `It is a TIE`;
                } 
            }
            return true;    
        }
        return false;
    };

    function checkWinner() {
        const hCheck = () => { // check 3 horizontal lines 
            const res = [0,1,2].map((y) => (board[y][0] !== ' ') && board[y].every(el => el === board[y][0]))
                                .indexOf(true);
            return res >= 0 ? ['0','1','2'].map(el => +res + el).join(',') : '';
        }
        const vCheck = () => {  // check 3 vertical lines 
            const res = [0,1,2].map((x) => (board[0][x] !== ' ') && board.map(row => row[x]).every(el => el === board[0][x]))
                                .indexOf(true);
            return res >= 0 ? ['0','1','2'].map(el => el + res).join(',') : '';
        }
        const dCheck = () => {  // check 2 diagonal lines 
            const res = 2 * [0,2].map(z => (board[z][0] !== ' ') && board.map((row, i) => row[Math.abs(z - i)]).every(el => el === board[z][0]))
                .indexOf(true);
            return res >= 0 ? ['0','1','2'].map((el, i) => el + Math.abs(res - i)).join(',') : '';  
        }

        const resCheck = [hCheck(), vCheck(), dCheck()].join(''); // string representing results of all checks
        const ind = resCheck.split(',')[0];
        return (resCheck.length > 0)
            ? { mark: board[ind[0]][ind[1]], line: resCheck }
            : { mark: ' ', line: '' }
    }

    function getWinner() {
        return winner.mark;
    }

    function getOptions() {
        const res = [];
        board.forEach((row, i) => 
            row.forEach((el, j) => {
                if (el === ' ') res.push(`${i}${j}`);
            }))
        // console.log(...board.join(',').split('').join(''))
        // console.log(mark, res.join(','));
        return res.join(',');
    }

    return {grid, reset, render, update, hint, hideHint, getWinner, getOptions};

})(); // End of gameBoard Module;

// GAME FLOW ---------------------------------------------------------------------
const gameFlow = (() => {
    const players = [playerFactory("X"), playerFactory("O")];
    players[0].toggleCanMove();
    let player = players.find(pl => pl.getMove());
    let turnCounter = 1;
    gameBoard.reset();

    // caching DOM
    const playerTypes = [...document.querySelectorAll('.player-type')]
    const btnRestart = document.querySelector('.btn-restart');    

    // binding Events handlers
    playerTypes.forEach(el => el.addEventListener('click', togglePlayerType.bind(el)))
    btnRestart.addEventListener('click', restartGame);        

    // play one turn on click
    gameBoard.grid.addEventListener('click', playOneTurn);
    setInterval(() => {
        console.log(player.getMark())
        if (turnCounter <= 9 && gameBoard.getWinner() === ' ' && player.getAI() === 'computer') {
            const arr = gameBoard.getOptions().split(',');
            const rnd = arr[Math.floor(Math.random() * arr.length)]
            console.log(gameBoard.getOptions(), rnd)
            if (gameBoard.update(rnd, player.getMark())) {
                players.forEach(pl => pl.toggleCanMove());    
                player = players.find(pl => pl.getMove());
                turnCounter += 1;
            };
        }
    }, 1500)
    
    // show/hide hints
    gameBoard.grid.addEventListener('mouseover', (event) => gameBoard.hint(event.target.dataset.id, player.getMark()));
    [...gameBoard.grid.children].forEach(ch => 
        ch.addEventListener('mouseleave', (event) => gameBoard.hideHint(event.target.dataset.id)));
    
    function playOneTurn(event) {
        // console.log(player.getAI(), player.getMark())
        if (turnCounter <= 9 && gameBoard.getWinner() === ' ' && player.getAI() === 'person')
            if (gameBoard.update(event.target.dataset.id, player.getMark())) {
                players.forEach(pl => pl.toggleCanMove());    
                player = players.find(pl => pl.getMove());
                turnCounter += 1;
            };
    };

    function restartGame() {
        if (gameBoard.getWinner() === ' ') {
            players.forEach(pl => pl.toggleCanMove());    
            player = players.find(pl => pl.getMove());
        }
        gameBoard.reset();
        turnCounter = 1;
    };

    function togglePlayerType(event) {
        if (event.target.textContent !== players[this.id].getAI()) {
            players[this.id].toggleAI();
            [...this.children].forEach(span => span.classList.toggle('md-dark'));
        }
        console.log(players.map(el=>el.getAI())) // -------------------------------------- to DELETE
    };

    function getTurn() {
        return turnCounter;
    };

    return {getTurn};
})();

