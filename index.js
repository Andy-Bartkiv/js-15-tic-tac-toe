// PLAYERS --------------------------------------
const playerFactory = (mark) => {
    const getMark = () => mark;
    let _canMove = false;
    const getMove = () => _canMove;
    const toggleCanMove = () => { _canMove = !(_canMove) };
    return {getMark, getMove, toggleCanMove}
};

// GAME BOARD ----------------------------------
const gameBoard = ((size = 3) => {
    let board = [
        ['O', ' ', ' '],
        [' ', 'X', ' '],
        [' ', ' ', 'O']
    ];
    const grid = document.querySelector('.main-grid');

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
            el.classList.remove('hint');
        })
    };

    function reset() {
        board = board.map(() => [' ', ' ', ' ']);
        render();
    };

    function hint(id, mark) {
        // console.log('hint', id)
        const val = board[id[0]][id[1]];
        if (val === ' ') {
            const element = [...grid.children].find(el => el.dataset.id === id);
            // console.log(element, mark);
            element.classList.add('hint')
            element.textContent = mark;
        }
    }

    function hideHint(id, mark) {
        // console.log('hide', id)
        const val = board[id[0]][id[1]];
        if (val === ' ') {
            const element = [...grid.children].find(el => el.dataset.id === id);
            // console.log(element, mark);
            element.classList.remove('hint')
            element.textContent = ' ';
        }
    }

    function update(id, mark) {
        // const id = event.target.dataset.id;
        // const mark = this.getMark();
        if (board[id[0]][id[1]] === ' ') {
            // console.log(id, mark)
            board[id[0]][id[1]] = mark;
            render();
            return true;    
        }
        return false;
    };

    return {grid, reset, render, update, hint, hideHint};

})(); // End of gameBoard Module;

// GAME FLOW ---------------------------------------------------------------------
const gameFlow = (() => {

    const playerA = playerFactory("X");
    const playerB = playerFactory("O");
    const players = [playerA, playerB]
    players[0].toggleCanMove();
    let player = players.find(pl => pl.getMove());

    gameBoard.render();

    // DOM caching
    const btnReset = document.querySelector('button[type="reset"]');
    btnReset.addEventListener('click', gameBoard.reset);
        
    gameBoard.grid.addEventListener('click', playOneTurn);
    
    // gameBoard.grid.addEventListener('dblclick', (event) => event.target.classList.toggle('winner-item'));

    // show hints
    gameBoard.grid.addEventListener('mouseover', (event) => gameBoard.hint(event.target.dataset.id, player.getMark()));
    [...gameBoard.grid.children].forEach(ch => 
        ch.addEventListener('mouseleave', (event) => gameBoard.hideHint(event.target.dataset.id, player.getMark())))
   
    function playOneTurn(event) {
        if (gameBoard.update(event.target.dataset.id, player.getMark())) {
            players.forEach(pl => pl.toggleCanMove());    
            player = players.find(pl => pl.getMove());
        }
    }

})();

