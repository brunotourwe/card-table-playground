#!/usr/bin/env node

const assert = require("assert");
const {
  chooseSuitOrder,
  sortHandCards
} = require("../hand-sorting.js");

function makeCard(cardId, suit, rank) {
  return {
    cardId,
    suit,
    rank
  };
}

function makeJoker(cardId) {
  return {
    cardId,
    suit: null,
    rank: "JOKER"
  };
}

function getCardIds(cards) {
  return cards.map((card) => card.cardId);
}

function getSuits(cards) {
  return cards.map((card) => card.suit ?? "joker");
}

function testHighLowSortWithinSuitAndJokersAtEnd() {
  const hand = [
    makeCard("s4", "spades", "4"),
    makeCard("h9", "hearts", "9"),
    makeCard("sA", "spades", "A"),
    makeJoker("joker-red"),
    makeCard("s10", "spades", "10"),
    makeCard("hK", "hearts", "K"),
    makeJoker("joker-black")
  ];

  const result = sortHandCards(hand, {
    rankPolicy: "high_low"
  });

  assert.deepStrictEqual(result.suitOrder, ["spades", "hearts"]);
  assert.deepStrictEqual(getCardIds(result.sortedCards), [
    "sA",
    "s10",
    "s4",
    "hK",
    "h9",
    "joker-red",
    "joker-black"
  ]);
}

function testAlternationBeatsPureCountOrdering() {
  const hand = [
    makeCard("cA", "clubs", "A"),
    makeCard("cK", "clubs", "K"),
    makeCard("cQ", "clubs", "Q"),
    makeCard("cJ", "clubs", "J"),
    makeCard("c10", "clubs", "10"),
    makeCard("dA", "diamonds", "A"),
    makeCard("hA", "hearts", "A"),
    makeCard("hK", "hearts", "K"),
    makeCard("sA", "spades", "A"),
    makeCard("sK", "spades", "K"),
    makeCard("sQ", "spades", "Q"),
    makeCard("sJ", "spades", "J")
  ];

  const result = sortHandCards(hand, {
    rankPolicy: "high_low"
  });

  assert.deepStrictEqual(result.suitOrder, ["clubs", "hearts", "spades", "diamonds"]);
  assert.deepStrictEqual(getSuits(result.sortedCards), [
    "clubs",
    "clubs",
    "clubs",
    "clubs",
    "clubs",
    "hearts",
    "hearts",
    "spades",
    "spades",
    "spades",
    "spades",
    "diamonds",
  ]);
}

function testLowHighUsesFullRankProfileForSameColorSuits() {
  const hand = [
    makeCard("hK", "hearts", "K"),
    makeCard("h5", "hearts", "5"),
    makeCard("dQ", "diamonds", "Q"),
    makeCard("d2", "diamonds", "2")
  ];

  const result = sortHandCards(hand, {
    rankPolicy: "low_high"
  });

  assert.deepStrictEqual(result.suitOrder, ["diamonds", "hearts"]);
  assert.deepStrictEqual(getCardIds(result.sortedCards), [
    "d2",
    "dQ",
    "h5",
    "hK"
  ]);
}

function testSecondCardBreaksSameHighCardTie() {
  const hand = [
    makeCard("d10", "diamonds", "10"),
    makeCard("d7", "diamonds", "7"),
    makeCard("d5", "diamonds", "5"),
    makeCard("d4", "diamonds", "4"),
    makeCard("d2", "diamonds", "2"),
    makeCard("sA", "spades", "A"),
    makeCard("s9", "spades", "9"),
    makeCard("s4", "spades", "4"),
    makeCard("hA", "hearts", "A"),
    makeCard("hK", "hearts", "K"),
    makeCard("h6", "hearts", "6"),
    makeCard("h2", "hearts", "2"),
    makeCard("cK", "clubs", "K")
  ];

  const result = sortHandCards(hand, {
    rankPolicy: "high_low"
  });

  assert.deepStrictEqual(result.suitOrder, ["hearts", "spades", "diamonds", "clubs"]);
  assert.deepStrictEqual(getCardIds(result.sortedCards), [
    "hA",
    "hK",
    "h6",
    "h2",
    "sA",
    "s9",
    "s4",
    "d10",
    "d7",
    "d5",
    "d4",
    "d2",
    "cK"
  ]);
}

function testLongerProfileWinsAfterEqualPrefix() {
  const hand = [
    makeCard("hA", "hearts", "A"),
    makeCard("hK", "hearts", "K"),
    makeCard("dA", "diamonds", "A"),
    makeCard("dK", "diamonds", "K"),
    makeCard("d3", "diamonds", "3")
  ];

  const result = sortHandCards(hand, {
    rankPolicy: "high_low"
  });

  assert.deepStrictEqual(result.suitOrder, ["diamonds", "hearts"]);
  assert.deepStrictEqual(getCardIds(result.sortedCards), [
    "dA",
    "dK",
    "d3",
    "hA",
    "hK"
  ]);
}

function testSameColorFinalFallbackSuitPriority() {
  const hand = [
    makeCard("h9", "hearts", "9"),
    makeCard("d9", "diamonds", "9")
  ];

  const result = sortHandCards(hand, {
    rankPolicy: "high_low"
  });

  assert.deepStrictEqual(result.suitOrder, ["hearts", "diamonds"]);
  assert.deepStrictEqual(getCardIds(result.sortedCards), ["h9", "d9"]);
}

function testOnlyEqualCardsUseOriginalDrawOrder() {
  const hand = [
    makeCard("h1", "hearts", "9"),
    makeCard("h2", "hearts", "9"),
    makeCard("s1", "spades", "A")
  ];

  const result = sortHandCards(hand, {
    rankPolicy: "high_low"
  });

  const heartsGroup = result.groups.find((group) => group.suit === "hearts");
  assert.ok(heartsGroup, "Expected hearts group to be present.");
  assert.deepStrictEqual(getCardIds(heartsGroup.cards), ["h1", "h2"]);
}

function testChooseSuitOrderWorksDirectly() {
  const groupMap = {
    hearts: [makeCard("hA", "hearts", "A")],
    diamonds: [makeCard("d2", "diamonds", "2")],
    clubs: [makeCard("cA", "clubs", "A"), makeCard("cK", "clubs", "K")],
    spades: []
  };

  const { suitOrder } = chooseSuitOrder(
    {
      hearts: groupMap.hearts.map((card, originalIndex) => ({ card, originalIndex })),
      diamonds: groupMap.diamonds.map((card, originalIndex) => ({ card, originalIndex })),
      clubs: groupMap.clubs.map((card, originalIndex) => ({ card, originalIndex })),
      spades: []
    },
    "high_low",
    "largest_first_alternating_color"
  );

  assert.deepStrictEqual(suitOrder, ["hearts", "clubs", "diamonds"]);
}

function run() {
  testHighLowSortWithinSuitAndJokersAtEnd();
  testAlternationBeatsPureCountOrdering();
  testLowHighUsesFullRankProfileForSameColorSuits();
  testSecondCardBreaksSameHighCardTie();
  testLongerProfileWinsAfterEqualPrefix();
  testSameColorFinalFallbackSuitPriority();
  testOnlyEqualCardsUseOriginalDrawOrder();
  testChooseSuitOrderWorksDirectly();
  console.log("hand-sorting-test: ok");
}

run();
