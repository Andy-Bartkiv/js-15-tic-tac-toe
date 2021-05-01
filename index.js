// PLAYERS --------------------------------------
const playerFactory = (mark, aiLvl = '') => {
    const getMark = () => mark;
    let _ai = 'person';
    let _aiLvl = aiLvl;
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
            playerMarks.forEach(el => el.classList.toggle('mark-highlight'));
        })
    };

    function reset() {
        board = board.map(() => [' ', ' ', ' ']);
        winner = { mark: ' ', line: ''};
        winnerDiv.textContent = `TIC - TAC - TOE`;
        playerMarks.forEach(el => el.classList.remove('mark-tie'));
        render();
        turnsLeft = getOptions().length;
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
            turnsLeft = getOptions().length
            if (turnsLeft <= 4) { // fastest win available at 5-th turn
                winner = checkWinner();
                if (getWinner() !== ' ') {
                    const line = winner.line.split(',');
                    [...grid.children].filter(el => line.includes(el.dataset.id)).forEach(el => el.classList.add('winner-cell'))
                    winnerDiv.textContent = `Player  ${getWinner()}  wins!` ;
                    playerMarks.forEach(el => el.classList.toggle('mark-highlight'));
                } else if (turnsLeft <= 0) {
                    playerMarks.forEach(el => el.classList.add('mark-tie'));
                    winnerDiv.textContent = `It's a draw!`;
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
            let res = [0,2].map(z => (board[z][0] !== ' ') && board.map((row, i) => row[Math.abs(z - i)]).every(el => el === board[z][0]));
            res = res.map((val, ind) => val ? ['0','1','2'].map((el, i) => el + Math.abs(ind*2 - i)).join(',') : '');
            return res.filter(el => el !== '').join(',');
        }

        const resCheck = [hCheck(), vCheck(), dCheck()].filter(el => el !== '').join(','); // string representing results of all checks
        const ind = resCheck.split(',')[0];
        return (resCheck.length > 0)
            ? { mark: board[ind[0]][ind[1]], line: resCheck }
            : { mark: ' ', line: '' }
    }

    function getOptions() {
        const res = [];
        board.forEach((row, i) => row.forEach((el, j) => (el === ' ') && res.push(`${i}${j}`) ));
        return res;
    }

    function chooseAIMove(mark, aiLvl) {
        let ind = -1;
        let arr = getOptions();
        const opponentMark = (mark === 'X') ? 'O' : 'X';
        if (aiLvl !== '') { // if ai logic is "starred" (better than lvl=0)
            // console.log(checkBoard1(mark));
        // "star border" (lvl=1) logic: check for player instant win
            ind = checkBoard(mark).indexOf(true);
        // "star border" (lvl=1) logic: check for opponent instant win
            ind = (ind >= 0) ? ind : checkBoard(opponentMark).indexOf(true);
        // "star" (lvl=2) logic
            if (ind < 0 && aiLvl === 'star') {
                const xxx = arr.map(el => {
                    board[el[0]][el[1]] = mark;
                    const res = minimax(opponentMark);
                    board[el[0]][el[1]] = ' ';
                    return res;
                });
            // const bestScore = (mark === 'O') ? Math.max(...xxx) : Math.min(...xxx);
                const bestScore = Math.max(...xxx);
                arr = arr.filter((el, i) => xxx[i] === bestScore);
                console.log(mark, scores[mark], 'ind', ind, 'xxx =', xxx);
            };
        };

        ind = (ind >= 0) ? ind : Math.floor(Math.random() * arr.length); 
        console.log(arr, arr[ind]);
        return arr[ind];
    }

    function checkBoard(mark) { // returns matrix of false for empty positions, with true if filling position with 'mark' lead to win condition
        // console.log(turnsLeft, getOptions());
        return getOptions().map(el => {
            board[el[0]][el[1]] = mark;
            const res = checkWinner().mark !== ' ';
            board[el[0]][el[1]] = ' ';
            return res;
        });
    };

    const scores = {
        'X': -1,
        ' ': 0,
        'O': 1
    };

    function minimax(mark) { // X is minimizing, O is maximizing
        const opponentMark = (mark === 'X') ? 'O' : 'X';
        const res = checkWinner().mark;
        if (res !== ' ' || getOptions().length === 0) 
            return scores[res];
        else {
            let bestScore = 2 * scores[opponentMark];
            getOptions().forEach(el => {
                board[el[0]][el[1]] = mark;
                const score = minimax(opponentMark);
                board[el[0]][el[1]] = ' ';
                if (mark === 'X')
                    bestScore = (score < bestScore) ? score : bestScore;
                else 
                    bestScore = (score > bestScore) ? score : bestScore;
            });
            return bestScore;   
        }
    }

    return {grid, reset, render, update, hint, hideHint, getWinner, chooseAIMove, isGameRunning};
})(); // End of gameBoard Module;

// GAME FLOW ---------------------------------------------------------------------
const gameFlow = (() => {
    const players = [playerFactory("X"), playerFactory("O")];
    players[0].toggleCanMove();
    let player = players.find(pl => pl.getMove());
    // caching DOM
    const playerTypes = [...document.querySelectorAll('.player-type')]
    const btnRestart = document.querySelector('.btn-restart');    
    // binding Events handlers
    playerTypes.forEach(el => el.addEventListener('click', togglePlayerType.bind(el)))
    btnRestart.addEventListener('click', restartGame);        
    // show/hide hints
    gameBoard.grid.addEventListener('mouseover', (event) => gameBoard.hint(event.target.dataset.id, player.getMark()));
    [...gameBoard.grid.children].forEach(ch => 
        ch.addEventListener('mouseleave', (event) => gameBoard.hideHint(event.target.dataset.id)));
    // reset game at the beginning
    gameBoard.reset();
    // play one turn -> on click (player controlled) OR periodically (AI controlled)
    gameBoard.grid.addEventListener('click', playOneTurn);
    setInterval(playOneTurn, 1500);
    
    function playOneTurn(event) {
        const [ control, id ] = (event !== undefined) 
            ? [ 'person', event.target.dataset.id ]
            : [ 'computer', gameBoard.chooseAIMove(player.getMark(), player.getAILvl()) ]
        if (gameBoard.isGameRunning() && gameBoard.getWinner() === ' ' && player.getAI() === control)
            if (gameBoard.update(id, player.getMark()))
                togglePlayerTurn();
    };

    function restartGame() {
        if (gameBoard.getWinner() === ' ') 
            togglePlayerTurn();
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
