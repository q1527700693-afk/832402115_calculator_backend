const db = require("../db");

const insertStatement = db.prepare(
    "INSERT INTO calculation_history (expression, result, created_at) VALUES (?, ?, ?)"
);

const listStatement = db.prepare(
    "SELECT id, expression, result, created_at AS createdAt FROM calculation_history ORDER BY id DESC"
);

const deleteStatement = db.prepare(
    "DELETE FROM calculation_history WHERE id = ?"
);

const clearStatement = db.prepare(
    "DELETE FROM calculation_history"
);

function formatTime(date) {
    const pad = (value) => String(value).padStart(2, "0");

    return [
        date.getFullYear(),
        pad(date.getMonth() + 1),
        pad(date.getDate())
    ].join("-") + " " + [
        pad(date.getHours()),
        pad(date.getMinutes()),
        pad(date.getSeconds())
    ].join(":");
}

function save(expression, result) {
    const createdAt = formatTime(new Date());
    const info = insertStatement.run(expression, result.toString(), createdAt);

    return {
        id: Number(info.lastInsertRowid),
        expression,
        result: result.toString(),
        createdAt
    };
}

function findAll() {
    return listStatement.all().map((row) => ({
        id: Number(row.id),
        expression: row.expression,
        result: row.result,
        createdAt: row.createdAt
    }));
}

function deleteById(id) {
    const info = deleteStatement.run(Number(id));
    return info.changes > 0;
}

function clearAll() {
    const info = clearStatement.run();
    return Number(info.changes);
}

module.exports = {
    save,
    findAll,
    deleteById,
    clearAll
};
