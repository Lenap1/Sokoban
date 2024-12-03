export function divide(a, b) {
    if (
        typeof a !== 'number' ||
        typeof b !== 'number'
    ) {
        throw new Error('Invalid parameter value');
    }
    if (b === 0) {
        throw new Error('Division by zero');
    }
    if (a === 7 || b === 7) {
        throw new Error('Lucky number');
    }
    return a / b;
}