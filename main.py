import random


class Sudoku:
    matrix: list[list[int]]

    def __init__(self, matrix: list[list[int]]):
        self.matrix = matrix

    def set_box(self, x: int, data: list[int]):
        box_y = (x // 3) * 3
        box_x = (x % 3) * 3

        for index, i in enumerate(range(0, 9, 3)):
            self.matrix[box_y + index][box_x: box_x + 3] = data[i: i + 3]

    def set_number(self, x: int, y: int, number: int):
        if number not in self.get_possible_solutions(x, y):
            raise ValueError(f"Number {number} is not a possible solution for ({x}, {y})")
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

    def is_completed(self) -> bool:
        for func in [self.get_row, self.get_column, self.get_box]:
            for i in range(9):
                if sum([j for j in func(i) if j is not None]) != 45:
                    return False
        return True

    def __str__(self) -> str: 
        table_str = []
        for li, y in enumerate(self.matrix):
            if li % 3 == 0 and li != 0:
                table_str.append("------+-------+------")
            table_str.append(" ".join([("| " if i % 3 == 0 and i != 0 else "") + (str(v) if v is not None else ".") for i, v in enumerate(y)]))
        return "\n".join(table_str)

    def __repr__(self) -> str:
        return self.__str__()

def solve(sudoku: Sudoku) -> Sudoku:
    for y in range(9):
        for x in range(9):
            if sudoku.matrix[y][x] is None:
                print(sudoku.get_possible_solutions(x, y))





def generator() -> Sudoku:
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

    return solve(sudoku)


if __name__ == "__main__":
    generator()


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
