// PLAYERS --------------------------------------
const playerFactory = (mark, aiLvl = '') => {
    const getMark = () => mark;
    let _ai = 'person'; // two options: 'computer', 'person'
    let _aiLvl = aiLvl; // three AI levels: '', 'star_border', 'star'
    let _canMove = false;
    const getAI = () => _ai;
    const toggleAI = () => { _ai = (_ai === 'person') ? 'computer' : 'person'};
    const getAILvl = () => _aiLvl;
    const toggleAILvl = () => { _aiLvl = (_aiLvl === '') ? 'star_border' : (_aiLvl === 'star_border') ? 'star' : ''};
    const getMove = () => _canMove;
    const toggleCanMove = () => { _canMove = !(_canMove) };
    return {getMark, getAI, getAILvl, toggleAI, toggleAILvl, getMove, toggleCanMove}
};

// GAME BOARD ----------------------------------
const gameBoard = ((size = 3) => {
    let board = [ [' ', ' ', ' '], [' ', ' ', ' '], [' ', ' ', ' ']];
    let winner = { mark: ' ', line: ''};
    const getWinner = () => winner.mark;
    let turnsLeft = getOptions().length;
    const isGameRunning = () => turnsLeft > 0;
    const opponentMark = (mark) => (mark === 'X') ? 'O' : 'X';
    const randomIndex = (arr) => Math.floor(Math.random() * arr.length);
    // DOM caching 
    const grid = document.querySelector('.main-grid');
    const winnerDiv = document.querySelector('.winner');
    const playerMarks = [...document.querySelectorAll('.player-mark')];
    playerMarks[1].classList.add('mark-highlight'); // reverse active player indicator
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
        });
        playerMarks.forEach(el => el.classList.toggle('mark-highlight'));
        playerMarks.forEach(el => el.classList.toggle('mark-animation'));
    };

    function reset() {
        board = board.map(() => [' ', ' ', ' ']);
        winner = { mark: ' ', line: ''};
        winnerDiv.textContent = `TIC - TAC - TOE`;
        playerMarks.forEach(el => el.classList.remove('mark-tie'));
        playerMarks.forEach(el => 
            {if (el.classList.contains('mark-highlight')) el.classList.add('mark-animation')});        
        render();
        turnsLeft = getOptions().length;
    };

    // at hover show if placing mark at specific cell is possible 
    function hint(id, mark) {
        if (id && board[id[0]][id[1]] === ' ') {
            const element = [...grid.children].find(el => el.dataset.id === id);
            element.classList.add('hint')
            element.textContent = mark;
        };
    };
    function hideHint(id) {
        if (board[id[0]][id[1]] === ' ') {
            const element = [...grid.children].find(el => el.dataset.id === id);
            element.classList.remove('hint')
            element.textContent = ' ';
        };
    };
    // board state update (mark placement / end game determination) on click or AI move
    function update(id, mark) {
        if (id && board[id[0]][id[1]] === ' ') {
            board[id[0]][id[1]] = mark;
            render();
            turnsLeft = getOptions().length;
            if (turnsLeft <= 4) { // fastest win available from 5-th turn
                winner = checkWinner();
                if (getWinner() !== ' ') {
                    const line = winner.line.split(',');
                    [...grid.children].filter(el => line.includes(el.dataset.id)).forEach(el => el.classList.add('winner-cell'))
                    winnerDiv.textContent = `Player  ${getWinner()}  wins!` ;
                    playerMarks.forEach(el => el.classList.toggle('mark-highlight'));
                    playerMarks.forEach(el => el.classList.remove('mark-animation'));
                } else if (turnsLeft <= 0) {
                    playerMarks.forEach(el => el.classList.add('mark-tie'));
                    playerMarks.forEach(el => el.classList.remove('mark-animation'));
                    winnerDiv.textContent = `It's a draw!`;
                } 
            }
            return true; // successful updating board at (id[0]][id[1]) with (mark)
        }
        return false; // not possible to update board
    };
    // checking for winner 3 horizontal lines, 3 vertical and 2 diagonal
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
            let res = [0,2].map(z => (board[z][0] !== ' ') && board.map((row, i) => row[Math.abs(z - i)]).every(el => el === board[z][0]));
            res = res.map((val, ind) => val ? ['0','1','2'].map((el, i) => el + Math.abs(ind*2 - i)).join(',') : '');
            return res.filter(el => el !== '').join(',');
        }
        // string: results of all checks
        const resCheck = [hCheck(), vCheck(), dCheck()].filter(el => el !== '').join(',');
        const pos = resCheck.split(',')[0]; // string: position of winning mark
        return (resCheck.length > 0)
            ? { mark: board[pos[0]][pos[1]], line: resCheck }
            : { mark: ' ', line: '' }
    }

    function getOptions() {
        const res = [];
        board.forEach((row, i) => row.forEach((el, j) => (el === ' ') && res.push(`${i}${j}`) ));
        return res;
    }

    function chooseAIMove(mark, aiLvl) {
        let options = getOptions();
        let goodMoves = []; 
        if (aiLvl !== '') { // if ai logic is "starred" (better than lvl=0)
        // "star border" (lvl=1) logic: check for player instant win
            goodMoves = options.filter((el, i) => checkBoard(mark)[i]);
        // "star border" (lvl=1) logic: check for opponent instant win
            if (goodMoves.length === 0)
                goodMoves = options.filter((el, i) => checkBoard(opponentMark(mark))[i]);
        // "star" (lvl=2) logic: minimax
            if (goodMoves.length === 0 && aiLvl === 'star') {
                const scores = options.map(el => minimax(el, mark));
                goodMoves = options.filter((el, i) => scores[i] === Math.max(...scores));
            };
            if (goodMoves.length > 0) options = [...goodMoves];
        // additional logic for 'both start lvls': if possible filter options to make two (mark) in a row
            if (options.length > 2) { 
                const scores = checkBoard(mark, true, options);
                goodMoves = options.filter((el, i) => scores[i]);
                if (goodMoves.length > 0) options = [...goodMoves];
            }
        };
        return options[randomIndex(options)];
    }
    // returns matrix of false for empty positions, with true if filling position with 'mark' lead to win condition
    function checkBoard(mark, deep = false, options = getOptions()) {
        return options.map(el => {
            board[el[0]][el[1]] = mark;
            const res = (deep) 
                        ? checkBoard(mark).includes(true)
                        : checkWinner().mark !== ' ';
            board[el[0]][el[1]] = ' ';
            return res;
        });
    };
    // Refactored MINIMAX function
    function minimax(el, mark) { // (mark) player is maximizing on each turn
        let bestScore = - 2;
        board[el[0]][el[1]] = mark; // update board one move forward
        if (checkWinner().mark !== ' ') // player (mark) wins
            bestScore = 1;
        else if (getOptions().length === 0) // a draw, no more options
            bestScore = 0;
        else // get opponent's best move (with "-")
            bestScore = - Math.max(...getOptions().map(el => minimax(el, opponentMark(mark))));
        board[el[0]][el[1]] = ' '; // restore board one move back
        return bestScore;
    }

    return {grid, reset, render, update, hint, hideHint, getWinner, chooseAIMove, isGameRunning};
})(); // End of gameBoard Module;

// GAME FLOW ---------------------------------------------------------------------
const gameFlow = (() => {
    let minimaxCalculated = null; // to calculate minimax only once per turn
    const players = [playerFactory("X"), playerFactory("O")];
    players[0].toggleCanMove(); // First move to Player 'X'
    let player = players.find(pl => pl.getMove());
    // caching DOM
    const playerTypes = [...document.querySelectorAll('.player-type')];
    const btnRestart = document.querySelector('.btn-restart');    
    // binding Events handlers
    playerTypes.forEach(el => el.addEventListener('click', togglePlayerType.bind(el)));
    btnRestart.addEventListener('click', restartGame);        
    // show/hide hints
    gameBoard.grid.addEventListener('mouseover', (event) => gameBoard.hint(event.target.dataset.id, player.getMark()));
    [...gameBoard.grid.children].forEach(ch => 
        ch.addEventListener('mouseleave', (event) => gameBoard.hideHint(event.target.dataset.id)));
    // reset game at the beginning
    gameBoard.reset();
    // play one turn -> on click (player controlled) OR periodically (AI controlled)
    gameBoard.grid.addEventListener('click', playOneTurn);
    setInterval(playOneTurn, 1000);
    
    function playOneTurn(event) {
        if (!minimaxCalculated && player.getAI() === 'computer')
            Promise.resolve(gameBoard.chooseAIMove(player.getMark(), player.getAILvl()))
                .then(val => minimaxCalculated = val);
        const [ control, id ] = (event !== undefined) 
            ? [ 'person', event.target.dataset.id ]
            : [ 'computer', minimaxCalculated ];
        if (gameBoard.isGameRunning() && gameBoard.getWinner() === ' ' && player.getAI() === control)
            if (gameBoard.update(id, player.getMark())) {
                togglePlayerTurn();
                minimaxCalculated = null;
            };
    };

    function restartGame() {
        if (gameBoard.getWinner() === ' ') 
            togglePlayerTurn();
        minimaxCalculated = gameBoard.chooseAIMove(player.getMark(), '');
        gameBoard.reset();
    };

    function togglePlayerType(event) {
        if (event.target.textContent !== players[this.id].getAI()) {
            players[this.id].toggleAI();
            [...this.children].forEach(span => span.classList.toggle('md-dark'));
        } else if (event.target.textContent === 'computer') {
            players[this.id].toggleAILvl();
            this.children[1].children[1].textContent = players[this.id].getAILvl();
        }
    };

    function togglePlayerTurn() {
        players.forEach(pl => pl.toggleCanMove());    
        player = players.find(pl => pl.getMove());
    }

})();
