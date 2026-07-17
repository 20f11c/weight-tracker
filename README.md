# 轻体记录

> 一款简洁优雅的体重记录与管理应用

轻体记录是一款基于 Ionic React + Capacitor 构建的 Android 原生应用，帮助你轻松记录每日体重、追踪健康趋势、达成理想目标。

## ✨ 主要功能

- **每日体重记录** — 支持早/晚称重，自动计算日均体重
- **BMI 智能计算** — 根据年龄、性别自动评估 BMI 等级（成人/老年人标准）
- **数据统计与趋势分析** — 周/月/年多维度统计，体重变化趋势一目了然
- **数据导出** — 支持 CSV / JSON 格式导出，方便备份与分析
- **目标体重追踪** — 智能推荐目标体重，可视化展示达标进度

## 🛠 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | React 19 + TypeScript |
| UI 组件库 | Ionic React 8 |
| 构建工具 | Vite 8 |
| 移动端框架 | Capacitor 8 |
| 数据库 | @capacitor-community/sqlite（原生 SQLite） |
| 图表库 | ECharts 6 |
| 日期处理 | dayjs |
| 状态管理 | Zustand 5 |
| 路由 | react-router-dom v5 |

## 📁 项目结构

```
src/
├── App.tsx                    # 应用入口，路由配置与原生功能初始化
├── main.tsx                   # React 挂载入口
├── index.css                  # 全局样式
├── constants.ts               # 常量定义（数据库名、BMI 标准、配色等）
├── types.ts                   # TypeScript 类型定义
├── hooks.ts                   # 自定义 Hooks
│
├── db-connection.ts           # SQLite 数据库连接管理
├── db-migrations.ts           # 数据库迁移脚本
├── db-dailyWeight.ts          # 每日体重数据访问层（CRUD）
├── db-userProfile.ts          # 用户资料数据访问层
│
├── useUserStore.ts            # 用户状态管理（Zustand Store）
├── useWeightStore.ts          # 体重记录状态管理（Zustand Store）
│
├── page-Setup.tsx             # 初始设置页（首次使用时填写个人信息）
├── page-Home.tsx              # 首页（今日体重、BMI 卡片、快速记录）
├── page-History.tsx           # 历史记录页（查看与管理过往记录）
├── page-Statistics.tsx        # 统计分析页（周/月/年图表与趋势）
├── page-Settings.tsx          # 设置页（个人资料修改、数据导出）
│
├── comp-WeightInput.tsx       # 体重输入组件
├── comp-WeightChart.tsx       # 体重趋势图表组件
├── comp-BMICard.tsx           # BMI 展示卡片组件
├── comp-StatsCard.tsx         # 统计数据卡片组件
├── comp-PeriodCompareChart.tsx # 周期对比图表组件
│
├── utils-bmi.ts               # BMI 计算与目标体重工具函数
├── utils-dateHelper.ts        # 日期处理工具函数
├── utils-statistics.ts        # 统计分析工具函数
├── utils-exportData.ts        # 数据导出工具函数（CSV/JSON）
│
├── assets/                    # 静态资源（Logo、启动图标等）
└── vite-env.d.ts              # Vite 类型声明
```

## 🚀 快速开始

### 环境要求

- **Node.js** >= 22
- **Java** 21（Temurin 推荐）
- **Android SDK**（建议通过 Android Studio 安装）

### 安装与运行

```bash
# 1. 克隆项目
git clone https://github.com/your-username/weight-tracker.git
cd weight-tracker

# 2. 安装依赖
npm install

# 3. 启动开发服务器（浏览器预览）
npm run dev

# 4. 构建生产版本
npm run build

# 5. 同步 Web 资源到 Android 平台
npx cap sync android

# 6. 构建 APK
cd android
./gradlew assembleDebug    # Debug APK
./gradlew assembleRelease  # Release APK
```

### 常用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动 Vite 开发服务器 |
| `npm run build` | TypeScript 编译 + Vite 打包 |
| `npm run lint` | 使用 oxlint 进行代码检查 |
| `npm run preview` | 启动 Vite 预览服务 |

## 📦 发布流程

项目通过 **GitHub Actions** 实现自动构建与发布：

```bash
# 1. 更新 package.json 中的版本号
# 2. 创建并推送 tag
git tag v1.x.x
git push origin v1.x.x
```

推送 tag 后将自动触发 CI 流程：

1. 安装依赖（`npm ci`）
2. 构建 Web 资源（`npm run build`）
3. 同步 Capacitor（`npx cap sync android`）
4. 构建 Release APK（`./gradlew assembleRelease`）
5. 自动创建 GitHub Release 并上传 APK

也可以手动触发：在 GitHub Actions 页面选择 **Build and Release APK** 工作流，点击 **Run workflow**。

## 🏗 项目架构

### 数据流

```
UI 页面 (page-*.tsx)
    ↓
Zustand Store (useUserStore / useWeightStore)
    ↓
数据访问层 (db-*.ts)
    ↓
@capacitor-community/sqlite → 原生 SQLite 数据库
```

### 页面说明

| 页面 | 路径 | 说明 |
|------|------|------|
| Setup | `/setup` | 首次使用引导页，填写身高、体重、性别、出生日期 |
| Home | `/` | 首页，展示今日体重、BMI、日环比、快速录入 |
| History | `/history` | 历史记录列表，支持查看与删除 |
| Statistics | `/statistics` | 统计分析，周/月/年趋势图表与周期对比 |
| Settings | `/settings` | 个人设置，修改资料与数据导出 |

### 底部导航

应用使用三 Tab 导航结构：**首页** / **历史** / **统计**，设置页通过首页入口跳转。

## 📸 截图

| 首页 | 历史记录 | 统计分析 |
|------|---------|---------|
| ![首页](docs/screenshots/home.png) | ![历史记录](docs/screenshots/history.png) | ![统计分析](docs/screenshots/statistics.png) |

## 📄 许可证

本项目基于 [MIT License](LICENSE) 开源。
