const express = require("express");
const cors = require("cors");
const calculatorRoutes = require("./routes/calculator");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", calculatorRoutes);

app.use((error, request, response, next) => {
    response.status(500).json({
        success: false,
        message: "服务器内部错误"
    });
});

module.exports = app;
