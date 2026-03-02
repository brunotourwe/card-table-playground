(function initHandSorting(globalScope, factory) {
  const api = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }

  globalScope.__CTP_HAND_SORTING__ = api;
}(typeof globalThis !== "undefined" ? globalThis : this, () => {
  const RANK_ORDERS = {
    high_low: ["A", "K", "Q", "J", "10", "9", "8", "7", "6", "5", "4", "3", "2"],
    low_high: ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"]
  };
  const SUIT_COLORS = {
    hearts: "red",
    diamonds: "red",
    clubs: "black",
    spades: "black"
  };
  const FALLBACK_SUIT_PRIORITY = ["hearts", "diamonds", "clubs", "spades"];
  const FALLBACK_SUIT_PRIORITY_INDEX = FALLBACK_SUIT_PRIORITY.reduce((indices, suit, index) => ({
    ...indices,
    [suit]: index
  }), {});
  const DEFAULT_OPTIONS = {
    rankPolicy: "high_low",
    suitGroupPolicy: "largest_first_alternating_color"
  };

  function assertSupportedRankPolicy(rankPolicy) {
    if (!Object.prototype.hasOwnProperty.call(RANK_ORDERS, rankPolicy)) {
      throw new Error(`Unsupported rank policy: ${rankPolicy}`);
    }
  }

  function assertSupportedSuitGroupPolicy(suitGroupPolicy) {
    if (suitGroupPolicy !== "largest_first_alternating_color") {
      throw new Error(`Unsupported suit group policy: ${suitGroupPolicy}`);
    }
  }

  function getRankStrengthMap(rankPolicy) {
    assertSupportedRankPolicy(rankPolicy);

    return RANK_ORDERS[rankPolicy].reduce((strengthMap, rank, index) => {
      strengthMap[rank] = index;
      return strengthMap;
    }, {});
  }

  function getSuitColor(suit) {
    if (!Object.prototype.hasOwnProperty.call(SUIT_COLORS, suit)) {
      throw new Error(`Unsupported suit: ${suit}`);
    }

    return SUIT_COLORS[suit];
  }

  function annotateCards(cards) {
    return cards.map((card, originalIndex) => ({
      card,
      originalIndex
    }));
  }

  function compareAnnotatedCards(left, right, rankStrengthMap) {
    const leftStrength = rankStrengthMap[left.card.rank];
    const rightStrength = rankStrengthMap[right.card.rank];

    if (leftStrength !== rightStrength) {
      return leftStrength - rightStrength;
    }

    return left.originalIndex - right.originalIndex;
  }

  function sortSuitCards(cards, rankPolicy) {
    const rankStrengthMap = getRankStrengthMap(rankPolicy);
    return [...cards].sort((left, right) => compareAnnotatedCards(left, right, rankStrengthMap));
  }

  function partitionHand(cards) {
    const suitedGroups = {
      hearts: [],
      diamonds: [],
      clubs: [],
      spades: []
    };
    const jokers = [];

    cards.forEach((entry) => {
      if (entry.card.rank === "JOKER") {
        jokers.push(entry);
        return;
      }

      const { suit } = entry.card;
      if (!Object.prototype.hasOwnProperty.call(suitedGroups, suit)) {
        throw new Error(`Unsupported or missing suit on card: ${entry.card.cardId ?? entry.card.rank}`);
      }

      suitedGroups[suit].push(entry);
    });

    return { suitedGroups, jokers };
  }

  function getPresentSuits(groupMap) {
    return FALLBACK_SUIT_PRIORITY.filter((suit) => groupMap[suit].length > 0);
  }

  function buildSuitMetadata(groupMap, rankPolicy) {
    const rankStrengthMap = getRankStrengthMap(rankPolicy);

    return FALLBACK_SUIT_PRIORITY.reduce((metadata, suit) => {
      if (groupMap[suit].length === 0) {
        return metadata;
      }

      const sortedCards = sortSuitCards(groupMap[suit], rankPolicy);
      metadata[suit] = {
        suit,
        color: getSuitColor(suit),
        cards: sortedCards,
        count: sortedCards.length,
        rankProfile: sortedCards.map((entry) => rankStrengthMap[entry.card.rank]),
        fallbackPriority: FALLBACK_SUIT_PRIORITY_INDEX[suit]
      };
      return metadata;
    }, {});
  }

  function compareRankProfiles(leftProfile, rightProfile) {
    const sharedLength = Math.min(leftProfile.length, rightProfile.length);

    for (let index = 0; index < sharedLength; index += 1) {
      if (leftProfile[index] !== rightProfile[index]) {
        return leftProfile[index] - rightProfile[index];
      }
    }

    if (leftProfile.length !== rightProfile.length) {
      return rightProfile.length - leftProfile.length;
    }

    return 0;
  }

  function permute(items) {
    if (items.length <= 1) {
      return [items];
    }

    const permutations = [];

    items.forEach((item, index) => {
      const remainder = items.slice(0, index).concat(items.slice(index + 1));
      permute(remainder).forEach((tail) => {
        permutations.push([item, ...tail]);
      });
    });

    return permutations;
  }

  function getAlternationScore(order, metadata) {
    if (order.length <= 1) {
      return 0;
    }

    let score = 0;

    for (let index = 0; index < order.length - 1; index += 1) {
      if (metadata[order[index]].color !== metadata[order[index + 1]].color) {
        score += 1;
      }
    }

    return score;
  }

  function compareSuitOrders(leftOrder, rightOrder, metadata) {
    const leftAlternationScore = getAlternationScore(leftOrder, metadata);
    const rightAlternationScore = getAlternationScore(rightOrder, metadata);

    if (leftAlternationScore !== rightAlternationScore) {
      return rightAlternationScore - leftAlternationScore;
    }

    for (let index = 0; index < leftOrder.length; index += 1) {
      const leftProfile = metadata[leftOrder[index]].rankProfile;
      const rightProfile = metadata[rightOrder[index]].rankProfile;
      const profileComparison = compareRankProfiles(leftProfile, rightProfile);

      if (profileComparison !== 0) {
        return profileComparison;
      }
    }

    for (let index = 0; index < leftOrder.length; index += 1) {
      const leftCount = metadata[leftOrder[index]].count;
      const rightCount = metadata[rightOrder[index]].count;

      if (leftCount !== rightCount) {
        return rightCount - leftCount;
      }
    }

    for (let index = 0; index < leftOrder.length; index += 1) {
      const leftFallbackPriority = metadata[leftOrder[index]].fallbackPriority;
      const rightFallbackPriority = metadata[rightOrder[index]].fallbackPriority;

      if (leftFallbackPriority !== rightFallbackPriority) {
        return leftFallbackPriority - rightFallbackPriority;
      }
    }

    return 0;
  }

  function chooseSuitOrder(groupMap, rankPolicy, suitGroupPolicy) {
    assertSupportedSuitGroupPolicy(suitGroupPolicy);

    const metadata = buildSuitMetadata(groupMap, rankPolicy);
    const presentSuits = getPresentSuits(groupMap);

    if (presentSuits.length <= 1) {
      return {
        suitOrder: presentSuits,
        metadata
      };
    }

    const candidateOrders = permute(presentSuits);
    let bestOrder = candidateOrders[0];

    for (let index = 1; index < candidateOrders.length; index += 1) {
      const candidateOrder = candidateOrders[index];
      if (compareSuitOrders(candidateOrder, bestOrder, metadata) < 0) {
        bestOrder = candidateOrder;
      }
    }

    return {
      suitOrder: bestOrder,
      metadata
    };
  }

  function sortHandCards(cards, options = {}) {
    const {
      rankPolicy,
      suitGroupPolicy
    } = {
      ...DEFAULT_OPTIONS,
      ...options
    };

    assertSupportedRankPolicy(rankPolicy);
    assertSupportedSuitGroupPolicy(suitGroupPolicy);

    const annotatedCards = annotateCards(cards);
    const { suitedGroups, jokers } = partitionHand(annotatedCards);
    const { suitOrder, metadata } = chooseSuitOrder(suitedGroups, rankPolicy, suitGroupPolicy);
    const sortedCards = [];

    suitOrder.forEach((suit) => {
      metadata[suit].cards.forEach((entry) => {
        sortedCards.push(entry.card);
      });
    });

    jokers.forEach((entry) => {
      sortedCards.push(entry.card);
    });

    return {
      sortedCards,
      suitOrder,
      groups: suitOrder.map((suit) => ({
        suit,
        color: metadata[suit].color,
        count: metadata[suit].count,
        topCard: metadata[suit].cards[0].card,
        cards: metadata[suit].cards.map((entry) => entry.card)
      })),
      jokers: jokers.map((entry) => entry.card)
    };
  }

  return {
    FALLBACK_SUIT_PRIORITY,
    RANK_ORDERS,
    SUIT_COLORS,
    chooseSuitOrder,
    getAlternationScore,
    getPresentSuits,
    getRankStrengthMap,
    partitionHand,
    sortHandCards,
    sortSuitCards
  };
}));
