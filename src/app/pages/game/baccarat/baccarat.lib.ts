export class BaccratLib {

    /**
     * 카드의 뒷자리만 가져오기
     */
    public CardString(card: string): string {
        return card.substr(1);
    }

    public CardSNum(card: string): number {
        return this.cardToNumber(card.substr(1));
    }

    public sumCardNum(card1num: number, card2num: number): number {
        const sum = card1num + card2num;
        return sum % 10;
    }

    /**
     * Change Card to Number
     */
    public cardToNumber(num: string): number {
        switch (num) {
            case 'A':
                return 1;
            case '10':
            case 'J':
            case 'Q':
            case 'K':
                return 0;
            default:
                return parseInt(num, 10);
        }
    }

    /**
     * 'PLAYER', 'BANKER', 'TIE' 중 하나를 선택
     */
    public getWinner(playerSum: number, bankerSum: number): string {
        if (playerSum > bankerSum) { // PLAYER WIN
            return 'PLAYER';
        } else if (playerSum < bankerSum) { // BANKER WIN
            return 'BANKER';
        } else { // TIE
            return 'TIE';
        }
    }

}
