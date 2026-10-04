export type LevelId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type LevelDifficulty = "EASY" | "MEDIUM" | "HARD";

export interface LevelDefinition {
  id: LevelId;
  difficulty?: LevelDifficulty;
  title: string;
  prompt: string;
  hint: string;
  cards: string[];
  acceptedOutput: RegExp;
}

const card = (statement: string) => `      ${statement}`;
const labeledCard = (label: number, statement: string) =>
  `${String(label).padEnd(6, " ")}${statement}`;

export const LEVELS: LevelDefinition[] = [
  {
    id: 1,
    difficulty: "EASY",
    title: "Square of an Integer",
    prompt: "Set N to 4, calculate its square, and print the result.",
    hint: "Use one integer variable for 4, another for its product, and an integer FORMAT statement for the printed result.",
    cards: [
      card("N = 4"),
      card("ISQ = N * N"),
      card("WRITE(6, 20) ISQ"),
      labeledCard(20, "FORMAT(I3)"),
      card("STOP"),
      card("END"),
    ],
    acceptedOutput: /^\s*16\s*$/m,
  },
  {
    id: 2,
    difficulty: "EASY",
    title: "Simple Sum",
    prompt: "Set A to 5 and B to 3, add them together, and print the result.",
    hint: "Store 5 and 3 in separate variables, add them into a third variable, then print that value.",
    cards: [
      card("IA = 5"),
      card("IB = 3"),
      card("IC = IA + IB"),
      card("WRITE(6, 20) IC"),
      labeledCard(20, "FORMAT(I3)"),
      card("STOP"),
      card("END"),
    ],
    acceptedOutput: /^\s*8\s*$/m,
  },
  {
    id: 3,
    difficulty: "EASY",
    title: "Counting to Five",
    prompt: "Print the numbers 1 through 5 using a DO loop.",
    hint: "Use a DO loop variable that starts at 1 and ends at 5, with a WRITE statement inside the loop.",
    cards: [
      card("DO 10 I = 1, 5"),
      card("WRITE(6, 20) I"),
      labeledCard(20, "FORMAT(I2)"),
      labeledCard(10, "CONTINUE"),
      card("STOP"),
      card("END"),
    ],
    acceptedOutput: /^\s*1\s*\r?\n\s*2\s*\r?\n\s*3\s*\r?\n\s*4\s*\r?\n\s*5\s*$/m,
  },
  {
    id: 4,
    difficulty: "EASY",
    title: "Multiplication Table",
    prompt: "Print the first five multiples of 5 using a DO loop.",
    hint: "Loop from 1 through 5, multiply the loop variable by 5, and print the product each iteration.",
    cards: [
      card("DO 10 I = 1, 5"),
      card("M = I * 5"),
      card("WRITE(6, 20) M"),
      labeledCard(20, "FORMAT(I3)"),
      labeledCard(10, "CONTINUE"),
      card("STOP"),
      card("END"),
    ],
    acceptedOutput: /^\s*5\s*\r?\n\s*10\s*\r?\n\s*15\s*\r?\n\s*20\s*\r?\n\s*25\s*$/m,
  },
  {
    id: 5,
    difficulty: "EASY",
    title: "Countdown",
    prompt: "Print a countdown from 3 to 1 using a loop and a conditional branch.",
    hint: "Start at 3, print the current value, subtract 1, and branch back while the value remains positive.",
    cards: [
      card("N = 3"),
      labeledCard(10, "WRITE(6, 20) N"),
      labeledCard(20, "FORMAT(I2)"),
      card("N = N - 1"),
      card("IF (N .GT. 0) GO TO 10"),
      card("STOP"),
      card("END"),
    ],
    acceptedOutput: /^\s*3\s*\r?\n\s*2\s*\r?\n\s*1\s*$/m,
  },
  {
    id: 6,
    difficulty: "MEDIUM",
    title: "Arithmetic Branching",
    prompt: "Use an arithmetic IF to print EQUAL when N is 4.",
    hint: "Set N to 4 and branch based on N minus 4; the equal branch should print EQUAL.",
    cards: [
      card("N = 4"),
      card("IF (N - 4) 30, 20, 30"),
      labeledCard(20, "WRITE(6, 10)"),
      labeledCard(10, "FORMAT(5HEQUAL)"),
      card("STOP"),
      labeledCard(30, "WRITE(6, 40)"),
      labeledCard(40, "FORMAT(7HUNEQUAL)"),
      card("STOP"),
      card("END"),
    ],
    acceptedOutput: /^\s*EQUAL\s*$/m,
  },
  {
    id: 7,
    difficulty: "MEDIUM",
    title: "Powers of Two",
    prompt: "Print the first four powers of two using a DO loop.",
    hint: "Loop I from 1 through 4, calculate 2 to the power of I, and print each result.",
    cards: [
      card("DO 10 I = 1, 4"),
      card("K = 2 ** I"),
      card("WRITE(6, 20) K"),
      labeledCard(20, "FORMAT(I3)"),
      labeledCard(10, "CONTINUE"),
      card("STOP"),
      card("END"),
    ],
    acceptedOutput: /^\s*2\s*\r?\n\s*4\s*\r?\n\s*8\s*\r?\n\s*16\s*$/m,
  },
  {
    id: 8,
    difficulty: "MEDIUM",
    title: "Array Accumulator",
    prompt: "Store three numbers in an array, add them, and print the total.",
    hint: "Declare an array with three elements, assign the values, add all three into a total, and print it.",
    cards: [
      card("DIMENSION NUMS(3)"),
      card("NUMS(1) = 10"),
      card("NUMS(2) = 25"),
      card("NUMS(3) = 15"),
      card("TOTAL = NUMS(1) + NUMS(2) + NUMS(3)"),
      card("WRITE(6, 50) TOTAL"),
      labeledCard(50, "FORMAT(F6.1)"),
      card("STOP"),
      card("END"),
    ],
    acceptedOutput: /^\s*50(?:\.0+)?\s*$/m,
  },
  {
    id: 9,
    difficulty: "HARD",
    title: "Fibonacci Sequence",
    prompt: "Print the first six numbers in the Fibonacci sequence.",
    hint: "Begin with two 1 values, print them, then repeatedly add the previous two values and shift forward.",
    cards: [
      card("IA = 1"),
      card("IB = 1"),
      card("WRITE(6, 20) IA"),
      card("WRITE(6, 20) IB"),
      card("DO 10 I = 1, 4"),
      card("IC = IA + IB"),
      card("WRITE(6, 20) IC"),
      card("IA = IB"),
      card("IB = IC"),
      labeledCard(10, "CONTINUE"),
      labeledCard(20, "FORMAT(I4)"),
      card("STOP"),
      card("END"),
    ],
    acceptedOutput: /^\s*1\s*\r?\n\s*1\s*\r?\n\s*2\s*\r?\n\s*3\s*\r?\n\s*5\s*\r?\n\s*8\s*$/m,
  },
  {
    id: 10,
    difficulty: "HARD",
    title: "Factorial Calculator",
    prompt: "Calculate and print the factorial of 5.",
    hint: "Initialize a product at 1, loop from 1 through 5 multiplying into it, then print the product.",
    cards: [
      card("N = 5"),
      card("IFACT = 1"),
      card("DO 10 I = 1, N"),
      card("IFACT = IFACT * I"),
      labeledCard(10, "CONTINUE"),
      card("WRITE(6, 20) IFACT"),
      labeledCard(20, "FORMAT(I5)"),
      card("STOP"),
      card("END"),
    ],
    acceptedOutput: /^\s*120\s*$/m,
  },
];

export function getLevel(id: LevelId): LevelDefinition {
  const level = LEVELS.find((candidate) => candidate.id === id);
  if (!level) throw new Error(`Unknown level: ${id}`);
  return level;
}
