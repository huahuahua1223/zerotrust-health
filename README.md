# ZeroTrust Health - 前端应用

基于零知识证明的去中心化医疗保险系统前端 DApp，与 [Hardhat-ZKMedicalInsurance](../Hardhat-ZKMedicalInsurance) 智能合约配套使用。

## 🎯 项目简介

本前端是完整的 Web3 DApp，支持三类角色：

- **用户**：浏览保险产品、购买保单、使用零知识证明提交理赔（不暴露疾病信息）、查看保单与理赔状态
- **保险公司**：创建产品、为资金池注资、审批/拒绝/支付理赔、管理产品
- **管理员**：授予/撤销角色、暂停/恢复合约、系统监控

## 🏗️ 技术栈

- **框架**: React 18 + Vite 5 + TypeScript 5
- **Web3**: Wagmi v3 + Viem v2 + Reown AppKit（钱包连接与链上交互）
- **UI**: TailwindCSS + shadcn/ui + Framer Motion
- **路由**: React Router v6
- **状态**: Zustand
- **表单**: React Hook Form + Zod
- **ZK**: SnarkJS + Circomlibjs（浏览器端生成 Groth16 证明）
- **存储**: Pinata IPFS（产品详情与理赔文档）
- **国际化**: i18next（中/英）

## 📦 项目结构

```
zerotrust-health/
├── public/
│   └── zk/                    # ZK 证明文件（需从 Hardhat zkbuild 拷贝 .wasm、.zkey）
├── src/
│   ├── components/
│   │   ├── guards/            # 路由守卫（AdminGuard、InsurerGuard）
│   │   ├── layout/            # MainLayout、Header、Footer
│   │   ├── products/          # ProductCard 等
│   │   ├── ui/                # shadcn/ui 组件
│   │   └── web3/              # WalletButton、NetworkSwitch、TransactionStatus
│   ├── config/
│   │   ├── abis.ts            # 合约 ABI
│   │   ├── contracts.ts       # 按链 ID 的合约地址
│   │   └── diseases.ts        # 疾病列表（与 Merkle 覆盖一致）
│   ├── contracts/             # 合约 JSON（如 ZKMedicalInsurance.json）
│   ├── hooks/
│   │   ├── useContracts.ts    # 合约读操作
│   │   ├── useContractWrites.ts # 合约写操作
│   │   ├── useContractEvents.ts # 事件监听
│   │   ├── useTokenOperations.ts # ERC20 授权/余额
│   │   ├── useUserRoles.ts    # 角色检查（INSURER/ADMIN 等）
│   │   ├── useZKProof.ts      # ZK 证明生成（wasm + zkey）
│   │   └── useZKSecret.ts     # 用户 ZK 密钥管理
│   ├── lib/
│   │   ├── zk/                # Merkle、proof、secret
│   │   ├── errors.ts、ipfs.ts、utils.ts
│   ├── pages/                 # 页面（见下方路由）
│   ├── providers/             # Web3Provider
│   ├── store/                 # Zustand
│   ├── types/                 # TypeScript 类型
│   └── i18n/                  # 中英文案
├── .env.example / .env        # 环境变量
└── package.json
```

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- MetaMask 浏览器扩展

### 安装

```bash
# 克隆项目
git clone <repository-url>
cd zerotrust-health

# 安装依赖
pnpm install
```

### 配置

1. 复制环境变量文件：
```bash
cp .env.example .env
```

2. 编辑 `.env`，填入你的配置：
```env
VITE_REOWN_PROJECT_ID=你的项目ID   # https://cloud.reown.com
VITE_CHAIN_ID=31337
# 部署后填写合约地址（见 .env.example 中的 VITE_CONTRACT_*_31337）
# 可选：VITE_PINATA_JWT、VITE_PINATA_GATEWAY 用于 IPFS
```

3. 确保合约端已就绪（在 `Hardhat-ZKMedicalInsurance` 目录）：
```bash
pnpm node              # 启动本地节点
pnpm deploy:local      # 部署合约
pnpm init:accounts     # 为测试账户 mint 代币
```
将部署输出的合约地址填入前端的 `.env`（`VITE_CONTRACT_INSURANCE_MANAGER_31337` 等）。

4. ZK 证明文件：将 `Hardhat-ZKMedicalInsurance/zkbuild/` 下的 `medical_claim.wasm`、`medical_claim_final.zkey` 拷贝到本项目的 `public/zk/`，否则提交理赔时无法在浏览器中生成证明。

### 开发

```bash
pnpm dev
```

访问 http://localhost:8080

### 构建

```bash
pnpm build
```

### 测试

```bash
pnpm test
```

## 🔑 关键功能与路由

### 公开

- `/` - 首页
- `/products` - 产品列表
- `/products/:id` - 产品详情

### 用户（需连接钱包）

- `/my-policies`、`/my-policies/:id` - 我的保单
- `/my-claims` - 我的理赔列表
- `/claims/:id` - 理赔详情
- `/claim/new` - 提交理赔（ZK 证明）

### 保险公司（需 INSURER 角色，InsurerGuard）

- `/insurer/dashboard` - 仪表盘
- `/insurer/products`、`/insurer/products/new` - 产品管理、创建产品
- `/insurer/claims`、`/insurer/claims/:id` - 理赔列表、审批/拒绝/支付

### 管理员（需 DEFAULT_ADMIN_ROLE，AdminGuard）

- `/admin/roles` - 角色管理
- `/admin/system` - 系统（暂停/恢复等）

## 🔐 零知识证明

前端使用与链上 **Groth16Verifier** 一致的电路在浏览器中生成证明：

- 用户提交理赔时**不暴露疾病 ID**，仅证明「疾病在保险覆盖的 Merkle 树中」
- Nullifier 防止同一笔理赔重复提交
- 依赖 `public/zk/medical_claim.wasm` 与 `medical_claim_final.zkey`（须从 Hardhat 项目 `zkbuild/` 拷贝，与当前部署的 Verifier 一致）
- 证明生成在浏览器中完成，需加载约 50MB 的 wasm/zkey，首次可能较慢

## 🌐 支持的网络

- **Hardhat Local** (Chain ID: 31337) - 开发测试
- **Sepolia Testnet** (Chain ID: 11155111) - 测试网部署

## 📱 浏览器支持

- Chrome/Edge >= 90
- Firefox >= 88
- Safari >= 14

需要支持 WebAssembly 和 BigInt。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📝 License

MIT

---

**版本**: 1.0.0  
**最后更新**: 2026-02-07
