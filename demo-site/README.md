# Belief Dynamics in Social Networks

Interactive demo platform for multi-agent belief dynamics simulation with LLM-powered cognitive agents.

## Quick Start

1. Create a public GitHub repository
2. Upload all files from this folder to the repository root
3. Go to Settings → Pages → Source: `main` branch
4. Visit `https://your-username.github.io/repo-name`

## File Structure

```
├── index.html
├── css/style.css
├── js/
│   ├── data.js
│   └── app.js
└── data/
    ├── experiment_config.json    # Agent cognitive profiles
    └── llm_responses.json        # LLM interaction records
```

## Data Files

Replace files in `data/` folder to display different experiments.

- **experiment_config.json** - Agent configuration with cognitive modeling parameters
- **llm_responses.json** - LLM responses including attitude scores and change reasons

## Features

- Experiment workflow demo
- LLM response viewer (by round)
- Attitude trajectory chart
- Change reason timeline
- Network topology visualization

## Tech Stack

HTML5, CSS3, Chart.js, D3.js - Pure static, no backend required.

---

# 社会网络中的信念动态变化

基于LLM认知智能体的多智能体信念动态仿真交互展示平台。

## 快速开始

1. 创建一个公开的 GitHub 仓库
2. 将此文件夹中的所有文件上传到仓库根目录
3. 进入 Settings → Pages → Source 选择 `main` 分支
4. 访问 `https://你的用户名.github.io/仓库名`

## 文件结构

```
├── index.html
├── css/style.css
├── js/
│   ├── data.js
│   └── app.js
└── data/
    ├── experiment_config.json    # 智能体认知建模配置
    └── llm_responses.json        # LLM交互记录
```

## 数据文件

替换 `data/` 文件夹中的文件即可展示不同实验。

- **experiment_config.json** - 智能体配置，包含认知建模参数（从众性、信任度、开放性等）
- **llm_responses.json** - LLM响应记录，包含态度分数、变化原因、智能体交互内容

## 功能模块

- 实验配置执行流程演示
- LLM响应查看器（按轮次）
- 态度变化轨迹图
- 变化原因时间线
- 网络拓扑可视化（全连接/小世界/稀疏网络）

## 技术栈

HTML5, CSS3, Chart.js, D3.js - 纯静态网站，无需后端。
