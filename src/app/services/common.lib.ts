export class CLib {
    /**
     * user display option for siteKey
     */
//     public sortUser(data, siteKey, options): Array<any> {
//         const arr = [];
//
//         data.map((entry) => {
//             if (typeof entry.siteKey === 'undefined' ) {
//                 return;
//             }
//             if (options.onlyOurMember === true && siteKey !== entry.siteKey) {
//                 return;
//             }
// /*
//             if (options.cyber === false && entry.siteKey === 'cyber') {
//                 return;
//             }
// */
//             if (options.other === false && siteKey !== entry.siteKey && entry.siteKey !== 'cyber') {
//                 return;
//             }
//             arr.push(entry);
//         });
//
//         return arr;
//     }

    // public diplayUser(userSiteKey, settedSiteKey, display): boolean {
    //     if (!settedSiteKey) {
    //         return true;
    //     }
    //     // only siteKey
    //     if (display === 0 &&  settedSiteKey !== userSiteKey) {
    //         return false;
    //     }
    //
    //     // cyber and siteKey
    //     if (display === 1 && settedSiteKey !== userSiteKey && userSiteKey !== 'cyber') {
    //         return false;
    //     }
    //     // default 2 : all users
    //
    //     return true;
    // }

    public inArray(needle: any, haystack: any[]): boolean {
        for (const i in haystack) {
            if (haystack[i] === needle) { return true; }
        }
        return false;
    }

}
