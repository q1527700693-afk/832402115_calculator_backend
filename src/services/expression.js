const Decimal = require("decimal.js");

Decimal.set({
    precision: 40,
    rounding: Decimal.ROUND_HALF_UP
});

const PI = new Decimal("3.1415926535897932384626433832795028841971693993751");
const E = new Decimal("2.71828182845904523536028747135266249775724709369995");

const BINARY_PRECEDENCE = {
    "+": 1,
    "-": 1,
    "*": 2,
    "/": 2,
    "^": 4
};

const FUNCTIONS = new Set([
    "sin",
    "cos",
    "tan",
    "sqrt",
    "log",
    "ln",
    "abs"
]);

function normalize(expression) {
    return String(expression)
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/−/g, "-")
        .trim();
}

function isDigitOrDot(char) {
    return /[0-9.]/.test(char);
}

function isLetter(char) {
    return /[a-zA-Zπ]/.test(char);
}

function tokenize(expression) {
    if (!expression) {
        throw new Error("表达式不能为空");
    }

    const tokens = [];
    let i = 0;

    while (i < expression.length) {
        const ch = expression[i];

        if (/\s/.test(ch)) {
            i++;
            continue;
        }

        if (isDigitOrDot(ch)) {
            let number = "";
            let dotCount = 0;

            while (i < expression.length && isDigitOrDot(expression[i])) {
                if (expression[i] === ".") {
                    dotCount++;
                    if (dotCount > 1) {
                        throw new Error("数字格式错误");
                    }
                }
                number += expression[i];
                i++;
            }

            if (number === "." || number.endsWith(".")) {
                throw new Error("数字格式错误");
            }

            tokens.push({
                type: "number",
                value: new Decimal(number)
            });
            continue;
        }

        if (isLetter(ch)) {
            let name = "";

            while (i < expression.length && isLetter(expression[i])) {
                name += expression[i];
                i++;
            }

            const key = name.toLowerCase();

            if (key === "pi" || key === "π") {
                tokens.push({ type: "number", value: PI });
            } else if (key === "e") {
                tokens.push({ type: "number", value: E });
            } else if (FUNCTIONS.has(key)) {
                tokens.push({ type: "function", value: key });
            } else {
                throw new Error(`不支持的函数或常量：${name}`);
            }
            continue;
        }

        if ("+-*/^()".includes(ch)) {
            tokens.push({ type: "operator", value: ch });
            i++;
            continue;
        }

        throw new Error(`不支持的字符：${ch}`);
    }

    return tokens;
}

function isNumberToken(token) {
    return token && token.type === "number";
}

function isBinaryOperator(token) {
    return token.type === "operator"
        && ["+", "-", "*", "/", "^"].includes(token.value);
}

function startsOperand(token) {
    return token.type === "number"
        || token.type === "function"
        || token.value === "(";
}

function endsOperand(token) {
    return token.type === "number" || token.value === ")";
}

function validateTokens(tokens) {
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const previous = i > 0 ? tokens[i - 1] : null;
        const next = i + 1 < tokens.length ? tokens[i + 1] : null;

        if (token.type === "function" && (!next || next.value !== "(")) {
            throw new Error("函数后面必须跟括号");
        }

        if (token.value === "(" && next && next.value === ")") {
            throw new Error("括号内不能为空");
        }

        if (previous && endsOperand(previous) && startsOperand(token)) {
            throw new Error("缺少运算符");
        }

        if (isBinaryOperator(token) && (!next || next.value === ")")) {
            throw new Error("表达式不完整");
        }

        if (isBinaryOperator(token) && previous && isBinaryOperator(previous)) {
            const isUnarySign = (token.value === "+" || token.value === "-")
                && ["*", "/", "^"].includes(previous.value);

            if (!isUnarySign) {
                throw new Error("运算符位置错误");
            }
        }
    }

    const first = tokens[0];
    const last = tokens[tokens.length - 1];

    if (first && isBinaryOperator(first) && first.value !== "+" && first.value !== "-") {
        throw new Error("表达式不能以运算符开头");
    }

    if (last && (isBinaryOperator(last) || last.type === "function" || last.value === "(")) {
        throw new Error("表达式不完整");
    }
}

function toRpn(tokens) {
    const output = [];
    const operators = [];

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];

        if (token.type === "number") {
            output.push(token);
            continue;
        }

        if (token.type === "function") {
            operators.push(token);
            continue;
        }

        if (token.value === "(") {
            operators.push(token);
            continue;
        }

        if (token.value === ")") {
            while (operators.length > 0 && operators[operators.length - 1].value !== "(") {
                output.push(operators.pop());
            }

            if (operators.length === 0) {
                throw new Error("括号不匹配");
            }

            operators.pop();

            if (operators.length > 0 && operators[operators.length - 1].type === "function") {
                output.push(operators.pop());
            }
            continue;
        }

        if (!["+", "-", "*", "/", "^"].includes(token.value)) {
            throw new Error(`不支持的运算符：${token.value}`);
        }

        let op = token.value;
        const previous = i > 0 ? tokens[i - 1] : null;
        const previousIsOperand = previous !== null
            && (isNumberToken(previous) || previous.value === ")");

        // 一元正负号，例如 -5、3*-2、sin(-30)
        if ((op === "-" || op === "+") && !previousIsOperand) {
            if (op === "+") {
                continue;
            }

            operators.push({ type: "operator", value: "u-" });
            continue;
        }

        while (operators.length > 0) {
            const top = operators[operators.length - 1];

            if (top.value === "(") {
                break;
            }

            if (top.type === "function") {
                output.push(operators.pop());
                continue;
            }

            const topPrecedence = top.value === "u-"
                ? 3
                : (BINARY_PRECEDENCE[top.value] || 0);
            const opPrecedence = BINARY_PRECEDENCE[op] || 0;
            const rightAssociative = op === "^";

            if (topPrecedence > opPrecedence
                || (topPrecedence === opPrecedence && !rightAssociative)) {
                output.push(operators.pop());
            } else {
                break;
            }
        }

        operators.push({ type: "operator", value: op });
    }

    while (operators.length > 0) {
        const operator = operators.pop();
        if (operator.value === "(") {
            throw new Error("括号不匹配");
        }
        output.push(operator);
    }

    return output;
}

function toDegrees(value) {
    return value.times(PI).dividedBy(180);
}

function evaluateFunction(name, value) {
    switch (name) {
        case "sin":
            return toDegrees(value).sin();
        case "cos":
            return toDegrees(value).cos();
        case "tan":
            return toDegrees(value).tan();
        case "sqrt":
            if (value.isNegative()) {
                throw new Error("负数不能开平方");
            }
            return value.sqrt();
        case "log":
            if (value.lte(0)) {
                throw new Error("log 的参数必须大于 0");
            }
            return value.log(10);
        case "ln":
            if (value.lte(0)) {
                throw new Error("ln 的参数必须大于 0");
            }
            return value.ln();
        case "abs":
            return value.abs();
        default:
            throw new Error(`不支持的函数：${name}`);
    }
}

function evaluateRpn(rpn) {
    const stack = [];

    for (const token of rpn) {
        if (token.type === "number") {
            stack.push(token.value);
            continue;
        }

        if (token.type === "function") {
            if (stack.length < 1) {
                throw new Error("表达式不完整");
            }
            stack.push(evaluateFunction(token.value, stack.pop()));
            continue;
        }

        if (token.value === "u-") {
            if (stack.length < 1) {
                throw new Error("表达式不完整");
            }
            stack.push(stack.pop().neg());
            continue;
        }

        if (stack.length < 2) {
            throw new Error("表达式不完整");
        }

        const right = stack.pop();
        const left = stack.pop();
        let result;

        switch (token.value) {
            case "+":
                result = left.plus(right);
                break;
            case "-":
                result = left.minus(right);
                break;
            case "*":
                result = left.times(right);
                break;
            case "/":
                if (right.isZero()) {
                    throw new Error("除数不能为 0");
                }
                result = left.dividedBy(right);
                break;
            case "^":
                result = left.pow(right);
                break;
            default:
                throw new Error(`不支持的运算符：${token.value}`);
        }

        stack.push(result);
    }

    if (stack.length !== 1) {
        throw new Error("表达式不完整");
    }

    const result = stack.pop();
    if (!result.isFinite()) {
        throw new Error("计算结果无效");
    }

    return result;
}

function evaluate(expression) {
    const normalized = normalize(expression);
    const tokens = tokenize(normalized);
    validateTokens(tokens);
    const rpn = toRpn(tokens);
    return evaluateRpn(rpn);
}

module.exports = {
    evaluate
};
