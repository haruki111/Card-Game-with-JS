class Card {
    suit = ["H", "D", "C", "S"];
    rank = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

    constructor(suit, rank) {
        this.suit = suit
        this.rank = rank
    }

    getRankNumber() {
        if (this.rank == "A") return 11;
        else if (this.rank == "J" || this.rank == "Q" || this.rank == "K") return 10;
        return Number(this.rank);
    }
}

class Deck {
    constructor(gameType) {
        this.gameType = gameType;
        this.deck = Deck.generateDeck(gameType);
    }

    static generateDeck(gameType) {
        let newDeck = [];
        let suit = ["H", "D", "C", "S"];
        let rank = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

        if (gameType == "blackjack") {
            for (let i = 0; i < suit.length; i++) {
                for (let j = 0; j < rank.length; j++) {
                    newDeck.push(new Card(suit[i], rank[j]));
                }
            }
        }

        return newDeck;
    }

    shuffleDeck() {
        let newDeck = [];

        while (this.deck.length > 0) {
            let l = this.deck.length;
            let random = Math.floor(Math.random() * l);

            newDeck.push(this.deck[random]);
            this.deck.splice(random, 1);
        }
        this.deck = newDeck;
    }

    drawOne() {
        return this.deck.shift();
    }

    resetDeck() {
        this.deck = Deck.generateDeck(this.gameType);
        this.shuffleDeck();
    }
}

class MartingaleMethod {
    constructor(chips) {
        this.basic = Math.floor(chips * 0.05);
        this.bet = 0;
    }

    method(player) {
        let winOrLose = player.grades[player.grades.length - 1];
        if (player.grades.length == 0) {
            this.bet = this.basic;
            return this.bet;
        }

        else {
            if (winOrLose != 1) { //負けOr引き分けの場合
                this.bet *= 2;
                return this.bet;
            }
            else {
                this.bet = this.basic;
                return this.bet;
            }
        }
    }
}

class GranMartingaleMethod {
    constructor(chips) {
        this.basic = Math.floor(chips * 0.05);
        this.additional = this.basic;
        this.bet = 0;
    }

    method(player) {
        let winOrLose = player.grades[player.grades.length - 1];
        if (player.grades.length == 0) {
            this.bet = this.basic;
            return this.bet;
        }

        else {
            if (winOrLose != 1) { //負けOr引き分けの場合
                this.bet = (this.bet * 2) + this.additional;
                return this.bet;
            }
            else {
                this.bet = this.basic;
                return this.bet;
            }
        }
    }
}

class TenPercentMethod {
    constructor(basic) {
        this.basic = Math.floor(basic * 0.1);
    }

    method(player) {
        return Math.floor(player.chips * 0.1);
    }
}

class GoodManMethod {
    constructor() {
        this.basic = [10, 20, 30, 50];
        this.bet = 0;
    }

    method(player) {
        let winOrLose = player.grades[player.grades.length - 1];
        if (player.grades.length == 0) {
            this.bet = this.basic[0];
            return this.basic[0];
        }

        else {
            if (winOrLose != 1) { //負けOr引き分けの場合
                this.bet = this.basic[0];
                return this.bet;
            }
            else {
                let order = this.basic.indexOf(this.bet);
                if (order == this.basic.length) this.bet = this.basic[order];
                else this.bet = this.basic[order + 1];
                return this.bet;
            }
        }
    }
}

class Investments {
    constructor(basic) {
        this.item = [new MartingaleMethod(basic), new GranMartingaleMethod(basic), new TenPercentMethod(basic), new GoodManMethod()];
        this.random = Math.floor(Math.random() * this.item.length);
        return this.item[this.random];
    }
}

class Player {
    constructor(name, type, gameType, chips = 400) {
        this.name = name;
        this.type = type;
        this.gameType = gameType;
        this.chips = chips;
        if (this.type == "house") this.chips = -1;
        this.hand = [new Card("?", "?"), new Card("?", "?")];
        this.grades = []; //成績
        this.investment = new Investments(this.chips); //投資法
        this.bet = 0; // 現在のラウンドでのベットしているチップ
        this.winAmount = 0 // 勝利金額
        this.gameStatus = 'betting'
    }

    promptPlayer(userData, houseScore) {
        let gameDecision;
        if (this.gameStatus == "betting") {
            if (userData == null) {
                let latch = this.investment.method(this);
                if (latch >= this.chips * 0.7) latch = Math.floor(this.chips / 2);
                gameDecision = new GameDecision("bet", latch);
            }
            else gameDecision = new GameDecision("bet", userData);
        }

        else if (this.gameStatus == "bet" || this.gameStatus == "hit") {
            if (userData == null) {
                let playerScore = this.getHandScore();

                if (this.isValid11AOnce()) {
                    gameDecision = new GameDecision(this.softHandAction(playerScore, houseScore), 0);
                }
                else {
                    gameDecision = new GameDecision(this.hardHandAction(playerScore, houseScore), 0);
                }
            }
            else gameDecision = new GameDecision(userData, 0);
        }

        else if (this.gameStatus == "stand" || this.gameStatus == "surrender") {
            gameDecision = new GameDecision(userData, 0);
        }

        return gameDecision;
    }

    softHandAction(playerScore, houseScore) {
        let softHand = [
            ["H", "H", "H", "D", "D", "H", "H", "H", "H", "H"],
            ["H", "H", "H", "D", "D", "H", "H", "H", "H", "H"],
            ["H", "H", "D", "D", "D", "H", "H", "H", "H", "H"],
            ["H", "H", "D", "D", "D", "H", "H", "H", "H", "H"],
            ["H", "D", "D", "D", "D", "H", "H", "H", "H", "H"],
            ["S", "D", "D", "D", "D", "S", "S", "H", "H", "H"],
            ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S"],
            ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S"],
        ];
        let hashAction = { "H": "hit", "D": "double", "S": "stand", "R": "surrender" };

        let playerSelectArr = [13, 14, 15, 16, 17, 18, 19, 20];
        let houseSelectArr = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

        let playerSelect = playerSelectArr.indexOf(playerScore);
        if (playerScore < 13) playerSelect = 0;
        if (playerScore > 20) playerSelect = 7;
        let houseSelect = houseSelectArr.indexOf(houseScore);

        let playerAction = hashAction[softHand[playerSelect][houseSelect]];
        if (this.hand.length > 2 && playerAction == "double") playerAction = "hit";
        if (playerAction == "double" && this.bet > this.chips) playerAction = "hit";

        return playerAction;
    }

    hardHandAction(playerScore, houseScore) {
        let hardHand = [
            ["H", "H", "H", "H", "H", "H", "H", "H", "H", "H"],
            ["H", "D", "D", "D", "D", "H", "H", "H", "H", "H"],
            ["D", "D", "D", "D", "D", "D", "D", "D", "H", "H"],
            ["D", "D", "D", "D", "D", "D", "D", "D", "D", "H"],
            ["H", "H", "S", "S", "S", "H", "H", "H", "H", "H"],
            ["S", "S", "S", "S", "S", "H", "H", "H", "H", "H"],
            ["S", "S", "S", "S", "S", "H", "H", "H", "R", "H"],
            ["S", "S", "S", "S", "S", "H", "H", "R", "R", "R"],
            ["S", "S", "S", "S", "S", "H", "H", "H", "H", "H"],
            ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S"],
        ];
        let hashAction = { "H": "hit", "D": "double", "S": "stand", "R": "surrender" };

        let playerSelectArr = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
        let houseSelectArr = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

        let playerSelect = playerSelectArr.indexOf(playerScore);
        if (playerScore < 9) playerSelect = 0;
        if (playerScore > 16) playerSelect = 9;

        let houseSelect = houseSelectArr.indexOf(houseScore);

        let playerAction = hashAction[hardHand[playerSelect][houseSelect]];
        if (this.hand.length > 2 && (playerAction == "double" || playerAction == "surrender")) playerAction = "hit";
        if (playerAction == "double" && this.bet > this.chips) playerAction = "hit";

        return playerAction;
    }

    getHandScore() {
        let scoreAnd11AHash = this.scoreAnd11A();
        return scoreAnd11AHash["score"];
    }

    isValid11AOnce() {
        let scoreAnd11AHash = this.scoreAnd11A();
        return scoreAnd11AHash["haveA"] == 1;
    }

    scoreAnd11A() {
        let score = 0;
        let haveA = 0;

        for (let i = 0; i < this.hand.length; i++) {
            score += this.hand[i].getRankNumber();
            if (this.hand[i].rank == "A") haveA++;
        }

        while (score > 21 && haveA > 0) {
            haveA--;
            score -= 10;
        }
        return { "score": score, "haveA": haveA };
    }
}

class GameDecision {
    constructor(action, amount) {
        this.action = action
        this.amount = amount
    }
}

class Table {
    constructor(userName, gameType, gameRound, gameSpeed, betDenominations = [5, 20, 50, 100]) {
        this.gameType = gameType;
        this.round = gameRound;
        this.gameSpeed = gameSpeed;
        this.betDenominations = betDenominations;
        this.deck = new Deck(this.gameType);
        this.deck.shuffleDeck();
        let userType = userName == "ai" ? "ai" : "user";
        this.players = [new Player("player1", "ai", this.gameType), new Player(userName, userType, this.gameType), new Player('player3', 'ai', this.gameType)];
        this.house = new Player("house", "house", this.gameType);
        this.house.gameStatus = "waitingForBets";
        this.gamePhase = "betting";//betting, acting, 'evaluatingWinners, gameOver'
        this.resultsLog = [];
        this.turnCounter = 1;
        this.currRound = 1;
    }

    evaluateMove(player, gameDecision) {
        if (gameDecision.action == "bet") {
            player.bet = gameDecision.amount;
            player.chips -= player.bet;
            player.gameStatus = "bet";
        }
        if (this.gamePhase == "acting") {
            if (gameDecision.action == "surrender") {
                player.gameStatus = "surrender";
                player.bet -= Math.ceil(player.bet / 2)
                player.chips += player.bet;
            }
            else if (gameDecision.action == "stand") {
                player.gameStatus = "stand";
            }
            else if (gameDecision.action == "hit") {
                player.gameStatus = "hit";
                player.hand.push(this.deck.drawOne());
            }
            else if (gameDecision.action == "double") {
                player.gameStatus = "double";
                player.bet *= 2;
                player.chips -= (player.bet / 2);
                player.hand.push(this.deck.drawOne());
            }

            if (player.getHandScore() > 21) {
                player.gameStatus = "bust";
            }
        }
    }

    blackjackGetRoundResults() {
        let hash = {};
        hash["round"] = this.currRound;
        hash["result"] = [];

        for (let i = 0; i < this.players.length; i++) {
            let player = this.players[i];
            hash["result"][i] = { "name": player.name, "action": player.gameStatus, "bet": player.bet, "won": player.winAmount, "chips": player.chips };
        }
        this.resultsLog[this.resultsLog.length] = hash;
        return this.resultsLog[this.resultsLog.length - 1];
    }

    blackjackAssignPlayerHands() {
        for (let i = 0; i < this.players.length; i++) {
            this.players[i].hand[0] = this.deck.drawOne();
            this.players[i].hand[1] = this.deck.drawOne();
        }

        this.house.hand[0] = this.deck.drawOne();
        this.house.hand[1] = this.deck.drawOne();
    }

    blackjackClearPlayerHandsAndBets() {
        this.deck.resetDeck();

        for (let i = 0; i < this.players.length; i++) {
            let player = this.players[i];
            player.bet = 0;
            player.winAmount = 0;
            player.hand.length = 0;
            player.hand = [new Card("?", "?"), new Card("?", "?")];
            player.gameStatus = 'betting';
        }

        this.house.hand.length = 0;
        this.house.hand = [new Card("?", "?"), new Card("?", "?")];
        this.house.gameStatus = 'betting';
    }

    getTurnPlayer() {
        if (this.turnCounter == -1) return this.house;
        let turnPlayer = this.turnCounter % this.players.length;
        return turnPlayer == 0 ? this.players[this.players.length - 1] : this.players[turnPlayer - 1];
    }

    validBlackJack() {
        for (let i = 0; i < this.players.length; i++) {
            let player = this.players[i];
            if (player.getHandScore() == 21 && player.hand.length == 2) player.gameStatus = "blackjack";
        }
    }

    haveTurn(userData) {
        let player = this.getTurnPlayer();
        if (this.gamePhase == "betting") {
            let gameDecision = player.promptPlayer(userData);
            this.evaluateMove(player, gameDecision);
            if (this.onLastPlayer()) {
                this.blackjackAssignPlayerHands(); //2枚カードを割り当て
                this.gamePhase = "acting";
                this.house.gameStatus = "waitingForActions";
                this.validBlackJack();
            }
            this.turnCounter++;
        }

        else if (this.gamePhase == "acting") {
            if (player.gameStatus == "bet" || player.gameStatus == "hit") {
                let gameDecision = player.promptPlayer(userData, this.house.hand[0].getRankNumber());
                this.evaluateMove(player, gameDecision);
            }
            this.turnCounter++;

            if (this.allPlayerActionsResolved() && this.onLastPlayer()) {
                this.gamePhase = "evaluatingWinners"
                this.turnCounter = -1;
            }
        }

        else if (this.gamePhase == "evaluatingWinners") {
            if (this.house.gameStatus == "waitingForActions" || this.house.gameStatus == "hit") {
                let houseHaveCard = this.house.hand.length;
                if (this.house.getHandScore() < 17) {
                    this.house.hand[houseHaveCard] = this.deck.drawOne();
                    this.house.gameStatus = "hit";
                }
                else {
                    if (this.house.getHandScore() == 21 && this.house.hand.length == 2) this.house.gameStatus = "blackjack";
                    else if (this.house.getHandScore() > 21) this.house.gameStatus = "bust";
                    else this.house.gameStatus = "stand";
                }
            }

            else {
                for (let i = 0; i < this.players.length; i++) {
                    this.blackjackEvaluate(this.players[i]);
                }
                Controller.renderResult(this.blackjackGetRoundResults(), this);
            }
        }
    }

    nextTurn() {
        if (this.currRound != this.round && this.gamePhase != "end") {
            this.turnCounter = 1;
            this.currRound++;
            this.gamePhase = "betting";
        }
        else this.gamePhase = "end";
    }

    blackjackEvaluate(player) {
        if (player.gameStatus == "bust" || player.gameStatus == "surrender") player.winAmount -= player.bet; //プレイヤーがバ-スト
        else if (this.house.gameStatus == "blackjack") { //ハウスがブラックジャックの場合
            if (player.gameStatus == "blackjack") {
                player.chips += player.bet;
                player.winAmount = 0;
            }
            else player.winAmount -= player.bet;
        }
        else if (player.getHandScore() > this.house.getHandScore() || this.house.gameStatus == "bust" || player.gameStatus == "blackjack") { //ハウスがバ-スト、またはプレイヤーの手札がディーラの手札よりも大きい場合
            if (player.gameStatus == "blackjack") {
                player.chips += Math.ceil(player.bet * 2.5);
                player.winAmount += Math.ceil(player.bet * 1.5);
            }
            else {
                player.chips += player.bet * 2;
                player.winAmount += player.bet;
            }
        }
        else if (this.house.gameStatus != "bust" && player.getHandScore() < this.house.getHandScore()) { //ハウスがバ-ストしておらず、ハウスの手札がプレイヤーの手札より大きい場合
            player.winAmount -= player.bet;
        }
        else player.chips += player.bet; //引き分け

        this.updateGrades(player);
        if (player.chips <= 0 && player.type == "user") this.gamePhase = "end";
    }

    updateGrades(player) {
        if (player.winAmount > 0) player.grades.push(1);
        else if (player.winAmount == 0) player.grades.push(0);
        else if (player.winAmount < 0) player.grades.push(-1);
    }

    onFirstPlayer() {
        return this.getTurnPlayer() == this.players[0];
    }

    onLastPlayer() {
        return this.getTurnPlayer() == this.players[this.players.length - 1];
    }

    allPlayerActionsResolved() {
        let setStatus = ["bust", "stand", "surrender", "double", "blackjack"];
        for (let i = 0; i < this.players.length; i++) {
            if (!setStatus.includes(this.players[i].gameStatus)) return false;
        }
        return true;
    }

    formatTable() {
        this.gamePhase = "betting";
        this.currRound = 1;
        this.turnCounter = 1;
        this.resultsLog = [];
    }

    formatPlayer() {
        this.blackjackClearPlayerHandsAndBets();
        for (let i = 0; i < this.players.length; i++) {
            this.players[i].chips = 400;
            this.players[i].grades = []; //成績
            this.players[i].investment = new Investments(this.players[i].chips); //投資法
        }
    }
}

const config = {
    initialForm: document.getElementById("initialForm"),
    mainPage: document.getElementById("mainPage")
}

const img = {
    "?": 'https://recursionist.io/img/questionMark.png',
    "H": `https://recursionist.io/img/heart.png`,
    "D": `https://recursionist.io/img/diamond.png`,
    "C": `https://recursionist.io/img/clover.png`,
    "S": `https://recursionist.io/img/spade.png`
}

class Controller {
    static startGame() {
        config.initialForm.append(View.form());

        config.initialForm.querySelectorAll("#startGameBtn")[0].addEventListener("click", () => {
            let playerName = config.initialForm.querySelectorAll(`input[id="playerName"]`)[0].value;
            let gameType = config.initialForm.querySelectorAll(`select[id="selectGame"]`)[0].value;
            let gameRound = config.initialForm.querySelectorAll(`select[id="selectRound"]`)[0].value;
            let gameSpeed = config.initialForm.querySelectorAll(`select[id="selectSpeed"]`)[0].value;

            if (playerName == '') alert("Please input your name.");
            else if (gameType == "poker") alert("鋭意製作中(多分)");
            else {
                let table1 = new Table(playerName, gameType, gameRound, gameSpeed);

                config.initialForm.innerHTML = '';
                config.mainPage.classList.add("col-12", "position-relative", "d-block");
                this.renderTable(table1);
            }
        });
    }

    static renderTable(table) {
        if (table.gamePhase == "end") this.renderFinalResult(table);


        else if (table.getTurnPlayer().type == "user") {
            let user = table.getTurnPlayer();
            if (table.gamePhase == "betting") {
                this.formatMainPage(table);
                this.renderBet(table, user); //bet表示
            }

            else if (table.gamePhase == "acting") {
                if (user.gameStatus == "bet" || user.gameStatus == "hit") this.renderAction(table, user);

                else this.renderTableHelper(table, user.gameStatus);
            }
        }

        else if (table.getTurnPlayer().type == "ai") this.renderTableHelper(table, null);

        else if (table.getTurnPlayer().type == "house") {
            if (table.house.gameStatus == "waitingForActions" || table.house.gameStatus == "hit") {
                this.renderTableHelper(table, null);
            }
            else table.haveTurn();
        }
    }

    static renderTableHelper(table, userData) {
        table.haveTurn(userData);
        this.formatMainPage(table);
        setTimeout(() => { this.renderTable(table) }, table.gameSpeed * 1000);
    }

    static formatMainPage(table) {
        config.mainPage.innerHTML = ``;
        config.mainPage.append(View.main(table), View.roundDiv(table));
    }

    static renderBet(table, user) {
        config.mainPage.append(View.betDiv(table.betDenominations));
        let bet = 0;
        let minusBet = config.mainPage.querySelectorAll("#minusBet");
        let plusBet = config.mainPage.querySelectorAll("#plusBet");
        let betInputs = config.mainPage.querySelectorAll("#betInput");

        for (let i = 0; i < betInputs.length; i++) {
            minusBet[i].addEventListener("click", () => {
                if (betInputs[i].value != 0) {
                    bet -= Number(betInputs[i].getAttribute("data-chip"));
                    betInputs[i].value--;
                }
                config.mainPage.querySelectorAll("#betSubmitBtn")[0].innerHTML = `Submit your bet for ${bet}`;
            });

            plusBet[i].addEventListener("click", () => {
                if (user.chips >= bet + Number(betInputs[i].getAttribute("data-chip"))) {
                    bet += Number(betInputs[i].getAttribute("data-chip"));
                    betInputs[i].value++;
                }
                config.mainPage.querySelectorAll("#betSubmitBtn")[0].innerHTML = `Submit your bet for ${bet}`;
            });
        }

        config.mainPage.querySelectorAll("#betSubmitBtn")[0].addEventListener("click", () => {
            if (bet > 0) this.renderTableHelper(table, bet);
        })
    }

    static renderAction(table, user) {
        config.mainPage.append(View.actionDiv());

        if (user.gameStatus == "bet") {
            config.mainPage.querySelectorAll("#surrenderBtn")[0].addEventListener("click", () => {
                this.renderTableHelper(table, "surrender");
            });
        }
        else config.mainPage.querySelectorAll("#surrenderBtn")[0].classList.add("disabled");

        config.mainPage.querySelectorAll("#standBtn")[0].addEventListener("click", () => {
            this.renderTableHelper(table, "stand");
        });

        config.mainPage.querySelectorAll("#hitBtn")[0].addEventListener("click", () => {
            this.renderTableHelper(table, "hit");
        });

        if (user.gameStatus == "bet") {
            config.mainPage.querySelectorAll("#doubleBtn")[0].addEventListener("click", () => {
                this.renderTableHelper(table, "double")
            });
        }
        else config.mainPage.querySelectorAll("#doubleBtn")[0].classList.add("disabled");
    }

    static renderResult(result, table) {
        this.formatMainPage(table);
        config.mainPage.append(View.resultDiv(result));

        config.mainPage.querySelectorAll("#resultOkBtn")[0].addEventListener("click", () => {
            table.blackjackClearPlayerHandsAndBets();
            table.nextTurn();
            this.renderTable(table);
        });
    }

    static renderFinalResult(table) {
        config.mainPage.querySelectorAll("#result")[0].classList.add("d-none");
        config.mainPage.append(View.finalResultDiv(table.resultsLog));

        config.mainPage.querySelectorAll("#Continue")[0].addEventListener("click", () => {
            table.formatTable();
            table.formatPlayer();
            this.renderTable(table);
        })

        config.mainPage.querySelectorAll("#Home")[0].addEventListener("click", () => {
            config.mainPage.innerHTML = ``;
            config.mainPage.classList = '';
            this.startGame();
        })
    }
}

class View {
    static form() {
        let form = document.createElement("div");
        let gameArr = [{ name: 'Black Jack', value: 'blackjack' }, { name: 'Poker', value: 'poker' }];

        let speedArr = [10, 5, 2, 1, 0.5, 0.25];
        let roundArr = [10, 7, 5, 3, 1];

        let mid = (arr) => Math.floor(arr.length / 2);

        form.innerHTML =
            `
                <h2 class="mainTitle">
                    Welcome to Card Game!
                </h2>
                <form>
                    <table>
                        <tr>
                            <th>Name</th>
                            <td><input type="text" class="form-control w-75 d-inline-block" placeholder="name" id="playerName"/></td>
                        </tr>
                        <tr>
                            <th>Game</th>
                            <td><select id="selectGame" class="custom-select w-75"></select></td>
                        </tr>
                        <tr>
                            <th>Round</th>
                            <td><select id="selectRound" class="custom-select w-75"></select></td>
                        </tr>
                        <tr>
                            <th>Speed</th>
                            <td><select id="selectSpeed" class="custom-select w-75"></select></td>
                        </tr>
                    </table>
                </form>
                <div class="d-flex justify-content-center align-items-center mt-1">
                    <button id="startGameBtn" type="submit" class="btn btn-light">
                        Start Game
                    </button>
                </div>
            `;
        for (let i = 0; i < gameArr.length; i++) {
            form.querySelectorAll("#selectGame")[0].insertAdjacentHTML('beforeend', `<option value="${gameArr[i].value}">${gameArr[i].name}</option>`);
        }

        for (let i = 0; i < roundArr.length; i++) {
            if (i == mid(roundArr))
                form.querySelectorAll("#selectRound")[0].insertAdjacentHTML('beforeend', `<option value="${roundArr[i]}" selected>${roundArr[i]}</option>`);
            else
                form.querySelectorAll("#selectRound")[0].insertAdjacentHTML('beforeend', `<option value="${roundArr[i]}">${roundArr[i]}</option>`);
        }

        for (let i = 0; i < speedArr.length; i++) {
            if (i == mid(speedArr))
                form.querySelectorAll("#selectSpeed")[0].insertAdjacentHTML('beforeend', `<option value="${1 / speedArr[i]}" selected>${speedArr[i]}</option>`);
            else
                form.querySelectorAll("#selectSpeed")[0].insertAdjacentHTML('beforeend', `<option value="${1 / speedArr[i]}">${speedArr[i]}</option>`);
        }

        return form;
    }

    static main(table) {
        let main = document.createElement("div");
        main.innerHTML =
            `
                <div id="houseCardWrap">
                    <div id="houseInfo"></div>
                    <div id="playerScore"></div>
                    <div id="houseCards"></div>
                </div>

                <div id="playersWrap">
                    <div id="player">
                        <div id="playerInfo"></div>
                        <div id="playerScore"></div>
                        <div id="playerCards"></div>
                    </div>
                    <div id="player" class="player2">
                        <div id="playerInfo"></div>
                        <div id="playerScore"></div>
                        <div id="playerCards"></div>
                    </div>
                    <div id="player">
                        <div id="playerInfo"></div>
                        <div id="playerScore"></div>
                        <div id="playerCards"></div>
                    </div>                   
                </div>
            `

        let house = table.house;
        let player1 = table.players[0];
        let player2 = table.players[1];
        let player3 = table.players[2];
        let players = [player1, player2, player3];

        let houseCardWrap = main.querySelectorAll("#houseCardWrap")[0];
        let houseCardHide = table.gamePhase == "evaluatingWinners" || table.gamePhase == "end" ? house.hand.length : 1;

        houseCardWrap.querySelectorAll("#houseInfo")[0].append(this.houseInfo(house));
        if (table.gamePhase != "betting") {
            if (houseCardHide == 1) houseCardWrap.querySelectorAll("#playerScore")[0].append(this.scoreDiv(house.hand[0].getRankNumber()));
            else houseCardWrap.querySelectorAll("#playerScore")[0].append(this.scoreDiv(house.getHandScore()));
        }
        for (let i = 0; i < houseCardHide; i++) {
            houseCardWrap.querySelectorAll("#houseCards")[0].append(this.cardDiv(house.hand[i]));
            if (houseCardHide == 1) {
                houseCardWrap.querySelectorAll("#houseCards")[0].append(this.cardDiv({ suit: "?", rank: "?" }));
            }
        }

        for (let i = 0; i < players.length; i++) {
            let playerDiv = main.querySelectorAll("#player")[i];
            playerDiv.querySelectorAll("#playerInfo")[0].append(this.playerInfo(players[i]));
            if (table.gamePhase != "betting") playerDiv.querySelectorAll("#playerScore")[0].append(this.scoreDiv(players[i].getHandScore()));
            for (let j = 0; j < players[i].hand.length; j++) {
                playerDiv.querySelectorAll("#playerCards")[0].append(this.cardDiv(players[i].hand[j]));
            }
        }

        return main;
    }

    static houseInfo(house) {
        let info = document.createElement("div");
        info.innerHTML =
            `
                <p class="playerName">Dealer</p>
                <div class="playerStatus">
                    <p>S:<span id="playerGameStatus" >${house.gameStatus}</span></p>
                </div>
            `
        if (house.gameStatus == "blackjack") {
            info.querySelectorAll("#playerGameStatus")[0].classList.add("text-warning");
        }
        return info
    }

    static playerInfo(player) {
        let info = document.createElement("div");
        info.innerHTML =
            `
                <p class="playerName">${player.name}</p>
                <div class="playerStatus">
                    <p>S:<span id="playerGameStatus">${player.gameStatus}</span></p>
                    <p>B:${player.bet}</p>
                    <p>C:${player.chips}</p>
                </div>
            `

        if (player.gameStatus == "blackjack") {
            info.querySelectorAll("#playerGameStatus")[0].classList.add("text-warning");
        }
        return info;
    }

    static cardDiv(playerHand) {
        let card = document.createElement("div");
        card.classList.add("rounded");
        card.setAttribute("id", "card");
        let colorArr = ["D", "H"];
        let color = colorArr.includes(playerHand.suit) ? "text-danger" : "text-dark";
        card.innerHTML =
            `
                <div>
                    <img src="${img[playerHand.suit]}"/>
                </div>
                <div class="cardText">
                    <p class="${color}">${playerHand.rank}</p>
                </div>
            `
        return card;
    }

    static scoreDiv(score) {
        let playerScore = document.createElement("div");
        playerScore.classList.add("rounded-pill");
        playerScore.innerHTML = `<p class="scoreText">${score}</p>`;
        return playerScore;
    }

    static actionDiv() {
        let action = document.createElement("div");
        action.classList.add("action", "position")
        action.innerHTML =
            `
                <button id="surrenderBtn" type="submit" class="btn btn-light">Surrender</button>
                <button id="standBtn" type="submit" class="btn btn-success">Stand</button>
                <button id="hitBtn" type="submit" class="btn btn-warning text-white">Hit</button>
                <button id="doubleBtn" type="submit" class="btn btn-danger">Double</button>
            `

        return action;
    }

    static betDiv(betDenominations) {
        let bets = document.createElement("div");
        bets.classList.add("bets", "position");

        let betChoice = document.createElement("div");
        betChoice.classList.add("betChoice");

        for (let i = 0; i < 4; i++) {
            let bet = document.createElement("div");
            bet.classList.add("bet");
            bet.innerHTML =
                `
                    <div class="input-group">
                        <span class="input-group-btn">
                            <button id="minusBet" type="button" class="btn btn-danger">-</button>
                        </span>
                        <input
                            type="text" id="betInput" class="form-control text-center bg-white" size="1"
                            value="0" min="0" readonly data-chip="${betDenominations[i]}"
                        />
                        <span class="input-group-btn">
                            <button id="plusBet" type="button" class="btn btn-success">+</button>
                        </span>
                    </div>
                    <p class="text-white text-center pt-1">${betDenominations[i]}</p>
                `

            betChoice.append(bet);
        }

        let betSubmit = document.createElement("div");
        betSubmit.classList.add("betSubmit");
        betSubmit.innerHTML =
            `
                <button id="betSubmitBtn" type="submit" class="btn btn-success bg-primary w-auto">
                    Submit your bet for 0
                </button>
            `;

        bets.append(betChoice, betSubmit);

        return bets;
    }

    static roundDiv(table) {
        let content = document.createElement("div");
        content.classList.add("round", "position");

        content.innerHTML =
            `
            <div class="roundTextWrap">
                <h3>Round</h3>
                <p> ${table.currRound} / ${table.round} </p>
            </div>
            `;

        return content;
    }

    static resultDiv(resultLog) {
        let resultLogRound = resultLog.round;
        let resultLogResult = resultLog.result;

        let result = document.createElement("div");
        result.classList.add("rounded", "position");
        result.id = "result"
        result.innerHTML = `<h3>Round ${resultLogRound}</h3>`;

        let ul = document.createElement("ul");
        for (let i = 0; i < resultLogResult.length; i++) {
            let playerResult = resultLogResult[i];

            let li = document.createElement("li");
            li.innerHTML = `name: ${playerResult.name}, action: ${playerResult.action}, bet: ${playerResult.bet}, won: ${playerResult.won}`;
            ul.append(li);
        }
        let resultOkBtn = document.createElement("div");
        resultOkBtn.classList.add("btnWrap");
        resultOkBtn.innerHTML = `<button id="resultOkBtn" class="btn btn-sm btn-primary p-auto" type="submit">OK</button>`;

        result.append(ul, resultOkBtn);
        return result;
    }

    static finalResultDiv(resultsLog) {
        let finalResult = document.createElement("div");
        finalResult.classList.add("finalResult");
        finalResult.innerHTML = `<h3>Result</h3>`;

        let table = document.createElement("table");
        table.classList.add("table");
        table.innerHTML =
            `
                <thead>
                    <tr id="theadTr"><th>name</th></tr>
                </thead>
                <tbody id="tbody"></tbody>
            `

        let theadTr = table.querySelectorAll("#theadTr")[0];
        let tbody = table.querySelectorAll("#tbody")[0];
        for (let i = 0; i < resultsLog[0].result.length; i++) {
            let playerName = document.createElement("tr");
            playerName.id = "player";
            playerName.innerHTML = `<td>${resultsLog[0].result[i].name}</td>`
            tbody.append(playerName);
        }

        for (let i = 0; i < resultsLog.length; i++) {
            let th = document.createElement("th");
            th.innerHTML = `Round${resultsLog[i].round}`
            theadTr.append(th);
            for (let j = 0; j < resultsLog[i].result.length; j++) {
                let player = resultsLog[i].result[j];
                let td = document.createElement("td");
                td.innerHTML = `${player.chips}`;
                tbody.querySelectorAll("#player")[j].append(td);
            }
        }

        let ContinueAndHomeBtn = document.createElement("div");
        ContinueAndHomeBtn.classList.add("btnWrap", "mb-2");
        ContinueAndHomeBtn.innerHTML =
            `
                <button id="Continue" class="btn btn-sm btn-outline-primary mx-2 p-auto" type="submit">Continue</button>
                <button id="Home" class="btn btn-sm btn-primary mx-2 p-auto" type="submit">Home</button>
            `;

        finalResult.append(table, ContinueAndHomeBtn);
        return finalResult;
    }
}
Controller.startGame();
