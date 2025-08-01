# SOTI Clone - 设备管理系统

一个基于 React + SQLite 的设备管理系统，支持打印机设备的添加、管理和监控。

## 功能特性

- 🖨️ **打印机管理** - 添加、查看、删除打印机设备
- 📊 **实时统计** - 设备状态统计和可视化
- 🎨 **现代化UI** - 基于 Tailwind CSS 的美观界面
- 🔄 **实时更新** - 设备状态实时监控
- 💾 **数据持久化** - 使用 SQLite 数据库存储设备信息

## 技术栈

### 前端
- React 19
- Vite
- Tailwind CSS
- Chart.js

### 后端
- Node.js
- Express
- SQLite3
- CORS

## 快速开始

### 1. 安装依赖

```bash
# 安装前端依赖
npm install

# 安装后端依赖
cd server
npm install
cd ..
```

### 2. 启动开发服务器

```bash
# 同时启动前端和后端（推荐）
npm run dev:full

# 或者分别启动
npm run server:dev  # 启动后端服务器 (端口 3001)
npm run dev         # 启动前端开发服务器 (端口 5173)
```

### 3. 访问应用

- 前端: http://localhost:5173
- 后端API: http://localhost:3001

## 数据库结构

### printers 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键，自增 |
| name | TEXT | 打印机名称 |
| printer_id | TEXT | 设备ID（唯一） |
| status | TEXT | 设备状态（online/offline/warning） |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

## API 接口

### 打印机管理
- `GET /api/printers` - 获取所有打印机
- `POST /api/printers` - 添加打印机
- `PUT /api/printers/:id/status` - 更新打印机状态
- `DELETE /api/printers/:id` - 删除打印机

### 统计信息
- `GET /api/printers/stats` - 获取打印机统计信息

## 项目结构

```
soti_clone/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── modal.jsx          # 抽象Modal组件
│   │   │   ├── ModelAddPrinter.jsx # 添加打印机Modal
│   │   │   └── ModalManager.jsx   # Modal管理器
│   │   └── layout/
│   ├── services/
│   │   └── api.js                 # API服务
│   └── pages/
│       └── DeviceManagement.jsx   # 设备管理页面
├── server/
│   ├── server.js                  # Express服务器
│   └── package.json              # 后端依赖
└── database.sqlite               # SQLite数据库文件
```

## 开发说明

### 添加新的Modal类型

1. 在 `ModalManager.jsx` 中添加新的Modal状态
2. 创建对应的Modal组件
3. 在 `ModalManager` 中注册新的Modal

### 数据库操作

所有数据库操作都通过后端API进行，前端通过 `apiService` 调用：

```javascript
import apiService from '../services/api.js';

// 添加打印机
const result = await apiService.addPrinter('HP LaserJet', 'HP001');

// 获取所有打印机
const printers = await apiService.getPrinters();
```

## 故障排除

### 数据库连接问题
- 确保 SQLite 已正确安装
- 检查 `server/database.sqlite` 文件权限

### API 连接问题
- 确保后端服务器运行在端口 3001
- 检查 CORS 配置
- 查看浏览器控制台错误信息

## 许可证

MIT License