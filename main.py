import time
from functools import wraps
from copy import deepcopy
from dataclasses import dataclass
import random

class Sudoku:
    matrix: list[list[int]]
    difficulties = {
        "xs": (36, 50),
        "s": (32, 35),
        "m": (28, 31),
        "l": (22, 27),
        "xl": (17, 21),
    }

    def __init__(self, matrix: list[list[int]]):
        self.matrix = matrix

    def set_box(self, z: int, data: list[int]):
        box_y = (z // 3) * 3
        box_x = (z % 3) * 3

        for index, i in enumerate(range(0, 9, 3)):
            self.matrix[box_y + index][box_x: box_x + 3] = data[i: i + 3]

    def set_number(self, x: int, y: int, number: int | None):
        p = self.get_possible_solutions(x, y)
        if number is not None and number not in p:
            raise ValueError(f"Number {number} is not a possible solution for ({x}, {y}), possibilities is: {str(p)}")
        self.matrix[y][x] = number

    def get_possible_solutions(self, x: int, y: int) -> list[int]:
        possibles_numbers = set(range(1, 10))

        for numbers in [self.get_row(y), self.get_column(x), self.get_box(x, y)]:
            possibles_numbers -= set(numbers)

        return list(possibles_numbers)

    def get_row(self, y: int) -> list[int]:
        return self.matrix[y]
    
    def get_column(self, x: int) -> list[int]:
        return [row[x] for row in self.matrix]

    def get_box(self, x: int, y: int) -> list[int]:
        origin_x, origin_y = ((x // 3) * 3, (y // 3) * 3)

        numbers = []
        for i in range(3):
            numbers.extend(self.matrix[origin_y + i][origin_x: origin_x + 3])
        return numbers
    
    def get_boxN(self, z: int) -> list[int]:
        box_y = (z // 3) * 3
        box_x = (z % 3) * 3

        numbers = []
        for index in range(3):
            numbers.extend(self.matrix[box_y + index][box_x: box_x + 3])
        return numbers

    def is_completed(self) -> bool:
        for func in [self.get_row, self.get_column, self.get_boxN]:
            for i in range(9):
                if sum([j for j in func(i) if j is not None]) != 45:
                    return False
        return True
    
    def get_number_of_empty_pos(self) -> int:
        cpt = 0
        for y in range(9):
            for x in range(9):
                if self.matrix[y][x] == None:
                    cpt += 1
        return cpt

    def __str__(self) -> str: 
        table_str = []
        for li, y in enumerate(self.matrix):
            if li % 3 == 0 and li != 0:
                table_str.append("------+-------+------")
            table_str.append(" ".join([("| " if i % 3 == 0 and i != 0 else "") + (str(v) if v is not None else ".") for i, v in enumerate(y)]))
        return "\n".join(table_str)

    def __repr__(self) -> str:
        return self.__str__()

def solve(sudoku: Sudoku) -> bool:
    possibilities: list[CoorWithPossibleSolutions] = []

    for y in range(9):
        for x in range(9):
            if sudoku.matrix[y][x] is None:
                possibilities.append(
                    CoorWithPossibleSolutions(
                        (x, y),
                        sudoku.get_possible_solutions(x, y)
                    )
                )

    if len(possibilities) == 0:
        return None

    possibility: CoorWithPossibleSolutions | None = min(possibilities, key=lambda x: len(x.possibles_solutions))

    for p in possibility.possibles_solutions:
        sudoku.set_number(*possibility.coor, p)

        if sudoku.is_completed():
            return sudoku
        else:
            if not solve(sudoku):
                sudoku.set_number(*possibility.coor, None)
                continue

            return True
    return False


@dataclass
class CoorWithPossibleSolutions:
    coor: tuple[int, int]
    possibles_solutions: list[int]

def is_unique(sudoku: Sudoku) -> bool:
    """
    False: Si aucune solution trouvée ou deux solutions trouvées
    True : Si une et une seul solution trouvée
    """
    def __process__(sudoku: Sudoku) -> int:
        """
        -1 : Deux solutions trouvées
         0 : Aucune solution trouvée
         1 : Une solution trouvée 
        """
        solution = 0
        possibilities: list[CoorWithPossibleSolutions] = []

        for y in range(9):
            for x in range(9):
                if sudoku.matrix[y][x] is None:
                    possibilities.append(
                        CoorWithPossibleSolutions(
                            (x, y),
                            sudoku.get_possible_solutions(x, y)
                        )
                    )

        if len(possibilities) == 0:
            return 0

        possibility: CoorWithPossibleSolutions | None = min(possibilities, key=lambda x: len(x.possibles_solutions))

        for p in possibility.possibles_solutions:
            sudoku.set_number(*possibility.coor, p)

            if sudoku.is_completed():
                sudoku.set_number(*possibility.coor, None)
                return 1
            else:
                child_solution = __process__(sudoku)
                if child_solution == -1 or (child_solution and solution):
                    return -1
                elif child_solution:
                    solution = 1

                sudoku.set_number(*possibility.coor, None)
        
        return solution

    return __process__(deepcopy(sudoku)) != -1

def remove(sudoku: Sudoku, np: int) -> Sudoku:
    def __process__(sudoku: Sudoku) -> Sudoku:
        sudoku = deepcopy(sudoku)
        pos = [(y, x) for y in range(9) for x in range(9)]
        random.shuffle(pos)

        cpt = 0
        for p in pos:
            if cpt >= np:
                break

            old_value = sudoku.matrix[p[0]][p[1]]
            sudoku.matrix[p[0]][p[1]] = None

            if not is_unique(sudoku):
                sudoku.matrix[p[0]][p[1]] = old_value
            else:
                cpt += 1
        
        return sudoku

    solutions: list[Sudoku] = []
    for _ in range(5):
        solution = __process__(sudoku)
        if solution.get_number_of_empty_pos() == np:
            return solution
        else:
            solutions.append(solution)

    return max(solutions, key=lambda s: s.get_number_of_empty_pos())


def generator(difficulty: str = "m") -> Sudoku:
    table = [[None] * 9 for _ in range(9)]
    
    sudoku = Sudoku(table)
    
    p1 = list(range(1, 10))
    random.shuffle(p1)
    sudoku.set_box(0, p1)

    p2 = list(range(1, 10))
    random.shuffle(p2)
    sudoku.set_box(4, p2)

    p3 = list(range(1, 10))
    random.shuffle(p3)
    sudoku.set_box(8, p3)

    solve(sudoku)

    np = {
        "xs": random.randint(31, 45),
        "s": random.randint(46, 49),
        "m": random.randint(50, 53),
        "l": random.randint(54, 59),
        "xl": random.randint(60, 64),
    }[difficulty] # Nombre de passage
    print("np:", np)

    start_time = time.time()
    sudoku = remove(sudoku, np)
    print("--- %s seconds ---" % (time.time() - start_time))
    return sudoku



if __name__ == "__main__":
    s = generator("xl")
    print(s)

    solve(s)
    print(s)


# 1 2 3 | 1 2 3 | 1 2 3
# 1 2 3 | 1 2 3 | 1 2 3
# 1 2 3 | 1 . 3 | 1 2 3
# ------+-------+------
# 1 2 3 | 1 2 3 | 1 2 3
# 1 . 3 | 1 2 3 | 1 2 3 (7, 4) -> (7 // 3 = 2, 4 // 3 = 1)
# 1 2 3 | 1 2 3 | 1 2 3
# ------+-------+------
# 1 2 3 | 1 . 3 | 1 2 3
# 1 2 3 | 1 2 3 | 1 2 3
# 1 2 3 | 1 2 3 | 1 2 3


