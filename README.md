# 计算器后端 - Node.js

## 技术栈

- Node.js 22+
- Express
- node:sqlite
- decimal.js
- SQLite

## 运行方式

安装依赖：

```bash
npm install
```

启动：

```bash
npm start
```

启动成功：

```text
Calculator backend started on http://localhost:8080
```

## 接口

### 计算

```text
POST /api/calculate
Content-Type: application/json
```

请求：

```json
{
  "expression": "(1+2)*3"
}
```

成功返回：

```json
{
  "success": true,
  "expression": "(1+2)*3",
  "result": 9
}
```

失败返回：

```json
{
  "success": false,
  "message": "除数不能为 0"
}
```

### 查询历史

```text
GET /api/history
```

### 删除历史

```text
DELETE /api/history/{id}
```

### 清空全部历史

```text
DELETE /api/history
```

## 数据库

SQLite 数据库文件：

```text
data/calculator.db
```

启动服务时自动创建表。


## 科学计算

支持：

- `^`：幂运算
- `sqrt(x)`：开平方
- `sin(x)`、`cos(x)`、`tan(x)`：三角函数，默认角度制
- `log(x)`：以 10 为底的对数
- `ln(x)`：自然对数
- `abs(x)`：绝对值
- `pi`、`π`：圆周率
- `e`：自然常数

示例：

```text
sqrt(16)
sin(30)
cos(60)
2^3^2
log(100)
ln(e)
pi
2*pi
```
