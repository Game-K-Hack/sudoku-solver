import type { SquareModel } from './types'
import { SquareState } from './types'

export class Sudoku {
    matrix: SquareModel[][];

    static difficulties: Record<string, [number, number]> = {
        xs: [36, 50],
        s: [32, 35],
        m: [28, 31],
        l: [22, 27],
        xl: [17, 21],
    }

    constructor(matrix: (number | null)[][] | SquareModel[][]) {
        // Si c'est déjà une matrice de Square, l'utiliser directement
        if (matrix.length > 0 && matrix[0] && matrix[0].length > 0 && matrix[0][0] && typeof matrix[0][0] === 'object' && 'state' in matrix[0][0]) {
            this.matrix = matrix as SquareModel[][];
        } else {
            // Sinon, convertir les nombres en Square
            this.matrix = (matrix as (number | null)[][]).map(row => 
                row.map(value => ({ value, state: SquareState.NORMAL, isInital: false }))
            );
        }
    }

    setBox(z: number, data: (number | null)[]): void {
        const boxY = Math.floor(z / 3) * 3;
        const boxX = (z % 3) * 3;
        for (let index = 0; index < 3; index++) {
            const squares = data.slice(index * 3, index * 3 + 3).map(value => ({ value, state: SquareState.NORMAL, isInital: false }));
            this.matrix[boxY + index]!.splice(boxX, 3, ...squares);
        }
    }

    setNumber(x: number, y: number, number: number | null): void {
        const p = this.getPossibleSolutions(x, y);
        if (number !== null && !p.includes(number)) throw new Error(`Number ${number} is not a possible solution for (${x}, ${y}), possibilities is: ${JSON.stringify(p)}`);
        this.matrix[y]![x]!.value = number;
    }

    getPossibleSolutions(x: number, y: number): number[] {
        const possibleNumbers = new Set<number>([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (const numbers of [this.getRow(y), this.getColumn(x), this.getBox(x, y)]) {
            for (const square of numbers) {
                if (square.value !== null) possibleNumbers.delete(square.value);
            }
        }
        return Array.from(possibleNumbers);
    }

    getRow(y: number): SquareModel[] {
        return this.matrix[y]!;
    }

    getColumn(x: number): SquareModel[] {
        return this.matrix.map((row) => row[x]!);
    }

    getBox(x: number, y: number): SquareModel[] {
        const originX = Math.floor(x / 3) * 3;
        const originY = Math.floor(y / 3) * 3;
        const squares: SquareModel[] = [];
        for (let i = 0; i < 3; i++) {
            squares.push(...this.matrix[originY + i]!.slice(originX, originX + 3));
        }
        return squares;
    }

    getBoxN(z: number): SquareModel[] {
        const boxY = Math.floor(z / 3) * 3;
        const boxX = (z % 3) * 3;
        const squares: SquareModel[] = [];
        for (let index = 0; index < 3; index++) {
            squares.push(...this.matrix[boxY + index]!.slice(boxX, boxX + 3))
        }
        return squares;
    }

    isCompleted(): boolean {
        for (const func of [
            (i: number) => this.getRow(i),
            (i: number) => this.getColumn(i),
            (i: number) => this.getBoxN(i)
        ]) {
            for (let i = 0; i < 9; i++) {
                if (func(i).reduce((acc, square) => acc! + (square.value ?? 0), 0) !== 45) return false;
            }
        }
        return true;
    }

    getNumberOfEmptyPos(): number {
        let count = 0;
        for (let y = 0; y < 9; y++) {
            for (let x = 0; x < 9; x++) {
                if (this.matrix[y]![x]!.value === null) count++;
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
                    (square, i) => (i % 3 === 0 && i !== 0 ? "| " : "") + (square.value !== null ? String(square.value) : ".")
                ).join(" ")
            );
        }
        return tableStr.join("\n");
    }
}
