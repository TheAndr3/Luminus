export function inputVerify(data:string) {
    if (data.includes('=')  || data.includes( 'OR ') || data.includes('AND')) {
        return false;
    } else {
        return true;
    }
}
