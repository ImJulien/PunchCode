export interface LevelDefinition {
  id: 1 | 2 | 3;
  title: string;
  prompt: string;
  cards: string[];
  acceptedOutput: RegExp;
}

export const LEVELS: LevelDefinition[] = [
  {
    id: 1,
    title: "Count to 10",
    prompt: "Write a program that counts from 1 to 10 and prints the final value.",
    cards: [
      "      DO 10 I = 1, 10",
      "      WRITE(6, 20) I",
      "20    FORMAT(I3)",
      "10    CONTINUE",
      "      STOP",
      "      END",
    ],
    acceptedOutput: /^\s*10\s*$/m,
  },
  {
    id: 2,
    title: "Add A and B",
    prompt: "Set A to 5 and B to 3, add them together, and print the result.",
    cards: [
      "      A = 5",
      "      B = 3",
      "      C = A + B",
      "      WRITE(6, 20) C",
      "20    FORMAT(I3)",
      "      STOP",
      "      END",
    ],
    acceptedOutput: /^\s*8\s*$/m,
  },
  {
    id: 3,
    title: "Sum an array",
    prompt: "Create an array containing 10, 25, and 15, then print its sum.",
    cards: [
      "      DIMENSION NUMS(3)",
      "      NUMS(1) = 10",
      "      NUMS(2) = 25",
      "      NUMS(3) = 15",
      "      TOTAL = NUMS(1) + NUMS(2) + NUMS(3)",
      "      WRITE(6, 50) TOTAL",
      "50    FORMAT(F6.1)",
      "      STOP",
      "      END",
    ],
    acceptedOutput: /^\s*50(?:\.0+)?\s*$/m,
  },
];
