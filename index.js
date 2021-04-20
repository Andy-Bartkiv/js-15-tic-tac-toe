const gameBoard = {
    board: [
    ['O', ' ', ' '],
    [' ', 'X', ' '],
    [' ', ' ', 'O']
    ]
};

const gameFlow = {

};

const Player = () => {

};

// caching DOM 
const gridItems = [...document.querySelectorAll('.grid-item')];
const btnReset = document.querySelector('button[type="reset"]');

// binding events
btnReset.addEventListener('click', () => {
    gameBoard.board = gameBoard.board.map(() => [' ', ' ', ' ']);
    render();
    console.table(gameBoard.board)
})

gridItems.forEach((el, ind) => 
    el.addEventListener('click', () => {
        gameBoard.board[Math.floor(ind/3)][ind % 3] = 'X';
        render();
        console.table(gameBoard.board)
    })
)

function render() {
    gridItems.forEach((el, ind) => el.textContent = gameBoard.board[Math.floor(ind/3)][ind % 3])
}

render();

