import { print, askQuestion } from "./io.mjs";
import { debug, DEBUG_LEVELS } from "./debug.mjs";
import { ANSI } from "./ansi.mjs";
import DICTIONARY from "./language.mjs";
import showSplashScreen from "./splash.mjs";

const GAME_BOARD_SIZE = 3;
const PLAYER_1 = 1;
const PLAYER_2 = -1;

const MENU_CHOICES = {
    MENU_CHOICE_START_GAME: 1,
    MENU_CHOICE_START_PVC: 2,
    MENU_CHOICE_SHOW_SETTINGS: 3,
    MENU_CHOICE_EXIT_GAME: 4
};

const NO_CHOICE = -1;

let language = DICTIONARY.en;
let gameboard;
let currentPlayer;

clearScreen();
showSplashScreen();
setTimeout(start, 2500);

async function start() {
    do {
        let chosenAction = NO_CHOICE;
        chosenAction = await showMenu();

        if (chosenAction == MENU_CHOICES.MENU_CHOICE_START_GAME) {
            await runGame();
        } else if (chosenAction == MENU_CHOICES.MENU_CHOICE_START_PVC) {
            await runGame();
        } else if (chosenAction == MENU_CHOICES.MENU_CHOICE_SHOW_SETTINGS) {
        } else if (chosenAction == MENU_CHOICES.MENU_CHOICE_EXIT_GAME) {
            clearScreen();
            process.exit();
        }

    } while (true);
}

async function runGame() {
    let isPlaying = true;

    while (isPlaying) {
        initializeGame();
        let chosenGameMode = await askQuestion("Choose game mode (1: PvP, 2: PvC): ");
        if (chosenGameMode === "2") {
            while (true) {
                await playGame();
                if (evaluateGameState() !== 0) break; 
                computerMove();
                if (evaluateGameState() !== 0) break; 
            }
        } else {
            isPlaying = await playGame();
        }
    }
}

async function showMenu() {
    let choice = -1;
    let validChoice = false;

    while (!validChoice) {
        clearScreen();
        print(ANSI.COLOR.YELLOW + "MENU" + ANSI.RESET);
        print("1. Play Player vs Player");
        print("2. Play Player vs Computer");
        print("3. Settings");
        print("4. Exit Game");

        choice = await askQuestion("");

        if ([MENU_CHOICES.MENU_CHOICE_START_GAME, MENU_CHOICES.MENU_CHOICE_START_PVC, MENU_CHOICES.MENU_CHOICE_SHOW_SETTINGS, MENU_CHOICES.MENU_CHOICE_EXIT_GAME].includes(Number(choice))) {
            validChoice = true;
        }
    }

    return choice;
}

async function playGame() {
    let outcome;
    do {
        clearScreen();
        showGameBoardWithCurrentState();
        showHUD();

        if (currentPlayer === PLAYER_1) {
            let move = await getGameMoveFromCurrentPlayer();
            updateGameBoardState(move);
        } else {
            computerMove();
        }

        outcome = evaluateGameState();
        changeCurrentPlayer();
    } while (outcome == 0);

    showGameSummary(outcome);
    return await askWantToPlayAgain();
}

async function askWantToPlayAgain() {
    let answer = await askQuestion(language.PLAY_AGAIN_QUESTION);
    let playAgain = true;
    if (answer && answer.toLowerCase()[0] != language.CONFIRM) {
        playAgain = false;
    }
    return playAgain;
}

function showGameSummary(outcome) {
    clearScreen();
    let winningPlayer = (outcome > 0) ? 1 : 2;
    print("Winner is player " + winningPlayer);
    showGameBoardWithCurrentState();
    print("GAME OVER");
}

function changeCurrentPlayer() {
    currentPlayer *= -1;
}

function evaluateGameState() {
    let sum = 0;
    let state = 0;

    for (let row = 0; row < GAME_BOARD_SIZE; row++) {
        for (let col = 0; col < GAME_BOARD_SIZE; col++) {
            sum += gameboard[row][col];
        }

        if (Math.abs(sum) == 3) {
            state = sum;
        }
        sum = 0;
    }

    for (let col = 0; col < GAME_BOARD_SIZE; col++) {
        for (let row = 0; row < GAME_BOARD_SIZE; row++) {
            sum += gameboard[row][col];
        }

        if (Math.abs(sum) == 3) {
            state = sum;
        }

        sum = 0;
    }

    let winner = state / 3;
    return winner;
}

function updateGameBoardState(move) {
    const ROW_ID = 0;
    const COLUMN_ID = 1;
    gameboard[move[ROW_ID] - 1][move[COLUMN_ID] - 1] = currentPlayer;
}

async function getGameMoveFromCurrentPlayer() {
    let position = null;
    do {
        let rawInput = await askQuestion("Place your mark at (row column): ");
        position = rawInput.split(" ").map(Number);
    } while (isValidPositionOnBoard(position) == false);

    return position;
}

function isValidPositionOnBoard(position) {
    if (position.length < 2) {
        return false;
    }

    let isValidInput = true;
    if (position[0] < 1 || position[0] > GAME_BOARD_SIZE || position[1] < 1 || position[1] > GAME_BOARD_SIZE) {
        isValidInput = false;
    } else if (gameboard[position[0] - 1][position[1] - 1] !== 0) {
        isValidInput = false;
    }

    return isValidInput;
}

function showHUD() {
    let playerDescription = "one";
    if (PLAYER_2 == currentPlayer) {
        playerDescription = "two";
    }
    print("Player " + playerDescription + " it is your turn");
}

function showGameBoardWithCurrentState() {
    for (let currentRow = 0; currentRow < GAME_BOARD_SIZE; currentRow++) {
        let rowOutput = "";
        for (let currentCol = 0; currentCol < GAME_BOARD_SIZE; currentCol++) {
            let cell = gameboard[currentRow][currentCol];
            if (cell == 0) {
                rowOutput += "_ ";
            } else if (cell > 0) {
                rowOutput += "X ";
            } else {
                rowOutput += "O  ";
            }
        }

        print(rowOutput);
    }
}

function initializeGame() {
    gameboard = createGameBoard();
    currentPlayer = PLAYER_1;
}

function createGameBoard() {
    let newBoard = new Array(GAME_BOARD_SIZE);

    for (let currentRow = 0; currentRow < GAME_BOARD_SIZE; currentRow++) {
        let row = new Array(GAME_BOARD_SIZE);
        for (let currentColumn = 0; currentColumn < GAME_BOARD_SIZE; currentColumn++) {
            row[currentColumn] = 0;
        }
        newBoard[currentRow] = row;
    }

    return newBoard;
}

function computerMove() {
    let emptyCells = [];
    
    for (let row = 0; row < GAME_BOARD_SIZE; row++) {
        for (let col = 0; col < GAME_BOARD_SIZE; col++) {
            if (gameboard[row][col] === 0) {
                emptyCells.push([row, col]);
            }
        }
    }

    if (emptyCells.length > 0) {
        const randomIndex = Math.floor(Math.random() * emptyCells.length);
        const move = emptyCells[randomIndex];
        gameboard[move[0]][move[1]] = PLAYER_2;
        print(`Computer placed 'O' at: ${move[0] + 1} ${move[1] + 1}`);
    }
}

function clearScreen() {
    console.log(ANSI.CLEAR_SCREEN, ANSI.CURSOR_HOME, ANSI.RESET);
}


//#endregion

