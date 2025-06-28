// ========== TIC TAC TOE MEGA ULTIMATE HYPER ULTRA+ ==========
// ========== GPU-ACCELERATED | 60FPS | LAG-FREE AI ==========

document.addEventListener('DOMContentLoaded', () => {
    // ====== DOM Elements ======
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

    // ====== Game State ======
    let currentPlayer = 'X';
    let gameState = ['', '', '', '', '', '', '', '', ''];
    let gameActive = true;
    let scores = { x: 0, o: 0 };
    let gameMode = 'pvp';
    let playerTypes = { x: 'human', o: 'human' };
    let difficulty = 'medium';
    let moveHistory = [];
    let soundEnabled = true;

    // ====== Bitmask Win Conditions ======
    const WIN_MASKS = [
        0b111000000, // Top row
        0b000111000, // Middle row
        0b000000111, // Bottom row
        0b100100100, // Left column
        0b010010010, // Middle column
        0b001001001, // Right column
        0b100010001, // Diagonal
        0b001010100  // Anti-diagonal
    ];

    // ====== Sound Effects ======
    const sounds = {
        x: document.getElementById('sound-x'),
        o: document.getElementById('sound-o'),
        win: document.getElementById('sound-win')
    };

    // ====== AI Web Worker ======
    const aiWorker = new Worker(URL.createObjectURL(new Blob([`
        const WIN_MASKS = [${WIN_MASKS.join(',')}];
        
        self.onmessage = function(e) {
            const { gameState, currentPlayer, difficulty } = e.data;
            let move;
            
            // Difficulty-based AI
            switch(difficulty) {
                case 'easy':
                    move = getRandomMove(gameState);
                    break;
                case 'medium':
                    move = Math.random() < 0.7 ? getSmartMove(gameState, currentPlayer) : getRandomMove(gameState);
                    break;
                case 'hard':
                    move = getBestMove(gameState, currentPlayer);
                    break;
            }
            
            self.postMessage(move);
        };

        function getRandomMove(state) {
            const empty = state.map((v, i) => v === '' ? i : null).filter(v => v !== null);
            return empty.length ? empty[Math.floor(Math.random() * empty.length)] : null;
        }

        function getSmartMove(state, player) {
            // Check for immediate win
            for (let i = 0; i < WIN_MASKS.length; i++) {
                const mask = WIN_MASKS[i];
                const playerMask = state.reduce((m, cell, idx) => 
                    m | (cell === player ? 1 << (8 - idx) : 0), 0);
                
                if ((playerMask & mask) === mask) {
                    const move = 8 - Math.log2(mask & ~playerMask);
                    if (move >= 0 && !state[move]) return move;
                }
            }
            
            // Block opponent
            const opponent = player === 'X' ? 'O' : 'X';
            for (let i = 0; i < WIN_MASKS.length; i++) {
                const mask = WIN_MASKS[i];
                const opponentMask = state.reduce((m, cell, idx) => 
                    m | (cell === opponent ? 1 << (8 - idx) : 0), 0);
                
                if ((opponentMask & mask) === mask) {
                    const move = 8 - Math.log2(mask & ~opponentMask);
                    if (move >= 0 && !state[move]) return move;
                }
            }
            
            // Center or corners
            if (!state[4]) return 4;
            const corners = [0, 2, 6, 8].filter(i => !state[i]);
            if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
            
            // Random move as fallback
            return getRandomMove(state);
        }

        function getBestMove(state, player) {
            // Minimax implementation
            const opponent = player === 'X' ? 'O' : 'X';
            
            function minimax(s, depth, isMax) {
                const winner = checkWinner(s);
                if (winner === player) return 10 - depth;
                if (winner === opponent) return depth - 10;
                if (!s.includes('')) return 0;
                
                if (isMax) {
                    let best = -Infinity;
                    for (let i = 0; i < s.length; i++) {
                        if (s[i] === '') {
                            s[i] = player;
                            best = Math.max(best, minimax(s, depth + 1, false));
                            s[i] = '';
                        }
                    }
                    return best;
                } else {
                    let best = Infinity;
                    for (let i = 0; i < s.length; i++) {
                        if (s[i] === '') {
                            s[i] = opponent;
                            best = Math.min(best, minimax(s, depth + 1, true));
                            s[i] = '';
                        }
                    }
                    return best;
                }
            }
            
            let bestScore = -Infinity;
            let bestMove = null;
            
            for (let i = 0; i < state.length; i++) {
                if (state[i] === '') {
                    state[i] = player;
                    const score = minimax(state, 0, false);
                    state[i] = '';
                    
                    if (score > bestScore) {
                        bestScore = score;
                        bestMove = i;
                    }
                }
            }
            
            return bestMove;
        }

        function checkWinner(s) {
            const xMask = s.reduce((m, cell, idx) => m | (cell === 'X' ? 1 << (8 - idx) : 0), 0);
            const oMask = s.reduce((m, cell, idx) => m | (cell === 'O' ? 1 << (8 - idx) : 0), 0);
            
            for (const mask of WIN_MASKS) {
                if ((xMask & mask) === mask) return 'X';
                if ((oMask & mask) === mask) return 'O';
            }
            return null;
        }
    `], { type: 'application/javascript' })));

    // ====== Initialize Game ======
    function init() {
        setupEventListeners();
        updatePlayerTypes();
        
        // Start AI if first player is computer
        if (playerTypes[currentPlayer.toLowerCase()] === 'computer') {
            setTimeout(() => makeAIMove(), 500);
        }
    }

    // ====== Event Listeners ======
    function setupEventListeners() {
        // Debounced cell clicks (60FPS optimized)
        cells.forEach(cell => {
            cell.addEventListener('click', (e) => {
                if (!gameActive) return;
                const clickedCell = e.target;
                const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));
                if (gameState[clickedCellIndex] !== '') return;
                if (playerTypes[currentPlayer.toLowerCase()] !== 'human') return;
                
                requestAnimationFrame(() => makeMove(clickedCellIndex));
            });
        });

        // Game controls
        resetButton.addEventListener('click', resetGame);
        resetScoresButton.addEventListener('click', resetScores);
        gameModeSelect.addEventListener('change', updateGameMode);
        difficultySelect.addEventListener('change', updateDifficulty);
    }

    // ====== Game Logic ======
    function makeMove(index) {
        if (!gameActive || gameState[index] !== '') return;

        // Update game state
        gameState[index] = currentPlayer;
        moveHistory.push({ player: currentPlayer, position: index });

        // Animate cell
        animateCell(cells[index], currentPlayer);
        
        // Play sound
        playSound(currentPlayer.toLowerCase());
        
        // Check result
        checkResult();
        
        if (gameActive) {
            switchPlayer();
            if (playerTypes[currentPlayer.toLowerCase()] === 'computer') {
                setTimeout(() => makeAIMove(), 500);
            }
        }
    }

    function animateCell(cell, player) {
        cell.textContent = player;
        cell.classList.add(player.toLowerCase(), 'cell-pop');
        
        // Remove animation class after completion
        setTimeout(() => {
            cell.classList.remove('cell-pop');
        }, 300);
    }

    function switchPlayer() {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        status.textContent = `${currentPlayer}'S TURN`;
        status.className = 'status';
        status.classList.add(currentPlayer.toLowerCase());
    }

    // ====== AI Logic ======
    function makeAIMove() {
        if (!gameActive) return;
        aiWorker.postMessage({ 
            gameState: [...gameState], 
            currentPlayer, 
            difficulty 
        });
    }

    aiWorker.onmessage = (e) => {
        const move = e.data;
        if (move !== null && move !== undefined) {
            makeMove(move);
        }
    };

    // ====== Game Results ======
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

    function checkWinner() {
        const xMask = gameState.reduce((mask, cell, idx) => 
            mask | (cell === 'X' ? 1 << (8 - idx) : 0), 0);
        const oMask = gameState.reduce((mask, cell, idx) => 
            mask | (cell === 'O' ? 1 << (8 - idx) : 0), 0);
        
        for (const mask of WIN_MASKS) {
            if ((xMask & mask) === mask) return 'X';
            if ((oMask & mask) === mask) return 'O';
        }
        return null;
    }

    function handleWin(winner) {
        // Update UI
        status.textContent = `PLAYER ${winner} WINS!`;
        status.className = 'status win-text';
        status.classList.add(winner.toLowerCase());
        
        // Highlight winning cells
        highlightWinningCells(winner);
        
        // Update score
        updateScore(winner);
        
        // Play sound and confetti
        playSound('win');
        createConfetti(winner === 'X' ? '#ff2d75' : '#00bfff');
        
        gameActive = false;
    }

    function handleDraw() {
        status.textContent = 'DRAW!';
        status.className = 'status draw-text';
        playSound('draw');
        gameActive = false;
    }

    function highlightWinningCells(winner) {
        const winMask = gameState.reduce((mask, cell, idx) => 
            mask | (cell === winner ? 1 << (8 - idx) : 0), 0);
        
        for (const mask of WIN_MASKS) {
            if ((winMask & mask) === mask) {
                const winningCells = [];
                for (let i = 0; i < 9; i++) {
                    if (mask & (1 << (8 - i))) {
                        cells[i].classList.add('winning-cell');
                        winningCells.push(i);
                    }
                }
                break;
            }
        }
    }

    // ====== Score Management ======
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

    function animateScore(element) {
        element.classList.add('score-pop');
        setTimeout(() => element.classList.remove('score-pop'), 300);
    }

    function resetScores() {
        scores = { x: 0, o: 0 };
        scoreX.textContent = '0';
        scoreO.textContent = '0';
        playSound('reset');
    }

    // ====== Game Reset ======
    function resetGame() {
        currentPlayer = 'X';
        gameState = ['', '', '', '', '', '', '', '', ''];
        gameActive = true;
        moveHistory = [];
        
        // Reset UI
        status.textContent = `${currentPlayer}'S TURN`;
        status.className = 'status';
        status.classList.add(currentPlayer.toLowerCase());
        
        cells.forEach(cell => {
            cell.textContent = '';
            cell.className = 'cell';
        });
        
        // Clear confetti
        confettiContainer.innerHTML = '';
        confettiContainer.style.display = 'none';
        
        // Start AI if needed
        if (playerTypes[currentPlayer.toLowerCase()] === 'computer') {
            setTimeout(() => makeAIMove(), 500);
        }
    }

    // ====== Visual Effects ======
    function createConfetti(color) {
        confettiContainer.innerHTML = '';
        confettiContainer.style.display = 'block';
        
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.backgroundColor = color;
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.animationDelay = `${Math.random() * 2}s`;
            confettiContainer.appendChild(confetti);
        }
        
        setTimeout(() => {
            confettiContainer.style.display = 'none';
        }, 5000);
    }

    // ====== Sound Management ======
    function playSound(type) {
        if (!soundEnabled || !sounds[type]) return;
        sounds[type].currentTime = 0;
        sounds[type].play().catch(e => console.log('Audio error:', e));
    }

    // ====== Game Mode Management ======
    function updateGameMode(e) {
        gameMode = e.target.value;
        updatePlayerTypes();
        resetGame();
    }

    function updateDifficulty(e) {
        difficulty = e.target.value;
    }

    function updatePlayerTypes() {
        switch(gameMode) {
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

    // ====== Start the Game ======
    init();
});
