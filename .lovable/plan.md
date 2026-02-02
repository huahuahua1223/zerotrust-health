
# 合约集成与 Reown AppKit 配置完整计划

## 项目当前状态总结

### 已完成
- 页面结构和 UI 组件（所有 15 个页面）
- i18n 多语言支持（react-i18next）
- 基础合约配置（地址、ABI）
- 部分读取 Hooks（useActiveProducts, useUserPolicies 等）
- Zustand 状态管理（UI Store, ClaimForm Store）

### 需要实现
1. **Reown AppKit 配置**：替换基础 wagmi 连接器
2. **合约数据接入**：所有页面从 mock 数据切换到真实合约
3. **合约写入操作**：购买保单、提交理赔、审批理赔等
4. **ZK 证明生成**：前端 snarkjs 集成
5. **ERC20 Token 操作**：approve + 交易流程

---

## 第一阶段：Reown AppKit 配置

### 1.1 更新 wagmi 配置文件

修改 `src/config/wagmi.ts`，使用 Reown AppKit：

```text
配置内容：
- 使用 @reown/appkit-adapter-wagmi
- 创建 WagmiAdapter
- 配置 projectId（从环境变量读取）
- 设置 metadata（appName, appDescription, appUrl, appIcon）
- 支持链：Hardhat (31337), Sepolia (11155111)
```

### 1.2 创建 AppKit Provider

创建 `src/providers/Web3Provider.tsx`：

```text
功能：
- 使用 createAppKit 初始化
- 包装 WagmiProvider 和 QueryClientProvider
- 配置钱包功能（email, socials, wallets）
- 设置主题（light/dark）
```

### 1.3 更新 App.tsx

- 替换 WagmiProvider 为 Web3Provider
- 移除手动的连接器配置

### 1.4 更新 Header 组件

- 使用 AppKit 组件 `<appkit-button />` 或 `useAppKit()` hook
- 移除手动实现的钱包连接下拉菜单

---

## 第二阶段：合约读取 Hooks 完善

### 2.1 扩展 useContracts.ts

添加以下 hooks：

```text
// 产品相关
- useProducts()        // 获取所有产品（带详情）
- useProductsPage()    // 分页获取产品
- useProductPool()     // 获取产品资金池余额

// 保单相关  
- usePoliciesPage()    // 分页获取用户保单
- usePolicyDetails()   // 获取完整保单详情（含关联产品）

// 理赔相关
- useClaimsPage()      // 分页获取理赔
- useClaimDetails()    // 获取完整理赔详情

// 保险公司相关
- useInsurerProducts() // 获取保险公司的产品
- useInsurerStats()    // 获取统计数据

// 系统相关
- useContractPaused()  // 检查合约是否暂停
- useVerifierAddress() // 获取验证器地址
```

### 2.2 创建 useContractWrites.ts

合约写入操作 hooks：

```text
// 用户操作
- useBuyPolicy()           // 购买保单
- useSubmitClaimWithProof() // 提交理赔

// 保险公司操作
- useCreateProduct()       // 创建产品
- useFundPool()            // 注资资金池
- useSetProductActive()    // 激活/禁用产品
- useApproveClaim()        // 批准理赔
- useRejectClaim()         // 拒绝理赔
- usePayoutClaim()         // 支付理赔

// 管理员操作
- useGrantRole()           // 授予角色
- useRevokeRole()          // 撤销角色
- usePauseContract()       // 暂停合约
- useUnpauseContract()     // 恢复合约
- useSetVerifier()         // 更新验证器
```

### 2.3 创建 useTokenOperations.ts

ERC20 代币操作：

```text
- useTokenBalance()     // 查询余额
- useTokenAllowance()   // 查询授权额度
- useTokenApprove()     // 授权代币
- useMintTestToken()    // Mint 测试代币（仅开发）
```

---

## 第三阶段：页面合约集成

### 3.1 Products.tsx - 产品列表

替换 mock 数据：

```text
更改：
- 使用 useProducts() 获取真实产品
- 添加 loading skeleton
- 处理空数据和错误状态
- 实现无限滚动或分页
```

### 3.2 ProductDetail.tsx - 产品详情 + 购买

实现购买流程：

```text
更改：
- 使用 useProduct(id) 获取产品详情
- 使用 useProductPool(id) 获取资金池
- 实现真实购买流程：
  1. 检查钱包连接
  2. 检查代币余额
  3. 调用 approve（如果需要）
  4. 调用 buyPolicy
  5. 等待交易确认
  6. 从事件获取 policyId
  7. 跳转到保单详情
```

### 3.3 MyPolicies.tsx - 我的保单

替换 mock 数据：

```text
更改：
- 使用 useUserPolicies() 获取保单 ID 列表
- 批量获取保单详情
- 关联产品信息
- 计算剩余天数和状态
```

### 3.4 PolicyDetail.tsx - 保单详情

替换 mock 数据：

```text
更改：
- 使用 usePolicy(id) 获取保单
- 使用 useProduct(productId) 获取关联产品
- 获取相关理赔记录
```

### 3.5 MyClaims.tsx - 我的理赔

替换 mock 数据：

```text
更改：
- 使用 useUserClaims() 获取理赔 ID 列表
- 批量获取理赔详情
```

### 3.6 ClaimDetail.tsx - 理赔详情

替换 mock 数据：

```text
更改：
- 使用 useClaim(id) 获取理赔详情
- 显示 ZK 证明验证状态
- 显示时间线
```

### 3.7 SubmitClaim.tsx - 提交理赔

实现完整流程：

```text
更改：
- 使用 useUserPolicies() 获取有效保单
- 实现文件上传到 IPFS（或本地哈希）
- 集成 ZK 证明生成（snarkjs）
- 调用 submitClaimWithProof
- 处理交易状态
```

### 3.8 Insurer Dashboard - 保险公司仪表板

替换 mock 数据：

```text
更改：
- 使用 useInsurerProducts() 获取产品统计
- 使用 useInsurerClaims() 获取待审理赔
- 计算总资金池余额
```

### 3.9 Insurer Products - 产品管理

替换 mock 数据并实现功能：

```text
更改：
- 显示保险公司的产品列表
- 实现注资功能（approve + fundPool）
- 实现激活/禁用功能
```

### 3.10 Insurer CreateProduct - 创建产品

实现创建功能：

```text
更改：
- 表单验证
- 调用 createProduct
- 等待交易确认
- 获取新产品 ID
- 跳转到产品详情
```

### 3.11 Insurer Claims - 理赔管理

替换 mock 数据：

```text
更改：
- 获取保险公司相关理赔
- 按状态筛选（待审核、已验证、已批准等）
```

### 3.12 Insurer ClaimDetail - 理赔审批

实现审批功能：

```text
更改：
- 使用 useClaim(id) 获取理赔详情
- 实现批准功能（approveClaim）
- 实现拒绝功能（rejectClaim）
- 实现支付功能（payoutClaim）
```

### 3.13 Admin Roles - 角色管理

实现角色管理：

```text
更改：
- 获取角色列表
- 实现授予角色（grantRole）
- 实现撤销角色（revokeRole）
```

### 3.14 Admin System - 系统管理

实现系统功能：

```text
更改：
- 显示合约状态（是否暂停）
- 实现暂停/恢复合约
- 实现更新验证器地址
```

---

## 第四阶段：ZK 证明集成

### 4.1 创建 ZK 工具函数

创建 `src/lib/zk/proof.ts`：

```text
功能：
- generateProof()        // 生成 ZK 证明
- formatProofForContract() // 格式化证明数据
- SNARK_FIELD 常量
```

### 4.2 创建 Secret 管理

创建 `src/lib/zk/secret.ts`：

```text
功能：
- getOrCreateSecret()    // 获取或创建用户密钥
- backupSecret()         // 备份密钥
- restoreSecret()        // 恢复密钥
```

### 4.3 创建 Merkle 树工具

创建 `src/lib/zk/merkle.ts`：

```text
功能：
- buildMerkleTree()      // 构建 Merkle 树
- getMerkleProof()       // 获取 Merkle 证明
```

### 4.4 创建 useZKProof hook

创建 `src/hooks/useZKProof.ts`：

```text
功能：
- 封装证明生成逻辑
- 处理 loading 状态
- 错误处理
- 进度回调
```

---

## 第五阶段：优化与完善

### 5.1 事件监听

创建 `src/hooks/useContractEvents.ts`：

```text
监听事件：
- PolicyPurchased     // 刷新保单列表
- ClaimSubmitted      // 刷新理赔列表
- ClaimApproved       // 更新理赔状态
- ClaimRejected       // 更新理赔状态
- ClaimPaid           // 更新理赔状态
```

### 5.2 错误处理

创建 `src/lib/errors.ts`：

```text
处理合约错误：
- ProductNotFound
- PolicyNotFound
- ProductNotActive
- PolicyExpired
- AmountExceedsCoverage
- InvalidProof
- NullifierAlreadyUsed
- PoolInsufficient
```

### 5.3 交易状态 UI

创建 `src/components/web3/TransactionStatus.tsx`：

```text
功能：
- 显示交易进度
- 显示交易哈希（可点击跳转区块浏览器）
- 成功/失败状态
```

---

## 文件变更清单

### 新建文件（14 个）
1. `src/providers/Web3Provider.tsx`
2. `src/hooks/useContractWrites.ts`
3. `src/hooks/useTokenOperations.ts`
4. `src/hooks/useZKProof.ts`
5. `src/hooks/useContractEvents.ts`
6. `src/lib/zk/proof.ts`
7. `src/lib/zk/secret.ts`
8. `src/lib/zk/merkle.ts`
9. `src/lib/zk/index.ts`
10. `src/lib/errors.ts`
11. `src/components/web3/TransactionStatus.tsx`
12. `src/components/web3/NetworkGuard.tsx`
13. `src/components/web3/RoleGuard.tsx`
14. `src/components/web3/index.ts`

### 修改文件（18 个）
1. `src/config/wagmi.ts` - AppKit 配置
2. `src/App.tsx` - 使用 Web3Provider
3. `src/hooks/useContracts.ts` - 扩展读取 hooks
4. `src/hooks/index.ts` - 导出新 hooks
5. `src/components/layout/Header.tsx` - AppKit 钱包按钮
6. `src/pages/Products.tsx` - 合约数据
7. `src/pages/ProductDetail.tsx` - 购买流程
8. `src/pages/MyPolicies.tsx` - 合约数据
9. `src/pages/PolicyDetail.tsx` - 合约数据
10. `src/pages/MyClaims.tsx` - 合约数据
11. `src/pages/ClaimDetail.tsx` - 合约数据
12. `src/pages/SubmitClaim.tsx` - ZK 证明 + 提交
13. `src/pages/insurer/Dashboard.tsx` - 合约数据
14. `src/pages/insurer/Products.tsx` - 合约数据 + 功能
15. `src/pages/insurer/CreateProduct.tsx` - 创建功能
16. `src/pages/insurer/Claims.tsx` - 合约数据
17. `src/pages/insurer/ClaimDetail.tsx` - 审批功能
18. `src/pages/admin/Roles.tsx` - 角色管理
19. `src/pages/admin/System.tsx` - 系统管理

---

## 技术要点

### Reown AppKit 配置

```typescript
import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { hardhat, sepolia } from '@reown/appkit/networks'

const projectId = import.meta.env.VITE_REOWN_PROJECT_ID

const wagmiAdapter = new WagmiAdapter({
  networks: [hardhat, sepolia],
  projectId,
})

createAppKit({
  adapters: [wagmiAdapter],
  networks: [hardhat, sepolia],
  projectId,
  metadata: {
    name: 'ZK Medical Insurance',
    description: 'Privacy-preserving medical insurance',
    url: 'https://zk-medical-insurance.app',
    icons: ['https://zk-medical-insurance.app/logo.png']
  },
  features: {
    analytics: true,
    email: false,
    socials: false
  }
})
```

### 合约写入示例

```typescript
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'

export function useBuyPolicy() {
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash })
  
  const buyPolicy = async (productId: bigint) => {
    await writeContract({
      address: INSURANCE_ADDRESS,
      abi: INSURANCE_ABI,
      functionName: 'buyPolicy',
      args: [productId]
    })
  }
  
  return { buyPolicy, isPending, isLoading, isSuccess, hash }
}
```

### ZK 证明生成

```typescript
import { groth16 } from 'snarkjs'

export async function generateProof(input: ClaimInput) {
  const { proof, publicSignals } = await groth16.fullProve(
    input,
    '/zk/medical_claim.wasm',
    '/zk/medical_claim_final.zkey'
  )
  
  return formatProofForContract(proof, publicSignals)
}
```

---

## 环境变量要求

```env
VITE_REOWN_PROJECT_ID=your_project_id_here
```

需要在 Reown Cloud (https://cloud.reown.com/) 注册获取 Project ID。

---

## 预期结果

完成后：
1. 使用 Reown AppKit 提供专业钱包连接体验
2. 所有页面使用真实合约数据
3. 完整的购买、理赔、审批流程
4. ZK 证明生成和验证
5. 实时事件监听和 UI 更新
6. 完善的错误处理和交易状态显示
