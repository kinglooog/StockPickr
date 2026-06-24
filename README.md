# 股灵智选 · 热点题材追踪

A股热点题材智能追踪系统。每日自动抓取东方财富概念板块数据，调用 DeepSeek API 生成题材解释 + 上中下游产业链逻辑 + 成分股归因。

## 技术栈

| 层 | 选型 |
|---|------|
| 后端 | FastAPI + SQLAlchemy + SQLite |
| 前端 | React 18 + Vite + TailwindCSS 4 |
| 调度 | APScheduler |
| LLM | DeepSeek API |
| 数据 | 东方财富公开 API |

## 快速启动

```bash
# 1. 克隆项目
git clone https://github.com/kinglooog/StockPickr.git
cd StockPickr

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 填入你的 DeepSeek API Key

# 3. 安装后端依赖
cd backend
pip install -r requirements.txt

# 4. 启动后端
uvicorn main:app --reload

# 5. 新开终端，安装前端依赖
cd frontend
npm install

# 6. 启动前端
npm run dev
```

访问 `http://localhost:5173`

## 使用

- 首次使用点击「手动刷新」或调用 `POST /api/v1/refresh` 触发数据抓取
- 每天 16:00（收盘后）自动刷新
- 在题材详情页查看产业链上中下游逻辑 + 成分股归因

## API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/topics` | 题材列表（分页） |
| GET | `/api/v1/topics/hot` | 今日最热 Top N |
| GET | `/api/v1/topics/{id}` | 题材详情（含产业链+成分股） |
| GET | `/api/v1/stocks/{code}` | 个股所属题材 |
| POST | `/api/v1/refresh` | 手动触发刷新 |
| GET | `/api/v1/update-log` | 更新日志 |
| GET | `/api/v1/dates` | 有数据的日期列表 |

## 免责

AI 生成内容仅供参考，不构成投资建议。
