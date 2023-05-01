export default class Vec extends Array<number> {
    constructor(size: number, base?: number[]);
    iterate(fun: Function): void;
    deepAssign(base: number[]): any;
    compare(other: number[]): boolean;
    len(): number;
    length2(): number;
    /**
     * Normalizes the vector and returns it.
     * It does not return a copy, so this will change the instance itself.
     */
    normalize(): any;
    dot(otherVec: number[]): number;
    flip(): any;
    add(vec: number[]): any;
    subtract(vec: number[]): any;
    multiply(mult: number): any;
    min(vec: number[]): any;
    max(vec: number[]): any;
}
