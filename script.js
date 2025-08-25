const chipButtons = document.querySelectorAll(".chip-button");
const resetChipButton = document.getElementById("reset-chip-button");
const playerHandContainer = document.getElementById("player-hand");
const dealerHandContainer = document.getElementById("dealer-hand");
const dealButton = document.getElementById("deal-button");
const hitButton = document.getElementById("hit-button");
const standButton = document.getElementById("stand-button");
const bettingControls = document.getElementById("betting-controls");
const gameControls = document.getElementById("game-controls");
const gameMessage = document.getElementById("game-message");

const CardSymbol = Object.freeze({
  KIER: Symbol("kier"),
  KARO: Symbol("karo"),
  PIK: Symbol("pik"),
  TREFL: Symbol("trefl"),
});

const GAME_PHASE = Object.freeze({
  BETTING: "BETTING",
  PLAYER_TURN: "PLAYER_TURN",
  DEALER_TURN: "DEALER_TURN",
  ROUND_OVER: "ROUND_OVER",
});

let playerHand = [];
let dealerHand = [];
let deck = [];

const gameState = {
  playerMoney: 1000,
  currentBet: 0,
  playerCardScore: 0,
  dealerCardScore: 0,
  currentPhase: GAME_PHASE.BETTING,
};

class Card {
  constructor(value, symbol, facedown) {
    if (typeof value !== "number" || value < 1 || value > 13) {
      throw new Error("wrong card value");
    }
    if (!Object.values(CardSymbol).includes(symbol)) {
      throw new Error("wrong card symbol");
    }
    if (typeof facedown !== "boolean") {
      throw new Error("wrong facedown boolean");
    }
    this.value = value;
    this.symbol = symbol;
    this.facedown = facedown;
  }
}

const handler = {
  get: function (target, property) {
    return target[property];
  },
  set: function (target, property, value) {
    target[property] = value;
    const elementToUpdate = document.getElementById(property);
    if (elementToUpdate) {
      elementToUpdate.textContent = value;
    }
    if (property === "currentPhase") {
      updateUI();
    }
    return true;
  },
};

const game = new Proxy(gameState, handler);

function dealRound() {
  if (game.currentBet === 0) return;

  clearRound();
  calculateScores();
  prepareDeck(deck, 6);
  shuffle(deck);

  playerHand.push(deck.pop());
  playerHand.push(deck.pop());
  dealerHand.push(deck.pop());
  dealerHand.push(deck.pop());

  showPlayerHand();
  dealerHand[0].facedown = true;
  showDealerHand();
  calculateScores();

  const playerHasBlackjack = game.playerCardScore === 21;
  const dealerRealScore =
    (dealerHand[0].value > 9
      ? 10
      : dealerHand[0].value === 1
      ? 11
      : dealerHand[0].value) +
    (dealerHand[1].value > 9
      ? 10
      : dealerHand[1].value === 1
      ? 11
      : dealerHand[1].value);
  const dealerHasBlackjack = dealerRealScore === 21;

  if (playerHasBlackjack) {
    if (dealerHasBlackjack) {
      draw();
    } else {
      playerWins(1.5);
    }
  } else if (dealerHasBlackjack) {
    revealDealerCard();
    playerLoses();
  } else {
    game.currentPhase = GAME_PHASE.PLAYER_TURN;
  }
}

function resolveRound() {
  if (game.dealerCardScore > 21) {
    playerWins();
  } else if (game.playerCardScore > game.dealerCardScore) {
    playerWins();
  } else if (game.dealerCardScore > game.playerCardScore) {
    playerLoses();
  } else {
    draw();
  }
}

function playerWins(payoutRatio = 1) {
  const winnings = Math.ceil(game.currentBet * payoutRatio);
  game.playerMoney += game.currentBet + winnings;
  game.currentPhase = GAME_PHASE.ROUND_OVER;
  gameMessage.textContent = "You Won!";
}

function playerLoses() {
  game.currentPhase = GAME_PHASE.ROUND_OVER;
  gameMessage.textContent = "You Lost!";
}

function draw() {
  game.playerMoney += game.currentBet;
  game.currentPhase = GAME_PHASE.ROUND_OVER;
  gameMessage.textContent = "Draw!";
}

function addToBet(value) {
  if (value > game.playerMoney) return;
  game.currentBet += value;
  game.playerMoney -= value;
  updateUI();
}

function resetChips() {
  game.playerMoney += game.currentBet;
  game.currentBet = 0;
  updateUI();
}

function playerHit() {
  if (game.currentPhase !== GAME_PHASE.PLAYER_TURN) return;
  playerHand.push(deck.pop());
  showPlayerHand();
  calculateScores();

  if (game.playerCardScore > 21) {
    playerLoses();
  }
}

function playerStand() {
  if (game.currentPhase !== GAME_PHASE.PLAYER_TURN) return;
  game.currentPhase = GAME_PHASE.DEALER_TURN;
  dealerPlays();
}

function dealerPlays() {
  revealDealerCard();

  const playInterval = setInterval(() => {
    if (game.dealerCardScore < 17) {
      dealerHand.push(deck.pop());
      showDealerHand();
      calculateScores();
    } else {
      clearInterval(playInterval);
      resolveRound();
    }
  }, 1000);
}

function prepareDeck(deck, numberOfDecks) {
  for (let i = 0; i < numberOfDecks; i++) {
    for (let j = 0; j < 52; j++) {
      let cardSymbol;
      switch (Math.trunc(j / 13)) {
        case 0:
          cardSymbol = CardSymbol.KIER;
          break;
        case 1:
          cardSymbol = CardSymbol.KARO;
          break;
        case 2:
          cardSymbol = CardSymbol.PIK;
          break;
        case 3:
          cardSymbol = CardSymbol.TREFL;
          break;
      }
      deck.push(new Card((j % 13) + 1, cardSymbol, false));
    }
  }
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function updateUI() {
  switch (game.currentPhase) {
    case GAME_PHASE.BETTING:
      bettingControls.classList.remove("hidden");
      gameControls.classList.add("hidden");

      chipButtons.forEach((btn) => btn.classList.remove("locked"));
      resetChipButton.classList.remove("locked");

      dealButton.textContent = "Deal";
      if (game.currentBet === 0) {
        dealButton.classList.add("locked");
      } else {
        dealButton.classList.remove("locked");
      }
      break;

    case GAME_PHASE.PLAYER_TURN:
      bettingControls.classList.add("hidden");
      gameControls.classList.remove("hidden");

      hitButton.classList.remove("locked");
      standButton.classList.remove("locked");
      break;

    case GAME_PHASE.DEALER_TURN:
      bettingControls.classList.add("hidden");
      gameControls.classList.remove("hidden");
      hitButton.classList.add("locked");
      standButton.classList.add("locked");
      break;

    case GAME_PHASE.ROUND_OVER:
      bettingControls.classList.remove("hidden");
      gameControls.classList.add("hidden");

      chipButtons.forEach((btn) => btn.classList.add("locked"));
      resetChipButton.classList.add("locked");

      dealButton.textContent = "New Round";
      dealButton.classList.remove("locked");
      break;
  }
}

function calculateScores() {
  let playerCardScore = 0;
  let dealerCardScore = 0;
  playerHand.forEach((card) => {
    if (card.facedown == true) return;
    if (card.value >= 2 && card.value <= 10) {
      playerCardScore += card.value;
    } else if (card.value >= 11 && card.value <= 13) {
      playerCardScore += 10;
    }
  });
  playerHand.forEach((card) => {
    if (card.facedown == true) return;
    if (card.value == 1) {
      if (playerCardScore + 11 <= 21) {
        playerCardScore += 11;
      } else {
        playerCardScore += 1;
      }
    }
  });

  dealerHand.forEach((card) => {
    if (card.facedown == true) return;
    if (card.value >= 2 && card.value <= 10) {
      dealerCardScore += card.value;
    } else if (card.value >= 11 && card.value <= 13) {
      dealerCardScore += 10;
    }
  });
  dealerHand.forEach((card) => {
    if (card.facedown == true) return;
    if (card.value == 1) {
      if (dealerCardScore + 11 <= 21) {
        dealerCardScore += 11;
      } else {
        dealerCardScore += 1;
      }
    }
  });
  game.playerCardScore = playerCardScore;
  game.dealerCardScore = dealerCardScore;
}

function showCard(card, destinationContainer) {
  const template = document.getElementById("card-template");
  const cardClone = template.content.cloneNode(true);
  const valueElement = cardClone.querySelector(".value");
  const symbolUpElement = cardClone.querySelector(".symbol-up");
  const symbolDownElement = cardClone.querySelector(".symbol-down");
  const cardElement = cardClone.querySelector(".card");
  let value = card.value;
  switch (card.value) {
    case 1:
      value = "A";
      break;
    case 11:
      value = "J";
      break;
    case 12:
      value = "Q";
      break;
    case 13:
      value = "K";
      break;
  }
  valueElement.textContent = value;
  let cardSymbol = "";
  let colorClass = "";
  switch (card.symbol) {
    case CardSymbol.KIER:
      cardSymbol = "♥";
      colorClass = "kier";
      break;
    case CardSymbol.KARO:
      cardSymbol = "♦";
      colorClass = "karo";
      break;
    case CardSymbol.PIK:
      cardSymbol = "♠";
      colorClass = "pik";
      break;
    case CardSymbol.TREFL:
      cardSymbol = "♣";
      colorClass = "trefl";
      break;
  }
  symbolUpElement.textContent = cardSymbol;
  symbolDownElement.textContent = cardSymbol;
  cardElement.classList.add(colorClass);
  if (card.facedown === true) {
    cardElement.classList.add("face-down");
  }
  destinationContainer.appendChild(cardClone);
}

function clearRound() {
  playerHand = [];
  dealerHand = [];
  deck = [];
  clearDealerHand();
  clearPlayerHand();
}

function clearPlayerHand() {
  playerHandContainer.innerHTML = "";
}

function clearDealerHand() {
  dealerHandContainer.innerHTML = "";
}

function showPlayerHand() {
  clearPlayerHand();
  playerHand.forEach((element) => showCard(element, playerHandContainer));
}

function showDealerHand() {
  clearDealerHand();
  dealerHand.forEach((element) => showCard(element, dealerHandContainer));
}

function revealDealerCard() {
  dealerHand[0].facedown = false;
  showDealerHand();
  calculateScores();
}

chipButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (game.currentPhase === GAME_PHASE.BETTING) {
      addToBet(parseInt(button.dataset.bet, 10));
    }
  });
});

resetChipButton.addEventListener("click", () => {
  if (game.currentPhase === GAME_PHASE.BETTING) {
    resetChips();
  }
});

dealButton.addEventListener("click", () => {
  if (dealButton.classList.contains("locked")) return;

  if (game.currentPhase === GAME_PHASE.BETTING) {
    dealRound();
  } else if (game.currentPhase === GAME_PHASE.ROUND_OVER) {
    game.currentBet = 0;
    clearRound();
    game.currentPhase = GAME_PHASE.BETTING;
  }
});

hitButton.addEventListener("click", playerHit);
standButton.addEventListener("click", playerStand);

updateUI();
