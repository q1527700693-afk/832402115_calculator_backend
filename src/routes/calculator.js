const express = require("express");
const { evaluate } = require("../services/expression");
const { convertBase } = require("../services/base-converter");
const historyService = require("../services/history");

const router = express.Router();

function toJsonResult(decimal) {
    // 无限小数无法完整显示，这里只保留 12 位有效数字。
    // 这样会优先显示高位数字，例如 1/3 显示为 0.333333333333。
    const text = decimal.toSignificantDigits(12).toString();
    const number = Number(text);
    return Number.isFinite(number) ? number : text;
}

router.post("/calculate", (request, response) => {
    try {
        const expression = request.body.expression;

        if (typeof expression !== "string" || expression.trim() === "") {
            throw new Error("表达式不能为空");
        }

        const result = evaluate(expression);
        historyService.save(expression, result);

        response.json({
            success: true,
            expression,
            result: toJsonResult(result)
        });
    } catch (error) {
        response.status(400).json({
            success: false,
            message: error.message
        });
    }
});

router.post("/convert/base", (request, response) => {
    try {
        const { value, fromBase, toBase } = request.body;
        const result = convertBase(value, fromBase, toBase);

        response.json({
            success: true,
            value,
            fromBase: Number(fromBase),
            toBase: Number(toBase),
            result
        });
    } catch (error) {
        response.status(400).json({
            success: false,
            message: error.message
        });
    }
});

router.get("/history", (request, response) => {
    response.json({
        success: true,
        data: historyService.findAll()
    });
});

router.delete("/history", (request, response) => {
    const deletedCount = historyService.clearAll();

    response.json({
        success: true,
        message: "已清空历史记录",
        deletedCount
    });
});

router.delete("/history/:id", (request, response) => {
    const deleted = historyService.deleteById(request.params.id);

    if (!deleted) {
        return response.status(404).json({
            success: false,
            message: "记录不存在"
        });
    }

    return response.json({
        success: true,
        message: "删除成功"
    });
});

module.exports = router;
