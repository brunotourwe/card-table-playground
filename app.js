const cardTable = document.getElementById("card-table");
const cardCountInput = document.getElementById("card-count");
const drawButton = document.getElementById("draw-button");
const statusMessage = document.getElementById("status");
const renderModeInputs = document.querySelectorAll(
  "input[name=\"render-mode\"]"
);

let currentCards = [];

function createDeck() {
  const suits = [
    { name: "spades", symbol: "♠︎" },
    { name: "hearts", symbol: "♥︎" },
    { name: "diamonds", symbol: "♦︎" },
    { name: "clubs", symbol: "♣︎" }
  ];

  const ranks = [
    "A",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K"
  ];

  const deck = [];

  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({
        rank,
        suit: suit.name,
        symbol: suit.symbol
      });
    }
  }

  return deck;
}

function shuffleDeck(deck) {
  const shuffled = deck.slice();

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;
  }

  return shuffled;
}

function drawCards(count) {
  const deck = createDeck();
  const shuffled = shuffleDeck(deck);
  return shuffled.slice(0, count);
}

function clearStatus() {
  statusMessage.textContent = "";
}

function setStatus(message) {
  statusMessage.textContent = message;
}

function createCardElement(card, mode) {
  const cardElement = document.createElement("div");
  cardElement.dataset.suit = card.suit;

  if (mode === "image") {
    cardElement.className = "card";
    const cardImage = document.createElement("img");
    cardImage.className = "card__image";
    cardImage.src = getCardImagePath(card);
    cardImage.alt = `${getRankLabel(card.rank)} of ${capitalize(card.suit)}`;
    cardElement.appendChild(cardImage);
    return cardElement;
  }

  cardElement.className = "card card--text";

  const cornerTop = document.createElement("div");
  cornerTop.className = "card__corner";
  cornerTop.textContent = `${card.rank}${card.symbol}`;

  const center = document.createElement("div");
  center.className = "card__center";
  center.textContent = card.symbol;

  const cornerBottom = document.createElement("div");
  cornerBottom.className = "card__corner card__corner--bottom";
  cornerBottom.textContent = `${card.rank}${card.symbol}`;

  cardElement.appendChild(cornerTop);
  cardElement.appendChild(center);
  cardElement.appendChild(cornerBottom);

  return cardElement;
}

function getCardImagePath(card) {
  const rank = card.rank.toLowerCase();
  return `assets/cards/${rank}_of_${card.suit}.svg`;
}

function getRankLabel(rank) {
  const labels = {
    A: "Ace",
    J: "Jack",
    Q: "Queen",
    K: "King"
  };

  return labels[rank] ?? rank;
}

function capitalize(value) {
  return `${value[0].toUpperCase()}${value.slice(1)}`;
}

function getRenderMode() {
  const selected = document.querySelector("input[name=\"render-mode\"]:checked");
  return selected ? selected.value : "unicode";
}

function renderCards(cards) {
  cardTable.innerHTML = "";
  const mode = getRenderMode();

  for (const card of cards) {
    const cardElement = createCardElement(card, mode);
    cardTable.appendChild(cardElement);
  }
}

function getRequestedCount() {
  const value = Number.parseInt(cardCountInput.value, 10);

  if (Number.isNaN(value)) {
    return null;
  }

  if (value < 1 || value > 52) {
    return null;
  }

  return value;
}

function drawFromInput() {
  const count = getRequestedCount();

  if (count === null) {
    setStatus("Enter a number from 1 to 52.");
    return;
  }

  clearStatus();
  currentCards = drawCards(count);
  renderCards(currentCards);
}

drawButton.addEventListener("click", drawFromInput);
renderModeInputs.forEach((input) => {
  input.addEventListener("change", () => {
    if (currentCards.length > 0) {
      renderCards(currentCards);
    }
  });
});

drawFromInput();
