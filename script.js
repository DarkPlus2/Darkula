document.addEventListener('DOMContentLoaded', () => {
    // Game state
    const gameState = {
        board: Array(9).fill().map(() => Array(9).fill('')),
        activeBoard: null,
        currentPlayer: 'X',
        gameMode: 'pvp',
        scores: { X: 0, O: 0, ties: 0 },
        gameOver: false,
        difficulty: 'medium'
    };

    // DOM elements
    const mainGrid = document.getElementById('main-grid');
    const statusMessage = document.getElementById('status');
    const xScoreElement = document.querySelector('.x-score .score-value');
    const oScoreElement = document.querySelector('.o-score .score-value');
    const tiesScoreElement = document.querySelector('.ties .score-value');
    const pvpBtn = document.getElementById('pvp-btn');
    const pvcBtn = document.getElementById('pvc-btn');
    const difficultySelect = document.getElementById('difficulty');
    const difficultyContainer = document.getElementById('difficulty-container');
    const restartBtn = document.getElementById('restart-btn');
    const newGameBtn = document.getElementById('new-game-btn');
    const confettiContainer = document.getElementById('confetti-container');

    // Initialize the game
    function initGame() {
        gameState.board = Array(9).fill().map(() => Array(9).fill(''));
        gameState.activeBoard = null;
        gameState.currentPlayer = 'X';
        gameState.gameOver = false;
        
        renderBoard();
        updateStatus();
        updateScoresDisplay();
        
        // Highlight active player
        document.querySelector('.x-score').classList.add('active');
        document.querySelector('.o-score').classList.remove('active');
        
        // If PVC mode and computer's turn, make a move
        if (gameState.gameMode === 'pvc' && gameState.currentPlayer === 'O') {
            setTimeout(computerMove, 500);
        }
    }

    // Render the main grid and sub-grids
    function renderBoard() {
        mainGrid.innerHTML = '';
        
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.index = i;
            
            // Check if this board is won
            const boardWinner = checkWinner(gameState.board[i]);
            if (boardWinner) {
                cell.classList.add(boardWinner.toLowerCase());
                cell.innerHTML = boardWinner === 'X' ? '<i class="fas fa-times"></i>' : '<i class="far fa-circle"></i>';
                continue;
            }
            
            // Check if this board is full (tie)
            if (isBoardFull(gameState.board[i])) {
                cell.textContent = 'T';
                cell.style.color = '#636e72';
                continue;
            }
            
            // Create sub-grid for active boards
            if (gameState.activeBoard === null || gameState.activeBoard === i) {
                cell.classList.add('active-board');
                const subGrid = document.createElement('div');
                subGrid.className = 'sub-grid';
                subGrid.style.display = 'grid';
                subGrid.style.gridTemplateColumns = 'repeat(3, 1fr)';
                subGrid.style.gridTemplateRows = 'repeat(3, 1fr)';
                subGrid.style.gap = '5px';
                subGrid.style.width = '100%';
                subGrid.style.height = '100%';
                
                for (let j = 0; j < 9; j++) {
                    const subCell = document.createElement('div');
                    subCell.className = 'sub-cell';
                    subCell.dataset.boardIndex = i;
                    subCell.dataset.cellIndex = j;
                    
                    if (gameState.board[i][j]) {
                        subCell.classList.add(gameState.board[i][j].toLowerCase());
                        subCell.innerHTML = gameState.board[i][j] === 'X' ? 
                            '<i class="fas fa-times"></i>' : 
                            '<i class="far fa-circle"></i>';
                    } else {
                        subCell.addEventListener('click', handleCellClick);
                    }
                    
                    subGrid.appendChild(subCell);
                }
                
                cell.appendChild(subGrid);
            }
            
            mainGrid.appendChild(cell);
        }
    }

    // Handle cell click
    function handleCellClick(e) {
        if (gameState.gameOver) return;
        
        const boardIndex = parseInt(e.target.dataset.boardIndex);
        const cellIndex = parseInt(e.target.dataset.cellIndex);
        
        // Check if the move is valid
        if (gameState.board[boardIndex][cellIndex] !== '' || 
            (gameState.activeBoard !== null && gameState.activeBoard !== boardIndex)) {
            return;
        }
        
        // Make the move
        gameState.board[boardIndex][cellIndex] = gameState.currentPlayer;
        
        // Check if the sub-board is won
        const subBoardWinner = checkWinner(gameState.board[boardIndex]);
        
        // Determine next active board
        gameState.activeBoard = isBoardFull(gameState.board[cellIndex]) || checkWinner(gameState.board[cellIndex]) ? null : cellIndex;
        
        // Switch player
        gameState.currentPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';
        
        // Update UI
        renderBoard();
        updateStatus();
        
        // Highlight active player
        document.querySelector('.x-score').classList.toggle('active', gameState.currentPlayer === 'X');
        document.querySelector('.o-score').classList.toggle('active', gameState.currentPlayer === 'O');
        
        // Check for overall game winner
        const overallWinner = checkOverallWinner();
        if (overallWinner) {
            gameState.gameOver = true;
            if (overallWinner !== 'tie') {
                gameState.scores[overallWinner]++;
                showConfetti();
                statusMessage.textContent = `${overallWinner} wins the game!`;
            } else {
                gameState.scores.ties++;
                statusMessage.textContent = "It's a tie!";
            }
            updateScoresDisplay();
            return;
        }
        
        // If PVC mode and computer's turn, make a move
        if (gameState.gameMode === 'pvc' && gameState.currentPlayer === 'O' && !gameState.gameOver) {
            setTimeout(computerMove, 500);
        }
    }

    // Computer move logic
    function computerMove() {
        if (gameState.gameOver) return;
        
        let boardIndex, cellIndex;
        
        if (gameState.difficulty === 'easy') {
            // Easy: random moves
            [boardIndex, cellIndex] = getRandomMove();
        } else if (gameState.difficulty === 'medium') {
            // Medium: sometimes blocks or wins if obvious
            const move = getSmartMove();
            boardIndex = move.boardIndex;
            cellIndex = move.cellIndex;
        } else {
            // Hard: more strategic
            const move = getStrategicMove();
            boardIndex = move.boardIndex;
            cellIndex = move.cellIndex;
        }
        
        // Make the move
        gameState.board[boardIndex][cellIndex] = 'O';
        
        // Check if the sub-board is won
        const subBoardWinner = checkWinner(gameState.board[boardIndex]);
        
        // Determine next active board
        gameState.activeBoard = isBoardFull(gameState.board[cellIndex]) || checkWinner(gameState.board[cellIndex]) ? null : cellIndex;
        
        // Switch player
        gameState.currentPlayer = 'X';
        
        // Update UI
        renderBoard();
        updateStatus();
        
        // Highlight active player
        document.querySelector('.x-score').classList.add('active');
        document.querySelector('.o-score').classList.remove('active');
        
        // Check for overall game winner
        const overallWinner = checkOverallWinner();
        if (overallWinner) {
            gameState.gameOver = true;
            if (overallWinner !== 'tie') {
                gameState.scores[overallWinner]++;
                if (overallWinner === 'O') showConfetti();
                statusMessage.textContent = `${overallWinner} wins the game!`;
            } else {
                gameState.scores.ties++;
                statusMessage.textContent = "It's a tie!";
            }
            updateScoresDisplay();
        }
    }

    // Get a random valid move
    function getRandomMove() {
        let validMoves = [];
        
        // If activeBoard is specified, only look there
        const boardsToCheck = gameState.activeBoard !== null ? [gameState.activeBoard] : [...Array(9).keys()];
        
        for (const boardIndex of boardsToCheck) {
            // Skip if board is already won or full
            if (checkWinner(gameState.board[boardIndex]) || isBoardFull(gameState.board[boardIndex])) continue;
            
            for (let cellIndex = 0; cellIndex < 9; cellIndex++) {
                if (gameState.board[boardIndex][cellIndex] === '') {
                    validMoves.push({ boardIndex, cellIndex });
                }
            }
        }
        
        // If no valid moves in active board, look anywhere
        if (validMoves.length === 0) {
            for (let boardIndex = 0; boardIndex < 9; boardIndex++) {
                // Skip if board is already won or full
                if (checkWinner(gameState.board[boardIndex]) || isBoardFull(gameState.board[boardIndex])) continue;
                
                for (let cellIndex = 0; cellIndex < 9; cellIndex++) {
                    if (gameState.board[boardIndex][cellIndex] === '') {
                        validMoves.push({ boardIndex, cellIndex });
                    }
                }
            }
        }
        
        // Select a random move
        const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
        return [randomMove.boardIndex, randomMove.cellIndex];
    }

    // Get a smart move (looks for immediate wins/blocks)
    function getSmartMove() {
        // First, check if computer can win any sub-board
        for (let boardIndex = 0; boardIndex < 9; boardIndex++) {
            if (checkWinner(gameState.board[boardIndex]) || isBoardFull(gameState.board[boardIndex])) continue;
            
            // Try each empty cell to see if it would win the sub-board
            for (let cellIndex = 0; cellIndex < 9; cellIndex++) {
                if (gameState.board[boardIndex][cellIndex] === '') {
                    // Simulate move
                    gameState.board[boardIndex][cellIndex] = 'O';
                    const isWin = checkWinner(gameState.board[boardIndex]);
                    gameState.board[boardIndex][cellIndex] = '';
                    
                    if (isWin) {
                        return { boardIndex, cellIndex };
                    }
                }
            }
        }
        
        // Then, check if player can win any sub-board in their next move and block
        for (let boardIndex = 0; boardIndex < 9; boardIndex++) {
            if (checkWinner(gameState.board[boardIndex]) || isBoardFull(gameState.board[boardIndex])) continue;
            
            for (let cellIndex = 0; cellIndex < 9; cellIndex++) {
                if (gameState.board[boardIndex][cellIndex] === '') {
                    // Simulate player move
                    gameState.board[boardIndex][cellIndex] = 'X';
                    const isWin = checkWinner(gameState.board[boardIndex]);
                    gameState.board[boardIndex][cellIndex] = '';
                    
                    if (isWin) {
                        return { boardIndex, cellIndex };
                    }
                }
            }
        }
        
        // If no immediate wins/blocks, return a random move
        const [boardIndex, cellIndex] = getRandomMove();
        return { boardIndex, cellIndex };
    }

    // Get a strategic move (more advanced logic)
    function getStrategicMove() {
        // Try to get center or corners first
        const preferredCells = [4, 0, 2, 6, 8, 1, 3, 5, 7]; // Center first, then corners, then edges
        
        // First, check for immediate wins/blocks (same as smart move)
        const smartMove = getSmartMove();
        if (smartMove) return smartMove;
        
        // Then try to get center of any board
        for (let boardIndex = 0; boardIndex < 9; boardIndex++) {
            if (checkWinner(gameState.board[boardIndex]) || isBoardFull(gameState.board[boardIndex])) continue;
            
            if (gameState.board[boardIndex][4] === '') {
                return { boardIndex, cellIndex: 4 };
            }
        }
        
        // Then try to get corners
        for (const cellIndex of [0, 2, 6, 8]) {
            for (let boardIndex = 0; boardIndex < 9; boardIndex++) {
                if (checkWinner(gameState.board[boardIndex]) || isBoardFull(gameState.board[boardIndex])) continue;
                
                if (gameState.board[boardIndex][cellIndex] === '') {
                    return { boardIndex, cellIndex };
                }
            }
        }
        
        // Fall back to random move
        const [boardIndex, cellIndex] = getRandomMove();
        return { boardIndex, cellIndex };
    }

    // Check for winner in a 3x3 board
    function checkWinner(board) {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6]             // diagonals
        ];
        
        for (const pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }
        
        return null;
    }

    // Check if a 3x3 board is full
    function isBoardFull(board) {
        return board.every(cell => cell !== '');
    }

    // Check for overall game winner
    function checkOverallWinner() {
        // Create a meta-board representing each sub-board's status
        const metaBoard = [];
        for (let i = 0; i < 9; i++) {
            const winner = checkWinner(gameState.board[i]);
            if (winner) {
                metaBoard.push(winner);
            } else if (isBoardFull(gameState.board[i])) {
                metaBoard.push('T'); // Tie
            } else {
                metaBoard.push(''); // Still playable
            }
        }
        
        // Check if meta-board has a winner
        const winner = checkWinner(metaBoard);
        if (winner) return winner;
        
        // Check if all boards are decided (won or tied)
        if (metaBoard.every(cell => cell !== '')) {
            return 'tie';
        }
        
        return null;
    }

    // Update status message
    function updateStatus() {
        if (gameState.gameOver) return;
        
        if (gameState.activeBoard === null) {
            statusMessage.textContent = `${gameState.currentPlayer}'s turn (any board)`;
        } else {
            statusMessage.textContent = `${gameState.currentPlayer}'s turn (board ${gameState.activeBoard + 1})`;
        }
    }

    // Update scores display
    function updateScoresDisplay() {
        xScoreElement.textContent = gameState.scores.X;
        oScoreElement.textContent = gameState.scores.O;
        tiesScoreElement.textContent = gameState.scores.ties;
    }

    // Show confetti animation
    function showConfetti() {
        // Clear any existing confetti
        confettiContainer.innerHTML = '';
        
        // Create 50 confetti pieces
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            
            // Random properties
            const size = Math.random() * 10 + 5;
            const color = `hsl(${Math.random() * 360}, 100%, 50%)`;
            const left = Math.random() * 100;
            const animationDuration = Math.random() * 3 + 2;
            
            confetti.style.width = `${size}px`;
            confetti.style.height = `${size}px`;
            confetti.style.backgroundColor = color;
            confetti.style.left = `${left}%`;
            confetti.style.animationDuration = `${animationDuration}s`;
            confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
            
            confettiContainer.appendChild(confetti);
        }
        
        // Remove confetti after animation
        setTimeout(() => {
            confettiContainer.innerHTML = '';
        }, 5000);
    }

    // Event listeners
    pvpBtn.addEventListener('click', () => {
        gameState.gameMode = 'pvp';
        pvpBtn.classList.add('active');
        pvcBtn.classList.remove('active');
        difficultyContainer.style.display = 'none';
        initGame();
    });

    pvcBtn.addEventListener('click', () => {
        gameState.gameMode = 'pvc';
        pvcBtn.classList.add('active');
        pvpBtn.classList.remove('active');
        difficultyContainer.style.display = 'flex';
        initGame();
    });

    difficultySelect.addEventListener('change', () => {
        gameState.difficulty = difficultySelect.value;
    });

    restartBtn.addEventListener('click', initGame);

    newGameBtn.addEventListener('click', () => {
        gameState.scores = { X: 0, O: 0, ties: 0 };
        initGame();
    });

    // Initialize the game
    initGame();
});
