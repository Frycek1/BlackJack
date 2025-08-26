# BlackJack simulator in JavaScript
Simple blackjack simulator written in html, javaScript and css.

## Table of Contents
1. [Getting Started](#getting-started)
2. [Features](#features)
3. [Game Rules](#game-rules)

---
## Getting Started
This project does not require any build process or installation. To run it, simply:
1.  Clone the repository: `git clone https://github.com/Frycek1/BlackJack.git`
2.  Open the `index.html` file in any modern web browser.

Or test it online at https://frycek1.github.io/BlacJack

---
## Features
- [x] Betting system.
- [x] Card dealing for the player and the dealer.
- [x] Basic player actions: **Hit** and **Stand**.
- [x] Dealer's turn logic (hits until 17).
- [x] Automatic round resolution (win, lose, push).
- [ ] **(In Progress)** Double Down mechanic.
- [ ] **(In Progress)** Split mechanic.

---
## Game Rules
The goal of the game is to get a card total as close to 21 as possible, without going over. The player wins if their score is higher than the dealer's, or if the dealer busts (exceeds 21). Dealer draws 

* **Card Values**:
    * Cards 2 through 10 are worth their face value.
    * Jack, Queen, and King are each worth 10.
    * An Ace is worth 11 or 1, whichever is more beneficial.
* **Blackjack**: An Ace and a 10-value card on the initial deal. This is the highest hand and pays 3:2.
