// 1either = 1^9 gwei = 1^18gwei
export function removeComma(val: number | string): number {
    if (val !== undefined && val !== null) {
      // here we just remove the commas from value
      return parseFloat(val.toString().replace(/,/g, ''));
    } else {
      return ;
    }
}

// return string
export function removeCommaV2(val: number | string): string {
    if (val !== undefined && val !== null) {
      // here we just remove the commas from value
      return val.toString().replace(/,/g, '');
    } else {
      return ;
    }
}

// return string
export function removeDot(val: number | string): any {
    if (val !== undefined && val !== null) {
      // here we just remove the commas from value
      return (val.toString().replace(/\./g, ''));
    } else {
      return ;
    }
}

export function removeFromArrayByValue(arr: any[], v: any): any[] {
    const index = arr.indexOf(v);
    if (index > -1) {
      arr.splice(index, 1);
    }
    return arr;
}

export function copyToClipboard(item: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        try {
            document.addEventListener('copy', (e: ClipboardEvent) => {
                e.clipboardData.setData('text/plain', (item));
                e.preventDefault();
                document.removeEventListener('copy', null);
            });
            document.execCommand('copy');
            resolve(true);
        } catch (e) {
            reject(false);
        }
    });
}

export function inArray(needle: number | string, haystack: any): boolean {
    for (const i in haystack) {
        if (haystack[i] === needle) { return true; }
    }
    return false;
}

/**
 * 브라우저 language
 */
export function navigatorLanguage(): string {
    const userLangtmp1 = navigator.language || (navigator as any).userLanguage;
    const userLangtmp2 = userLangtmp1.split('-');
    return userLangtmp2[0];
}
