import { ANSI } from "./ansi.mjs";

const ART = `
${ANSI.COLOR.GREEN} ______  ____   __      ______   ____    __      ______   ___     ___
|      ||    | /  ]    |      | /    |  /  ]    |      | /   \\   /  _]
|      | |  | /  /     |      ||  o  | /  /     |      ||     | /  [_
|_|  |_| |  |/  /      |_|  |_||     |/  /      |_|  |_||  O  ||    _]
  |  |   |  /   \\_       |  |  |  _  /   \\_       |  |  |     ||   [_
  |  |   |  \\     |      |  |  |  |  \\     |      |  |  |     ||     |
  |__|  |____\\____|      |__|  |__|__|\\____|      |__|   \\___/ |_____|

${ANSI.COLOR.YELLOW}               Tic Tac Toe${ANSI.COLOR.RESET}
${ANSI.COLOR.RED}           Player vs Computer${ANSI.COLOR.RESET}
`;

function showSplashScreen() {
    console.log(ART);
}

export default showSplashScreen;
