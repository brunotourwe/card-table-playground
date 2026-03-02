# Hand Sorting v1

This document defines the v1 semantic sorting model for cards in hand view.

## Scope

- Applies only to `hand` view.
- `matrix` view remains unsorted.
- Sorting reorders the current hand snapshot only; it does not draw a new hand.
- Hand render direction (`ltr` / `rtl`) is not part of sorting. It only mirrors presentation.
- Reveal direction is independent from sorting and follows hand render direction.

## Non-Goals

- Matrix sorting.
- Suit interleaving between groups. Interleaving may be added later as a second-stage layout transform.
- Manual per-card reordering while sorting is active.
- Defining UI controls in this document.

## Inputs

- `cards`: current hand snapshot.
- `rankPolicy`: one of:
  - `high_low`
  - `low_high`
- `suitGroupPolicy`:
  - v1 required policy: `largest_first_alternating_color`
- `renderDirection`:
  - `ltr`
  - `rtl`
  - note: this does not affect semantic sort order

## Output

- A canonical semantic card sequence for hand view.
- Renderers may mirror placement for `rtl`, but the sorted sequence itself does not change.

## Card Model Assumptions

- Standard suited cards use suits:
  - `hearts`
  - `diamonds`
  - `clubs`
  - `spades`
- Jokers are allowed and are always handled as a separate final group.
- Cards are unique in standard decks, but the algorithm remains deterministic if duplicates or multiple jokers exist.

## Rank Policies

### `high_low`

Descending rank order:

```text
A, K, Q, J, 10, 9, 8, 7, 6, 5, 4, 3, 2
```

### `low_high`

Ascending rank order:

```text
2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K, A
```

## Joker Policy

- Jokers are never used when choosing suit-group order.
- Jokers always appear after all suited groups.
- Jokers form a separate final group.
- If multiple jokers compare equal, preserve original draw order between them.

## Suit Colors

- `hearts`, `diamonds` are red.
- `clubs`, `spades` are black.

## Final Fallback Suit Priority

This priority is used only as the final suit-group tie-break:

```text
hearts > diamonds > clubs > spades
```

## Sorting Procedure

### 1. Partition the hand

Split the cards into:

- suited cards by suit
- joker group

Ignore absent suits completely.

### 2. Sort cards inside each suited group

For each present suit:

- Sort the cards in that suit according to `rankPolicy`.
- This sorted list is that suit group's `rank profile`.

If two cards inside the same suit compare equal under the active rank policy, preserve original draw order.

### 3. Choose suit-group order

In v1, suit groups are ordered by evaluating all permutations of the present suits and selecting the best one under the scoring rules below.

This is intentional. The policy is not greedy, because a smaller suit may be chosen earlier if it enables a better overall alternating-color layout.

### 4. Score each candidate suit order

For each permutation of present suits, compute this ordered comparison key:

1. `alternationScore`
   Count adjacent suit transitions whose colors differ.
   Higher is better.

2. `rankProfileVector`
   Suit rank profiles in permutation order.
   Compare lexicographically by suit, then lexicographically within each suit profile under the active `rankPolicy`.
   Compare the first card, then second, then third, and so on.
   If one suit profile is a complete equal prefix of another, the longer profile wins.

3. `countVector`
   Suit counts in permutation order.
   Compare lexicographically, descending.
   Higher is better earlier.

4. `fallbackSuitPriorityVector`
   Compare suit priority in permutation order using:
   `hearts > diamonds > clubs > spades`

Choose the permutation with the best lexicographic score under those four criteria.

### 5. Build final semantic sequence

- Concatenate suited groups in the chosen suit-group order.
- Append the joker group at the end.

### 6. Rendering

- `ltr`: render the semantic sequence as-is.
- `rtl`: mirror only visual placement.
- The semantic sequence does not reverse for `rtl`.

## Determinism Rules

- The algorithm must not rely on engine sort stability for business logic.
- All suit-group ordering must be determined by explicit scoring and tie-break rules.
- Original draw order is used only when cards remain equal after all explicit card-level rules.

## Worked Examples

### Example 1: Basic `high_low`

Hand:

```text
spades: A, 10, 4
hearts: K, 9
clubs: Q
diamonds: 2
```

Sorted within suits:

```text
spades: A, 10, 4
hearts: K, 9
clubs: Q
diamonds: 2
```

Candidate suit orders are scored globally.
A color-alternating order beats a purely count-descending order if needed.

Possible winning result:

```text
spades | hearts | clubs | diamonds
```

or another globally better alternating order if the score tuple demands it.

### Example 2: Smaller first suit allowed

Counts:

```text
spades: 5
clubs: 4
hearts: 3
diamonds: 1
```

`largest_first_alternating_color` does not force `spades` first if another start yields a better total alternation score.

The algorithm evaluates all present-suit permutations and picks the best scored one.

### Example 3: Only same-color suits remain

Present suits:

```text
hearts, diamonds
```

No color alternation is possible.

The order is chosen by:

1. full rank profile under active rank policy
2. count
3. fallback priority `hearts > diamonds`

### Example 4: `low_high`

Hand:

```text
clubs: A, 7, 2
hearts: K, 5
```

Sorted within suits:

```text
clubs: 2, 7, A
hearts: 5, K
```

Suit-profile comparison for suit-group tie-breaks uses:

```text
clubs profile = 2, 7, A
hearts profile = 5, K
```

because `low_high` compares the lowest cards first.

### Example 5: Same first card, second card breaks the tie

Hand:

```text
diamonds: 10, 7, 5, 4, 2
spades: A, 9, 4
hearts: A, K, 6, 2
clubs: K
```

Under `high_low`:

```text
hearts profile = A, K, 6, 2
spades profile = A, 9, 4
diamonds profile = 10, 7, 5, 4, 2
clubs profile = K
```

`hearts` beats `spades` because both start with `A`, but `K` beats `9`.

The winning order is:

```text
hearts | spades | diamonds | clubs
```

This keeps maximum color alternation and uses full suit rank profile, not only the highest card.

### Example 6: Jokers

Hand:

```text
spades: A, J
hearts: Q
jokers: red joker, black joker
```

Final semantic order:

```text
<sorted suited groups> + <joker group>
```

Example:

```text
spades A, J | hearts Q | red joker, black joker
```

If the two jokers compare equal, keep their original draw order.

## Future Extensions

- Additional suit-group policies such as manual player-defined suit order.
- `ace_low` or other alternate rank policies.
- Suit interleaving after base sorting.
- Matrix sorting, if reintroduced.
- UI-level grouping controls and labels.
