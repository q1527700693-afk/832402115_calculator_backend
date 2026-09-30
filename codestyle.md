# 后端代码规范

## 规范来源

本项目 Java 代码主要参考以下主流规范：

- Google Java Style Guide  
  https://google.github.io/styleguide/javaguide.html
- Oracle Java Code Conventions  
  https://www.oracle.com/java/technologies/javase/codeconventions-contents.html
- 阿里巴巴 Java 开发手册  
  https://github.com/alibaba/p3c

## 基本约定

1. 类名使用大驼峰命名，例如 `CalculateController`。
2. 方法名和变量名使用小驼峰命名，例如 `findAll`、`historyService`。
3. 包名全部小写。
4. 使用 4 个空格缩进。
5. Controller 只负责接收请求和返回响应。
6. Service 负责业务逻辑。
7. 数据库操作使用参数化 SQL，禁止拼接用户输入。
8. 不使用 `eval`、脚本引擎等方式执行用户表达式。
9. 统一返回 JSON 格式，错误信息通过异常处理器返回。
