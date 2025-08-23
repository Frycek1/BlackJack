const chipButtons = document.querySelectorAll(".chip-button");
const resetChipButton = document.getElementById("reset-chip-button");
const playerHandContainer = document.getElementById("player-hand");
const dealerHandContainer = document.getElementById("dealer-hand");
const dealButton = document.getElementById("deal-button");

const gameState = {
  playerMoney: 1000,
  currentBet: 0,
  playerCardScore: 0,
  dealerCardScore: 0,
};

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

function createCard(value, symbol, destinationContainer) {
  const template = document.getElementById("card-template");

  const cardClone = template.content.cloneNode(true);

  const valueElement = cardClone.querySelector(".value");
  const symbolUpElement = cardClone.querySelector(".symbol-up");
  const symbolDownElement = cardClone.querySelector(".symbol-down");
  const cardElement = cardClone.querySelector(".card");

  valueElement.textContent = value;

  let cardSymbol = "";
  let colorClass = "";
  switch (symbol) {
    case "kier":
      cardSymbol = "♥";
      colorClass = "kier";
      break;
    case "karo":
      cardSymbol = "♦";
      colorClass = "karo";
      break;
    case "pik":
      cardSymbol = "♠";
      colorClass = "pik";
      break;
    case "trefl":
      cardSymbol = "♣";
      colorClass = "trefl";
      break;
  }

  symbolUpElement.textContent = cardSymbol;
  symbolDownElement.textContent = cardSymbol;

  cardElement.classList.add(colorClass);
  cardElement.classList.add("face-down");

  destinationContainer.appendChild(cardClone);
}
function clearPlayerHand() {
  playerHandContainer.innerHTML = "";
}
function clearDealerHand() {}

chipButtons.forEach((button) => {
  button.addEventListener("click", () => {
    addToBet(button);
  });
});
resetChipButton.addEventListener("click", () => {
  resetChips();
});
dealButton.addEventListener("click", () => {});

createCard("A", "trefl", playerHandContainer);
createCard("Q", "karo", dealerHandContainer);
