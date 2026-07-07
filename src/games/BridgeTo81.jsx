import { useState, useEffect, useRef } from "react";

/* ============================================================
   BRIDGE TO 8.1 — summer practice for Layla (MVWSD)
   Gap: grade-level Math 7 → Math 8.1 (Algebra 1 in 8th grade)
   Design: graph-paper world; progress is literally a slope.
   Pedagogy: one problem at a time, faded scaffolding
   (nudge → setup → full walkthrough), misconception-aware
   feedback, interleaved "Mix" mode, self-explanation prompts.
   ============================================================ */

const STRANDS = [
  { id: "A", name: "Negative numbers", sub: "Rational number fluency", color: "#5B7DB1" },
  { id: "B", name: "Ratios & percent", sub: "Proportional reasoning", color: "#4A9E8F" },
  { id: "C", name: "Solving equations", sub: "The gateway to Algebra", color: "#C77B3F" },
  { id: "D", name: "Exponents", sub: "Powers & scientific notation", color: "#8B6FB8" },
  { id: "E", name: "Slope & lines", sub: "The heart of Math 8", color: "#3E8FB0" },
  { id: "F", name: "Functions & systems", sub: "Thinking like Algebra 1", color: "#B05F7A" },
  { id: "G", name: "Roots & right triangles", sub: "Pythagorean theorem", color: "#6E8F4E" },
];

const PROBLEMS = [
  // ================= A · rational numbers =================
  { id: "A5", strand: "A", type: "input", prompt: "Compute:", math: "−15 + 9", accept: ["-6"], num: -6,
    nudge: "Different signs: find the gap between 15 and 9, and keep the sign of the bigger one.",
    setup: "Gap: 15 − 9 = 6. Bigger absolute value: the −15.",
    steps: ["Opposite signs → subtract the sizes: 15 − 9 = 6.", "The negative side (15) is bigger, so the result is negative.", "−15 + 9 = −6."],
    slips: { "6": "The negative 15 outweighs the positive 9 — the answer stays below zero.", "-24": "Adding 9 moves you TOWARD zero from −15, not further away." } },
  { id: "A6", strand: "A", type: "input", prompt: "Compute:", math: "−8 − (−3)", accept: ["-5"], num: -5,
    nudge: "Subtracting a negative flips to adding. Rewrite before computing.",
    setup: "−8 − (−3) = −8 + 3",
    steps: ["Two minus signs back-to-back become a plus: −8 + 3.", "From −8, move 3 to the right.", "−8 + 3 = −5."],
    slips: { "-11": "The double negative flips to addition: −8 + 3 moves toward zero." } },
  { id: "A1", strand: "A", type: "input", prompt: "Compute:", math: "−7 + 12 − (−5)", accept: ["10"], num: 10,
    nudge: "Subtracting a negative is the same as adding. Rewrite the last part before computing.",
    setup: "−7 + 12 − (−5)  →  −7 + 12 + 5",
    steps: ["Rewrite: subtracting −5 means adding 5, so the expression is −7 + 12 + 5.", "Left to right: −7 + 12 = 5.", "Then 5 + 5 = 10."],
    slips: { "0": "Check the last step — you're subtracting a negative, which adds 5, not removes it." } },
  { id: "A7", strand: "A", type: "input", prompt: "Multiply:", math: "(−6)(−7)", accept: ["42"], num: 42,
    nudge: "Two negatives multiplied — what sign comes out?",
    setup: "negative × negative = positive",
    steps: ["Same signs multiply to a positive.", "6 × 7 = 42.", "(−6)(−7) = 42."],
    slips: { "-42": "Negative times negative flips positive — only mixed signs stay negative." } },
  { id: "A8", strand: "A", type: "input", prompt: "Divide:", math: "−48 ÷ 6", accept: ["-8"], num: -8,
    nudge: "One negative, one positive — what sign survives?",
    setup: "mixed signs → negative answer",
    steps: ["Negative ÷ positive = negative.", "48 ÷ 6 = 8.", "−48 ÷ 6 = −8."],
    slips: { "8": "Only matching signs give a positive — here the signs are mixed." } },
  { id: "A2", strand: "A", type: "input", prompt: "Multiply. Give your answer as a fraction:", math: "(−3/4) × (8/9)", accept: ["-2/3", "-6/9", "-24/36"], num: -2 / 3,
    nudge: "Multiply straight across (tops together, bottoms together), then simplify. What sign must the answer have?",
    setup: "(−3 × 8) / (4 × 9) = −24/36",
    steps: ["Negative × positive = negative, so the answer is negative.", "Multiply across: −3 × 8 = −24 and 4 × 9 = 36, giving −24/36.", "Divide top and bottom by 12: −24/36 = −2/3."],
    slips: { "2/3": "The value is right but the sign isn't — negative × positive gives a negative." } },
  { id: "A3", strand: "A", type: "input", prompt: "Divide:", math: "−5.4 ÷ (−0.9)", accept: ["6"], num: 6,
    nudge: "Negative ÷ negative gives what sign? Then think: how many 0.9s fit into 5.4?",
    setup: "Same signs → positive answer. Now compute 5.4 ÷ 0.9.",
    steps: ["Negative ÷ negative = positive.", "Multiply both numbers by 10 to clear decimals: 54 ÷ 9.", "54 ÷ 9 = 6."],
    slips: { "-6": "Two negatives divided give a positive result." } },
  { id: "A9", strand: "A", type: "input", prompt: "Evaluate:", math: "(−2)³", accept: ["-8"], num: -8,
    nudge: "Write it out: (−2)(−2)(−2). Track the sign step by step.",
    setup: "(−2)(−2) = +4, then ×(−2)…",
    steps: ["First pair: (−2)(−2) = +4.", "Then 4 × (−2) = −8.", "Odd powers of a negative stay negative; even powers turn positive."],
    slips: { "8": "Three negative factors: the first two cancel to +4, the third flips it back to −8.", "-6": "Cubing multiplies, not triples: (−2)(−2)(−2)." } },
  { id: "A10", strand: "A", type: "input", prompt: "Evaluate:", math: "|−9| − |4|", accept: ["5"], num: 5,
    nudge: "Absolute value bars ask for distance from zero — always positive. Strip them first.",
    setup: "|−9| = 9 and |4| = 4",
    steps: ["|−9| is the distance from 0 to −9: that's 9.", "|4| = 4.", "9 − 4 = 5."],
    slips: { "-13": "The bars make both values positive before the subtraction happens.", "-5": "|−9| = +9, so it's 9 − 4, a positive result.", "13": "It's subtraction after the bars come off: 9 − 4." } },
  { id: "A4", strand: "A", type: "input", prompt: "Evaluate using order of operations:", math: "3 − 2(4 − 7)²", accept: ["-15"], num: -15,
    nudge: "Parentheses first, then the exponent, then multiplication, then subtraction. What is (4 − 7)?",
    setup: "(4 − 7) = −3, so the expression is 3 − 2(−3)²",
    steps: ["Parentheses: 4 − 7 = −3.", "Exponent: (−3)² = (−3)(−3) = +9. Squaring a negative gives a positive.", "Multiply: 2 × 9 = 18.", "Subtract: 3 − 18 = −15."],
    slips: { "21": "Careful: (−3)² = +9, not −9. The square applies to the whole −3.", "-3": "Don't subtract before handling the exponent and multiplication." } },
  { id: "A11", strand: "A", type: "input", prompt: "Add. Answer as a fraction:", math: "−3/5 + 1/2", accept: ["-1/10"], num: -0.1,
    nudge: "Common denominator first (tenths), then combine — the signs fight it out on the tops.",
    setup: "−3/5 = −6/10  and  1/2 = 5/10",
    steps: ["Convert to tenths: −6/10 + 5/10.", "Combine the numerators: −6 + 5 = −1.", "Answer: −1/10."],
    slips: { "-2/7": "Denominators never add — convert both to tenths first.", "1/10": "The −6 outweighs the +5, so the result stays negative." } },
  { id: "A12", strand: "A", type: "input", prompt: "The temperature is −4°F at dawn. It rises 9° by noon, then drops 12° by midnight. What's the final temperature, in °F?", math: "", accept: ["-7"], num: -7,
    nudge: "Translate the story into one expression: −4 + 9 − 12, then work left to right.",
    setup: "−4 + 9 = 5, then 5 − 12",
    steps: ["Rise: −4 + 9 = 5.", "Drop: 5 − 12 = −7.", "Final temperature: −7°F."],
    slips: { "7": "The 12-degree drop pushes past zero into the negatives.", "17": "Rises add, drops subtract: −4 + 9 − 12." } },

  // ================= B · ratios & percent =================
  { id: "B1", strand: "B", type: "input", prompt: "A 16 oz smoothie costs $6.40. What is the unit price per ounce, in dollars?", math: "", accept: ["0.40", "0.4", ".40", ".4", "$0.40"], num: 0.4,
    nudge: "Unit price means the cost of exactly one ounce. Which number gets divided by which?",
    setup: "unit price = total cost ÷ total ounces = 6.40 ÷ 16",
    steps: ["'Per ounce' tells you to divide dollars by ounces.", "6.40 ÷ 16 = 0.40.", "So each ounce costs $0.40."],
    slips: { "2.5": "That's ounces per dollar — flip the division: dollars ÷ ounces." } },
  { id: "B9", strand: "B", type: "input", prompt: "A road trip covers 210 miles in 3.5 hours. What's the average speed, in miles per hour?", math: "", accept: ["60"], num: 60,
    nudge: "'Miles per hour' spells out the division: miles ÷ hours.",
    setup: "210 ÷ 3.5",
    steps: ["Speed = distance ÷ time = 210 ÷ 3.5.", "Clear the decimal: 2100 ÷ 35.", "= 60 mph."],
    slips: { "735": "That multiplied — 'per hour' means divide the miles by the hours." } },
  { id: "B2", strand: "B", type: "input", prompt: "Solve the proportion:", math: "x/12 = 15/20", accept: ["9", "x=9"], num: 9,
    nudge: "Two equal ratios: you can cross-multiply, or first simplify 15/20.",
    setup: "Cross-multiply: 20x = 15 × 12",
    steps: ["Cross-multiply: 20 · x = 15 · 12 = 180.", "Divide both sides by 20: x = 180 ÷ 20.", "x = 9. Check: 9/12 = 3/4 and 15/20 = 3/4. ✓"] },
  { id: "B6", strand: "B", type: "input", prompt: "Solve the proportion:", math: "9/x = 3/7", accept: ["21", "x=21"], num: 21,
    nudge: "Careful — the x is on the bottom this time. Cross-multiplying still works.",
    setup: "Cross-multiply: 3x = 9 × 7",
    steps: ["Cross-multiply: 3 · x = 9 · 7 = 63.", "Divide by 3: x = 21.", "Check: 9/21 simplifies to 3/7 ✓"],
    slips: { "3": "That divided 9 by 3 — but x sits under the 9, so cross-multiply: 3x = 63." } },
  { id: "B11", strand: "B", type: "input", prompt: "A cookie recipe uses flour and sugar in a 3 : 2 ratio. If you use 9 cups of flour, how many cups of sugar?", math: "", accept: ["6"], num: 6,
    nudge: "9 cups is how many 'batches' of the 3-cup flour part? Sugar scales the same way.",
    setup: "9 ÷ 3 = 3 batches → sugar = 2 × 3",
    steps: ["The flour tripled: 3 → 9 is ×3.", "Sugar scales identically: 2 × 3.", "6 cups of sugar."],
    slips: { "13.5": "That flipped the ratio — sugar is the SMALLER part: 2 for every 3 flour." } },
  { id: "B4", strand: "B", type: "input", prompt: "Layla reads 42 pages in 35 minutes. At that rate, how many pages in 50 minutes?", math: "", accept: ["60"], num: 60,
    nudge: "Find her rate in pages per minute first, then scale it up.",
    setup: "rate = 42 ÷ 35 = 1.2 pages per minute",
    steps: ["Unit rate: 42 ÷ 35 = 1.2 pages per minute.", "Multiply by the new time: 1.2 × 50.", "1.2 × 50 = 60 pages."] },
  { id: "B5", strand: "B", type: "input", prompt: "Find 15% of 80.", math: "", accept: ["12"], num: 12,
    nudge: "Convert the percent to a decimal, then 'of' means multiply. Or: find 10% and 5% separately.",
    setup: "0.15 × 80   (or 10% = 8 and 5% = 4)",
    steps: ["15% = 0.15.", "0.15 × 80 = 12.", "Mental check: 10% of 80 is 8, 5% is 4, and 8 + 4 = 12 ✓"],
    slips: { "68": "That's 80 minus 15% — the question only asks for the 15% piece itself." } },
  { id: "B8", strand: "B", type: "input", prompt: "18 is what percent of 40?", math: "", accept: ["45", "45%"], num: 45,
    nudge: "Set up part ÷ whole, then convert the decimal to a percent.",
    setup: "18 ÷ 40 = 0.45",
    steps: ["Part over whole: 18/40.", "18 ÷ 40 = 0.45.", "0.45 = 45%."],
    slips: { "0.45": "That's the decimal — shift twice to name it as a percent: 45%.", "22": "Don't subtract — divide the part by the whole: 18 ÷ 40." } },
  { id: "B10", strand: "B", type: "input", prompt: "A $25 game has 8% sales tax added. What's the total price, in dollars?", math: "", accept: ["27", "$27"], num: 27,
    nudge: "Two moves: compute the tax, then add it on. (Or one move: × 1.08.)",
    setup: "tax = 0.08 × 25, total = 25 + tax",
    steps: ["Tax: 0.08 × 25 = 2.", "Add it on: 25 + 2 = 27.", "Shortcut: 25 × 1.08 = 27 — the 1 keeps the original price, the .08 adds the tax."],
    slips: { "2": "That's just the tax — the total includes the $25 game too." } },
  { id: "B3", strand: "B", type: "input", prompt: "A hoodie is 25% off and the sale price is $36. What was the original price, in dollars?", math: "", accept: ["48", "$48"], num: 48,
    nudge: "If 25% is taken off, what percent of the original price is the $36? Set that up as an equation.",
    setup: "sale price = 75% of original  →  0.75 · p = 36",
    steps: ["25% off means she pays 100% − 25% = 75% of the original price p.", "Equation: 0.75p = 36.", "Divide: p = 36 ÷ 0.75 = 48.", "Check: 25% of $48 is $12, and 48 − 12 = 36. ✓"],
    slips: { "45": "Adding 25% back onto $36 doesn't undo taking 25% off $48 — the 25% was of the bigger number. Try 0.75p = 36.", "27": "That takes another 25% off. We want to go backward to the original price." } },
  { id: "B7", strand: "B", type: "input", prompt: "A map's scale says 1 inch = 25 miles. Two towns are 3.5 inches apart on the map. How many real miles apart are they?", math: "", accept: ["87.5"], num: 87.5,
    nudge: "Every map-inch is worth 25 real miles. Scale up.",
    setup: "3.5 × 25",
    steps: ["Each inch stands for 25 miles.", "3.5 × 25 = 87.5.", "The towns are 87.5 miles apart."],
    slips: { "75": "Don't drop the half-inch: 3 × 25 = 75, plus another half-inch worth 12.5." } },
  { id: "B12", strand: "B", type: "input", prompt: "A plant was 60 cm tall and shrank to 45 cm after pruning. What PERCENT did its height decrease?", math: "", accept: ["25", "25%"], num: 25,
    nudge: "Percent change = (amount of change) ÷ (ORIGINAL amount). Which number is the original?",
    setup: "change = 60 − 45 = 15, then 15 ÷ 60",
    steps: ["Change: 60 − 45 = 15 cm.", "Divide by the ORIGINAL: 15 ÷ 60 = 0.25.", "A 25% decrease."],
    slips: { "15": "15 is the drop in centimeters — percent change divides it by the original 60.", "33": "Divide by the original height (60), not the new one (45)." } },

  // ================= C · solving equations =================
  { id: "C2", strand: "C", type: "input", prompt: "Solve for x:", math: "5x − 7 = 3x + 9", accept: ["8", "x=8"], num: 8,
    nudge: "Get all the x's on one side and all the plain numbers on the other. What could you subtract from both sides first?",
    setup: "Subtract 3x from both sides: 2x − 7 = 9",
    steps: ["Subtract 3x from both sides: 2x − 7 = 9.", "Add 7 to both sides: 2x = 16.", "Divide by 2: x = 8.", "Check: 5(8) − 7 = 33 and 3(8) + 9 = 33. ✓"],
    slips: { "1": "Looks like the 7 and 9 got combined as 16 ÷ 16. Move the x-terms first, keeping signs: 5x − 3x = 2x." } },
  { id: "C8", strand: "C", type: "input", prompt: "Solve for x:", math: "7 − 2x = 1", accept: ["3", "x=3"], num: 3,
    nudge: "Move the 7 across first, then divide — and mind the negative on the 2x.",
    setup: "Subtract 7: −2x = −6",
    steps: ["Subtract 7 from both sides: −2x = −6.", "Divide both sides by −2.", "x = 3. Check: 7 − 2(3) = 1 ✓"],
    slips: { "-3": "Negative ÷ negative: −6 ÷ −2 = +3.", "4": "The 2x is subtracted from 7, so isolating gives −2x = −6, not 2x = 8." } },
  { id: "C5", strand: "C", type: "input", prompt: "Solve for x:", math: "3(x − 2) = 15", accept: ["7", "x=7"], num: 7,
    nudge: "Two routes: distribute the 3 first, OR divide both sides by 3 right away. The second is faster here.",
    setup: "Divide by 3: x − 2 = 5",
    steps: ["Divide both sides by 3: x − 2 = 5.", "Add 2: x = 7.", "Check: 3(7 − 2) = 3(5) = 15 ✓"],
    slips: { "5": "One more move: after x − 2 = 5, the 2 comes back over → x = 7.", "17/3": "Distribute before moving the constant: 3x − 6 = 15, not 3x − 2 = 15." } },
  { id: "C6", strand: "C", type: "input", prompt: "Solve for x:", math: "x/4 + 3 = 10", accept: ["28", "x=28"], num: 28,
    nudge: "Undo the +3 first, THEN undo the divide-by-4.",
    setup: "Subtract 3: x/4 = 7",
    steps: ["Subtract 3 from both sides: x/4 = 7.", "Multiply both sides by 4.", "x = 28. Check: 28/4 + 3 = 7 + 3 = 10 ✓"],
    slips: { "1.75": "The +3 comes off before the ÷4 gets undone — otherwise you're dividing the 3 too.", "7": "That's x/4 — one more step: multiply by 4." } },
  { id: "C10", strand: "C", type: "input", prompt: "Solve for x:", math: "−x + 9 = 2", accept: ["7", "x=7"], num: 7,
    nudge: "Isolate the −x first. Then remember: −x = something means x is its opposite.",
    setup: "Subtract 9: −x = −7",
    steps: ["Subtract 9 from both sides: −x = −7.", "−x means the opposite of x, so x = 7.", "Check: −7 + 9 = 2 ✓"],
    slips: { "-7": "−x = −7 means x itself is +7 — flip both signs at the end.", "11": "Subtract the 9 (it's added), don't add it: −x = 2 − 9." } },
  { id: "C1", strand: "C", type: "input", prompt: "Simplify (write like 7x−17):", math: "4(2x − 3) − (x + 5)", accept: ["7x-17", "-17+7x", "7x+-17"],
    nudge: "Distribute the 4 into the first parentheses — and remember the minus sign distributes into the second parentheses too.",
    setup: "4(2x − 3) = 8x − 12   and   −(x + 5) = −x − 5",
    steps: ["Distribute: 4(2x − 3) = 8x − 12.", "The minus in front acts like −1: −(x + 5) = −x − 5.", "Combine x-terms: 8x − x = 7x.", "Combine constants: −12 − 5 = −17. Result: 7x − 17."],
    slips: { "7x-7": "The minus sign has to hit both terms inside: −(x + 5) = −x − 5, so the constants are −12 − 5.", "7x+17": "Check the constants: −12 − 5 = −17, not +17." } },
  { id: "C7", strand: "C", type: "input", prompt: "Simplify (write like 2x+10):", math: "5x + 2 − 3x + 8", accept: ["2x+10", "10+2x"],
    nudge: "Collect the x-terms together and the plain numbers together — each term keeps the sign in front of it.",
    setup: "(5x − 3x) + (2 + 8)",
    steps: ["x-terms: 5x − 3x = 2x.", "Constants: 2 + 8 = 10.", "Result: 2x + 10."],
    slips: { "8x+10": "The 3x carries its minus sign: 5x − 3x = 2x.", "2x-6": "The 8 is added, so the constants are 2 + 8 = 10." } },
  { id: "C3", strand: "C", type: "input", prompt: "Solve for y:", math: "(2/3)y + 4 = 12", accept: ["12", "y=12"], num: 12,
    nudge: "Undo the +4 first. Then, to undo multiplying by 2/3, multiply by its reciprocal.",
    setup: "Subtract 4: (2/3)y = 8",
    steps: ["Subtract 4 from both sides: (2/3)y = 8.", "Multiply both sides by 3/2 (the reciprocal of 2/3).", "y = 8 × 3/2 = 12.", "Check: (2/3)(12) + 4 = 8 + 4 = 12. ✓"],
    slips: { "16/3": "Undo the +4 before dealing with the fraction — the 4 isn't multiplied by y." } },
  { id: "C9", strand: "C", type: "input", prompt: "Solve for x:", math: "4(x + 1) = 2x + 10", accept: ["3", "x=3"], num: 3,
    nudge: "Distribute the left side first, then gather x's on one side.",
    setup: "4x + 4 = 2x + 10",
    steps: ["Distribute: 4(x + 1) = 4x + 4.", "Subtract 2x: 2x + 4 = 10.", "Subtract 4, divide by 2: x = 3.", "Check: 4(4) = 16 and 2(3) + 10 = 16 ✓"],
    slips: { "1.5": "Distribute before dividing — the 4 multiplies the whole (x + 1)." } },
  { id: "C4", strand: "C", type: "mc", prompt: "Solve the inequality:", math: "−3n + 5 > 20",
    options: ["n > −5", "n < −5", "n > 5", "n < 5"], correct: 1,
    nudge: "Solve it like an equation — but something special happens when you divide both sides by a negative number.",
    setup: "Subtract 5: −3n > 15. Now divide by −3…",
    steps: ["Subtract 5 from both sides: −3n > 15.", "Divide both sides by −3. Dividing by a negative FLIPS the inequality sign.", "n < −5.", "Sanity check with n = −10: −3(−10) + 5 = 35 > 20. ✓"],
    slipsByIndex: { 0: "So close — dividing both sides by −3 flips the > to <." } },
  { id: "C11", strand: "C", type: "mc", prompt: "Solve the inequality:", math: "2y − 3 ≤ 9",
    options: ["y ≤ 6", "y ≥ 6", "y ≤ 3", "y ≥ 3"], correct: 0,
    nudge: "Solve like an equation. Do you divide by a negative anywhere? That's the only time the sign flips.",
    setup: "Add 3: 2y ≤ 12",
    steps: ["Add 3 to both sides: 2y ≤ 12.", "Divide by +2 — positive, so the ≤ stays put.", "y ≤ 6. Check y = 0: −3 ≤ 9 ✓"],
    slipsByIndex: { 1: "No negative division happened, so the ≤ never flips." } },
  { id: "C12", strand: "C", type: "input", prompt: "You have $40 saved and add $25 every week. The equation 40 + 25w = 240 finds when you hit $240. Solve for w (weeks).", math: "40 + 25w = 240", accept: ["8", "w=8"], num: 8,
    nudge: "The 40 was there from the start — subtract it before dividing by the weekly amount.",
    setup: "25w = 200",
    steps: ["Subtract the starting $40: 25w = 200.", "Divide by 25: w = 8.", "Check: 40 + 25(8) = 40 + 200 = 240 ✓"],
    slips: { "9.6": "Subtract the starting 40 first — only 200 of the 240 comes from weekly saving.", "11.2": "The 40 gets subtracted, not added: 25w = 240 − 40." } },

  // ================= D · exponents =================
  { id: "D1", strand: "D", type: "input", prompt: "Simplify (write like x^8):", math: "x⁵ · x³", accept: ["x^8", "x8"],
    nudge: "Write out what x⁵ and x³ mean as repeated multiplication. How many x's total?",
    setup: "x⁵ · x³ = (x·x·x·x·x)(x·x·x)",
    steps: ["x⁵ is five x's multiplied; x³ is three more.", "Together: eight x's multiplied.", "Same base, multiplying → add exponents: x⁵⁺³ = x⁸."],
    slips: { "x^15": "Multiplying same bases adds the exponents; raising a power to a power is what multiplies them.", "x15": "Multiplying same bases adds the exponents; raising a power to a power is what multiplies them." } },
  { id: "D5", strand: "D", type: "input", prompt: "Simplify (write like x^5):", math: "x⁷ / x²", accept: ["x^5", "x5"],
    nudge: "Write both as stacks of x's — how many cancel top-and-bottom?",
    setup: "(x·x·x·x·x·x·x) / (x·x)",
    steps: ["Seven x's on top, two below.", "Two pairs cancel.", "Five remain: dividing same bases SUBTRACTS exponents: x⁷⁻² = x⁵."],
    slips: { "x^9": "Dividing subtracts the exponents — adding is for multiplication.", "x9": "Dividing subtracts the exponents — adding is for multiplication." } },
  { id: "D6", strand: "D", type: "input", prompt: "Evaluate:", math: "5⁰", accept: ["1"], num: 1,
    nudge: "Follow the pattern down: 5³ = 125, 5² = 25, 5¹ = 5, each step divides by 5. One more step…",
    setup: "5¹ = 5, and 5 ÷ 5 = ?",
    steps: ["Each drop in exponent divides by 5: 125 → 25 → 5 → …", "5 ÷ 5 = 1.", "Any nonzero number to the 0 power is 1."],
    slips: { "0": "The pattern lands on 1, not 0 — each step DIVIDES by 5, and 5 ÷ 5 = 1.", "5": "That's 5¹. Zero exponent means one more divide." } },
  { id: "D2", strand: "D", type: "input", prompt: "Evaluate as a number:", math: "(2³)²", accept: ["64"], num: 64,
    nudge: "A power raised to a power. You can compute the inside first: what is 2³?",
    setup: "(2³)² = 8² … or use the rule 2³ˣ² = 2⁶",
    steps: ["Inside first: 2³ = 8.", "Then square it: 8² = 64.", "Rule version: (2³)² = 2⁶ = 64. Power to a power multiplies exponents."],
    slips: { "32": "That's 2⁵. Here the exponents multiply: 3 × 2 = 6, so 2⁶ = 64." } },
  { id: "D8", strand: "D", type: "input", prompt: "Evaluate as a number:", math: "2⁴ · 2³", accept: ["128"], num: 128,
    nudge: "Same base multiplied — combine the exponents first, then compute.",
    setup: "2⁴⁺³ = 2⁷",
    steps: ["Add exponents: 2⁴ · 2³ = 2⁷.", "2⁷ = 128.", "Check: 16 × 8 = 128 ✓"],
    slips: { "4096": "That's 2¹² — exponents ADD when multiplying (4 + 3), they don't multiply." } },
  { id: "D7", strand: "D", type: "input", prompt: "Simplify (write like x^6y^3):", math: "(x²y)³", accept: ["x^6y^3", "x6y3"],
    nudge: "The outside 3 hits EVERYTHING inside the parentheses — the x² and the y.",
    setup: "(x²)³ · (y)³",
    steps: ["Distribute the power: (x²)³ and y³.", "Power to a power multiplies: (x²)³ = x⁶.", "Result: x⁶y³."],
    slips: { "x^5y^3": "Power to a power MULTIPLIES exponents: 2 × 3 = 6.", "x^2y^3": "The x² gets cubed too — nothing inside escapes the outer exponent." } },
  { id: "D3", strand: "D", type: "input", prompt: "Evaluate (fraction or decimal):", math: "3⁻²", accept: ["1/9"], num: 1 / 9,
    nudge: "A negative exponent doesn't make the answer negative. It means 'one over…'",
    setup: "3⁻² = 1 / 3²",
    steps: ["Negative exponent = reciprocal: 3⁻² = 1/3².", "3² = 9.", "So 3⁻² = 1/9 ≈ 0.111."],
    slips: { "-9": "Negative exponents never make the value negative — they flip it into a fraction: 1/3².", "-1/9": "The result stays positive: 3⁻² = 1/3² = 1/9." } },
  { id: "D11", strand: "D", type: "input", prompt: "Evaluate (fraction or decimal):", math: "4⁻¹", accept: ["1/4", "0.25", ".25"], num: 0.25,
    nudge: "The exponent −1 flips the number over.",
    setup: "4⁻¹ = 1/4",
    steps: ["Negative exponent means reciprocal.", "4⁻¹ = 1/4.", "As a decimal: 0.25."],
    slips: { "-4": "The minus lives in the exponent, not the answer: 4⁻¹ = 1/4." } },
  { id: "D4", strand: "D", type: "mc", prompt: "Write 45,000,000 in scientific notation.", math: "",
    options: ["45 × 10⁶", "4.5 × 10⁷", "4.5 × 10⁶", "0.45 × 10⁸"], correct: 1,
    nudge: "Scientific notation needs a number between 1 and 10, times a power of 10.",
    setup: "Move the decimal in 45,000,000 until one digit sits before it: 4.5",
    steps: ["The front number must be at least 1 and less than 10 → 4.5 (rules out 45 and 0.45).", "Count decimal moves from 45,000,000. to 4.5 → 7 places.", "So 45,000,000 = 4.5 × 10⁷."],
    slipsByIndex: { 0: "45 isn't allowed as the front number — it must be between 1 and 10.", 2: "Count the decimal jumps again: 4.5 × 10⁶ is only 4,500,000." } },
  { id: "D9", strand: "D", type: "mc", prompt: "Write 0.00052 in scientific notation.", math: "",
    options: ["5.2 × 10⁴", "5.2 × 10⁻⁴", "52 × 10⁻⁵", "0.52 × 10⁻³"], correct: 1,
    nudge: "Small numbers get NEGATIVE powers of 10. And the front number still must be between 1 and 10.",
    setup: "0.00052 → 5.2 needs the decimal to hop 4 places right",
    steps: ["Front number: 5.2 (rules out 52 and 0.52).", "The decimal hops 4 places to get from 0.00052 to 5.2.", "Hopping right = negative exponent: 5.2 × 10⁻⁴."],
    slipsByIndex: { 0: "A positive exponent would make it 52,000 — tiny numbers need negative powers.", 2: "52 isn't between 1 and 10 — scientific notation wants 5.2." } },
  { id: "D10", strand: "D", type: "mc", prompt: "Multiply:", math: "(3 × 10⁴) × (2 × 10³)",
    options: ["6 × 10⁷", "6 × 10¹²", "5 × 10⁷", "6 × 10⁶"], correct: 0,
    nudge: "Multiply the front numbers together, and combine the powers of 10 with the exponent rule.",
    setup: "(3 × 2) × (10⁴ × 10³)",
    steps: ["Fronts: 3 × 2 = 6.", "Powers: 10⁴ × 10³ = 10⁴⁺³ = 10⁷.", "Answer: 6 × 10⁷."],
    slipsByIndex: { 1: "Exponents ADD when the bases multiply: 4 + 3 = 7, not 4 × 3.", 2: "The front numbers multiply (3 × 2), they don't add." } },
  { id: "D12", strand: "D", type: "mc", prompt: "Without a calculator: which is larger?", math: "2¹⁰   or   10³",
    options: ["2¹⁰", "10³", "They're equal"], correct: 0,
    nudge: "You can actually compute both — 2¹⁰ builds fast from 2⁵ = 32.",
    setup: "2¹⁰ = (2⁵)² = 32²",
    steps: ["10³ = 1,000.", "2¹⁰ = (2⁵)² = 32² = 1,024.", "1,024 > 1,000 — 2¹⁰ wins by a nose. (This is why computers call 1,024 a 'kilo'.)"],
    slipsByIndex: { 1: "Close race! 2¹⁰ = 1,024 edges out 1,000." } },

  // ================= E · slope & lines =================
  { id: "E1", strand: "E", type: "input", prompt: "Find the slope of the line through (2, 3) and (6, 11).", math: "", accept: ["2"], num: 2,
    nudge: "Slope is rise over run: how much y changes divided by how much x changes.",
    setup: "slope = (11 − 3) / (6 − 2)",
    steps: ["Rise: 11 − 3 = 8.", "Run: 6 − 2 = 4.", "Slope = 8/4 = 2. For every 1 step right, the line climbs 2."],
    slips: { "0.5": "That's run over rise — flip it. The y-change goes on top.", "1/2": "That's run over rise — flip it. The y-change goes on top." } },
  { id: "E6", strand: "E", type: "input", prompt: "Find the slope of the line through (1, 5) and (3, 1).", math: "", accept: ["-2"], num: -2,
    nudge: "Same formula — but watch what happens to the rise when the line goes DOWN.",
    setup: "slope = (1 − 5) / (3 − 1)",
    steps: ["Rise: 1 − 5 = −4 (the line falls).", "Run: 3 − 1 = 2.", "Slope = −4/2 = −2. Downhill lines have negative slope."],
    slips: { "2": "Check the direction: y drops from 5 to 1, so the rise is −4 and the slope is negative." } },
  { id: "E5", strand: "E", type: "mc", prompt: "Find the slope of the line through (0, 2) and (4, 2).", math: "",
    options: ["0", "2", "4", "Undefined"], correct: 0,
    nudge: "Look at the y-values. Does this line go up, down, or neither?",
    setup: "rise = 2 − 2 = 0",
    steps: ["Rise: 2 − 2 = 0. The line never climbs.", "Run: 4 − 0 = 4.", "Slope = 0/4 = 0. Perfectly flat lines have slope zero (undefined is for vertical lines)."],
    slipsByIndex: { 3: "Undefined is the VERTICAL line's slope (zero run). A flat line's slope is just 0.", 1: "The 2 is the height of the line, not its steepness — it never climbs, so slope is 0." } },
  { id: "E2", strand: "E", type: "input", prompt: "Write the equation of the line with slope 3 and y-intercept −4 (like y=3x−4).", math: "", accept: ["y=3x-4", "3x-4", "y=-4+3x"],
    nudge: "Slope-intercept form is y = mx + b. Which given number is m and which is b?",
    setup: "m = 3 (slope), b = −4 (y-intercept)",
    steps: ["The template is y = mx + b.", "Slot in m = 3 and b = −4.", "y = 3x − 4."],
    slips: { "y=-4x+3": "Swapped: the slope multiplies x, and the intercept stands alone.", "-4x+3": "Swapped: the slope multiplies x, and the intercept stands alone." } },
  { id: "E10", strand: "E", type: "input", prompt: "Write the equation of the line with slope −1 and y-intercept 6 (like y=−x+6).", math: "", accept: ["y=-x+6", "-x+6", "y=-1x+6", "y=6-x"],
    nudge: "m = −1 and b = 6. A slope of −1 usually gets written without the 1.",
    setup: "y = (−1)x + 6",
    steps: ["Template: y = mx + b.", "m = −1, b = 6.", "y = −x + 6."],
    slips: { "y=6x-1": "Swapped — the slope (−1) rides with the x; the 6 stands alone.", "y=x+6": "The slope is NEGATIVE one: y = −x + 6." } },
  { id: "E7", strand: "E", type: "input", prompt: "What is the y-intercept of the line y = 4x − 9?", math: "y = 4x − 9", accept: ["-9", "(0,-9)"], num: -9,
    nudge: "The y-intercept is where x = 0. What's left of the equation when the x-term vanishes?",
    setup: "x = 0 → y = 4(0) − 9",
    steps: ["At the y-axis, x = 0.", "y = 4(0) − 9 = −9.", "The line crosses the y-axis at −9 — the constant term, every time."],
    slips: { "4": "4 is the slope (the steepness). The intercept is the lonely constant: −9.", "9": "Keep the sign: the equation subtracts 9, so the intercept is −9." } },
  { id: "E3", strand: "E", type: "mc", prompt: "In the equation below, what happens to y each time x increases by 1?", math: "y = −2x + 7",
    options: ["y goes up by 2", "y goes down by 2", "y goes up by 7", "y goes down by 7"], correct: 1,
    nudge: "The number attached to x is the slope. What does a negative slope do?",
    setup: "slope = −2 → for each +1 in x, y changes by −2",
    steps: ["In y = mx + b, the slope m is the change in y per 1 step in x.", "Here m = −2, which is negative.", "So each time x increases by 1, y drops by 2. The 7 only sets where the line starts."],
    slipsByIndex: { 3: "The 7 is the y-intercept — the starting height — not the rate of change." } },
  { id: "E4", strand: "E", type: "mc", prompt: "Does the point (3, 5) lie on the line below?", math: "y = 2x − 1",
    options: ["Yes", "No"], correct: 0,
    nudge: "A point is on the line if its coordinates make the equation true. Plug in x = 3.",
    setup: "Test: does 5 = 2(3) − 1 ?",
    steps: ["Substitute x = 3 into the right side: 2(3) − 1.", "2(3) − 1 = 6 − 1 = 5.", "That matches the point's y-value of 5, so yes — (3, 5) is on the line."] },
  { id: "E9", strand: "E", type: "mc", prompt: "A line passes through the origin with slope 1/2. Which point is on it?", math: "",
    options: ["(2, 4)", "(4, 2)", "(1, 3)", "(2, 3)"], correct: 1,
    nudge: "Slope 1/2 means: up 1 for every 2 right. Or test each point — through the origin, y should be half of x.",
    setup: "y = (1/2)x → which point has y equal to half its x?",
    steps: ["Through the origin with slope 1/2: y = x/2.", "Test (4, 2): is 2 half of 4? Yes.", "(2, 4) would be slope 2 — the flipped ratio."],
    slipsByIndex: { 0: "(2, 4) climbs 4 in a run of 2 — that's slope 2, the reciprocal." } },
  { id: "E8", strand: "E", type: "input", prompt: "For the line y = 2x − 8, find the value of x where the line crosses the x-axis (where y = 0).", math: "y = 2x − 8", accept: ["4", "x=4"], num: 4,
    nudge: "On the x-axis, y = 0. Set the equation equal to zero and solve.",
    setup: "0 = 2x − 8",
    steps: ["Crossing the x-axis means y = 0.", "0 = 2x − 8 → 2x = 8.", "x = 4. The line crosses at (4, 0)."],
    slips: { "-8": "−8 is where it crosses the Y-axis. For the x-axis, set y = 0 and solve.", "8": "Halfway there: 2x = 8, so x = 4." } },
  { id: "E11", strand: "E", type: "input", prompt: "A table shows a line:  x: 0, 1, 2, 3  →  y: 5, 8, 11, 14.  What is the slope?", math: "", accept: ["3"], num: 3,
    nudge: "How much does y jump each time x steps up by 1?",
    setup: "8 − 5 = ?, 11 − 8 = ?, 14 − 11 = ?",
    steps: ["y climbs 8−5 = 3, then 11−8 = 3, then 14−11 = 3.", "A steady +3 per step of x.", "Slope = 3. (The 5 at x = 0 is the y-intercept — this table IS y = 3x + 5.)"],
    slips: { "5": "5 is the starting value (the y-intercept). Slope is the per-step JUMP: +3." } },
  { id: "E12", strand: "E", type: "mc", prompt: "A 12 cm candle burns 2 cm every hour. Which equation gives its height h after t hours?", math: "",
    options: ["h = 12 + 2t", "h = 2t − 12", "h = 12 − 2t", "h = 2 − 12t"], correct: 2,
    nudge: "Two questions: where does the height START, and does it go up or down each hour?",
    setup: "start = 12, change = −2 per hour",
    steps: ["At t = 0 the candle is 12 cm → the equation needs a 12 standing alone.", "Burning REMOVES 2 cm per hour → subtract 2t.", "h = 12 − 2t. (Slope −2, intercept 12 — a real-life downhill line.)"],
    slipsByIndex: { 0: "A plus 2t would make the candle GROW — burning shrinks it.", 1: "At t = 0 that gives −12 cm — the candle starts at 12." } },

  // ================= F · functions & systems =================
  { id: "F3", strand: "F", type: "input", prompt: "If f(x) = 3x − 5, find f(4).", math: "", accept: ["7"], num: 7,
    nudge: "f(4) means: run the input 4 through the machine. Replace every x with 4.",
    setup: "f(4) = 3(4) − 5",
    steps: ["f(4) says 'evaluate the rule at x = 4.'", "3(4) = 12.", "12 − 5 = 7. So f(4) = 7."],
    slips: { "-5": "Don't multiply f by 4 — f(4) means substitute 4 in for x.", "12": "Almost — finish with the − 5." } },
  { id: "F5", strand: "F", type: "input", prompt: "If f(x) = x² + 1, find f(3).", math: "", accept: ["10"], num: 10,
    nudge: "Substitute 3 for x — and remember x² means x times itself.",
    setup: "f(3) = 3² + 1",
    steps: ["Replace x with 3: 3² + 1.", "3² = 9.", "9 + 1 = 10."],
    slips: { "7": "x² is x·x, not x·2 — so 3² = 9, not 6.", "16": "Square first, THEN add 1: it's 3² + 1, not (3 + 1)²." } },
  { id: "F8", strand: "F", type: "input", prompt: "If f(x) = 5x − 2, find the x that makes f(x) = 18.", math: "", accept: ["4", "x=4"], num: 4,
    nudge: "This runs the machine BACKWARD: the output is 18, find the input. Set 5x − 2 = 18.",
    setup: "5x − 2 = 18",
    steps: ["Set the rule equal to the output: 5x − 2 = 18.", "Add 2: 5x = 20.", "x = 4. Check: f(4) = 20 − 2 = 18 ✓"],
    slips: { "88": "18 is the OUTPUT, not the input — solve 5x − 2 = 18 instead of computing f(18)." } },
  { id: "F2", strand: "F", type: "mc", prompt: "A table pairs inputs with outputs:  x → y:  1→4,  2→5,  2→6,  3→7.  Is this a function?", math: "",
    options: ["Yes — every x has a y", "No — the input 2 has two different outputs"], correct: 1,
    nudge: "A function must give exactly ONE output for each input. Scan the x-values for a repeat.",
    setup: "Look at x = 2. What outputs does it map to?",
    steps: ["Function rule: each input gets exactly one output.", "Here the input 2 maps to both 5 and 6.", "One input, two outputs → not a function. (Repeated y-values would have been fine.)"],
    slipsByIndex: { 0: "Every x having a y isn't enough — each x must have only ONE y. Look at x = 2." } },
  { id: "F7", strand: "F", type: "mc", prompt: "Pairs:  (1, 3),  (2, 3),  (3, 3).  Is this a function?", math: "",
    options: ["Yes — each input has exactly one output", "No — the output 3 repeats"], correct: 0,
    nudge: "The rule polices INPUTS, not outputs. Are any x-values repeated?",
    setup: "Inputs: 1, 2, 3 — all different",
    steps: ["Each input (1, 2, 3) appears once, with one output each.", "Outputs are allowed to repeat — a flat function sends everything to 3.", "Yes, it's a function (in fact it's y = 3, a horizontal line)."],
    slipsByIndex: { 1: "Repeated OUTPUTS are fine — it's repeated inputs with different outputs that break a function." } },
  { id: "F11", strand: "F", type: "mc", prompt: "The vertical line test says a graph is a function if no vertical line hits it twice. Which of these FAILS the test?", math: "",
    options: ["A slanted straight line", "A U-shaped parabola", "A full circle"], correct: 2,
    nudge: "Picture sliding a vertical line across each shape. Where does it cross twice?",
    setup: "Slide a vertical line through each shape",
    steps: ["A slanted line: any vertical line hits it once. Pass.", "A U-shape: once per vertical line. Pass.", "A circle: a vertical line through the middle hits top AND bottom — two y's for one x. Fail — not a function."],
    slipsByIndex: { 1: "The U opens upward — each x has one height. It passes." } },
  { id: "F1", strand: "F", type: "input", prompt: "Solve the system. What is x?", math: "y = x + 2\nx + y = 10", accept: ["4", "x=4"], num: 4,
    nudge: "The first equation tells you exactly what y equals. Substitute that whole expression into the second equation.",
    setup: "Replace y in the second equation: x + (x + 2) = 10",
    steps: ["Substitute y = x + 2 into x + y = 10: x + (x + 2) = 10.", "Combine: 2x + 2 = 10.", "Subtract 2: 2x = 8, so x = 4.", "(Then y = 4 + 2 = 6. Check: 4 + 6 = 10 ✓)"],
    slips: { "6": "That's y. The question asks for x — the substitution gives 2x + 2 = 10." } },
  { id: "F6", strand: "F", type: "input", prompt: "Solve the system. What is x?", math: "y = 2x\nx + y = 12", accept: ["4", "x=4"], num: 4,
    nudge: "Swap the y in the second equation for what the first equation says it equals.",
    setup: "x + 2x = 12",
    steps: ["Substitute y = 2x: x + 2x = 12.", "Combine: 3x = 12.", "x = 4. (And y = 8; check 4 + 8 = 12 ✓)"],
    slips: { "8": "That's y — the question wants x, from 3x = 12.", "6": "The y counts as 2x, so the left side is 3x, not 2x." } },
  { id: "F9", strand: "F", type: "input", prompt: "Solve the system. What is x?", math: "y = x − 1\ny = 2x − 5", accept: ["4", "x=4"], num: 4,
    nudge: "Both right-hand sides equal the same y — so they equal each other. Set them equal.",
    setup: "x − 1 = 2x − 5",
    steps: ["Both expressions equal y, so: x − 1 = 2x − 5.", "Subtract x: −1 = x − 5.", "Add 5: x = 4. (Both lines pass through (4, 3).)"],
    slips: { "-4": "Watch the signs when the constants move: adding 5 to −1 gives +4.", "3": "3 is the y-value at the crossing point — the question asks for x." } },
  { id: "F4", strand: "F", type: "input", prompt: "Two phone plans: Plan A is $20 plus $5 per GB. Plan B is $10 plus $7 per GB. For how many GB do they cost the same?", math: "", accept: ["5"], num: 5,
    nudge: "Write each plan's cost as an expression using g for GB, then set them equal.",
    setup: "20 + 5g = 10 + 7g",
    steps: ["Plan A: 20 + 5g.  Plan B: 10 + 7g.  Set equal: 20 + 5g = 10 + 7g.", "Subtract 5g: 20 = 10 + 2g.", "Subtract 10: 10 = 2g, so g = 5.", "Check: A = 20 + 25 = $45, B = 10 + 35 = $45. ✓"] },
  { id: "F10", strand: "F", type: "input", prompt: "Gym A charges a flat $30 a month. Gym B charges $10 a month plus $4 per visit. After how many visits do they cost the same?", math: "", accept: ["5"], num: 5,
    nudge: "Gym A never changes. Write Gym B's cost with v visits and set the two equal.",
    setup: "30 = 10 + 4v",
    steps: ["Gym A: 30. Gym B: 10 + 4v.", "Set equal: 30 = 10 + 4v → 20 = 4v.", "v = 5 visits. Fewer than 5, B is cheaper; more than 5, A wins."],
    slips: { "7.5": "Subtract the $10 base fee before dividing: 4v = 30 − 10 = 20." } },
  { id: "F12", strand: "F", type: "input", prompt: "A table shows  x: 1, 2, 3  →  y: 10, 7, 4.  What is the rate of change (slope)?", math: "", accept: ["-3"], num: -3,
    nudge: "y is FALLING as x grows. What signed number is added each step?",
    setup: "7 − 10 = ?, 4 − 7 = ?",
    steps: ["Each step: 7 − 10 = −3, then 4 − 7 = −3.", "y drops 3 for every +1 in x.", "Rate of change = −3."],
    slips: { "3": "The values shrink, so the rate carries a minus sign: −3." } },

  // ================= G · roots & right triangles =================
  { id: "G5", strand: "G", type: "input", prompt: "Evaluate:", math: "√81", accept: ["9"], num: 9,
    nudge: "What number times itself makes 81?",
    setup: "Test: 9 × 9 = ?",
    steps: ["√81 asks for the number whose square is 81.", "9 × 9 = 81.", "√81 = 9."],
    slips: { "40.5": "Square root isn't half — it asks what number multiplied by ITSELF gives 81." } },
  { id: "G1", strand: "G", type: "input", prompt: "Evaluate:", math: "√144", accept: ["12"], num: 12,
    nudge: "What number times itself gives 144? Try numbers near 10.",
    setup: "Test: 12 × 12 = ?",
    steps: ["√144 asks: what positive number squared is 144?", "12 × 12 = 144.", "√144 = 12."],
    slips: { "72": "Square root isn't half — it asks what number multiplied by itself gives 144." } },
  { id: "G6", strand: "G", type: "input", prompt: "Evaluate:", math: "√49 + √9", accept: ["10"], num: 10,
    nudge: "Take each root separately FIRST, then add.",
    setup: "√49 = 7 and √9 = 3",
    steps: ["√49 = 7.", "√9 = 3.", "7 + 3 = 10. (Warning: this is NOT √58 — roots don't combine across a plus sign.)"],
    slips: { "58": "The roots come first: √49 = 7 and √9 = 3, THEN add. You can't add under the roots." } },
  { id: "G2", strand: "G", type: "mc", prompt: "Between which two consecutive whole numbers is √40?", math: "",
    options: ["4 and 5", "5 and 6", "6 and 7", "19 and 21"], correct: 2,
    nudge: "Find the two perfect squares that 40 sits between.",
    setup: "6² = 36 and 7² = 49, and 36 < 40 < 49",
    steps: ["List perfect squares: 25, 36, 49…", "40 sits between 36 and 49.", "So √40 is between √36 = 6 and √49 = 7 (about 6.3)."] },
  { id: "G7", strand: "G", type: "mc", prompt: "Between which two consecutive whole numbers is √70?", math: "",
    options: ["7 and 8", "8 and 9", "9 and 10", "34 and 36"], correct: 1,
    nudge: "Which perfect squares surround 70?",
    setup: "8² = 64 and 9² = 81",
    steps: ["Perfect squares near 70: 64 and 81.", "64 < 70 < 81.", "So √70 sits between 8 and 9 (about 8.4)."],
    slipsByIndex: { 0: "7² = 49 and 8² = 64 — both below 70. One notch higher.", 3: "Halving 70 isn't rooting it — hunt for the surrounding perfect squares." } },
  { id: "G3", strand: "G", type: "input", prompt: "A right triangle has legs 6 and 8. How long is the hypotenuse?", math: "", accept: ["10"], num: 10,
    nudge: "Pythagorean theorem: leg² + leg² = hypotenuse².",
    setup: "6² + 8² = c²",
    steps: ["a² + b² = c² with a = 6, b = 8.", "36 + 64 = 100.", "c = √100 = 10."],
    slips: { "14": "Don't add the sides directly — square them first: 36 + 64 = 100, then take the square root." } },
  { id: "G8", strand: "G", type: "input", prompt: "A right triangle has legs 9 and 12. How long is the hypotenuse?", math: "", accept: ["15"], num: 15,
    nudge: "Square both legs, add, then root.",
    setup: "9² + 12² = c²",
    steps: ["9² = 81 and 12² = 144.", "81 + 144 = 225.", "c = √225 = 15. (A scaled-up 3-4-5 triangle!)"],
    slips: { "21": "Square first, then add: 81 + 144 = 225, then √225." } },
  { id: "G4", strand: "G", type: "input", prompt: "A right triangle has hypotenuse 13 and one leg 5. Find the other leg.", math: "", accept: ["12"], num: 12,
    nudge: "The hypotenuse is the biggest side and sits alone in a² + b² = c². This time you know c.",
    setup: "5² + b² = 13²  →  b² = 169 − 25",
    steps: ["Set up: 5² + b² = 13².", "25 + b² = 169.", "Subtract: b² = 144.", "b = √144 = 12."],
    slips: { "13.9": "13 is the hypotenuse, so it goes alone on its side: b² = 13² − 5², a subtraction.", "14": "13 is the hypotenuse, so subtract: b² = 169 − 25 = 144." } },
  { id: "G9", strand: "G", type: "input", prompt: "A right triangle has hypotenuse 10 and one leg 6. Find the other leg.", math: "", accept: ["8"], num: 8,
    nudge: "Knowing the hypotenuse means subtracting: leg² = hyp² − leg².",
    setup: "b² = 10² − 6²",
    steps: ["b² = 100 − 36.", "b² = 64.", "b = 8. (The classic 6-8-10.)"],
    slips: { "11.66": "10 is the hypotenuse — it goes alone: b² = 100 − 36, not 100 + 36.", "11.7": "10 is the hypotenuse — it goes alone: b² = 100 − 36, not 100 + 36." } },
  { id: "G10", strand: "G", type: "mc", prompt: "A triangle has sides 5, 12, and 13. Is it a right triangle?", math: "",
    options: ["Yes", "No"], correct: 0,
    nudge: "Test the Pythagorean relationship: do the two smaller sides, squared and added, equal the biggest side squared?",
    setup: "Does 5² + 12² = 13² ?",
    steps: ["Square the two shorter sides: 25 + 144 = 169.", "Square the longest: 13² = 169.", "They match — the converse of the Pythagorean theorem says it IS a right triangle."] },
  { id: "G11", strand: "G", type: "input", prompt: "A phone screen is 3 inches wide and 4 inches tall. How long is its diagonal, in inches?", math: "", accept: ["5"], num: 5,
    nudge: "The diagonal splits the rectangle into two right triangles — it's the hypotenuse.",
    setup: "3² + 4² = d²",
    steps: ["The width and height are the legs: 3² + 4² = 9 + 16 = 25.", "d = √25.", "The diagonal is 5 inches — the original 3-4-5."],
    slips: { "7": "The diagonal cuts the corner — shorter than walking the two sides. Use 3² + 4² = d²." } },
  { id: "G12", strand: "G", type: "input", prompt: "A 25 ft ladder leans against a wall with its base 7 ft from the wall. How high up the wall does it reach, in feet?", math: "", accept: ["24"], num: 24,
    nudge: "Draw it: the ladder is the hypotenuse, the ground distance is one leg, the wall height is the other.",
    setup: "7² + h² = 25²",
    steps: ["Ladder = hypotenuse = 25. Ground = leg = 7.", "h² = 625 − 49 = 576.", "h = √576 = 24 ft. (A 7-24-25 triple.)"],
    slips: { "26": "The ladder is the hypotenuse, so its square goes alone: h² = 25² − 7², a subtraction.", "18": "Subtract the SQUARES (625 − 49), not the side lengths." } },
];

/* ---------------- answer checking ---------------- */
function normalize(s) {
  return String(s).toLowerCase().replace(/\s+/g, "").replace(/^\$/, "").replace(/^[a-z]=/,(m)=>m).replace(/−/g, "-").replace(/×/g, "*");
}
function stripVar(s) { return s.replace(/^[a-z]=/, ""); }
function parseNum(s) {
  const t = stripVar(s);
  if (/^-?\d+\/\d+$/.test(t)) { const [a, b] = t.split("/").map(Number); return b === 0 ? NaN : a / b; }
  const v = parseFloat(t); return isNaN(v) ? NaN : v;
}
function checkAnswer(p, raw) {
  const norm = normalize(raw);
  if (!norm) return { status: "empty" };
  if (p.accept && p.accept.map(normalize).includes(norm)) return { status: "correct" };
  if (p.num !== undefined) {
    const v = parseNum(norm);
    if (!isNaN(v) && Math.abs(v - p.num) < 0.011) return { status: "correct" };
  }
  if (p.slips) {
    for (const k of Object.keys(p.slips)) {
      const nk = normalize(k);
      if (norm === nk || stripVar(norm) === nk) return { status: "slip", msg: p.slips[k] };
      if (p.num !== undefined) { const kv = parseNum(nk), uv = parseNum(norm); if (!isNaN(kv) && !isNaN(uv) && Math.abs(kv - uv) < 0.011) return { status: "slip", msg: p.slips[k] }; }
    }
  }
  return { status: "wrong" };
}

/* ---------------- persistence (window.storage) ---------------- */
const STORE_KEY = "layla-bridge81-v1";
async function loadProgress() {
  try { if (typeof window !== "undefined" && window.storage) { const r = await window.storage.get(STORE_KEY); if (r && r.value) return JSON.parse(r.value); } } catch (e) { /* first run */ }
  return {};
}
async function saveProgress(map) {
  try { if (typeof window !== "undefined" && window.storage) await window.storage.set(STORE_KEY, JSON.stringify(map)); } catch (e) { /* offline ok */ }
}

/* ---------------- slope-of-progress plot ---------------- */
function SlopePlot({ solved, total }) {
  const f = total ? solved / total : 0;
  const x0 = 8, y0 = 64, x1 = 8 + 104 * (solved ? 1 : 0.001), y1 = 64 - 56 * f;
  return (
    <svg viewBox="0 0 120 72" className="slopeplot" aria-label={`Progress: ${solved} of ${total} solved`}>
      {[...Array(11)].map((_, i) => <line key={"v" + i} x1={8 + i * 10.4} y1="4" x2={8 + i * 10.4} y2="64" className="gridln" />)}
      {[...Array(7)].map((_, i) => <line key={"h" + i} x1="8" y1={4 + i * 10} x2="112" y2={4 + i * 10} className="gridln" />)}
      <line x1="8" y1="64" x2="112" y2="64" className="axis" />
      <line x1="8" y1="64" x2="8" y2="4" className="axis" />
      {solved > 0 && <line x1={x0} y1={y0} x2={x1} y2={y1} className="progressline" />}
      <circle cx={x1} cy={solved > 0 ? y1 : y0} r="3.2" className="progressdot" />
    </svg>
  );
}

/* ---------------- main component ---------------- */
export default function BridgeTo81() {
  const [view, setView] = useState({ screen: "home" }); // {screen:'home'} | {screen:'strand', strandId, idx, mix?}
  const [status, setStatus] = useState({}); // id -> 'solid' | 'helped'
  const [loaded, setLoaded] = useState(false);
  const [input, setInput] = useState("");
  const [picked, setPicked] = useState(null);
  const [feedback, setFeedback] = useState(null); // {kind:'correct'|'slip'|'wrong'|'empty', msg}
  const [hintLevel, setHintLevel] = useState(0);  // 0 none, 1 nudge, 2 setup, 3 walkthrough
  const [stepsShown, setStepsShown] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [mixList, setMixList] = useState([]);
  const inputRef = useRef(null);
  const lastMixIds = useRef([]); // ids shown in the previous Mix set, to avoid immediate repeats

  useEffect(() => { loadProgress().then(m => { setStatus(m); setLoaded(true); }); }, []);
  useEffect(() => { if (loaded) saveProgress(status); }, [status, loaded]);

  const solvedCount = Object.keys(status).length;
  const solidCount = Object.values(status).filter(s => s === "solid").length;

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

  function submit() {
    if (!problem || feedback?.kind === "correct") return;
    if (problem.type === "mc") {
      if (picked === null) { setFeedback({ kind: "empty", msg: "Pick an answer first." }); return; }
      setAttempts(a => a + 1);
      if (picked === problem.correct) {
        markSolved(hintLevel === 0 && attempts === 0);
        setFeedback({ kind: "correct", msg: praise() });
      } else {
        const slip = problem.slipsByIndex && problem.slipsByIndex[picked];
        setFeedback(slip ? { kind: "slip", msg: slip } : { kind: "wrong", msg: "Not that one — want a hint? It won't cost you anything but pride points." });
      }
      return;
    }
    const res = checkAnswer(problem, input);
    if (res.status === "empty") { setFeedback({ kind: "empty", msg: "Type an answer first." }); return; }
    setAttempts(a => a + 1);
    if (res.status === "correct") { markSolved(hintLevel === 0 && attempts === 0); setFeedback({ kind: "correct", msg: praise() }); }
    else if (res.status === "slip") setFeedback({ kind: "slip", msg: res.msg });
    else setFeedback({ kind: "wrong", msg: "Not yet. Re-read the problem, or open a hint below — hints are how mathematicians actually work." });
  }

  function praise() {
    const clean = hintLevel === 0 && attempts === 0;
    return clean ? "Nailed it on the first try — that one's solid." : "Got it. You worked through it — do a fresh one like this later to make it stick.";
  }

  function nextHint() {
    if (hintLevel < 3) { setHintLevel(hintLevel + 1); if (hintLevel + 1 === 3) setStepsShown(1); }
    else if (stepsShown < problem.steps.length) setStepsShown(stepsShown + 1);
  }
  const hintBtnLabel = !problem ? "" :
    hintLevel === 0 ? "Stuck? Get a nudge" :
    hintLevel === 1 ? "Show me the setup" :
    hintLevel === 2 ? "Walk me through it" :
    stepsShown < problem.steps.length ? `Next step (${stepsShown}/${problem.steps.length})` : null;

  async function resetAll() {
    if (!confirm("Erase all progress and start fresh?")) return;
    setStatus({});
    try { if (window.storage) await window.storage.delete(STORE_KEY); } catch (e) {}
  }

  /* ---------------- render ---------------- */
  return (
    <div className="wrap">
      <style>{css}</style>

      {view.screen === "home" && (
        <div className="page">
          <header className="hero">
            <div className="eyebrow">Summer bridge · MVWSD</div>
            <h1>Layla’s climb<br />to <span className="hl">Math 8.1</span></h1>
            <p className="lede">Math 8.1 = Algebra 1 in 8th grade. Coming from Math 7, the gap is mostly Math 8 territory — slope, exponents, functions, right triangles — plus airtight equation-solving. That’s exactly what’s below.</p>
            <div className="plotcard">
              <SlopePlot solved={solvedCount} total={PROBLEMS.length} />
              <div className="plotstats">
                <div className="riseRun"><span className="frac"><span>{solvedCount}</span><span className="bar"></span><span>{PROBLEMS.length}</span></span></div>
                <div className="plotlabel">your slope so far<br /><span className="sub">{solidCount} solid · {solvedCount - solidCount} with help</span></div>
              </div>
            </div>
            <div className="targetnote">Target for the August diagnostic: i-Ready <b>518+</b> and CAASPP Level 3+. Steady beats cramming — a few problems a day.</div>
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
            <span className="mixsub">10 shuffled problems from every strand — the real test never sorts by topic</span>
          </button>

          <button className="resetlink" onClick={resetAll}>Reset progress</button>
        </div>
      )}

      {view.screen === "strand" && problem && (
        <div className="page">
          <div className="topbar">
            <button className="back" onClick={() => setView({ screen: "home" })}>← All topics</button>
            <div className="counter">{view.idx + 1} / {list.length}</div>
          </div>

          <div className="probcard" style={{ "--sc": (strandMeta || {}).color || "#5B7DB1" }}>
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
                {feedback.kind === "correct" ? "✓ " : feedback.kind === "slip" ? "Almost — " : ""}{feedback.msg}
              </div>
            )}

            <div className="helpzone">
              {hintLevel >= 1 && <div className="hint lvl1"><span className="hlabel">Nudge</span>{problem.nudge}</div>}
              {hintLevel >= 2 && <div className="hint lvl2"><span className="hlabel">Setup</span><span className="mono">{problem.setup}</span></div>}
              {hintLevel >= 3 && (
                <div className="hint lvl3">
                  <span className="hlabel">Walkthrough</span>
                  <ol>{problem.steps.slice(0, stepsShown).map((st, i) => <li key={i}>{st}</li>)}</ol>
                  {stepsShown >= problem.steps.length && (
                    <div className="selfexplain">Before moving on: cover this up and say the solution out loud in your own words. If you can teach it, you own it.</div>
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
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=IBM+Plex+Mono:wght@400;500&display=swap');

.wrap {
  min-height: 100vh;
  background:
    linear-gradient(rgba(210,220,228,.55) 1px, transparent 1px),
    linear-gradient(90deg, rgba(210,220,228,.55) 1px, transparent 1px),
    #F6F7F3;
  background-size: 24px 24px, 24px 24px, auto;
  color: #17263B;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  display: flex; justify-content: center;
  padding: 0 0 48px;
}
.page { width: 100%; max-width: 430px; padding: 20px 16px 0; }

/* hero */
.eyebrow { font-size: 11px; letter-spacing: .14em; text-transform: uppercase; color: #5A6B82; font-weight: 500; }
h1 { font-size: 34px; line-height: 1.05; margin: 8px 0 10px; font-weight: 700; letter-spacing: -0.02em; }
.hl { background: linear-gradient(transparent 55%, #FFE55C 55%); padding: 0 2px; }
.lede { font-size: 14.5px; line-height: 1.5; color: #3D4E66; margin: 0 0 16px; }

.plotcard { display: flex; gap: 14px; align-items: center; background: #fff; border: 1.5px solid #17263B; border-radius: 12px; padding: 12px 14px; box-shadow: 3px 3px 0 rgba(23,38,59,.14); }
.slopeplot { width: 130px; flex-shrink: 0; }
.gridln { stroke: #E3E9ED; stroke-width: 1; }
.axis { stroke: #17263B; stroke-width: 1.5; }
.progressline { stroke: #D9536F; stroke-width: 2.5; stroke-linecap: round; }
.progressdot { fill: #D9536F; }
.plotstats { display: flex; align-items: center; gap: 12px; }
.frac { display: inline-flex; flex-direction: column; align-items: center; font-family: 'IBM Plex Mono', monospace; font-size: 20px; font-weight: 500; line-height: 1.1; }
.frac .bar { width: 34px; height: 2px; background: #17263B; margin: 2px 0; }
.plotlabel { font-size: 12.5px; line-height: 1.35; color: #3D4E66; }
.plotlabel .sub { color: #7B8AA0; font-size: 11.5px; }

.targetnote { margin: 14px 0 20px; font-size: 12.5px; line-height: 1.5; color: #5A6B82; border-left: 3px solid #FFE55C; padding-left: 10px; }

/* strand cards */
.strandlist { display: flex; flex-direction: column; gap: 10px; }
.strandcard { display: flex; justify-content: space-between; align-items: center; gap: 10px; width: 100%; text-align: left; background: #fff; border: 1.5px solid #17263B; border-radius: 12px; padding: 14px; cursor: pointer; font-family: inherit; color: inherit; box-shadow: 3px 3px 0 rgba(23,38,59,.14); transition: transform .08s ease; }
.strandcard:active { transform: translate(2px,2px); box-shadow: 1px 1px 0 rgba(23,38,59,.14); }
.strandname { font-size: 16px; font-weight: 700; }
.strandsub { font-size: 12px; color: #7B8AA0; margin-top: 2px; }
.cells { display: grid; grid-template-columns: repeat(4, 11px); grid-gap: 4px; flex-shrink: 0; }
.cell { width: 11px; height: 11px; border: 1.5px solid var(--sc); border-radius: 3px; background: transparent; }
.cell.solid { background: var(--sc); }
.cell.helped { background: linear-gradient(135deg, var(--sc) 50%, transparent 50%); }

.mixbtn { margin-top: 16px; width: 100%; background: #17263B; color: #F6F7F3; border: none; border-radius: 12px; padding: 16px; font-family: inherit; cursor: pointer; text-align: left; display: flex; flex-direction: column; gap: 4px; }
.mixbtn span:first-child { font-size: 16px; font-weight: 700; }
.mixsub { font-size: 12px; color: #AEBBCC; font-weight: 400; line-height: 1.4; }
.resetlink { margin: 22px auto 0; display: block; background: none; border: none; color: #9AA7B8; font-size: 12px; font-family: inherit; cursor: pointer; text-decoration: underline; }

/* problem view */
.topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.back { background: none; border: none; font-family: inherit; font-size: 14px; font-weight: 500; color: #17263B; cursor: pointer; padding: 8px 8px 8px 0; }
.counter { font-family: 'IBM Plex Mono', monospace; font-size: 13px; color: #7B8AA0; }

.probcard { background: #fff; border: 1.5px solid #17263B; border-radius: 14px; padding: 18px 16px; box-shadow: 4px 4px 0 rgba(23,38,59,.14); }
.chip { display: inline-block; font-size: 11px; font-weight: 500; letter-spacing: .06em; text-transform: uppercase; color: #fff; background: var(--sc); padding: 4px 9px; border-radius: 99px; margin-bottom: 12px; }
.prompt { font-size: 16px; line-height: 1.45; margin: 0 0 10px; }
.mathblock { font-family: 'IBM Plex Mono', monospace; font-size: 20px; background: #F2F5F1; border-left: 3px solid var(--sc); padding: 12px 14px; border-radius: 6px; margin-bottom: 16px; line-height: 1.5; overflow-x: auto; }

.answerrow { display: flex; gap: 8px; }
.ansinput { flex: 1; min-width: 0; font-family: 'IBM Plex Mono', monospace; font-size: 17px; padding: 12px; border: 1.5px solid #17263B; border-radius: 10px; background: #FDFDFB; }
.ansinput:focus { outline: 3px solid #FFE55C; outline-offset: 1px; }
.checkbtn { background: #17263B; color: #fff; border: none; border-radius: 10px; font-family: inherit; font-weight: 700; font-size: 15px; padding: 12px 18px; cursor: pointer; min-height: 48px; }
.checkbtn:disabled { opacity: .4; cursor: default; }
.checkbtn.wide { width: 100%; margin-top: 4px; }

.choices { display: flex; flex-direction: column; gap: 8px; }
.choice { text-align: left; font-family: 'IBM Plex Mono', monospace; font-size: 15px; padding: 13px 14px; border: 1.5px solid #C6D0DA; border-radius: 10px; background: #FDFDFB; cursor: pointer; color: #17263B; min-height: 48px; }
.choice.picked { border-color: #17263B; background: #FFF6C9; }
.choice.right { border-color: #2F9E6B; background: #E7F5EE; }

.feedback { margin-top: 14px; font-size: 14px; line-height: 1.5; padding: 11px 13px; border-radius: 10px; }
.feedback.correct { background: #E7F5EE; color: #1E6B47; border: 1px solid #9FD4BB; }
.feedback.slip { background: #FDF0E4; color: #8A4B14; border: 1px solid #EBC79E; }
.feedback.wrong { background: #FBEBEE; color: #96324A; border: 1px solid #EDB6C2; }
.feedback.empty { background: #F1F3F6; color: #5A6B82; border: 1px solid #D7DEE6; }

/* progressive help */
.helpzone { margin-top: 16px; display: flex; flex-direction: column; gap: 8px; }
.hint { font-size: 14px; line-height: 1.55; padding: 11px 13px 11px 13px; border-radius: 10px; border: 1.5px dashed #B9C4D0; background: #FAFBF8; }
.hint .hlabel { display: block; font-size: 10.5px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #7B8AA0; margin-bottom: 4px; }
.hint .mono { font-family: 'IBM Plex Mono', monospace; font-size: 14.5px; }
.hint ol { margin: 4px 0 0; padding-left: 20px; display: flex; flex-direction: column; gap: 7px; }
.hint.lvl3 { border-style: solid; border-color: #17263B; }
.selfexplain { margin-top: 10px; font-size: 12.5px; color: #5A6B82; border-left: 3px solid #FFE55C; padding-left: 9px; line-height: 1.5; }
.hintbtn { align-self: flex-start; background: #FFE55C; border: 1.5px solid #17263B; color: #17263B; border-radius: 99px; font-family: inherit; font-weight: 700; font-size: 13.5px; padding: 10px 16px; cursor: pointer; min-height: 42px; box-shadow: 2px 2px 0 rgba(23,38,59,.2); }
.hintbtn:active { transform: translate(1px,1px); box-shadow: 1px 1px 0 rgba(23,38,59,.2); }

.navrow { display: flex; gap: 10px; margin-top: 16px; }
.navbtn { flex: 1; font-family: inherit; font-size: 15px; font-weight: 700; padding: 14px; border-radius: 10px; cursor: pointer; min-height: 50px; }
.navbtn.ghost { background: transparent; border: 1.5px solid #17263B; color: #17263B; }
.navbtn.primary { background: #2F9E6B; border: 1.5px solid #2F9E6B; color: #fff; }
.navbtn:disabled { opacity: .3; cursor: default; }

@media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
`;
