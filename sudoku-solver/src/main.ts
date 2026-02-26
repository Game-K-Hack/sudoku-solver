import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')


class Sudoku {
    matrix: (number | null)[][];

    static difficulties: Record<string, [number, number]> = {
        xs: [36, 50],
        s: [32, 35],
        m: [28, 31],
        l: [22, 27],
        xl: [17, 21],
    }

    constructor(matrix: (number | null)[][]) {
        this.matrix = matrix;
    }

    setBox(z: number, data: (number | null)[]): void {
        const boxY = Math.floor(z / 3) * 3;
        const boxX = (z % 3) * 3;
        for (let index = 0; index < 3; index++) {
            this.matrix[boxY + index]!.splice(boxX, 3, ...data.slice(index * 3, index * 3 + 3));
        }
    }

    setNumber(x: number, y: number, number: number | null): void {
        const p = this.getPossibleSolutions(x, y);
        if (number !== null && !p.includes(number)) throw new Error(`Number ${number} is not a possible solution for (${x}, ${y}), possibilities is: ${JSON.stringify(p)}`);
        this.matrix[y]![x] = number;
    }

    getPossibleSolutions(x: number, y: number): number[] {
        const possibleNumbers = new Set<number>([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (const numbers of [this.getRow(y), this.getColumn(x), this.getBox(x, y)]) {
            for (const n of numbers) {
                if (n !== null) possibleNumbers.delete(n);
            }
        }
        return Array.from(possibleNumbers);
    }

    getRow(y: number): (number | null)[] {
        return this.matrix[y]!;
    }

    getColumn(x: number): (number | null)[] {
        return this.matrix.map((row) => row[x]!);
    }

    getBox(x: number, y: number): (number | null)[] {
        const originX = Math.floor(x / 3) * 3;
        const originY = Math.floor(y / 3) * 3;
        const numbers: (number | null)[] = [];
        for (let i = 0; i < 3; i++) {
            numbers.push(...this.matrix[originY + i]!.slice(originX, originX + 3));
        }
        return numbers;
    }

    getBoxN(z: number): (number | null)[] {
        const boxY = Math.floor(z / 3) * 3;
        const boxX = (z % 3) * 3;
        const numbers: (number | null)[] = [];
        for (let index = 0; index < 3; index++) {
            numbers.push(...this.matrix[boxY + index]!.slice(boxX, boxX + 3))
        }
        return numbers;
    }

    isCompleted(): boolean {
        for (const func of [
            (i: number) => this.getRow(i),
            (i: number) => this.getColumn(i),
            (i: number) => this.getBoxN(i)
        ]) {
            for (let i = 0; i < 9; i++) {
                if (func(i).reduce((acc, v) => acc! + (v ?? 0), 0) !== 45) return false;
            }
        }
        return true;
    }

    getNumberOfEmptyPos(): number {
        let count = 0;
        for (let y = 0; y < 9; y++) {
            for (let x = 0; x < 9; x++) {
                if (this.matrix[y]![x] === null) count++;
            }
        }
        return count;
    }

    toString(): string {
        const tableStr: string[] = [];
        for (let li = 0; li < this.matrix.length; li++) {
            if (li % 3 === 0 && li !== 0) tableStr.push("------+-------+------");
            tableStr.push(
                this.matrix[li]!.map(
                    (v, i) => (i % 3 === 0 && i !== 0 ? "| " : "") + (v !== null ? String(v) : ".")
                ).join(" ")
            );
        }
        return tableStr.join("\n");
    }
}

function cloneSudoku(sudoku: Sudoku): Sudoku {
    return new Sudoku(sudoku.matrix.map(row => [...row]));
}

class CoorWithPossibleSolutions {
    constructor(
        public coor: [number, number],
        public possiblesSolutions: number[]
    ) {}
}

function solve(sudoku: Sudoku): boolean | Sudoku | null {
    const possibilities: CoorWithPossibleSolutions[] = [];

    for (let y = 0; y < 9; y++) {
        for (let x = 0; x < 9; x++) {
            if (sudoku.matrix[y]![x] === null) {
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

function isUnique(sudoku: Sudoku): boolean {
    /**
     * -1 : Deux solutions trouvées
     *  0 : Aucune solution trouvée
     *  1 : Une solution trouvée
     */
    function process(sudoku: Sudoku): number {
        let solution = 0;
        const possibilities: CoorWithPossibleSolutions[] = [];

        for (let y = 0; y < 9; y++) {
            for (let x = 0; x < 9; x++) {
                if (sudoku.matrix[y]![x] === null) {
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

        for (const p of possibility.possiblesSolutions) {
            sudoku.setNumber(possibility.coor[0], possibility.coor[1], p);

            if (sudoku.isCompleted()) {
                sudoku.setNumber(possibility.coor[0], possibility.coor[1], null);
                return 1;
            } else {
                const childSolution = process(sudoku);
                if (childSolution === -1 || (childSolution && solution)) {
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

function remove(sudoku: Sudoku, np: number): Sudoku {
    function process(sudoku: Sudoku): Sudoku {
        sudoku = cloneSudoku(sudoku);
        const pos: [number, number][] = [];
        for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) pos.push([y, x]);

        for (let i = pos.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pos[i], pos[j]] = [pos[j]!, pos[i]!];
        }

        let cpt = 0;
        for (const p of pos) {
            if (cpt >= np) break;

            const oldValue = sudoku.matrix[p[0]]![p[1]];
            sudoku.matrix[p[0]]![p[1]] = null;

            if (!isUnique(sudoku)) {
                sudoku.matrix[p[0]]![p[1]] = oldValue!;
            } else {
                cpt++;
            }
        }

        return sudoku;
    }

    const solutions: Sudoku[] = [];
    for (let i = 0; i < 5; i++) {
        const solution = process(sudoku);
        if (solution.getNumberOfEmptyPos() === np) {
        return solution;
        } else {
        solutions.push(solution);
        }
    }

    return solutions.reduce((max, curr) =>
        curr.getNumberOfEmptyPos() > max.getNumberOfEmptyPos() ? curr : max
    );
}

function generator(difficulty: string = "m"): Sudoku {
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

    const npMap: Record<string, () => number> = {
        xs: () => Math.floor(Math.random() * (45 - 31 + 1)) + 31,
        s:  () => Math.floor(Math.random() * (49 - 46 + 1)) + 46,
        m:  () => Math.floor(Math.random() * (53 - 50 + 1)) + 50,
        l:  () => Math.floor(Math.random() * (59 - 54 + 1)) + 54,
        xl: () => Math.floor(Math.random() * (64 - 60 + 1)) + 60,
    };

    const np = npMap[difficulty]!();
    console.log("np:", np);

    const startTime = performance.now();
    const result = remove(sudoku, np);
    console.log(`--- ${((performance.now() - startTime) / 1000).toFixed(3)} seconds ---`);

    return result;
}


let s = generator("xl");
console.log(s.toString());
