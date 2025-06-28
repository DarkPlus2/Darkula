// Tic Tac Toe Mega Ultimate - Ultimate Script
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const board = document.getElementById('board');
    const cells = document.querySelectorAll('.cell');
    const status = document.getElementById('status');
    const resetButton = document.getElementById('reset');
    const resetScoresButton = document.getElementById('reset-scores');
    const scoreX = document.getElementById('score-x');
    const scoreO = document.getElementById('score-o');
    const gameModeSelect = document.createElement('select');
    const playerXSelect = document.createElement('select');
    const playerOSelect = document.createElement('select');

    // Game State
    let currentPlayer = 'X';
    let gameState = ['', '', '', '', '', '', '', '', ''];
    let gameActive = true;
    let scores = { x: 0, o: 0 };
    let gameMode = 'pvp'; // pvp, pvc, cvc
    let playerTypes = { x: 'human', o: 'human' };
    let difficulty = 'medium'; // easy, medium, hard

    // Winning Conditions
    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6]             // diagonals
    ];

    // Initialize UI
    function initUI() {
        // Create game mode selector
        gameModeSelect.innerHTML = `
            <option value="pvp">Player vs Player</option>
            <option value="pvc">Player vs Computer</option>
            <option value="cvc">Computer vs Computer</option>
        `;
        gameModeSelect.addEventListener('change', (e) => {
            gameMode = e.target.value;
            updatePlayerOptions();
            resetGame();
        });

        // Create player type selectors
        playerXSelect.innerHTML = `
            <option value="human">Human (X)</option>
            <option value="computer">Computer (X)</option>
        `;
        playerOSelect.innerHTML = `
            <option value="human">Human (O)</option>
            <option value="computer">Computer (O)</option>
        `;

        playerXSelect.addEventListener('change', (e) => {
            playerTypes.x = e.target.value;
            resetGame();
        });
        playerOSelect.addEventListener('change', (e) => {
            playerTypes.o = e.target.value;
            resetGame();
        });

        // Create difficulty selector
        const difficultySelect = document.createElement('select');
        difficultySelect.innerHTML = `
            <option value="easy">Easy</option>
            <option value="medium" selected>Medium</option>
            <option value="hard">Hard</option>
        `;
        difficultySelect.addEventListener('change', (e) => {
            difficulty = e.target.value;
        });

        // Add controls to DOM
        const controls = document.querySelector('.controls');
        controls.insertBefore(createControl('Game Mode:', gameModeSelect), controls.firstChild);
        controls.insertBefore(createControl('Player X:', playerXSelect), controls.firstChild);
        controls.insertBefore(createControl('Player O:', playerOSelect), controls.firstChild);
        controls.insertBefore(createControl('Difficulty:', difficultySelect), controls.firstChild;

        updatePlayerOptions();
    }

    function createControl(label, element) {
        const div = document.createElement('div');
        div.style.margin = '10px 0';
        const labelEl = document.createElement('label');
        labelEl.textContent = label;
        labelEl.style.marginRight = '10px';
        div.appendChild(labelEl);
        div.appendChild(element);
        return div;
    }

    function updatePlayerOptions() {
        if (gameMode === 'pvp') {
            playerTypes = { x: 'human', o: 'human' };
            playerXSelect.value = 'human';
            playerOSelect.value = 'human';
            playerXSelect.disabled = true;
            playerOSelect.disabled = true;
        } else if (gameMode === 'pvc') {
            playerTypes = { x: 'human', o: 'computer' };
            playerXSelect.value = 'human';
            playerOSelect.value = 'computer';
            playerXSelect.disabled = false;
            playerOSelect.disabled = false;
        } else if (gameMode === 'cvc') {
            playerTypes = { x: 'computer', o: 'computer' };
            playerXSelect.value = 'computer';
            playerOSelect.value = 'computer';
            playerXSelect.disabled = true;
            playerOSelect.disabled = true;
        }
    }

    // Main Game Functions
    function handleCellClick(e) {
        if (!gameActive) return;
        
        const clickedCell = e.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

        // Check if cell is already occupied
        if (gameState[clickedCellIndex] !== '') return;
        
        // Check if current player is human
        if (playerTypes[currentPlayer.toLowerCase()] !== 'human') return;

        makeMove(clickedCellIndex);
    }

    function makeMove(index) {
        if (!gameActive || gameState[index] !== '') return;

        gameState[index] = currentPlayer;
        cells[index].textContent = currentPlayer;
        cells[index].classList.add(currentPlayer.toLowerCase());

        checkResult();
        
        if (gameActive) {
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            status.textContent = `${currentPlayer}'s turn`;
            
            // If next player is computer, make AI move
            if (playerTypes[currentPlayer.toLowerCase()] === 'computer') {
                setTimeout(() => makeAIMove(), 500);
            }
        }
    }

    function makeAIMove() {
        if (!gameActive) return;

        let move;
        switch (difficulty) {
            case 'easy':
                move = getRandomMove();
                break;
            case 'medium':
                move = Math.random() < 0.7 ? getSmartMove() : getRandomMove();
                break;
            case 'hard':
                move = getBestMove();
                break;
            default:
                move = getSmartMove();
        }

        if (move !== undefined && move !== null) {
            makeMove(move);
        }
    }

    // AI Move Functions
    function getRandomMove() {
        const emptyCells = gameState.map((cell, index) => cell === '' ? index : null).filter(val => val !== null);
        if (emptyCells.length === 0) return null;
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }

    function getSmartMove() {
        // Check for winning move
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            const line = [gameState[a], gameState[b], gameState[c]];
            
            // If two in a row and third is empty
            if (line.filter(val => val === currentPlayer).length === 2 && line.includes('')) {
                const emptyIndex = winningConditions[i][line.indexOf('')];
                return emptyIndex;
            }
        }

        // Check for opponent's winning move and block it
        const opponent = currentPlayer === 'X' ? 'O' : 'X';
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            const line = [gameState[a], gameState[b], gameState[c]];
            
            if (line.filter(val => val === opponent).length === 2 && line.includes('')) {
                const emptyIndex = winningConditions[i][line.indexOf('')];
                return emptyIndex;
            }
        }

        // Try to take center if available
        if (gameState[4] === '') return 4;

        // Try to take a corner if available
        const corners = [0, 2, 6, 8];
        const emptyCorners = corners.filter(index => gameState[index] === '');
        if (emptyCorners.length > 0) {
            return emptyCorners[Math.floor(Math.random() * emptyCorners.length)];
        }

        // Take any available edge
        const edges = [1, 3, 5, 7];
        const emptyEdges = edges.filter(index => gameState[index] === '');
        if (emptyEdges.length > 0) {
            return emptyEdges[Math.floor(Math.random() * emptyEdges.length)];
        }

        // Fallback to random move
        return getRandomMove();
    }

    function getBestMove() {
        // Minimax algorithm implementation
        function minimax(board, depth, isMaximizing) {
            const winner = checkWinner(board);
            
            if (winner === currentPlayer) return 10 - depth;
            if (winner === (currentPlayer === 'X' ? 'O' : 'X')) return depth - 10;
            if (!board.includes('')) return 0;
            
            if (isMaximizing) {
                let bestScore = -Infinity;
                for (let i = 0; i < board.length; i++) {
                    if (board[i] === '') {
                        board[i] = currentPlayer;
                        const score = minimax(board, depth + 1, false);
                        board[i] = '';
                        bestScore = Math.max(score, bestScore);
                    }
                }
                return bestScore;
            } else {
                let bestScore = Infinity;
                for (let i = 0; i < board.length; i++) {
                    if (board[i] === '') {
                        board[i] = currentPlayer === 'X' ? 'O' : 'X';
                        const score = minimax(board, depth + 1, true);
                        board[i] = '';
                        bestScore = Math.min(score, bestScore);
                    }
                }
                return bestScore;
            }
        }
        
        let bestScore = -Infinity;
        let bestMove = null;
        
        for (let i = 0; i < gameState.length; i++) {
            if (gameState[i] === '') {
                gameState[i] = currentPlayer;
                const score = minimax(gameState, 0, false);
                gameState[i] = '';
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
        
        return bestMove;
    }

    function checkWinner(board = gameState) {
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }
        return null;
    }

    function checkResult() {
        const winner = checkWinner();
        
        if (winner) {
            status.textContent = `Player ${winner} wins!`;
            highlightWinningCells(winner);
            updateScore(winner);
            gameActive = false;
            return;
        }
        
        if (!gameState.includes('')) {
            status.textContent = 'Game ended in a draw!';
            gameActive = false;
            return;
        }
    }

    function highlightWinningCells(winner) {
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            if (gameState[a] === winner && gameState[b] === winner && gameState[c] === winner) {
                cells[a].classList.add('winning-cell');
                cells[b].classList.add('winning-cell');
                cells[c].classList.add('winning-cell');
                break;
            }
        }
    }

    function updateScore(winner) {
        if (winner === 'X') {
            scores.x++;
            scoreX.textContent = scores.x;
        } else {
            scores.o++;
            scoreO.textContent = scores.o;
        }
    }

    function resetGame() {
        currentPlayer = 'X';
        gameState = ['', '', '', '', '', '', '', '', ''];
        gameActive = true;
        status.textContent = `${currentPlayer}'s turn`;

        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('x', 'o', 'winning-cell');
        });

        // If first player is computer, make AI move
        if (playerTypes[currentPlayer.toLowerCase()] === 'computer') {
            setTimeout(() => makeAIMove(), 500);
        }
    }

    function resetScores() {
        scores = { x: 0, o: 0 };
        scoreX.textContent = '0';
        scoreO.textContent = '0';
        resetGame();
    }

    // Event Listeners
    cells.forEach(cell => cell.addEventListener('click', handleCellClick));
    resetButton.addEventListener('click', resetGame);
    resetScoresButton.addEventListener('click', resetScores);

    // Initialize the game
    initUI();

    // Start with computer move if needed
    if (playerTypes.x === 'computer') {
        setTimeout(() => makeAIMove(), 500);
    }
});
