# 垃圾分类答题闯关游戏

一个基于 Vite + React 18 + TypeScript 的垃圾分类知识答题闯关小游戏，纯前端，数据存浏览器 localStorage。

## 功能特点

- **关卡闯关**：22个关卡，每关10题，逐关解锁
- **答题挑战**：15秒倒计时 + 3条命 + 连击特效
- **星级评价**：根据正确率获得1-3星评价
- **错题本**：自动记录错题，支持错题重练
- **个人中心**：累计闯关数、总正确率、错题统计
- **本地排行榜**：记录最佳成绩
- **220+ 题目**：覆盖可回收物、有害垃圾、厨余垃圾、其他垃圾

## 技术栈

- Vite 5
- React 18
- TypeScript 5
- 纯 CSS（写在 index.html 中）
- localStorage 持久化

## 快速开始

```bash
npm install
npm run dev
```

浏览器访问 http://localhost:5180。可通过 `VITE_PORT` 覆盖默认端口。

## 构建部署

```bash
npm run build
npm run preview
```

## 项目结构

```
├── index.html          # 入口 HTML + 全局样式
├── package.json
├── vite.config.ts
├── tsconfig.json
└── src/
    ├── main.tsx          # React 入口
    ├── App.tsx           # 路由管理
    ├── types.ts          # 类型定义
    ├── data/
    │   └── questions.ts  # 220+ 道垃圾分类题目
    ├── utils/
    │   └── storage.ts    # localStorage 数据管理
    ├── pages/
    │   ├── Home.tsx      # 关卡列表首页
    │   ├── Quiz.tsx      # 答题页面
    │   ├── Result.tsx    # 单关结果
    │   ├── Profile.tsx   # 个人中心
    │   └── Mistakes.tsx  # 错题本练习
    └── components/
        ├── ProgressBar.tsx  # 进度条
        ├── Lives.tsx        # 生命值显示
        ├── Timer.tsx        # 倒计时
        └── ComboPopup.tsx   # 连击特效
```
