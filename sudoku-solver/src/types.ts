export enum SquareState {
    NORMAL,
    CLICKED,
    ROW,
    ERROR,
}

export interface SquareModel {
    value: number | null
    state: SquareState
    isInital: boolean
}
