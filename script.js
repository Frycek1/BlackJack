const chipButtons = document.querySelectorAll(".chip-button");
const resetChipButton = document.getElementById("reset-chip-button");
const playerHandContainer = document.getElementById("player-hand");
const dealerHandContainer = document.getElementById("dealer-hand");
const dealButton = document.getElementById("deal-button");

let playerHand = new Array();
let dealerHand = new Array();
let deck = new Array();

const gameState = {
  playerMoney: 1000,
  currentBet: 0,
  playerCardScore: 0,
  dealerCardScore: 0,
};

const CardSymbol = Object.freeze({
  KIER: Symbol("kier"),
  KARO: Symbol("karo"),
  PIK: Symbol("pik"),
  TREFL: Symbol("trefl"),
});
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
    return true;
  },
};

const game = new Proxy(gameState, handler);

function addToBet(button) {
  const betValueNumber = parseInt(button.dataset.bet, 10);

  if (betValueNumber > game.playerMoney) return;
  game.currentBet += betValueNumber;
  game.playerMoney -= betValueNumber;
}

function resetChips() {
  game.playerMoney += game.currentBet;
  game.currentBet = 0;
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
function clearPlayerHand() {
  playerHandContainer.innerHTML = "";
}
function clearDealerHand() {
  dealerHandContainer.innerHTML = "";
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

function prepareDeck(deck, numberOfDecks) {
  let cardSymbol;
  for (i = 0; i < numberOfDecks; i++) {
    for (j = 0; j < 52; j++) {
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
  let currentIndex = array.length;

  while (currentIndex != 0) {
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
}

function clearRound() {
  playerHand = new Array();
  dealerHand = new Array();
  deck = new Array();
  clearDealerHand();
  clearPlayerHand();
}

function dealRound() {
  clearRound();
  prepareDeck(deck, 6);
  shuffle(deck);
  playerHand.push(deck.pop());
  playerHand.push(deck.pop());
  dealerHand.push(deck.pop());
  dealerHand.push(deck.pop());
  playerHand.forEach((element) => {
    showCard(element, playerHandContainer);
  });
  dealerHand[0].facedown = true;
  showCard(dealerHand[0], dealerHandContainer);
  showCard(dealerHand[1], dealerHandContainer);
  calculateScores();
}

chipButtons.forEach((button) => {
  button.addEventListener("click", () => {
    addToBet(button);
  });
});
resetChipButton.addEventListener("click", () => {
  resetChips();
});
dealButton.addEventListener("click", () => {
  dealRound();
});
