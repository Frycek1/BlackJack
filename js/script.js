const chipButtons = document.querySelectorAll(".chip-button");
const resetChipButton = document.getElementById("reset-chip-button");

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

chipButtons.forEach((button) => {
  button.addEventListener("click", () => {
    addToBet(button);
  });
});
resetChipButton.addEventListener("click", () => {
  resetChips();
});
