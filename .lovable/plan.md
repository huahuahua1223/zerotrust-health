
# 合约集成与 Reown AppKit 配置完整计划

## ✅ 已完成

### 第一阶段：Reown AppKit 配置 ✅
- [x] `src/providers/Web3Provider.tsx` - AppKit Provider 配置
- [x] `src/config/wagmi.ts` - Wagmi 适配器配置
- [x] `src/App.tsx` - 集成 Web3Provider
- [x] `src/components/layout/Header.tsx` - AppKit 钱包按钮
- [x] `src/components/web3/WalletButton.tsx` - 钱包连接组件
- [x] `src/components/web3/NetworkSwitch.tsx` - 网络切换组件
- [x] `src/components/web3/TransactionStatus.tsx` - 交易状态显示

### 第二阶段：合约读取 Hooks ✅
- [x] `src/hooks/useContracts.ts` - 扩展读取 hooks
  - useActiveProducts, useActiveProductsWithDetails
  - useProduct, useProducts
  - useUserPolicies, usePolicy, useUserPoliciesWithDetails
  - useUserClaims, useClaim, useUserClaimsWithDetails
  - useInsurerClaims, useInsurerClaimsWithDetails

### 第三阶段：合约写入 Hooks ✅
- [x] `src/hooks/useContractWrites.ts` - 写入操作 hooks
  - useBuyPolicy, useSubmitClaimWithProof
  - useCreateProduct, useFundPool, useSetProductActive
  - useApproveClaim, useRejectClaim, usePayClaim
  - useGrantInsurerRole, useRevokeInsurerRole

### 第四阶段：Token 操作 Hooks ✅
- [x] `src/hooks/useTokenOperations.ts` - ERC20 操作
  - useTokenBalance, useTokenAllowance
  - useTokenApprove, useMintTestToken, useTokenDecimals

### 第五阶段：页面合约集成 ✅
- [x] `src/pages/Products.tsx` - 产品列表（真实数据）
- [x] `src/pages/ProductDetail.tsx` - 产品详情 + 购买流程
- [x] `src/pages/MyPolicies.tsx` - 我的保单（真实数据）
- [x] `src/pages/PolicyDetail.tsx` - 保单详情（真实数据）
- [x] `src/pages/MyClaims.tsx` - 我的理赔（真实数据）
- [x] `src/pages/ClaimDetail.tsx` - 理赔详情（真实数据）
- [x] `src/pages/SubmitClaim.tsx` - 提交理赔（真实合约写入）
- [x] `src/pages/insurer/Dashboard.tsx` - 保险公司仪表板（真实数据）
- [x] `src/pages/insurer/Products.tsx` - 产品管理（注资/激活功能）
- [x] `src/pages/insurer/CreateProduct.tsx` - 创建产品（真实合约写入）
- [x] `src/pages/insurer/Claims.tsx` - 理赔管理（真实数据）
- [x] `src/pages/insurer/ClaimDetail.tsx` - 理赔审批（批准/拒绝/支付）
- [x] `src/pages/admin/Roles.tsx` - 角色管理（授予/撤销保险商角色）
- [x] `src/pages/admin/System.tsx` - 系统管理（合约状态显示）

---

## ✅ 第六阶段：高级功能已完成

### ZK 证明集成 ✅
- [x] `src/lib/zk/proof.ts` - snarkjs 证明生成（支持真实和模拟模式）
- [x] `src/lib/zk/secret.ts` - 用户密钥管理
- [x] `src/lib/zk/merkle.ts` - Merkle 树工具
- [x] `src/lib/zk/index.ts` - 统一导出
- [x] `src/hooks/useZKProof.ts` - ZK 证明 React hook
- [x] `src/types/snarkjs.d.ts` - snarkjs 类型声明

### 事件监听 ✅
- [x] `src/hooks/useContractEvents.ts` - 实时事件监听
  - usePolicyPurchasedEvent, useClaimSubmittedEvent
  - useClaimStatusChangedEvent, useProductCreatedEvent
  - useContractEvents（综合）, useManualRefresh

### 错误处理 ✅
- [x] `src/lib/errors.ts` - 合约错误解析
  - parseContractError, getShortErrorMessage, isRetryableError

---

## 环境变量要求

```env
VITE_REOWN_PROJECT_ID=your_project_id_here
```

需要在 [Reown Cloud](https://cloud.reown.com/) 注册获取 Project ID。

---

## 当前状态

**✅ 所有功能已完成！**

应用现在包含：
- ✅ Reown AppKit 钱包连接
- ✅ 所有页面使用真实合约数据
- ✅ 完整的购买、理赔、审批流程
- ✅ ZK 证明生成（snarkjs 集成，支持模拟模式）
- ✅ 实时事件监听和 UI 更新
- ✅ 用户友好的错误处理

### ZK 证明说明
当前 ZK 证明在没有电路文件（.wasm, .zkey）时使用模拟模式。
要启用真实证明生成，需要将 circom 编译的电路文件放入 `/public/zk/` 目录：
- `medical_claim.wasm`
- `medical_claim_final.zkey`
- `verification_key.json`
