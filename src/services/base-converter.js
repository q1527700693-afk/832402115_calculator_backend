const DIGITS = "0123456789ABCDEF";

function parseIntegerBase(value, base) {
    if (typeof value !== "string") {
        throw new Error("数字必须是字符串");
    }

    let text = value.trim().toUpperCase();
    if (!text) {
        throw new Error("数字不能为空");
    }

    let negative = false;
    if (text.startsWith("-")) {
        negative = true;
        text = text.slice(1);
    } else if (text.startsWith("+")) {
        text = text.slice(1);
    }

    if (!text) {
        throw new Error("数字格式错误");
    }

    const bigBase = BigInt(base);
    let result = 0n;

    for (const char of text) {
        const digit = DIGITS.indexOf(char);

        if (digit < 0 || digit >= base) {
            throw new Error(`数字 ${value} 不是合法的 ${base} 进制数`);
        }

        result = result * bigBase + BigInt(digit);
    }

    return negative ? -result : result;
}

function toIntegerBase(value, base) {
    if (value === 0n) {
        return "0";
    }

    const negative = value < 0n;
    let current = negative ? -value : value;
    const bigBase = BigInt(base);
    let result = "";

    while (current > 0n) {
        const remainder = Number(current % bigBase);
        result = DIGITS[remainder] + result;
        current = current / bigBase;
    }

    return negative ? `-${result}` : result;
}

function convertBase(value, fromBase, toBase) {
    const from = Number(fromBase);
    const to = Number(toBase);

    if (!Number.isInteger(from) || from < 2 || from > 16) {
        throw new Error("源进制必须是 2 到 16 之间的整数");
    }

    if (!Number.isInteger(to) || to < 2 || to > 16) {
        throw new Error("目标进制必须是 2 到 16 之间的整数");
    }

    const decimalValue = parseIntegerBase(String(value), from);
    return toIntegerBase(decimalValue, to);
}

module.exports = {
    convertBase
};
