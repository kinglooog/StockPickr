# 股灵智选 · 热点题材追踪

A股热点题材智能追踪系统。每日自动抓取东方财富概念板块数据，调用 DeepSeek API 生成题材解释 + 上中下游产业链逻辑 + 成分股归因。

## 技术栈

| 层 | 选型 |
|---|------|
| 后端 | FastAPI + SQLAlchemy + SQLite |
| 前端 | React 18 + Vite + TailwindCSS 4 |
| 调度 | APScheduler（每天 16:00 自动刷新） |
| LLM | DeepSeek API |
| 数据源 | 东方财富公开 API |

## 环境要求

- Python 3.10+
- Node.js 18+
- curl（爬虫需要，Windows 自带）

## 首次安装

```bash
# 1. 克隆项目
git clone https://github.com/kinglooog/StockPickr.git
cd StockPickr

# 2. 配置 API Key
cp .env.example .env
# 编辑 .env，把 your-deepseek-api-key-here 替换成你的 DeepSeek API Key

# 3. 后端：创建虚拟环境并安装依赖
cd backend
python -m venv venv
source venv/Scripts/activate   # Windows Git Bash
# 或 .\venv\Scripts\activate   # Windows PowerShell
pip install -r requirements.txt
cd ..

# 4. 前端：安装依赖
cd frontend
npm install
cd ..
```

## 启动

需要同时运行两个终端：

### 终端 1 — 启动后端（端口 8001）

```bash
cd backend

# 激活虚拟环境
source venv/Scripts/activate   # Git Bash
# 或 .\venv\Scripts\activate   # PowerShell

# 设置 UTF-8 编码（Windows 需要）
export PYTHONIOENCODING=utf-8   # Git Bash
# 或 $env:PYTHONIOENCODING="utf-8"   # PowerShell

# 启动
uvicorn main:app --host 127.0.0.1 --port 8001
```

看到以下输出表示成功：
```
[App] Database ready.
[Scheduler] Daily job registered at 16:00 (Asia/Shanghai)
Uvicorn running on http://127.0.0.1:8001
```

### 终端 2 — 启动前端（端口 5173）

```bash
cd frontend
npm run dev
```

看到以下输出表示成功：
```
VITE v8.x.x  ready in xxx ms
➜  Local:   http://127.0.0.1:5173/
```

浏览器打开 `http://localhost:5173`。

## 验证是否在运行

```bash
# 检查后端
curl http://127.0.0.1:8001/api/health
# 返回 {"status":"ok"} 表示后端正常

# 检查前端
curl http://127.0.0.1:5173/
# 返回 200 表示前端正常
```

## 关闭

### 关闭后端

```bash
# PowerShell
Get-NetTCPConnection -LocalPort 8001 -State Listen | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }

# 或者直接找到终端窗口按 Ctrl+C
```

### 关闭前端

在前端终端窗口按 `Ctrl+C` 即可。

## 首次使用

1. 打开 `http://localhost:5173`
2. 点击右上角「刷新数据」按钮（或者调用 `curl -X POST http://127.0.0.1:8001/api/v1/refresh`）
3. 等待 1-2 分钟（爬取数据 + DeepSeek 生成产业链逻辑）
4. 刷新页面，点击任意题材查看上中下游产业链和成分股

## 数据刷新逻辑

- **日常刷新**（点击按钮）：爬最新行情数据，已有产业链分析的概念直接复用（不消耗 LLM token）
- **强制全量**：`POST /api/v1/refresh?force=true` 重新分析所有概念
- **自动调度**：每个交易日 16:00 自动执行

## API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/topics` | 题材列表（分页，`?page=1&page_size=20`） |
| GET | `/api/v1/topics/hot` | 今日最热 Top N（`?limit=10`） |
| GET | `/api/v1/topics/{id}` | 题材详情（含产业链+成分股分组） |
| GET | `/api/v1/stocks/{code}` | 个股所属题材和逻辑 |
| POST | `/api/v1/refresh` | 手动刷新（`?force=true` 强制重跑 LLM） |
| GET | `/api/v1/update-log` | 最近更新日志 |
| GET | `/api/v1/dates` | 有数据的日期列表 |

## 故障排查

**端口被占用**
```bash
# 查看占用端口的进程
netstat -ano | findstr :8001
# 杀掉进程（替换 PID）
taskkill /F /PID 你的PID
# 或者换个端口启动
uvicorn main:app --port 8002
```

**爬虫连不上东方财富**
- 检查网络是否正常：`curl https://push2.eastmoney.com`
- 如果在境外，可能需要开代理；如果在境内，关掉代理试试
- 爬虫自带重试 + 代理/直连自适应

**前端代理不通**
- 确保后端已启动且端口正确
- `frontend/vite.config.ts` 中 `target` 指向后端地址

**数据为空**
- 先点「刷新数据」触发首次抓取
- 查看后端终端日志确认爬虫和 LLM 状态

## 免责

AI 生成内容仅供参考，不构成投资建议。
