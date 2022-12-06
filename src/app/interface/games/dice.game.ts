export interface InterfaceDiceGame {
    id: number;
    oddeven_str: string;
    lowhigh_str: string;
    datetime: string;
    dice1: number;
    dice2: number;
    hash: string;
    salt: string;
    sum: number;
}
