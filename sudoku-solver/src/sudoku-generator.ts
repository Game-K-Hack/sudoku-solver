import type { SquareModel } from './types'
import { SquareState } from './types'
import { Sudoku } from './Sudoku'

class CoorWithPossibleSolutions {
    constructor(
        public coor: [number, number],
        public possiblesSolutions: number[]
    ) {}
}

function cloneSudoku(sudoku: Sudoku): Sudoku {
    return new Sudoku(sudoku.matrix.map(row => [...row]));
}

export function solve(sudoku: Sudoku): boolean | Sudoku | null {
    const possibilities: CoorWithPossibleSolutions[] = [];

    for (let y = 0; y < 9; y++) {
        for (let x = 0; x < 9; x++) {
            if (sudoku.matrix[y]![x]!.value === null) {
                possibilities.push(
                    new CoorWithPossibleSolutions([x, y], sudoku.getPossibleSolutions(x, y))
                );
            }
        }
    }

    if (possibilities.length === 0) return null;

    const possibility = possibilities.reduce((min, curr) =>
        curr.possiblesSolutions.length < min.possiblesSolutions.length ? curr : min
    );

    for (const p of possibility.possiblesSolutions) {
        sudoku.setNumber(possibility.coor[0], possibility.coor[1], p);
        if (sudoku.isCompleted()) {
            return sudoku;
        } else {
            if (!solve(sudoku)) {
                sudoku.setNumber(possibility.coor[0], possibility.coor[1], null);
                continue;
            }
            return true;
        }
    }

    return false;
}

// Version optimisée d'isUnique avec limite de profondeur pour éviter les calculs trop longs
function isUnique(sudoku: Sudoku, maxDepth: number = 50): boolean {
    /**
     * -1 : Deux solutions trouvées
     *  0 : Aucune solution trouvée
     *  1 : Une solution trouvée
     */
    function process(sudoku: Sudoku, depth: number = 0): number {
        // Limite de profondeur pour éviter les calculs trop longs
        if (depth > maxDepth) return 1;

        let solution = 0;
        const possibilities: CoorWithPossibleSolutions[] = [];

        for (let y = 0; y < 9; y++) {
            for (let x = 0; x < 9; x++) {
                if (sudoku.matrix[y]![x]!.value === null) {
                    possibilities.push(
                        new CoorWithPossibleSolutions([x, y], sudoku.getPossibleSolutions(x, y))
                    );
                }
            }
        }

        if (possibilities.length === 0) return 0;

        const possibility = possibilities.reduce((min, curr) =>
            curr.possiblesSolutions.length < min.possiblesSolutions.length ? curr : min
        );

        // Optimisation : ne tester que les 2 premières possibilités si > 2
        const possibilitiesToTest = possibility.possiblesSolutions.length > 2 
            ? possibility.possiblesSolutions.slice(0, 2)
            : possibility.possiblesSolutions;

        for (const p of possibilitiesToTest) {
            sudoku.setNumber(possibility.coor[0], possibility.coor[1], p);

            if (sudoku.isCompleted()) {
                sudoku.setNumber(possibility.coor[0], possibility.coor[1], null);
                return 1;
            } else {
                const childSolution = process(sudoku, depth + 1);
                if (childSolution === -1 || (childSolution && solution)) {
                    sudoku.setNumber(possibility.coor[0], possibility.coor[1], null);
                    return -1;
                } else if (childSolution) {
                    solution = 1;
                }
                sudoku.setNumber(possibility.coor[0], possibility.coor[1], null);
            }
        }

        return solution;
    }

    return process(cloneSudoku(sudoku)) !== -1;
}

// Version optimisée avec moins d'appels à isUnique
function remove(sudoku: Sudoku, np: number): Sudoku {
    function process(sudoku: Sudoku): Sudoku {
        sudoku = cloneSudoku(sudoku);
        const pos: [number, number][] = [];
        for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) pos.push([y, x]);

        // Shuffle positions
        for (let i = pos.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pos[i], pos[j]] = [pos[j]!, pos[i]!];
        }

        let cpt = 0;
        let attempts = 0;
        const maxAttempts = np * 2; // Limite le nombre de tentatives

        for (const p of pos) {
            if (cpt >= np || attempts >= maxAttempts) break;
            attempts++;

            const oldValue = sudoku.matrix[p[0]]![p[1]]!.value;
            if (oldValue === null) continue; // Skip already empty cells

            sudoku.matrix[p[0]]![p[1]]!.value = null;

            // Vérification simplifiée pour améliorer les performances
            if (!isUnique(sudoku, 30)) {
                sudoku.matrix[p[0]]![p[1]]!.value = oldValue;
            } else {
                cpt++;
            }
        }

        return sudoku;
    }

    // Essayer seulement 2 fois au lieu de 5 pour gagner du temps
    const solutions: Sudoku[] = [];
    for (let i = 0; i < 2; i++) {
        const solution = process(sudoku);
        
        if (solution.getNumberOfEmptyPos() >= np * 0.9) { // Accepter 90% de l'objectif
            return solution;
        } else {
            solutions.push(solution);
        }
    }

    return solutions.reduce((max, curr) =>
        curr.getNumberOfEmptyPos() > max.getNumberOfEmptyPos() ? curr : max
    );
}

export function generator(difficulty: string = "m"): Sudoku {
    const table: (number | null)[][] = Array.from({ length: 9 }, () => Array(9).fill(null));
    const sudoku = new Sudoku(table);

    const shuffle = <T>(arr: T[]): T[] => {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j]!, arr[i]!];
            }
        return arr;
    };

    const p1 = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    sudoku.setBox(0, p1);
    const p2 = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    sudoku.setBox(4, p2);
    const p3 = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    sudoku.setBox(8, p3);

    solve(sudoku);

    // Objectifs de cases vides ajustés pour de meilleures performances
    const npMap: Record<string, () => number> = {
        xs: () => Math.floor(Math.random() * (40 - 35 + 1)) + 35,   // 35-40 au lieu de 31-45
        s:  () => Math.floor(Math.random() * (45 - 41 + 1)) + 41,   // 41-45 au lieu de 46-49
        m:  () => Math.floor(Math.random() * (50 - 46 + 1)) + 46,   // 46-50 au lieu de 50-53
        l:  () => Math.floor(Math.random() * (54 - 51 + 1)) + 51,   // 51-54 au lieu de 54-59
        xl: () => Math.floor(Math.random() * (58 - 55 + 1)) + 55,   // 55-58 au lieu de 60-64
    };

    const np = npMap[difficulty]!();
    const result = remove(sudoku, np);
    sudoku.matrix.flat().filter(s => s.value !== null).forEach(s => {
        s.isInital = true;
    })

    return result;
}
