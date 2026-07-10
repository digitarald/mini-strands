import { useState, useEffect, useRef } from "react";
import ResultsSplash from "../ResultsSplash.jsx";

/* ============================================================
   READY FOR MATH 6 — summer rebuild of 5th grade foundations
   For a rising 6th grader whose spring grades were shaky.
   Design: notebook-paper world; progress lives on a number
   line (THE grade-5 representation). Pedagogy: confidence
   first — small numbers, concrete contexts, faded scaffolding
   (nudge → setup → walkthrough), slip-specific feedback,
   interleaved review, self-explanation.
   ============================================================ */

const STRANDS = [
  { id: "A", name: "Place value & ×10", sub: "How digits shift", color: "#D97E48" },
  { id: "B", name: "Adding fractions", sub: "Unlike denominators", color: "#4E8FB8" },
  { id: "C", name: "Multiplying fractions", sub: "…and dividing them", color: "#7C6BB4" },
  { id: "D", name: "Decimals", sub: "Add, subtract, ×, ÷", color: "#3E9C84" },
  { id: "E", name: "Order of operations", sub: "Parentheses first", color: "#C15B76" },
  { id: "F", name: "Coordinate plane", sub: "Points & patterns", color: "#5E8F52" },
  { id: "G", name: "Volume", sub: "Filling boxes with cubes", color: "#A98436" },
];

const PROBLEMS = [
  // ================= A · place value & powers of 10 =================
  { id: "A1", strand: "A", type: "input", prompt: "Multiply:", math: "3.6 × 10", accept: ["36"], num: 36,
    nudge: "Multiplying by 10 makes every digit worth 10 times more — each digit slides one place to the left.",
    setup: "The 3 (ones) becomes 3 tens. The 6 (tenths) becomes 6 ones.",
    steps: ["3.6 means 3 ones and 6 tenths.", "×10 shifts each digit one place bigger: 3 ones → 3 tens, 6 tenths → 6 ones.", "That's 36."],
    slips: { "3.6": "The digits have to shift — ×10 can't leave the number the same.", "30.6": "Both digits shift together: the 6 moves up to the ones place too." } },
  { id: "A5", strand: "A", type: "input", prompt: "Multiply:", math: "0.07 × 100", accept: ["7"], num: 7,
    nudge: "×100 means two place shifts bigger. Watch the zeros disappear.",
    setup: "0.07 → 0.7 → …",
    steps: ["×100 = two shifts to a bigger place.", "First shift: 0.07 → 0.7.", "Second shift: 0.7 → 7."],
    slips: { "0.7": "That's only ×10 — one hundred needs two shifts.", "700": "Careful counting: 0.07 has the 7 two places below one, so two shifts lands exactly on 7." } },
  { id: "A6", strand: "A", type: "input", prompt: "Divide:", math: "82.5 ÷ 10", accept: ["8.25"], num: 8.25,
    nudge: "Dividing by 10 makes every digit worth 10 times less — one shift smaller.",
    setup: "The 8 tens become 8 ones, the 2 ones become 2 tenths…",
    steps: ["÷10 shifts every digit one place smaller.", "82.5 → 8.25.", "Check: 8.25 × 10 = 82.5 ✓"],
    slips: { "825": "Wrong direction — dividing makes the number smaller.", "0.825": "That's ÷100. One shift only." } },
  { id: "A2", strand: "A", type: "input", prompt: "Divide:", math: "45.2 ÷ 100", accept: ["0.452", ".452"], num: 0.452,
    nudge: "Dividing by 100 makes every digit worth 100 times less — two place shifts to the right.",
    setup: "45.2 → one shift gives 4.52 → one more shift gives…",
    steps: ["÷100 means two place shifts smaller.", "First shift: 45.2 → 4.52.", "Second shift: 4.52 → 0.452."],
    slips: { "4.52": "That's ÷10. Dividing by 100 needs two shifts.", "452": "Careful with direction — dividing makes the number smaller." } },
  { id: "A3", strand: "A", type: "mc", prompt: "Which number is greater?", math: "0.45   or   0.5",
    options: ["0.45", "0.5", "They're equal"], correct: 1,
    nudge: "Give them the same number of digits: rewrite 0.5 as hundredths.",
    setup: "0.5 = 0.50, so compare 45 hundredths with 50 hundredths.",
    steps: ["0.5 is the same as 0.50 (five tenths = fifty hundredths).", "Now compare: 45 hundredths vs 50 hundredths.", "50 > 45, so 0.5 is greater. Longer doesn't mean bigger with decimals!"],
    slipsByIndex: { 0: "0.45 has more digits, but that doesn't make it bigger. Rewrite 0.5 as 0.50 and compare." } },
  { id: "A7", strand: "A", type: "mc", prompt: "Which number is the GREATEST?", math: "0.309    0.35    0.4",
    options: ["0.309", "0.35", "0.4"], correct: 2,
    nudge: "Give all three the same number of decimal places, then compare like whole numbers.",
    setup: "0.309, 0.350, 0.400 — compare 309, 350, 400 (thousandths)",
    steps: ["Pad with zeros: 0.309, 0.350, 0.400.", "Now compare 309 vs 350 vs 400 thousandths.", "400 is biggest → 0.4 wins, even though it looks shortest."],
    slipsByIndex: { 0: "More digits doesn't mean more value. Pad them: 0.309 vs 0.350 vs 0.400." } },
  { id: "A11", strand: "A", type: "mc", prompt: "Which fraction equals 0.6?", math: "",
    options: ["6/10", "6/100", "1/6", "60/10"], correct: 0,
    nudge: "Read the decimal by its place: the 6 sits in which place?",
    setup: "0.6 = six tenths",
    steps: ["The first place after the point is the tenths place.", "So 0.6 means six tenths.", "As a fraction: 6/10 (which also simplifies to 3/5)."],
    slipsByIndex: { 1: "6/100 would be 0.06 — the 6 would sit one place further out.", 2: "1/6 ≈ 0.1666… — the 6 in 0.6 is a count of tenths, not a denominator." } },
  { id: "A4", strand: "A", type: "input", prompt: "Write as a regular number:", math: "6 × 10³", accept: ["6000", "6,000"], num: 6000,
    nudge: "10³ means 10 × 10 × 10. What number is that?",
    setup: "10³ = 1,000, so this is 6 × 1,000",
    steps: ["10³ = 10 × 10 × 10 = 1,000.", "6 × 1,000 = 6,000.", "Shortcut: the exponent 3 tells you the 6 shifts three places → three zeros."],
    slips: { "600": "10³ has three tens multiplied — that's 1,000, not 100.", "18": "10³ isn't 10 × 3 — it's 10 used as a factor three times." } },
  { id: "A8", strand: "A", type: "input", prompt: "Write as a regular number:", math: "4 × 10⁴", accept: ["40000", "40,000"], num: 40000,
    nudge: "The exponent counts the place shifts. Four shifts means how many zeros?",
    setup: "10⁴ = 10,000",
    steps: ["10⁴ = 10 × 10 × 10 × 10 = 10,000.", "4 × 10,000 = 40,000.", "The exponent 4 matches the four zeros."],
    slips: { "40": "10⁴ isn't 10 — it's ten thousand.", "4000": "Count again: the exponent 4 means four zeros after the 4." } },
  { id: "A9", strand: "A", type: "input", prompt: "Multiply:", math: "2.18 × 1,000", accept: ["2180", "2,180"], num: 2180,
    nudge: "×1,000 is three place shifts. When the digits run out, zeros fill in.",
    setup: "2.18 → 21.8 → 218 → …",
    steps: ["Three shifts: 2.18 → 21.8 → 218 → 2,180.", "The last shift had no digit, so a zero fills the gap.", "2.18 × 1,000 = 2,180."],
    slips: { "218": "That's ×100 — one more shift, filled with a zero.", "2.18000": "Tacking on zeros after the decimal doesn't change the value — the digits must shift places." } },
  { id: "A10", strand: "A", type: "input", prompt: "Round 7.463 to the nearest tenth.", math: "", accept: ["7.5"], num: 7.5,
    nudge: "The tenths digit is the 4. Look at its right-hand neighbor to decide: stay or round up?",
    setup: "Neighbor digit (hundredths) is 6 — is that 5 or more?",
    steps: ["Tenths digit: 4. Its neighbor (hundredths): 6.", "6 is 5-or-more, so the 4 rounds UP to 5.", "Answer: 7.5. Everything after the tenths place drops away."],
    slips: { "7.4": "Check the neighbor: the 6 in the hundredths place pushes the 4 up to 5.", "7.46": "Nearest TENTH means only one digit after the point survives." } },
  { id: "A12", strand: "A", type: "input", prompt: "Divide:", math: "900 ÷ 10³", accept: ["0.9", ".9"], num: 0.9,
    nudge: "10³ = 1,000. Dividing by 1,000 is three shifts smaller.",
    setup: "900 → 90 → 9 → …",
    steps: ["10³ = 1,000, so this is 900 ÷ 1,000.", "Three shifts smaller: 900 → 90 → 9 → 0.9.", "Answer: 0.9. (Makes sense: 900 is a bit less than 1,000.)"],
    slips: { "90": "That's ÷10 — the exponent 3 asks for three shifts.", "9": "One more shift: ÷1,000 needs three in total." } },

  // ================= B · add & subtract fractions =================
  { id: "B1", strand: "B", type: "input", prompt: "Add. Answer as a fraction:", math: "1/2 + 1/3", accept: ["5/6"], num: 5 / 6,
    nudge: "You can only add pieces that are the same size. What size piece works for both halves and thirds?",
    setup: "Common denominator 6:  1/2 = 3/6  and  1/3 = 2/6",
    steps: ["Halves and thirds are different-sized pieces — rewrite both as sixths.", "1/2 = 3/6 and 1/3 = 2/6.", "Now add the pieces: 3/6 + 2/6 = 5/6."],
    slips: { "2/5": "Tops AND bottoms got added — but the denominator is the piece size, and piece sizes don't add. Find a common denominator first.", "2/6": "The tops have to be converted too: 1/2 becomes 3/6, not 1/6." } },
  { id: "B5", strand: "B", type: "input", prompt: "Add. Answer as a fraction:", math: "1/4 + 2/3", accept: ["11/12"], num: 11 / 12,
    nudge: "Fourths and thirds need a common size. What number do both 4 and 3 go into?",
    setup: "Twelfths work:  1/4 = 3/12  and  2/3 = 8/12",
    steps: ["Common denominator: 12.", "Convert: 1/4 = 3/12 and 2/3 = 8/12.", "Add the pieces: 3/12 + 8/12 = 11/12."],
    slips: { "3/7": "Adding tops and bottoms mixes piece sizes. Convert both to twelfths first.", "3/12": "Both fractions convert — 2/3 becomes 8/12, then add." } },
  { id: "B8", strand: "B", type: "input", prompt: "Add. Answer as a fraction:", math: "2/5 + 1/2", accept: ["9/10"], num: 9 / 10,
    nudge: "Fifths and halves — what common size fits both?",
    setup: "Tenths:  2/5 = 4/10  and  1/2 = 5/10",
    steps: ["Common denominator: 10.", "Convert: 2/5 = 4/10 and 1/2 = 5/10.", "4/10 + 5/10 = 9/10."],
    slips: { "3/7": "Denominators don't add — they're piece sizes. Convert to tenths first." } },
  { id: "B2", strand: "B", type: "input", prompt: "Subtract. Answer as a fraction:", math: "3/4 − 1/8", accept: ["5/8"], num: 5 / 8,
    nudge: "Eighths are half the size of fourths. Rewrite 3/4 as eighths so both fractions match.",
    setup: "3/4 = 6/8, so the problem becomes 6/8 − 1/8",
    steps: ["Rewrite 3/4 in eighths: multiply top and bottom by 2 → 6/8.", "Now the pieces match: 6/8 − 1/8.", "6 − 1 = 5, so the answer is 5/8."],
    slips: { "2/4": "The bottoms don't subtract — convert 3/4 to 6/8 first so the pieces are the same size.", "1/2": "The bottoms don't subtract — convert 3/4 to 6/8 first so the pieces are the same size." } },
  { id: "B6", strand: "B", type: "input", prompt: "Subtract. Answer as a fraction:", math: "5/6 − 1/2", accept: ["1/3", "2/6"], num: 1 / 3,
    nudge: "Rewrite 1/2 as sixths so both fractions use the same size piece.",
    setup: "1/2 = 3/6, so it becomes 5/6 − 3/6",
    steps: ["Convert: 1/2 = 3/6.", "Subtract matching pieces: 5/6 − 3/6 = 2/6.", "Simplify: 2/6 = 1/3."],
    slips: { "1": "Subtracting tops and bottoms gave 4/4 — but denominators never subtract. Convert 1/2 to 3/6 first.", "4/6": "1/2 equals 3/6, not 1/6 — triple the top when you triple the bottom." } },
  { id: "B9", strand: "B", type: "input", prompt: "You run 3/10 of a mile, rest, then run 2/5 of a mile. How far did you run in total, as a fraction of a mile?", math: "", accept: ["7/10"], num: 0.7,
    nudge: "This is an adding story. Convert 2/5 into tenths so the pieces match.",
    setup: "2/5 = 4/10, so it's 3/10 + 4/10",
    steps: ["The story adds the two runs: 3/10 + 2/5.", "Convert: 2/5 = 4/10.", "3/10 + 4/10 = 7/10 of a mile."],
    slips: { "1/3": "Tops-plus-tops over bottoms-plus-bottoms isn't adding fractions — convert to tenths first.", "5/10": "2/5 is 4/10, not 2/10 — double the top with the bottom." } },
  { id: "B3", strand: "B", type: "input", prompt: "Add. You can answer as a mixed number (like 3 3/4) or a fraction:", math: "2 1/4 + 1 1/2", accept: ["15/4"], num: 3.75,
    nudge: "Add the whole numbers and the fractions separately. But first, make the fraction pieces match.",
    setup: "Wholes: 2 + 1 = 3.   Fractions: 1/4 + 1/2 = 1/4 + 2/4",
    steps: ["Split it: (2 + 1) and (1/4 + 1/2).", "Wholes: 2 + 1 = 3.", "Fractions: 1/2 = 2/4, so 1/4 + 2/4 = 3/4.", "Put them back together: 3 3/4."],
    slips: { "3 2/6": "The fraction parts got added top-and-bottom. Convert 1/2 to 2/4 first, then add fourths to fourths." } },
  { id: "B10", strand: "B", type: "input", prompt: "Add. Mixed number or fraction:", math: "1 1/3 + 2 1/2", accept: ["23/6"], num: 23 / 6,
    nudge: "Wholes with wholes, fractions with fractions. Thirds and halves both fit into sixths.",
    setup: "Wholes: 1 + 2 = 3.   Fractions: 1/3 + 1/2 = 2/6 + 3/6",
    steps: ["Wholes: 1 + 2 = 3.", "Convert the fractions to sixths: 1/3 = 2/6 and 1/2 = 3/6.", "2/6 + 3/6 = 5/6.", "Total: 3 5/6."],
    slips: { "3 2/5": "The fraction halves got added across. Sixths make the pieces match: 2/6 + 3/6." } },
  { id: "B4", strand: "B", type: "input", prompt: "A recipe bowl has 7/8 cup of flour. You scoop out 1/4 cup. How much is left, as a fraction of a cup?", math: "", accept: ["5/8"], num: 5 / 8,
    nudge: "This is a subtraction story: start amount minus the scoop. Match the piece sizes first.",
    setup: "7/8 − 1/4, and 1/4 = 2/8",
    steps: ["The story says: 7/8 − 1/4.", "Convert: 1/4 = 2/8.", "7/8 − 2/8 = 5/8 cup left."],
    slips: { "6/4": "Subtract, don't add — flour is leaving the bowl. And convert 1/4 to eighths first.", "6/8": "1/4 equals 2/8, not 1/8 — double the top when you double the bottom.", "3/4": "1/4 equals 2/8, not 1/8 — double the top when you double the bottom." } },
  { id: "B12", strand: "B", type: "input", prompt: "A pizza has 5/6 left. Friends eat 1/3 of a whole pizza. What fraction is left now?", math: "", accept: ["1/2", "3/6"], num: 0.5,
    nudge: "Subtracting again — convert 1/3 into sixths first.",
    setup: "1/3 = 2/6, so it's 5/6 − 2/6",
    steps: ["Set up: 5/6 − 1/3.", "Convert: 1/3 = 2/6.", "5/6 − 2/6 = 3/6 = 1/2 of the pizza."],
    slips: { "4/6": "1/3 equals 2/6, not 1/6 — the top doubles when the bottom doubles.", "2/3": "1/3 equals 2/6, not 1/6 — the top doubles when the bottom doubles.", "4/3": "The friends ATE pizza — subtract, and convert 1/3 to sixths first." } },
  { id: "B7", strand: "B", type: "input", prompt: "Subtract. Mixed number or fraction (this one needs borrowing!):", math: "3 1/2 − 1 3/4", accept: ["7/4"], num: 1.75,
    nudge: "1/2 is smaller than 3/4, so you can't subtract straight across. Borrow a whole and turn it into fourths.",
    setup: "3 1/2 = 3 2/4 = 2 6/4  (one whole borrowed as 4/4)",
    steps: ["Convert: 3 1/2 = 3 2/4. But 2/4 is less than 3/4 — borrow!", "Take 1 from the 3 and turn it into 4/4: 3 2/4 = 2 6/4.", "Now subtract: wholes 2 − 1 = 1, fractions 6/4 − 3/4 = 3/4.", "Answer: 1 3/4."],
    slips: { "2 1/4": "Sneaky one — you can't flip to '3/4 minus 1/2' just because it's easier. Borrow a whole from the 3 instead." } },
  { id: "B11", strand: "B", type: "mc", prompt: "Without calculating exactly: 7/8 + 11/12 is closest to…", math: "",
    options: ["about 1", "about 2", "about 20"], correct: 1,
    nudge: "Don't compute — judge each fraction. Is 7/8 close to 0, 1/2, or 1?",
    setup: "7/8 is almost 1. 11/12 is almost 1.",
    steps: ["7/8 is just one small piece short of a whole — close to 1.", "11/12 is also just one piece short — close to 1.", "Almost-1 plus almost-1 ≈ 2. Estimating like this is a superpower for catching mistakes."],
    slipsByIndex: { 2: "The big denominators don't make big values — each fraction is less than 1." } },

  // ================= C · multiply & divide fractions =================
  { id: "C5", strand: "C", type: "input", prompt: "Multiply. Answer as a fraction:", math: "1/2 × 1/2", accept: ["1/4"], num: 0.25,
    nudge: "This asks: what is half OF a half? Picture folding a paper in half, twice.",
    setup: "(1 × 1) / (2 × 2)",
    steps: ["Multiply tops: 1 × 1 = 1.", "Multiply bottoms: 2 × 2 = 4.", "Half of a half is 1/4 — smaller than either, which makes sense."],
    slips: { "1": "Half TIMES half shrinks — adding halves is what makes 1.", "1/2": "Taking half OF a half leaves a quarter." } },
  { id: "C1", strand: "C", type: "input", prompt: "Multiply. Answer as a fraction:", math: "2/3 × 4/5", accept: ["8/15"], num: 8 / 15,
    nudge: "Good news: multiplying fractions is the easy one. Tops together, bottoms together — no common denominator needed.",
    setup: "(2 × 4) / (3 × 5)",
    steps: ["Multiply the tops: 2 × 4 = 8.", "Multiply the bottoms: 3 × 5 = 15.", "Answer: 8/15. (Notice it's smaller than both — taking 2/3 OF something shrinks it.)"],
    slips: { "6/8": "That multiplied crosswise. Straight across: tops with tops, bottoms with bottoms." } },
  { id: "C2", strand: "C", type: "input", prompt: "Find 3/4 of 20.", math: "", accept: ["15"], num: 15,
    nudge: "'Of' means multiply. Or think in steps: what is 1/4 of 20 first?",
    setup: "1/4 of 20 = 5, and you want three of those",
    steps: ["Split 20 into 4 equal parts: 20 ÷ 4 = 5. That's 1/4.", "You want 3 of those parts: 3 × 5.", "3/4 of 20 = 15."],
    slips: { "5": "That's 1/4 of 20 — you found one part, now take three of them.", "60": "3/4 of a number is smaller than the number — divide by 4 first, then take 3 parts." } },
  { id: "C6", strand: "C", type: "input", prompt: "Find 2/5 of 30.", math: "", accept: ["12"], num: 12,
    nudge: "One fifth first: split 30 into 5 equal parts. Then take two of them.",
    setup: "1/5 of 30 = 6",
    steps: ["30 ÷ 5 = 6, so 1/5 of 30 is 6.", "Take two of those parts: 2 × 6.", "2/5 of 30 = 12."],
    slips: { "6": "That's 1/5 — the question wants TWO fifths.", "75": "2/5 of a number is smaller than it — divide into fifths first." } },
  { id: "C7", strand: "C", type: "input", prompt: "Multiply. Mixed number or fraction:", math: "5 × 2/3", accept: ["10/3"], num: 10 / 3,
    nudge: "Five copies of 2/3. How many thirds is that in total?",
    setup: "5 × 2/3 = (5 × 2)/3 = 10 thirds",
    steps: ["Five copies of two-thirds is 10 thirds: 10/3.", "10/3 as a mixed number: 3 groups of 3/3 with 1 left over.", "5 × 2/3 = 10/3 = 3 1/3."],
    slips: { "2/3": "The bottom stays put — only the count of thirds multiplies: 5 × 2 = 10 thirds.", "10/15": "The bottom stays put — only the count of thirds multiplies: 5 × 2 = 10 thirds." } },
  { id: "C11", strand: "C", type: "mc", prompt: "Without calculating: will 5/6 × 4 be greater than 4, less than 4, or equal to 4?", math: "",
    options: ["Greater than 4", "Less than 4", "Equal to 4"], correct: 1,
    nudge: "You're taking 5/6 OF 4. Is 5/6 a whole, more than a whole, or less?",
    setup: "5/6 is a bit less than 1 whole",
    steps: ["Multiplying by exactly 1 keeps a number the same.", "5/6 is slightly less than 1.", "So 5/6 × 4 lands slightly below 4. Predicting size before computing catches tons of errors."],
    slipsByIndex: { 0: "Multiplying only grows a number when the factor is bigger than 1 — and 5/6 isn't." } },
  { id: "C3", strand: "C", type: "input", prompt: "Divide:", math: "4 ÷ 1/2", accept: ["8"], num: 8,
    nudge: "Read it as a question: how many half-pieces fit inside 4 wholes?",
    setup: "Each whole holds 2 halves. There are 4 wholes…",
    steps: ["4 ÷ 1/2 asks: how many halves are in 4?", "Every 1 whole contains 2 halves.", "4 wholes × 2 halves each = 8. (Dividing by a fraction can make the answer BIGGER.)"],
    slips: { "2": "That's 4 ÷ 2. Dividing by one-HALF asks how many halves fit in 4 — the answer grows." } },
  { id: "C8", strand: "C", type: "input", prompt: "Divide:", math: "6 ÷ 1/3", accept: ["18"], num: 18,
    nudge: "How many third-pieces fit inside 6 wholes?",
    setup: "Each whole holds 3 thirds",
    steps: ["The question: how many thirds are in 6?", "Each whole contains 3 thirds.", "6 × 3 = 18 thirds fit."],
    slips: { "2": "That's 6 ÷ 3. Dividing by one-THIRD counts the thirds — the answer grows to 18." } },
  { id: "C9", strand: "C", type: "input", prompt: "Divide. Answer as a fraction:", math: "1/2 ÷ 3", accept: ["1/6"], num: 1 / 6,
    nudge: "You're splitting a half into 3 equal slivers. Bigger or smaller than 1/2?",
    setup: "Splitting 1/2 into 3 parts: 1 / (2 × 3)",
    steps: ["Picture half a sandwich shared by 3 people.", "Each person gets 1 of the 2 × 3 = 6 equal parts of the whole.", "1/2 ÷ 3 = 1/6."],
    slips: { "3/2": "Sharing among 3 makes pieces smaller — the denominator grows: 2 × 3 = 6.", "6": "The answer is a fraction: one sixth, written 1/6." } },
  { id: "C4", strand: "C", type: "input", prompt: "A ribbon 1/3 of a meter long is cut into 4 equal pieces. How long is each piece, as a fraction of a meter?", math: "1/3 ÷ 4", accept: ["1/12"], num: 1 / 12,
    nudge: "You're splitting an already-small piece into 4 even smaller ones. Will the answer be bigger or smaller than 1/3?",
    setup: "Splitting 1/3 into 4 parts: 1 / (3 × 4)",
    steps: ["Picture a bar cut in thirds; now cut one third into 4 slivers.", "Each sliver is 1 out of 3 × 4 = 12 equal parts of the whole meter.", "Each piece is 1/12 of a meter."],
    slips: { "4/3": "Sharing among 4 makes pieces smaller, not bigger — the denominator grows: 3 × 4 = 12.", "12": "Almost — the answer is a fraction: 1 twelfth, written 1/12." } },
  { id: "C10", strand: "C", type: "input", prompt: "You have 3/4 pound of trail mix, split evenly into 3 bags. How much is in each bag, as a fraction of a pound?", math: "", accept: ["1/4"], num: 0.25,
    nudge: "Three fourths shared into 3 groups — how many fourths per group?",
    setup: "3 fourths ÷ 3 = 1 fourth each",
    steps: ["You hold 3 quarter-pounds.", "Deal them into 3 bags: one quarter each.", "Each bag gets 1/4 pound."],
    slips: { "9/4": "Sharing divides — multiplying by 3 would triple the mix instead of splitting it." } },
  { id: "C12", strand: "C", type: "input", prompt: "One batch of muffins uses 2/3 cup of oats. How many cups for 4 batches? Mixed number or fraction.", math: "", accept: ["8/3"], num: 8 / 3,
    nudge: "Four copies of 2/3. Count the thirds.",
    setup: "4 × 2/3 = 8 thirds",
    steps: ["4 batches × 2 thirds each = 8 thirds of a cup.", "8/3 = 2 wholes (6/3) with 2/3 left over.", "You need 2 2/3 cups."],
    slips: { "2/3": "The denominator stays — only the count of thirds multiplies: 4 × 2 = 8.", "8/12": "The denominator stays — only the count of thirds multiplies: 4 × 2 = 8." } },

  // ================= D · decimals =================
  { id: "D7", strand: "D", type: "input", prompt: "Multiply:", math: "0.25 × 8", accept: ["2"], num: 2,
    nudge: "0.25 is a quarter. What is a quarter of 8?",
    setup: "0.25 = 1/4, so this is 1/4 of 8",
    steps: ["0.25 is the decimal form of 1/4.", "1/4 of 8 = 8 ÷ 4.", "Answer: 2. (Or: 25 × 8 = 200, two decimal places → 2.00.)"],
    slips: { "0.2": "Count decimal places: 25 × 8 = 200, and two places in gives 2.00 = 2.", "20": "Two decimal places move in from 200 → 2, not 20." } },
  { id: "D1", strand: "D", type: "input", prompt: "Add:", math: "3.7 + 2.45", accept: ["6.15"], num: 6.15,
    nudge: "Stack them with the decimal points lined up — not the last digits. It can help to write 3.7 as 3.70.",
    setup: "  3.70\n+ 2.45",
    steps: ["Rewrite 3.7 as 3.70 so both have hundredths.", "Line up the decimal points and add: 0.70 + 0.45 = 1.15.", "3 + 2 = 5, plus the 1.15 → 6.15."],
    slips: { "2.82": "The numbers got lined up by their last digits. Line up the decimal POINTS: 3.70 over 2.45.", "5.82": "Write 3.7 as 3.70 first, then add the hundredths column." } },
  { id: "D5", strand: "D", type: "input", prompt: "Add:", math: "12.6 + 0.85", accept: ["13.45"], num: 13.45,
    nudge: "Line up the points: the 12.6 becomes 12.60.",
    setup: "  12.60\n+  0.85",
    steps: ["Rewrite: 12.6 = 12.60.", "Add hundredths and tenths: 0.60 + 0.85 = 1.45.", "12 + 1.45 = 13.45."],
    slips: { "12.91": "The 0.85 slid into the wrong columns — the 8 is tenths, lining up under the 6.", "21.1": "Line up the decimal points, not the first digits." } },
  { id: "D2", strand: "D", type: "input", prompt: "Subtract:", math: "5 − 1.36", accept: ["3.64"], num: 3.64,
    nudge: "Whole number 5 is the same as 5.00. Now both numbers have hundredths.",
    setup: "  5.00\n− 1.36",
    steps: ["Rewrite 5 as 5.00.", "Subtract with borrowing: 5.00 − 1.36.", "5.00 − 1 = 4.00, then 4.00 − 0.36 = 3.64."],
    slips: { "4.36": "The 0.36 has to come OFF too: after 5 − 1 = 4, subtract the 0.36 → 3.64.", "4.64": "Check the whole-number part: 5.00 − 1.36 lands between 3 and 4." } },
  { id: "D6", strand: "D", type: "input", prompt: "Subtract:", math: "4.03 − 2.7", accept: ["1.33"], num: 1.33,
    nudge: "Write 2.7 as 2.70 and line up the points before subtracting.",
    setup: "  4.03\n− 2.70",
    steps: ["Rewrite: 2.7 = 2.70.", "The tenths need borrowing: 0.03 − 0.70 can't go, so borrow from the 4.", "3 + 1.03 − 0.70 → 4.03 − 2.70 = 1.33."],
    slips: { "1.96": "The 2.7 slid a column — its 7 is tenths (2.70), lining up under the 0.", "2.33": "Check the wholes after borrowing: the answer is between 1 and 2." } },
  { id: "D3", strand: "D", type: "input", prompt: "Multiply:", math: "0.4 × 0.3", accept: ["0.12", ".12"], num: 0.12,
    nudge: "Multiply 4 × 3 first, then figure out where the decimal point lands by counting decimal places.",
    setup: "4 × 3 = 12, and there are 1 + 1 = 2 decimal places total",
    steps: ["Ignore the points: 4 × 3 = 12.", "Count decimal places in the question: 0.4 has one, 0.3 has one → two total.", "Give the answer two decimal places: 0.12. (Makes sense: a bit of a bit is small.)"],
    slips: { "1.2": "Count the decimal places: one in 0.4 plus one in 0.3 means TWO in the answer.", "12": "Both numbers are less than 1, so the answer must be less than 1 too." } },
  { id: "D8", strand: "D", type: "input", prompt: "Multiply:", math: "3.5 × 0.2", accept: ["0.7", ".7", "0.70"], num: 0.7,
    nudge: "35 × 2 first. Then count the decimal places in the question.",
    setup: "35 × 2 = 70, with 1 + 1 = 2 decimal places",
    steps: ["Ignore points: 35 × 2 = 70.", "Decimal places: 3.5 has one, 0.2 has one → two total.", "70 with two places in: 0.70 = 0.7. (Check: 0.2 is a fifth, and a fifth of 3.5 is 0.7 ✓)"],
    slips: { "7": "Two decimal places, not one: 70 → 0.70.", "0.07": "Two places in from 70 lands at 0.70, not 0.07." } },
  { id: "D9", strand: "D", type: "input", prompt: "Divide:", math: "9.6 ÷ 4", accept: ["2.4"], num: 2.4,
    nudge: "Divide like whole numbers, but keep the decimal point lined up in the answer.",
    setup: "9 ÷ 4 = 2 remainder 1, then bring the 6 down…",
    steps: ["4 goes into 9 twice (8), remainder 1.", "Bring down the 6: 4 goes into 16 four times.", "Point stays put: 9.6 ÷ 4 = 2.4. Check: 2.4 × 4 = 9.6 ✓"],
    slips: { "24": "The decimal point rides straight up into the answer: 2.4, not 24." } },
  { id: "D4", strand: "D", type: "input", prompt: "Divide:", math: "7.2 ÷ 0.9", accept: ["8"], num: 8,
    nudge: "Make the divisor a whole number: multiply BOTH numbers by 10 first.",
    setup: "7.2 ÷ 0.9 = 72 ÷ 9",
    steps: ["Multiply both by 10 (that keeps the answer the same): 72 ÷ 9.", "72 ÷ 9 = 8.", "Check: 8 × 0.9 = 7.2 ✓"],
    slips: { "0.8": "After shifting both numbers, no decimal is left: 72 ÷ 9 = 8, a whole number." } },
  { id: "D10", strand: "D", type: "input", prompt: "Divide:", math: "0.36 ÷ 0.6", accept: ["0.6", ".6"], num: 0.6,
    nudge: "Shift both numbers by ×10 so you're dividing by a whole number.",
    setup: "0.36 ÷ 0.6 = 3.6 ÷ 6",
    steps: ["Multiply both by 10: 3.6 ÷ 6.", "36 tenths ÷ 6 = 6 tenths.", "Answer: 0.6. Check: 0.6 × 0.6 = 0.36 ✓"],
    slips: { "6": "After the shift it's 3.6 ÷ 6 — the answer is less than 1.", "0.06": "36 tenths shared by 6 gives 6 tenths: 0.6." } },
  { id: "D11", strand: "D", type: "mc", prompt: "Best ESTIMATE for 4.9 × 6.1 (no exact calculating!):", math: "",
    options: ["about 11", "about 30", "about 300"], correct: 1,
    nudge: "Round each number to its nearest whole first.",
    setup: "4.9 ≈ 5 and 6.1 ≈ 6",
    steps: ["Round: 4.9 → 5 and 6.1 → 6.", "5 × 6 = 30.", "So 4.9 × 6.1 ≈ 30. Estimating first is your error-detector for decimal problems."],
    slipsByIndex: { 0: "11 would be adding them — the × makes it around 30.", 2: "300 would mean a slipped decimal point — 5 × 6 is 30." } },
  { id: "D12", strand: "D", type: "input", prompt: "You pay with a $10 bill for a $3.75 snack and a $4.50 drink. How much change do you get, in dollars?", math: "", accept: ["1.75", "$1.75"], num: 1.75,
    nudge: "Two steps: total the purchases, then subtract from 10.",
    setup: "3.75 + 4.50 = ?, then 10.00 − that",
    steps: ["Add the purchases: 3.75 + 4.50 = 8.25.", "Subtract from the bill: 10.00 − 8.25.", "Change: $1.75."],
    slips: { "8.25": "That's what you SPENT — the change is what's left of the 10.", "2.75": "Check the subtraction: 10.00 − 8.25 borrows down to 1.75." } },

  // ================= E · order of operations =================
  { id: "E1", strand: "E", type: "input", prompt: "Evaluate:", math: "24 − 6 × 3", accept: ["6"], num: 6,
    nudge: "Multiplication happens before subtraction, even when it comes second in the line.",
    setup: "Do 6 × 3 first",
    steps: ["Multiplication first: 6 × 3 = 18.", "Then subtract: 24 − 18.", "Answer: 6."],
    slips: { "54": "That went left to right. Multiplication jumps the line: 6 × 3 happens before the subtraction." } },
  { id: "E5", strand: "E", type: "input", prompt: "Evaluate:", math: "18 ÷ 3 + 3", accept: ["9"], num: 9,
    nudge: "Division and addition: which one goes first?",
    setup: "18 ÷ 3 happens before the + 3",
    steps: ["Divide first: 18 ÷ 3 = 6.", "Then add: 6 + 3.", "Answer: 9."],
    slips: { "3": "The + 3 waits its turn — don't divide by 6. It's (18 ÷ 3) then + 3." } },
  { id: "E6", strand: "E", type: "input", prompt: "Evaluate:", math: "(14 − 8) × 5", accept: ["30"], num: 30,
    nudge: "Parentheses go first, always.",
    setup: "(14 − 8) = 6",
    steps: ["Inside the parentheses: 14 − 8 = 6.", "Then multiply: 6 × 5.", "Answer: 30."],
    slips: { "-26": "The parentheses protect the 14 − 8 — that difference happens before the × 5 touches anything." } },
  { id: "E2", strand: "E", type: "input", prompt: "Evaluate:", math: "2 × (3 + 5) − 4", accept: ["12"], num: 12,
    nudge: "Parentheses are a VIP pass — whatever is inside goes first.",
    setup: "(3 + 5) = 8, so it becomes 2 × 8 − 4",
    steps: ["Parentheses first: 3 + 5 = 8.", "Multiply: 2 × 8 = 16.", "Subtract: 16 − 4 = 12."],
    slips: { "7": "The parentheses group 3 + 5 together — that sum happens before the 2 multiplies anything.", "8": "After 2 × 8 = 16, the − 4 still needs to happen." } },
  { id: "E8", strand: "E", type: "input", prompt: "Evaluate:", math: "3 × 4 + 2 × 5", accept: ["22"], num: 22,
    nudge: "TWO multiplications hiding here. Do both before any adding.",
    setup: "(3 × 4) + (2 × 5)",
    steps: ["First product: 3 × 4 = 12.", "Second product: 2 × 5 = 10.", "Add the results: 12 + 10 = 22."],
    slips: { "70": "Left-to-right sneaked in — the + waits until BOTH multiplications are done." } },
  { id: "E3", strand: "E", type: "mc", prompt: "Which expression means: “add 9 and 3, THEN multiply the result by 2”?", math: "",
    options: ["9 + 3 × 2", "(9 + 3) × 2", "9 × 3 + 2", "2 × 9 + 3"], correct: 1,
    nudge: "‘Then’ is the clue — the adding must finish first. What symbol forces something to go first?",
    setup: "To make the sum happen first, wrap it: (9 + 3)",
    steps: ["Without parentheses, 9 + 3 × 2 would multiply first (giving 15).", "Parentheses force the sum to happen first: (9 + 3) = 12.", "Then × 2 → (9 + 3) × 2 = 24. That matches the words."],
    slipsByIndex: { 0: "Without parentheses, the × 2 grabs only the 3. The words say the whole sum gets doubled." } },
  { id: "E9", strand: "E", type: "mc", prompt: "Which expression means: “subtract 4 from 10, then divide by 2”?", math: "",
    options: ["10 − 4 ÷ 2", "(10 − 4) ÷ 2", "10 ÷ 2 − 4", "4 − 10 ÷ 2"], correct: 1,
    nudge: "The subtraction must finish before the dividing starts. What forces that?",
    setup: "Wrap the subtraction: (10 − 4)",
    steps: ["'Subtract 4 from 10' is 10 − 4 (order matters!).", "'Then divide' means the whole difference gets divided — wrap it in parentheses.", "(10 − 4) ÷ 2 = 6 ÷ 2 = 3."],
    slipsByIndex: { 0: "Without parentheses, only the 4 gets divided: 10 − 2 = 8. The words divide the whole difference.", 3: "'Subtract 4 FROM 10' starts at 10: it's 10 − 4." } },
  { id: "E7", strand: "E", type: "input", prompt: "Evaluate:", math: "40 − (4 + 6) × 2", accept: ["20"], num: 20,
    nudge: "Two rules stack up: parentheses first, and multiplication before subtraction.",
    setup: "(4 + 6) = 10, so it becomes 40 − 10 × 2",
    steps: ["Parentheses: 4 + 6 = 10.", "Multiply before subtracting: 10 × 2 = 20.", "40 − 20 = 20."],
    slips: { "84": "Left-to-right strikes again — the (4 + 6) × 2 = 20 comes off the 40 in one piece.", "60": "The × 2 belongs to the (4 + 6), so 20 gets subtracted, not 10." } },
  { id: "E10", strand: "E", type: "input", prompt: "Evaluate:", math: "36 ÷ (2 × 3)", accept: ["6"], num: 6,
    nudge: "The parentheses change everything here. Compute inside them first.",
    setup: "(2 × 3) = 6",
    steps: ["Inside first: 2 × 3 = 6.", "Then 36 ÷ 6.", "Answer: 6. (Without parentheses, 36 ÷ 2 × 3 would be 54 — parentheses matter!)"],
    slips: { "54": "That's 36 ÷ 2 × 3 without parentheses. Here the (2 × 3) = 6 happens first." } },
  { id: "E4", strand: "E", type: "input", prompt: "Evaluate:", math: "5 + 3 × (10 − 6) ÷ 2", accept: ["11"], num: 11,
    nudge: "Order: parentheses → multiply/divide (left to right) → add. Take it one move at a time.",
    setup: "(10 − 6) = 4, so it becomes 5 + 3 × 4 ÷ 2",
    steps: ["Parentheses: 10 − 6 = 4.", "Multiply and divide left to right: 3 × 4 = 12, then 12 ÷ 2 = 6.", "Add last: 5 + 6 = 11."],
    slips: { "16": "The 5 waits until the end — don't add it to the 3 first. Parentheses, then × and ÷, then +." } },
  { id: "E11", strand: "E", type: "input", prompt: "Evaluate (brackets work like parentheses):", math: "2 × [3 + (8 − 5)]", accept: ["12"], num: 12,
    nudge: "Work from the INSIDE out: the roundest brackets first.",
    setup: "(8 − 5) = 3, so it becomes 2 × [3 + 3]",
    steps: ["Innermost: 8 − 5 = 3.", "Next layer: [3 + 3] = 6.", "Finally: 2 × 6 = 12."],
    slips: { "9": "The 2 multiplies the WHOLE bracket [3 + 3] = 6, not just the first 3." } },
  { id: "E12", strand: "E", type: "input", prompt: "Adult movie tickets are $12 and kid tickets are $8. What's the total cost for 2 adults and 3 kids, in dollars?", math: "2 × 12 + 3 × 8", accept: ["48", "$48"], num: 48,
    nudge: "Two groups, two multiplications — then combine.",
    setup: "(2 × 12) + (3 × 8)",
    steps: ["Adults: 2 × 12 = 24.", "Kids: 3 × 8 = 24.", "Total: 24 + 24 = $48."],
    slips: { "60": "Adults and kids have different prices — 5 people × $12 overcharges the kids.", "40": "5 people × $8 undercharges the adults — keep the two groups separate." } },

  // ================= F · coordinate plane & patterns =================
  { id: "F1", strand: "F", type: "mc", prompt: "For the point (3, 5), which number tells you how far to go RIGHT from zero?", math: "(3, 5)",
    options: ["3", "5"], correct: 0,
    nudge: "Ordered pairs always come in the same order: (right, up) — like walking before climbing.",
    setup: "(x, y) = (right, up)",
    steps: ["The first number is always the x — how far right.", "The second is the y — how far up.", "So (3, 5) means right 3, up 5. The 3 is the RIGHT move."],
    slipsByIndex: { 1: "The 5 is the climb (up). The FIRST number is always the sideways move." } },
  { id: "F5", strand: "F", type: "mc", prompt: "The point (0, 6) sits exactly on one of the axes. Which one?", math: "(0, 6)",
    options: ["The x-axis (the floor)", "The y-axis (the wall)"], correct: 1,
    nudge: "The 0 means one of the moves doesn't happen. Which move is skipped?",
    setup: "Right 0, up 6",
    steps: ["(0, 6) says: go right 0 — don't move sideways at all.", "Then climb up 6.", "No sideways travel means you're still on the vertical line — the y-axis."],
    slipsByIndex: { 0: "Zero sideways travel keeps you glued to the vertical axis, not the floor." } },
  { id: "F2", strand: "F", type: "input", prompt: "Start at (0, 0). Walk right 4 and up 2. What ordered pair are you standing on? Write it like (x, y).", math: "", accept: ["(4,2)", "4,2"],
    nudge: "Right comes first in the pair, up comes second.",
    setup: "(right, up) = ( ?, ? )",
    steps: ["Right 4 → the first number is 4.", "Up 2 → the second number is 2.", "You're at (4, 2)."],
    slips: { "(2,4)": "Flipped! The sideways move is written first: (4, 2).", "2,4": "Flipped! The sideways move is written first: (4, 2)." } },
  { id: "F6", strand: "F", type: "input", prompt: "You're standing at (2, 3). Move right 3 and up 1. Where are you now? Write it like (x, y).", math: "", accept: ["(5,4)", "5,4"],
    nudge: "Add each move to the matching coordinate: right changes the first number, up changes the second.",
    setup: "(2 + 3, 3 + 1)",
    steps: ["Right 3: the x goes 2 → 5.", "Up 1: the y goes 3 → 4.", "New point: (5, 4)."],
    slips: { "(5,3)": "The 'up 1' still needs to happen — the second number climbs too.", "(3,4)": "Right moves change the FIRST number: 2 + 3 = 5." } },
  { id: "F9", strand: "F", type: "mc", prompt: "Which point is farther to the RIGHT: (7, 2) or (4, 9)?", math: "",
    options: ["(7, 2)", "(4, 9)", "They're equally far right"], correct: 0,
    nudge: "'Right' is controlled by only one of the two numbers.",
    setup: "Compare the FIRST numbers: 7 vs 4",
    steps: ["Sideways position is the first number (x).", "7 vs 4 → 7 is farther right.", "The 9 in (4, 9) is height — it makes the point higher, not farther over."],
    slipsByIndex: { 1: "The 9 is UP-ness. For right-ness, compare first numbers: 7 beats 4." } },
  { id: "F11", strand: "F", type: "input", prompt: "How many units apart are the points (2, 5) and (7, 5)? (Notice they have the same height.)", math: "", accept: ["5"], num: 5,
    nudge: "Same y means the gap is purely sideways. Subtract the x's.",
    setup: "7 − 2",
    steps: ["Both points sit at height 5 — the distance is horizontal.", "Subtract the x-coordinates: 7 − 2.", "They're 5 units apart."],
    slips: { "9": "Don't add — distance along a line is the DIFFERENCE: 7 − 2.", "0": "The y's match but the x's don't — subtract 7 − 2." } },
  { id: "F12", strand: "F", type: "input", prompt: "On a town map, the library is at (1, 2) and the park is at (1, 8). How many units apart are they?", math: "", accept: ["6"], num: 6,
    nudge: "Same first number — so the gap runs straight up. Subtract the heights.",
    setup: "8 − 2",
    steps: ["Both sit on the vertical line x = 1.", "Distance is the difference in heights: 8 − 2.", "6 units apart."],
    slips: { "10": "Subtract the y's (8 − 2), don't add them." } },
  { id: "F3", strand: "F", type: "input", prompt: "A pattern starts at 0 and adds 3 each time: 0, 3, 6, 9, … What is the 6th number in the pattern?", math: "", accept: ["15"], num: 15,
    nudge: "Keep the pattern going and count carefully — 0 is the 1st number.",
    setup: "1st: 0, 2nd: 3, 3rd: 6, 4th: 9, 5th: ?, 6th: ?",
    steps: ["Continue: 5th is 9 + 3 = 12.", "6th is 12 + 3 = 15.", "Shortcut: the 6th term has added 3 five times → 5 × 3 = 15."],
    slips: { "18": "Careful counting — 0 itself is the 1st number, so the 6th is 15.", "12": "That's the 5th number. One more hop of +3." } },
  { id: "F7", strand: "F", type: "input", prompt: "A pattern starts at 40 and SUBTRACTS 5 each time: 40, 35, 30, … What is the 7th number?", math: "", accept: ["10"], num: 10,
    nudge: "From the 1st number to the 7th is how many hops of −5?",
    setup: "6 hops of −5 from 40",
    steps: ["1st → 7th is 6 hops.", "6 hops of −5 removes 30.", "40 − 30 = 10."],
    slips: { "5": "That's the 8th number — count the hops: 1st to 7th is six hops.", "15": "One hop short — that's the 6th number." } },
  { id: "F8", strand: "F", type: "input", prompt: "A rule machine says y = x + 4. If x = 9, what is y?", math: "y = x + 4", accept: ["13"], num: 13,
    nudge: "Feed the 9 into the machine — replace x with 9.",
    setup: "y = 9 + 4",
    steps: ["The rule: whatever goes in, add 4.", "In goes 9: y = 9 + 4.", "y = 13."],
    slips: { "5": "The rule ADDS 4 — subtracting would be y = x − 4.", "36": "Add, don't multiply: x + 4 means 9 + 4." } },
  { id: "F4", strand: "F", type: "input", prompt: "Pattern x goes 0, 1, 2, 3 (add 1). Pattern y goes 0, 2, 4, 6 (add 2). When x = 5, what is y?", math: "", accept: ["10"], num: 10,
    nudge: "Compare pairs: (0,0), (1,2), (2,4), (3,6). What does y always equal compared to x?",
    setup: "y is always double x",
    steps: ["Line up the pairs: x=1→y=2, x=2→y=4, x=3→y=6.", "Every y is exactly 2 × x.", "When x = 5: y = 2 × 5 = 10. (This 'y depends on x' idea is a big deal in Math 6!)"],
    slips: { "7": "Don't just add 2 to x — check the pairs: y is DOUBLE x every time.", "8": "That's y when x = 4. Push one more step to x = 5." } },
  { id: "F10", strand: "F", type: "input", prompt: "Pattern x goes 0, 1, 2, 3. Pattern y goes 0, 3, 6, 9. When x = 10, what is y?", math: "", accept: ["30"], num: 30,
    nudge: "Find the rule connecting each x to its y — then jump straight to x = 10 without listing every step.",
    setup: "x=1→y=3, x=2→y=6, x=3→y=9 … y = ?×x",
    steps: ["Each y is triple its x: y = 3 × x.", "The rule lets you skip ahead — no need to list all ten steps.", "x = 10 → y = 3 × 10 = 30."],
    slips: { "12": "Don't just add 3 once more — the RULE is y = 3 × x, so jump to 3 × 10.", "13": "The connection is multiply-by-3, not add-3-to-x." } },

  // ================= G · volume =================
  { id: "G5", strand: "G", type: "input", prompt: "A cube has edges 3 units long. What is its volume, in cubic units?", math: "", accept: ["27"], num: 27,
    nudge: "A cube is 3 long, 3 wide, AND 3 tall.",
    setup: "3 × 3 × 3",
    steps: ["Bottom layer: 3 × 3 = 9 cubes.", "Three layers tall: 9 × 3.", "Volume = 27 cubic units."],
    slips: { "9": "That's one layer (3 × 3) — the cube stacks three of them.", "12": "Volume multiplies all three edges; adding gives something else entirely." } },
  { id: "G1", strand: "G", type: "input", prompt: "A box is 4 units long, 3 units wide, and 2 units tall. How many unit cubes fill it? (That's its volume.)", math: "V = length × width × height", accept: ["24"], num: 24,
    nudge: "First find how many cubes cover the floor of the box, then stack layers.",
    setup: "Floor layer: 4 × 3 cubes. Number of layers: 2.",
    steps: ["Bottom layer: 4 × 3 = 12 cubes.", "The box is 2 layers tall: 12 × 2.", "Volume = 24 cubic units."],
    slips: { "9": "Volume multiplies the dimensions — adding 4 + 3 + 2 gives a walk around, not a fill-up.", "12": "That's one layer. The box holds 2 layers of 12." } },
  { id: "G6", strand: "G", type: "input", prompt: "Find the volume of a box 6 units long, 2 units wide, and 5 units tall (in cubic units).", math: "", accept: ["60"], num: 60,
    nudge: "Layer first: how many cubes on the floor? Then stack.",
    setup: "Floor: 6 × 2 = 12. Layers: 5.",
    steps: ["Floor layer: 6 × 2 = 12 cubes.", "Stack 5 layers: 12 × 5.", "Volume = 60 cubic units."],
    slips: { "13": "Multiply the three dimensions — adding them doesn't count the cubes inside." } },
  { id: "G9", strand: "G", type: "mc", prompt: "Which unit measures VOLUME?", math: "",
    options: ["cm (centimeters)", "cm² (square centimeters)", "cm³ (cubic centimeters)"], correct: 2,
    nudge: "Volume fills space in 3 directions. The little exponent counts the directions.",
    setup: "length → cm, area → cm², volume → cm…?",
    steps: ["Length is one direction: cm.", "Area covers two directions (a flat sheet): cm².", "Volume fills three directions (a solid): cm³. The exponent matches the dimensions."],
    slipsByIndex: { 1: "cm² is for flat area — volume needs the third direction: cm³." } },
  { id: "G11", strand: "G", type: "input", prompt: "A juice box is 8 cm long, 4 cm wide, and 10 cm tall. What is its volume, in cm³?", math: "", accept: ["320"], num: 320,
    nudge: "Same recipe: floor layer, then stack.",
    setup: "8 × 4 × 10",
    steps: ["Floor: 8 × 4 = 32 cm².", "Stack 10 cm high: 32 × 10.", "Volume = 320 cm³."],
    slips: { "22": "Add the edges and you get a trip around the box — multiply for the fill-up: 8 × 4 × 10." } },
  { id: "G2", strand: "G", type: "input", prompt: "A box has volume 30 cm³. Its base is 5 cm by 3 cm. How tall is it, in cm?", math: "", accept: ["2"], num: 2,
    nudge: "Volume = base area × height. You know the volume and can find the base area — work backward.",
    setup: "Base area: 5 × 3 = 15. Then 15 × height = 30.",
    steps: ["Base area = 5 × 3 = 15 cm².", "Volume equation: 15 × h = 30.", "h = 30 ÷ 15 = 2 cm."],
    slips: { "22": "Don't subtract — volume divides back out: 30 ÷ (5 × 3).", "6": "First multiply the base: 5 × 3 = 15. Then 30 ÷ 15." } },
  { id: "G7", strand: "G", type: "input", prompt: "A box has volume 48 cubic units. It is 4 units long and 4 units wide. How tall is it?", math: "", accept: ["3"], num: 3,
    nudge: "Find the floor layer first, then ask: how many layers make 48?",
    setup: "Floor: 4 × 4 = 16. Then 16 × h = 48.",
    steps: ["Floor layer: 4 × 4 = 16 cubes.", "Layers needed: 48 ÷ 16.", "Height = 3 units."],
    slips: { "6": "The base is 4 × 4 = 16 — divide 48 by 16, not by 8.", "40": "Divide, don't subtract: how many 16-cube layers fit in 48?" } },
  { id: "G3", strand: "G", type: "input", prompt: "Convert: 3.5 meters = ? centimeters", math: "", accept: ["350"], num: 350,
    nudge: "1 meter = 100 centimeters. Converting to a smaller unit means MORE of them.",
    setup: "3.5 × 100",
    steps: ["Each meter is 100 cm.", "3.5 × 100 shifts the digits two places bigger.", "3.5 m = 350 cm."],
    slips: { "35": "That's ×10. A meter holds 100 centimeters — two place shifts.", "0.035": "Wrong direction — centimeters are smaller, so you need MORE of them, not fewer." } },
  { id: "G8", strand: "G", type: "input", prompt: "Convert: 2.4 kilograms = ? grams", math: "", accept: ["2400", "2,400"], num: 2400,
    nudge: "'Kilo' means one thousand. Smaller unit → more of them.",
    setup: "2.4 × 1,000",
    steps: ["1 kg = 1,000 g.", "2.4 × 1,000 = three place shifts.", "2.4 kg = 2,400 g."],
    slips: { "240": "Kilo is 1,000, not 100 — one more shift.", "0.0024": "Wrong direction — grams are smaller, so the count grows." } },
  { id: "G4", strand: "G", type: "input", prompt: "An L-shaped figure is built from two boxes: one is 5 × 2 × 2 and the other is 3 × 2 × 2. What is the total volume, in cubic units?", math: "", accept: ["32"], num: 32,
    nudge: "Weird shapes get split into friendly boxes. Find each box's volume, then combine.",
    setup: "Box 1: 5 × 2 × 2.   Box 2: 3 × 2 × 2.",
    steps: ["Box 1: 5 × 2 × 2 = 20 cubic units.", "Box 2: 3 × 2 × 2 = 12 cubic units.", "Total: 20 + 12 = 32 cubic units. Volumes of separate parts ADD."],
    slips: { "240": "Don't multiply the two boxes together — each box gets its own volume, then they add.", "20": "That's just the first box — the second piece holds 12 more." } },
  { id: "G10", strand: "G", type: "input", prompt: "A step-shaped figure: a 4 × 4 × 1 slab with a 2 × 2 × 3 tower on top. Total volume, in cubic units?", math: "", accept: ["28"], num: 28,
    nudge: "Two friendly boxes again — volume each one, then add.",
    setup: "Slab: 4 × 4 × 1.   Tower: 2 × 2 × 3.",
    steps: ["Slab: 4 × 4 × 1 = 16.", "Tower: 2 × 2 × 3 = 12.", "Total: 16 + 12 = 28 cubic units."],
    slips: { "192": "The pieces ADD — multiplying 16 × 12 would count cubes that don't exist.", "16": "The tower on top holds 12 more cubes." } },
  { id: "G12", strand: "G", type: "input", prompt: "A fish tank is 50 cm long, 20 cm wide, and 30 cm tall. How many cm³ of water fill it to the top?", math: "", accept: ["30000", "30,000"], num: 30000,
    nudge: "Big numbers, same recipe: floor layer × height. Take it in two steps.",
    setup: "50 × 20 = 1,000, then × 30",
    steps: ["Floor: 50 × 20 = 1,000 cm².", "Stack 30 cm high: 1,000 × 30.", "Volume = 30,000 cm³. (Fun fact: that's exactly 30 liters.)"],
    slips: { "100": "Adding the edges won't fill the tank — multiply all three: 50 × 20 × 30.", "3000": "Watch the zeros: 1,000 × 30 = 30,000." } },
];

/* ---------------- answer checking ---------------- */
function normalize(s) {
  return String(s).toLowerCase().replace(/\s+/g, "").replace(/^\$/, "").replace(/−/g, "-").replace(/,/g, ",");
}
function parseVal(raw) {
  const t = String(raw).trim().replace(/−/g, "-").replace(/,/g, "");
  const mixed = t.match(/^(-?\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) {
    const w = parseInt(mixed[1], 10), a = parseInt(mixed[2], 10), b = parseInt(mixed[3], 10);
    if (b === 0) return NaN;
    return w < 0 ? w - a / b : w + a / b;
  }
  const frac = t.match(/^(-?\d+)\/(\d+)$/);
  if (frac) { const a = parseInt(frac[1], 10), b = parseInt(frac[2], 10); return b === 0 ? NaN : a / b; }
  const v = parseFloat(t);
  return isNaN(v) ? NaN : v;
}
function checkAnswer(p, raw) {
  const norm = normalize(raw);
  if (!norm) return { status: "empty" };
  if (p.accept && p.accept.map(normalize).includes(norm)) return { status: "correct" };
  if (p.num !== undefined) {
    const v = parseVal(raw);
    if (!isNaN(v) && Math.abs(v - p.num) < 0.006) return { status: "correct" };
  }
  if (p.slips) {
    for (const k of Object.keys(p.slips)) {
      const nk = normalize(k);
      if (norm === nk) return { status: "slip", msg: p.slips[k] };
      const kv = parseVal(k), uv = parseVal(raw);
      if (!isNaN(kv) && !isNaN(uv) && Math.abs(kv - uv) < 0.006) return { status: "slip", msg: p.slips[k] };
    }
  }
  return { status: "wrong" };
}

/* ---------------- persistence (localStorage) ---------------- */
const STORE_KEY = "ready-math6-v1";
function todayStr() { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; }
async function loadProgress() {
  try {
    if (typeof localStorage !== "undefined") {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) { const p = JSON.parse(raw); return p && p.status ? p : { status: p || {}, day: null }; }
    }
  } catch (e) { /* first run */ }
  return { status: {}, day: null };
}
async function saveProgress(data) {
  try { if (typeof localStorage !== "undefined") localStorage.setItem(STORE_KEY, JSON.stringify(data)); } catch (e) { /* offline ok */ }
}

/* ---------------- number-line progress ---------------- */
function NumberLine({ solved, total }) {
  const x0 = 12, x1 = 228, y = 26;
  const px = x0 + (x1 - x0) * (total ? solved / total : 0);
  return (
    <svg viewBox="0 0 240 46" className="numline" aria-label={`Progress: ${solved} of ${total} solved`}>
      <line x1={x0} y1={y} x2={x1} y2={y} className="nl-base" />
      <line x1={x0} y1={y} x2={px} y2={y} className="nl-fill" />
      {[...Array(total + 1)].map((_, i) => {
        const tx = x0 + (x1 - x0) * (i / total);
        const big = i % 7 === 0;
        return <line key={i} x1={tx} y1={y - (big ? 7 : 4)} x2={tx} y2={y + (big ? 7 : 4)} className={i <= solved ? "nl-tick done" : "nl-tick"} />;
      })}
      <text x={x0} y={y + 18} className="nl-num">0</text>
      <text x={x1} y={y + 18} className="nl-num" textAnchor="end">{total}</text>
      <circle cx={px} cy={y} r="5" className="nl-dot" />
      {solved > 0 && solved < total && <text x={px} y={y - 12} className="nl-here" textAnchor="middle">you</text>}
      {solved >= total && <text x={px} y={y - 12} className="nl-here" textAnchor="end">done! ★</text>}
    </svg>
  );
}

/* ---------------- main component ---------------- */
export default function ReadyForMath6() {
  const [view, setView] = useState({ screen: "home" });
  const [status, setStatus] = useState({}); // id -> 'solid' | 'helped'
  const [day, setDay] = useState({ date: todayStr(), solved: 0, points: 0 }); // daily progress (resets each calendar day)
  const [loaded, setLoaded] = useState(false);
  const [splash, setSplash] = useState(false);
  const [input, setInput] = useState("");
  const [picked, setPicked] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [hintLevel, setHintLevel] = useState(0);
  const [stepsShown, setStepsShown] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [mixList, setMixList] = useState([]);
  const inputRef = useRef(null);
  const lastMixIds = useRef([]); // ids shown in the previous Mix set, to avoid immediate repeats

  useEffect(() => {
    loadProgress().then(({ status, day }) => {
      setStatus(status || {});
      const sameDay = day && day.date === todayStr();
      setDay(sameDay ? day : { date: todayStr(), solved: 0, points: 0 });
      setLoaded(true);
    });
  }, []);
  useEffect(() => { if (loaded) saveProgress({ status, day }); }, [status, day, loaded]);

  const solvedCount = Object.keys(status).length;
  const solidCount = Object.values(status).filter(s => s === "solid").length;
  const todayD = day.date === todayStr() ? day : { solved: 0, points: 0 };
  const strandsComplete = STRANDS.filter(s => { const ps = PROBLEMS.filter(p => p.strand === s.id); return ps.length > 0 && ps.every(p => status[p.id]); }).length;

  const milestoneRef = useRef(null); // last-seen count of fully-solved strands — auto-pop the splash when a strand is completed
  useEffect(() => {
    if (!loaded) return;
    const prev = milestoneRef.current;
    if (prev != null && strandsComplete > prev) setSplash(true);
    milestoneRef.current = strandsComplete;
  }, [loaded, strandsComplete]);

  const splashNode = splash ? (
    <ResultsSplash
      emoji="📒"
      title="Ready for Math 6"
      accent="#D97E48"
      headline={`${solvedCount}/${PROBLEMS.length} solved`}
      cheer={solvedCount === PROBLEMS.length ? "Every problem solved — you're ready for Math 6! 🎉" : "Steady progress — a few a day is how it sticks."}
      today={[
        { value: todayD.solved, label: "solved" },
        { value: todayD.points, label: "points" },
      ]}
      lifetime={[
        { value: `${solvedCount}/${PROBLEMS.length}`, label: "solved" },
        { value: solidCount, label: "solid" },
        { value: `${strandsComplete}/${STRANDS.length}`, label: "strands" },
      ]}
      onClose={() => setSplash(false)}
    />
  ) : null;

  const list = view.screen === "strand"
    ? (view.mix ? mixList : PROBLEMS.filter(p => p.strand === view.strandId))
    : [];
  const problem = list[view.idx];
  const strandMeta = problem ? STRANDS.find(s => s.id === problem.strand) : null;

  function resetProblemState() { setInput(""); setPicked(null); setFeedback(null); setHintLevel(0); setStepsShown(0); setAttempts(0); }
  function openStrand(id) { resetProblemState(); setView({ screen: "strand", strandId: id, idx: 0 }); }
  function openMix() {
    // Weighted draw: never-attempted problems come up most often, "solved
    // with help" next, and "solid / mastered" problems rarely -- instead of
    // a hard cutoff that used to dump back to ALL 84 once few were unsolved.
    // Also avoids repeating the immediately-prior mix set back-to-back.
    const bag = [];
    PROBLEMS.forEach(p => {
      const st = status[p.id];
      let w = st === "solid" ? 1 : st === "helped" ? 4 : 6;
      if (lastMixIds.current.includes(p.id)) w = Math.max(1, w - 3);
      for (let i = 0; i < w; i++) bag.push(p);
    });
    for (let i = bag.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[bag[i], bag[j]] = [bag[j], bag[i]]; }
    const chosen = [];
    const seen = new Set();
    for (const p of bag) { if (!seen.has(p.id)) { seen.add(p.id); chosen.push(p); if (chosen.length === 10) break; } }
    lastMixIds.current = chosen.map(p => p.id);
    setMixList(chosen);
    resetProblemState();
    setView({ screen: "strand", strandId: null, idx: 0, mix: true });
  }
  function go(delta) {
    const nextIdx = view.idx + delta;
    if (nextIdx < 0) return;
    if (nextIdx >= list.length) { setView({ screen: "home" }); return; }
    resetProblemState(); setView({ ...view, idx: nextIdx });
  }
  function markSolved(clean) {
    setStatus(prev => {
      if (prev[problem.id] === "solid") return prev;
      return { ...prev, [problem.id]: clean ? "solid" : "helped" };
    });
  }
  function bumpDaily(clean) {
    setDay(d => {
      const base = d.date === todayStr() ? d : { date: todayStr(), solved: 0, points: 0 };
      return { ...base, solved: base.solved + 1, points: base.points + (clean ? 3 : 1) };
    });
  }
  function praise() {
    const clean = hintLevel === 0 && attempts === 0;
    return clean
      ? "Exactly right, first try. That skill is solid — on to the next."
      : "You got there — and working through the hard ones is where the real learning happens. Try a similar one fresh tomorrow.";
  }
  function submit() {
    if (!problem || feedback?.kind === "correct") return;
    if (problem.type === "mc") {
      if (picked === null) { setFeedback({ kind: "empty", msg: "Pick an answer first." }); return; }
      setAttempts(a => a + 1);
      if (picked === problem.correct) { const clean = hintLevel === 0 && attempts === 0; markSolved(clean); bumpDaily(clean); setFeedback({ kind: "correct", msg: praise() }); }
      else {
        const slip = problem.slipsByIndex && problem.slipsByIndex[picked];
        setFeedback(slip ? { kind: "slip", msg: slip } : { kind: "wrong", msg: "Not that one. Hints below are free — using them is how you learn, not cheating." });
      }
      return;
    }
    const res = checkAnswer(problem, input);
    if (res.status === "empty") { setFeedback({ kind: "empty", msg: "Type an answer first — a guess counts as a start." }); return; }
    setAttempts(a => a + 1);
    if (res.status === "correct") { const clean = hintLevel === 0 && attempts === 0; markSolved(clean); bumpDaily(clean); setFeedback({ kind: "correct", msg: praise() }); }
    else if (res.status === "slip") setFeedback({ kind: "slip", msg: res.msg });
    else setFeedback({ kind: "wrong", msg: "Not yet — that's okay, mistakes are data. Re-read once, or tap a hint below." });
  }
  function nextHint() {
    if (hintLevel < 3) { setHintLevel(hintLevel + 1); if (hintLevel + 1 === 3) setStepsShown(1); }
    else if (stepsShown < problem.steps.length) setStepsShown(stepsShown + 1);
  }
  const hintBtnLabel = !problem ? "" :
    hintLevel === 0 ? "Stuck? Get a nudge" :
    hintLevel === 1 ? "Show me how to start" :
    hintLevel === 2 ? "Walk me through it" :
    stepsShown < problem.steps.length ? `Next step (${stepsShown}/${problem.steps.length})` : null;

  async function resetAll() {
    if (!confirm("Erase all progress and start fresh?")) return;
    setStatus({});
    setDay({ date: todayStr(), solved: 0, points: 0 });
    try { if (typeof localStorage !== "undefined") localStorage.removeItem(STORE_KEY); } catch (e) {}
  }

  return (
    <div className="wrap">
      <style>{css}</style>
      {splashNode}

      {view.screen === "home" && (
        <div className="page">
          <header className="hero">
            <div className="eyebrow">Summer rebuild · rising 6th grader</div>
            <h1>Ready for<br /><span className="hl">Math 6</span></h1>
            <p className="lede">Math 6 leans hard on four things from 5th grade: fractions, decimals, order of operations, and volume. This set rebuilds each one from the ground up — small steps, lots of help available, zero rush.</p>
            <div className="plotcard">
              <NumberLine solved={solvedCount} total={PROBLEMS.length} />
              <div className="plotlabel">{solvedCount} of {PROBLEMS.length} solved · {solidCount} solid, {solvedCount - solidCount} with help</div>
              <div className="todayrow">
                <span className="todaystat">Today: {todayD.solved} solved · {todayD.points} pts</span>
                <button className="sharebtn" onClick={() => setSplash(true)}>📸 Share</button>
              </div>
            </div>
            <div className="targetnote">No test to cram for — the August i-Ready just checks a starting point, and Math 6 is the default class. The real goal: walking in on day one <b>sure</b> of fractions and decimals.</div>
          </header>

          <div className="strandlist">
            {STRANDS.map(s => {
              const probs = PROBLEMS.filter(p => p.strand === s.id);
              const done = probs.filter(p => status[p.id]).length;
              return (
                <button key={s.id} className="strandcard" onClick={() => openStrand(s.id)} style={{ "--sc": s.color }}>
                  <div className="strandtext">
                    <div className="strandname">{s.name}</div>
                    <div className="strandsub">{s.sub}</div>
                  </div>
                  <div className="cells" aria-label={`${done} of ${probs.length} done`}>
                    {probs.map(p => <span key={p.id} className={"cell " + (status[p.id] === "solid" ? "solid" : status[p.id] === "helped" ? "helped" : "")} />)}
                  </div>
                </button>
              );
            })}
          </div>

          <button className="mixbtn" onClick={openMix}>
            <span>Mix it up</span>
            <span className="mixsub">10 shuffled problems from every topic — great for day-later review</span>
          </button>

          <button className="resetlink" onClick={resetAll}>Reset progress</button>
        </div>
      )}

      {view.screen === "strand" && problem && (
        <div className="page">
          <div className="topbar">
            <button className="back" onClick={() => setView({ screen: "home" })}>← All topics</button>
            <div className="topbarright">
              <button className="sharebtn small" onClick={() => setSplash(true)} aria-label="Share progress">📸</button>
              <div className="counter">{view.idx + 1} / {list.length}</div>
            </div>
          </div>

          <div className="probcard" style={{ "--sc": (strandMeta || {}).color || "#4E8FB8" }}>
            <div className="chip">{view.mix ? "Mixed set · " : ""}{strandMeta ? strandMeta.name : ""}{status[problem.id] ? (status[problem.id] === "solid" ? " · ✓ solid" : " · ✓ done w/ help") : ""}</div>
            <p className="prompt">{problem.prompt}</p>
            {problem.math && <div className="mathblock">{problem.math.split("\n").map((l, i) => <div key={i}>{l}</div>)}</div>}

            {problem.type === "input" ? (
              <div className="answerrow">
                <input
                  ref={inputRef}
                  className="ansinput"
                  inputMode="text"
                  autoComplete="off"
                  placeholder="your answer"
                  value={input}
                  onChange={e => { setInput(e.target.value); if (feedback && feedback.kind !== "correct") setFeedback(null); }}
                  onKeyDown={e => e.key === "Enter" && submit()}
                  disabled={feedback?.kind === "correct"}
                />
                <button className="checkbtn" onClick={submit} disabled={feedback?.kind === "correct"}>Check</button>
              </div>
            ) : (
              <div className="choices">
                {problem.options.map((opt, i) => (
                  <button
                    key={i}
                    className={"choice" + (picked === i ? " picked" : "") + (feedback?.kind === "correct" && i === problem.correct ? " right" : "")}
                    onClick={() => { if (feedback?.kind !== "correct") { setPicked(i); setFeedback(null); } }}
                  >{opt}</button>
                ))}
                <button className="checkbtn wide" onClick={submit} disabled={feedback?.kind === "correct"}>Check</button>
              </div>
            )}

            {feedback && (
              <div className={"feedback " + feedback.kind}>
                {feedback.kind === "correct" ? "✓ " : feedback.kind === "slip" ? "So close — " : ""}{feedback.msg}
              </div>
            )}

            <div className="helpzone">
              {hintLevel >= 1 && <div className="hint lvl1"><span className="hlabel">Nudge</span>{problem.nudge}</div>}
              {hintLevel >= 2 && <div className="hint lvl2"><span className="hlabel">How to start</span><span className="mono">{problem.setup.split("\n").map((l, i) => <div key={i}>{l}</div>)}</span></div>}
              {hintLevel >= 3 && (
                <div className="hint lvl3">
                  <span className="hlabel">Walkthrough</span>
                  <ol>{problem.steps.slice(0, stepsShown).map((st, i) => <li key={i}>{st}</li>)}</ol>
                  {stepsShown >= problem.steps.length && (
                    <div className="selfexplain">One more thing: cover this up and explain it out loud like you're teaching a friend. If you can say it, you know it.</div>
                  )}
                </div>
              )}
              {hintBtnLabel && feedback?.kind !== "correct" && (
                <button className="hintbtn" onClick={nextHint}>{hintBtnLabel}</button>
              )}
              {feedback?.kind === "correct" && hintLevel >= 3 && stepsShown < problem.steps.length && (
                <button className="hintbtn" onClick={nextHint}>See remaining steps</button>
              )}
            </div>
          </div>

          <div className="navrow">
            <button className="navbtn ghost" onClick={() => go(-1)} disabled={view.idx === 0}>← Prev</button>
            <button className={"navbtn" + (feedback?.kind === "correct" ? " primary" : " ghost")} onClick={() => go(1)}>
              {view.idx === list.length - 1 ? "Finish set" : feedback?.kind === "correct" ? "Next →" : "Skip →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- styles ---------------- */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;500;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap');

.wrap {
  min-height: 100vh;
  background:
    repeating-linear-gradient(#FBF8F1 0px, #FBF8F1 27px, #E9E0CC 27px, #E9E0CC 28px);
  color: #2E3830;
  font-family: 'Bricolage Grotesque', system-ui, sans-serif;
  display: flex; justify-content: center;
  padding: 0 0 48px;
}
.page { width: 100%; max-width: 430px; padding: 20px 16px 0; }

/* hero */
.eyebrow { font-size: 11px; letter-spacing: .14em; text-transform: uppercase; color: #7A836E; font-weight: 600; }
h1 { font-size: 36px; line-height: 1.02; margin: 8px 0 10px; font-weight: 800; letter-spacing: -0.02em; color: #26413C; }
.hl { background: linear-gradient(transparent 55%, #FFC24B 55%); padding: 0 2px; }
.lede { font-size: 14.5px; line-height: 1.55; color: #4A554C; margin: 0 0 16px; }

.plotcard { background: #fff; border: 1.5px solid #26413C; border-radius: 12px; padding: 12px 14px 8px; box-shadow: 3px 3px 0 rgba(38,65,60,.15); }
.numline { width: 100%; display: block; }
.nl-base { stroke: #C9CFC3; stroke-width: 2.5; stroke-linecap: round; }
.nl-fill { stroke: #E4572E; stroke-width: 3; stroke-linecap: round; }
.nl-tick { stroke: #C9CFC3; stroke-width: 1.4; }
.nl-tick.done { stroke: #E4572E; }
.nl-dot { fill: #E4572E; stroke: #fff; stroke-width: 1.5; }
.nl-num { font-family: 'IBM Plex Mono', monospace; font-size: 9px; fill: #7A836E; }
.nl-here { font-family: 'Bricolage Grotesque', sans-serif; font-size: 9.5px; font-weight: 700; fill: #E4572E; }
.plotlabel { font-size: 12.5px; color: #4A554C; text-align: center; padding: 4px 0 4px; }
.todayrow { display: flex; align-items: center; justify-content: space-between; gap: 8px; border-top: 1px dashed #E0D9C6; margin-top: 6px; padding-top: 8px; }
.todaystat { font-size: 12.5px; font-weight: 700; color: #B0602A; }
.sharebtn { background: #fff; border: 1.5px solid #26413C; border-radius: 99px; font-family: inherit; font-weight: 700; font-size: 13px; padding: 7px 12px; cursor: pointer; }
.sharebtn.small { font-size: 15px; padding: 5px 9px; }
.sharebtn:active { transform: translateY(1px); }
.topbarright { display: flex; align-items: center; gap: 10px; }

.targetnote { margin: 14px 0 20px; font-size: 12.5px; line-height: 1.55; color: #5C665A; border-left: 3px solid #FFC24B; padding-left: 10px; }

/* strand cards */
.strandlist { display: flex; flex-direction: column; gap: 10px; }
.strandcard { display: flex; justify-content: space-between; align-items: center; gap: 10px; width: 100%; text-align: left; background: #fff; border: 1.5px solid #26413C; border-radius: 12px; padding: 14px; cursor: pointer; font-family: inherit; color: inherit; box-shadow: 3px 3px 0 rgba(38,65,60,.15); transition: transform .08s ease; }
.strandcard:active { transform: translate(2px,2px); box-shadow: 1px 1px 0 rgba(38,65,60,.15); }
.strandname { font-size: 16px; font-weight: 700; color: #26413C; }
.strandsub { font-size: 12px; color: #8A927F; margin-top: 2px; }
.cells { display: grid; grid-template-columns: repeat(4, 11px); grid-gap: 4px; flex-shrink: 0; }
.cell { width: 11px; height: 11px; border: 1.5px solid var(--sc); border-radius: 50%; background: transparent; }
.cell.solid { background: var(--sc); }
.cell.helped { background: linear-gradient(135deg, var(--sc) 50%, transparent 50%); }

.mixbtn { margin-top: 16px; width: 100%; background: #26413C; color: #FBF8F1; border: none; border-radius: 12px; padding: 16px; font-family: inherit; cursor: pointer; text-align: left; display: flex; flex-direction: column; gap: 4px; }
.mixbtn span:first-child { font-size: 16px; font-weight: 700; }
.mixsub { font-size: 12px; color: #B9C6B4; font-weight: 400; line-height: 1.4; }
.resetlink { margin: 22px auto 0; display: block; background: none; border: none; color: #9AA391; font-size: 12px; font-family: inherit; cursor: pointer; text-decoration: underline; }

/* problem view */
.topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.back { background: none; border: none; font-family: inherit; font-size: 14px; font-weight: 600; color: #26413C; cursor: pointer; padding: 8px 8px 8px 0; }
.counter { font-family: 'IBM Plex Mono', monospace; font-size: 13px; color: #8A927F; }

.probcard { background: #fff; border: 1.5px solid #26413C; border-radius: 14px; padding: 18px 16px; box-shadow: 4px 4px 0 rgba(38,65,60,.15); }
.chip { display: inline-block; font-size: 11px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: #fff; background: var(--sc); padding: 4px 9px; border-radius: 99px; margin-bottom: 12px; }
.prompt { font-size: 16px; line-height: 1.5; margin: 0 0 10px; }
.mathblock { font-family: 'IBM Plex Mono', monospace; font-size: 20px; background: #F5F2E8; border-left: 3px solid var(--sc); padding: 12px 14px; border-radius: 6px; margin-bottom: 16px; line-height: 1.5; overflow-x: auto; white-space: pre; }

.answerrow { display: flex; gap: 8px; }
.ansinput { flex: 1; min-width: 0; font-family: 'IBM Plex Mono', monospace; font-size: 17px; padding: 12px; border: 1.5px solid #26413C; border-radius: 10px; background: #FDFCF8; }
.ansinput:focus { outline: 3px solid #FFC24B; outline-offset: 1px; }
.checkbtn { background: #26413C; color: #fff; border: none; border-radius: 10px; font-family: inherit; font-weight: 700; font-size: 15px; padding: 12px 18px; cursor: pointer; min-height: 48px; }
.checkbtn:disabled { opacity: .4; cursor: default; }
.checkbtn.wide { width: 100%; margin-top: 4px; }

.choices { display: flex; flex-direction: column; gap: 8px; }
.choice { text-align: left; font-family: 'IBM Plex Mono', monospace; font-size: 15px; padding: 13px 14px; border: 1.5px solid #CBD1C2; border-radius: 10px; background: #FDFCF8; cursor: pointer; color: #2E3830; min-height: 48px; }
.choice.picked { border-color: #26413C; background: #FFF1D2; }
.choice.right { border-color: #3E9C84; background: #E6F4EF; }

.feedback { margin-top: 14px; font-size: 14px; line-height: 1.55; padding: 11px 13px; border-radius: 10px; }
.feedback.correct { background: #E6F4EF; color: #1F6B58; border: 1px solid #A5D6C7; }
.feedback.slip { background: #FDF1E2; color: #8A5314; border: 1px solid #ECCB9B; }
.feedback.wrong { background: #FBEDEA; color: #93402E; border: 1px solid #ECBCAE; }
.feedback.empty { background: #F2F3EE; color: #5C665A; border: 1px solid #DBDFD3; }

/* progressive help */
.helpzone { margin-top: 16px; display: flex; flex-direction: column; gap: 8px; }
.hint { font-size: 14px; line-height: 1.6; padding: 11px 13px; border-radius: 10px; border: 1.5px dashed #C2C9B7; background: #FBFAF4; }
.hint .hlabel { display: block; font-size: 10.5px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #8A927F; margin-bottom: 4px; }
.hint .mono { font-family: 'IBM Plex Mono', monospace; font-size: 14.5px; white-space: pre; display: block; overflow-x: auto; }
.hint ol { margin: 4px 0 0; padding-left: 20px; display: flex; flex-direction: column; gap: 7px; }
.hint.lvl3 { border-style: solid; border-color: #26413C; }
.selfexplain { margin-top: 10px; font-size: 12.5px; color: #5C665A; border-left: 3px solid #FFC24B; padding-left: 9px; line-height: 1.55; }
.hintbtn { align-self: flex-start; background: #FFC24B; border: 1.5px solid #26413C; color: #26413C; border-radius: 99px; font-family: inherit; font-weight: 700; font-size: 13.5px; padding: 10px 16px; cursor: pointer; min-height: 42px; box-shadow: 2px 2px 0 rgba(38,65,60,.2); }
.hintbtn:active { transform: translate(1px,1px); box-shadow: 1px 1px 0 rgba(38,65,60,.2); }

.navrow { display: flex; gap: 10px; margin-top: 16px; }
.navbtn { flex: 1; font-family: inherit; font-size: 15px; font-weight: 700; padding: 14px; border-radius: 10px; cursor: pointer; min-height: 50px; }
.navbtn.ghost { background: transparent; border: 1.5px solid #26413C; color: #26413C; }
.navbtn.primary { background: #3E9C84; border: 1.5px solid #3E9C84; color: #fff; }
.navbtn:disabled { opacity: .3; cursor: default; }

@media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
`;
