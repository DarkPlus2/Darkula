// Tic Tac Toe Mega Ultimate - Ultimate Edition
document.addEventListener('DOMContentLoaded', () => {
    // ========== DOM Elements ==========
    const board = document.getElementById('board');
    const cells = document.querySelectorAll('.cell');
    const status = document.getElementById('status');
    const resetButton = document.getElementById('reset');
    const resetScoresButton = document.getElementById('reset-scores');
    const scoreX = document.getElementById('score-x');
    const scoreO = document.getElementById('score-o');
    const gameModeSelect = document.getElementById('game-mode');
    const difficultySelect = document.getElementById('difficulty');
    const confettiContainer = document.querySelector('.confetti-container');

    // ========== Game State ==========
    let currentPlayer = 'X';
    let gameState = ['', '', '', '', '', '', '', '', ''];
    let gameActive = true;
    let scores = { x: 0, o: 0 };
    let gameMode = 'pvp';
    let playerTypes = { x: 'human', o: 'human' };
    let difficulty = 'medium';
    let moveHistory = [];
    let gameHistory = [];
    let soundEnabled = true;

    // ========== Sound Effects ==========
    const sounds = {
        click: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-plastic-knock-1124.mp3'),
        win: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3'),
        draw: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-neutral-game-notification-951.mp3'),
        x: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-jump-coin-216.mp3'),
        o: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-unlock-game-notification-253.mp3'),
        reset: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-quick-jump-arcade-game-239.mp3')
    };

    // ========== Winning Conditions ==========
    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6]             // diagonals
    ];

    // ========== Initialize Game ==========
    function init() {
        setupEventListeners();
        updatePlayerTypes();
        playSound('reset');
        
        // If first player is computer, make AI move
        if (playerTypes[currentPlayer.toLowerCase()] === 'computer') {
            setTimeout(() => makeAIMove(), 800);
        }
    }

    // ========== Event Listeners ==========
    function setupEventListeners() {
        // Cell clicks
        cells.forEach(cell => {
            cell.addEventListener('click', handleCellClick);
            cell.addEventListener('mouseenter', () => {
                if (gameActive && !cell.textContent && playerTypes[currentPlayer.toLowerCase()] === 'human') {
                    cell.style.transform = 'scale(1.05)';
                }
            });
            cell.addEventListener('mouseleave', () => {
                cell.style.transform = 'scale(1)';
            });
        });

        // Game controls
        resetButton.addEventListener('click', resetGame);
        resetScoresButton.addEventListener('click', resetScores);
        gameModeSelect.addEventListener('change', updateGameMode);
        difficultySelect.addEventListener('change', updateDifficulty);
    }

    // ========== Game Mode & Difficulty ==========
    function updateGameMode(e) {
        gameMode = e.target.value;
        updatePlayerTypes();
        resetGame();
    }

    function updateDifficulty(e) {
        difficulty = e.target.value;
    }

    function updatePlayerTypes() {
        switch (gameMode) {
            case 'pvp':
                playerTypes = { x: 'human', o: 'human' };
                break;
            case 'pvc':
                playerTypes = { x: 'human', o: 'computer' };
                break;
            case 'cvc':
                playerTypes = { x: 'computer', o: 'computer' };
                break;
        }
    }

    // ========== Game Logic ==========
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

        // Record move
        moveHistory.push({
            player: currentPlayer,
            position: index,
            turn: moveHistory.length + 1
        });

        // Update game state
        gameState[index] = currentPlayer;
        
        // Animate cell
        animateCell(cells[index], currentPlayer);
        
        // Play sound
        playSound(currentPlayer.toLowerCase());
        
        checkResult();
        
        if (gameActive) {
            switchPlayer();
            
            // If next player is computer, make AI move
            if (playerTypes[currentPlayer.toLowerCase()] === 'computer') {
                setTimeout(() => makeAIMove(), 800);
            }
        }
    }

    function animateCell(cell, player) {
        cell.textContent = player;
        cell.classList.add(player.toLowerCase());
        
        // Add animation class
        cell.classList.add('cell-pop');
        
        // Remove animation class after animation completes
        setTimeout(() => {
            cell.classList.remove('cell-pop');
        }, 300);
    }

    function switchPlayer() {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        status.textContent = `${currentPlayer}'s turn`;
        status.className = 'status';
        status.classList.add(currentPlayer.toLowerCase());
    }

    // ========== AI Logic ==========
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
                return winningConditions[i][line.indexOf('')];
            }
        }

        // Check for opponent's winning move and block it
        const opponent = currentPlayer === 'X' ? 'O' : 'X';
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            const line = [gameState[a], gameState[b], gameState[c]];
            
            if (line.filter(val => val === opponent).length === 2 && line.includes('')) {
                return winningConditions[i][line.indexOf('')];
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

    // ========== Game Results ==========
    function checkResult() {
        const winner = checkWinner();
        
        if (winner) {
            handleWin(winner);
            return;
        }
        
        if (!gameState.includes('')) {
            handleDraw();
            return;
        }
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

    function handleWin(winner) {
        // Update status
        status.textContent = `Player ${winner} wins!`;
        status.className = 'status';
        status.classList.add(winner.toLowerCase(), 'win-text');
        
        // Highlight winning cells
        highlightWinningCells(winner);
        
        // Update score
        updateScore(winner);
        
        // Play win sound
        playSound('win');
        
        // Show confetti
        createConfetti(winner === 'X' ? '#fd79a8' : '#74b9ff');
        
        // Record game
        recordGame(winner);
        
        gameActive = false;
    }

    function handleDraw() {
        status.textContent = 'Game ended in a draw!';
        status.className = 'status draw-text';
        
        // Play draw sound
        playSound('draw');
        
        // Record game
        recordGame('draw');
        
        gameActive = false;
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

    // ========== Score Management ==========
    function updateScore(winner) {
        if (winner === 'X') {
            scores.x++;
            scoreX.textContent = scores.x;
            animateScore(scoreX);
        } else {
            scores.o++;
            scoreO.textContent = scores.o;
            animateScore(scoreO);
        }
    }

    function animateScore(scoreElement) {
        scoreElement.classList.add('score-pop');
        setTimeout(() => {
            scoreElement.classList.remove('score-pop');
        }, 300);
    }

    function resetScores() {
        scores = { x: 0, o: 0 };
        scoreX.textContent = '0';
        scoreO.textContent = '0';
        playSound('reset');
    }

    // ========== Game Reset ==========
    function resetGame() {
        // Record game if it was in progress
        if (moveHistory.length > 0 && gameActive) {
            recordGame('abandoned');
        }

        currentPlayer = 'X';
        gameState = ['', '', '', '', '', '', '', '', ''];
        gameActive = true;
        moveHistory = [];
        
        status.textContent = `${currentPlayer}'s turn`;
        status.className = 'status';
        status.classList.add(currentPlayer.toLowerCase());
        
        // Reset cells
        cells.forEach(cell => {
            cell.textContent = '';
            cell.className = 'cell';
        });
        
        // Play reset sound
        playSound('reset');
        
        // Clear confetti
        confettiContainer.innerHTML = '';
        confettiContainer.style.display = 'none';
        
        // If first player is computer, make AI move
        if (playerTypes[currentPlayer.toLowerCase()] === 'computer') {
            setTimeout(() => makeAIMove(), 800);
        }
    }

    // ========== Game History ==========
    function recordGame(result) {
        gameHistory.push({
            date: new Date(),
            result: result,
            moves: [...moveHistory],
            mode: gameMode,
            difficulty: difficulty
        });
        
        // For demo purposes, log to console
        console.log('Game recorded:', gameHistory[gameHistory.length - 1]);
    }

    // ========== Visual Effects ==========
    function createConfetti(color) {
        confettiContainer.innerHTML = '';
        confettiContainer.style.display = 'block';
        
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.backgroundColor = color;
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.animationDelay = `${Math.random() * 2}s`;
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
            confettiContainer.appendChild(confetti);
        }
        
        setTimeout(() => {
            confettiContainer.style.display = 'none';
        }, 5000);
    }

    // ========== Sound Management ==========
    function playSound(type) {
        if (!soundEnabled) return;
        
        const sound = sounds[type];
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(e => console.log('Sound playback prevented:', e));
        }
    }

    function toggleSound() {
        soundEnabled = !soundEnabled;
    }

    // ========== Initialize Game ==========
    init();
});
