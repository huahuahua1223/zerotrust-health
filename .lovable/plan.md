

# 多语言系统迁移计划：使用 react-i18next

## 概述

将当前自定义的 Context-based i18n 实现迁移到工业标准的 `react-i18next` 库，同时为所有页面添加完整的中英文翻译支持。

## 当前状态分析

### 现有实现
- 使用自定义 React Context (`src/locales/index.tsx`)
- 语言文件：`src/locales/en.ts` 和 `src/locales/zh.ts`
- 通过 `useI18n()` 和 `useTranslation()` hooks 访问翻译

### 需要翻译的硬编码字符串

经过代码审查，以下页面包含大量未翻译的英文字符串：

1. **PolicyDetail.tsx** - "Policy Information", "Product Description", "Start Date", "End Date", "Policy Holder", "Days Remaining", "Claims Summary", "Total Claims", "Amount Claimed", "Remaining Coverage", "Quick Actions", "View Product Details", "View My Claims"

2. **ClaimDetail.tsx** - "Claim Timeline", "Claim Submitted", "ZK Proof Verified", "Claim Approved", "Payment Processed", "Claim Details", "Disease Type", "Uploaded Documents", "ZK Proof", "Proof Hash", "Claimant"

3. **ProductDetail.tsx** - "Purchase Policy", "Total", "Insurer", "What's Covered", "Approve USDT", "Buy Policy", "Start Purchase", "Purchase Successful", "View My Policies"

4. **CreateProduct.tsx** - "Product Details", "Product Name", "Description", "Duration (Days)", "Initial Pool Funding", "Continue to Review", "Review & Confirm", "Product Created!", "View My Products", "Create Another", "Creating a Product"

5. **InsurerClaimDetail.tsx** - "Review Claim", "ZK Proof Verified", "Claim Information", "Verified At", "Associated Policy", "Claimant", "Approve Claim", "Reject Claim", "Rejection Reason"

6. **InsurerDashboard.tsx** - "My Products", "Active Policies", "Pending Claims", "Total Pool Balance", "Pending Review", "ZK Verified", "Recent Claims", "View All"

7. **InsurerProducts.tsx** - "Create New Product", "Product Name", "Premium", "Coverage", "Policies Sold", "Pool Balance", "Fund Pool", "Settings", "Current Balance"

8. **InsurerClaims.tsx** - "Pending Review", "Ready to Pay", "Processed", "No pending claims", "No claims ready for payment"

9. **AdminRoles.tsx** - "Total Admins", "Total Insurers", "Search by address", "Role Assignments", "Grant Role", "Revoke Role", "Wallet Address", "Admin", "Insurer"

10. **AdminSystem.tsx** - "Contract Status", "Emergency Controls", "Contract Paused", "Update ZK Verifier", "Resume Contract", "Pause Contract", "Admin Permissions"

---

## 技术方案

### 1. 配置 react-i18next

创建标准的 i18next 配置，支持：
- 语言检测（浏览器语言 + localStorage）
- 命名空间分离（按功能模块）
- 类型安全的翻译键

### 2. 语言文件重构

将翻译按命名空间组织：
- `common` - 通用文本
- `nav` - 导航
- `home` - 首页
- `products` - 产品相关
- `policies` - 保单相关
- `claims` - 理赔相关
- `claimForm` - 理赔表单
- `insurer` - 保险公司面板
- `admin` - 管理员面板
- `footer` - 页脚
- `errors` - 错误信息

### 3. 页面迁移

更新所有页面使用 `useTranslation()` hook：
```typescript
import { useTranslation } from 'react-i18next';

function Component() {
  const { t } = useTranslation();
  return <h1>{t('policies.title')}</h1>;
}
```

---

## 实施步骤

### 步骤 1：配置 i18next

创建 `src/i18n/index.ts`：
- 初始化 i18next
- 配置语言检测
- 加载翻译资源

### 步骤 2：创建新的翻译文件

**英文翻译 (`src/i18n/locales/en.json`)**：
- 包含所有现有翻译
- 添加所有页面缺失的翻译键
- 约 300+ 个翻译键

**中文翻译 (`src/i18n/locales/zh.json`)**：
- 对应英文的所有翻译键
- 完整的中文翻译

### 步骤 3：创建类型声明

`src/i18n/types.ts`：
- 定义翻译键类型
- 确保类型安全

### 步骤 4：更新入口文件

修改 `src/main.tsx`：
- 导入 i18n 配置
- 移除旧的 I18nProvider

### 步骤 5：更新所有页面组件

更新以下 15 个文件：
1. `src/pages/Index.tsx`
2. `src/pages/Products.tsx`
3. `src/pages/ProductDetail.tsx`
4. `src/pages/MyPolicies.tsx`
5. `src/pages/PolicyDetail.tsx`
6. `src/pages/MyClaims.tsx`
7. `src/pages/ClaimDetail.tsx`
8. `src/pages/SubmitClaim.tsx`
9. `src/pages/insurer/Dashboard.tsx`
10. `src/pages/insurer/Products.tsx`
11. `src/pages/insurer/Claims.tsx`
12. `src/pages/insurer/CreateProduct.tsx`
13. `src/pages/insurer/ClaimDetail.tsx`
14. `src/pages/admin/Roles.tsx`
15. `src/pages/admin/System.tsx`

### 步骤 6：更新布局组件

更新以下文件：
1. `src/components/layout/Header.tsx`
2. `src/components/layout/Footer.tsx`

### 步骤 7：清理旧代码

删除：
- `src/locales/index.tsx`
- `src/locales/en.ts`
- `src/locales/zh.ts`

---

## 新翻译键预览

### 新增的主要翻译键

```json
{
  "policyDetail": {
    "policyInfo": "Policy Information / 保单信息",
    "productDescription": "Product Description / 产品描述",
    "startDate": "Start Date / 开始日期",
    "endDate": "End Date / 结束日期",
    "policyHolder": "Policy Holder / 保单持有人",
    "daysRemaining": "Days Remaining / 剩余天数",
    "claimsSummary": "Claims Summary / 理赔摘要",
    "totalClaims": "Total Claims / 理赔总数",
    "amountClaimed": "Amount Claimed / 已理赔金额",
    "remainingCoverage": "Remaining Coverage / 剩余保额",
    "quickActions": "Quick Actions / 快捷操作",
    "viewProductDetails": "View Product Details / 查看产品详情",
    "viewMyClaims": "View My Claims / 查看我的理赔"
  },
  "claimDetail": {
    "claimTimeline": "Claim Timeline / 理赔时间线",
    "claimSubmitted": "Claim Submitted / 理赔已提交",
    "zkProofVerified": "ZK Proof Verified / ZK证明已验证",
    "claimApproved": "Claim Approved / 理赔已批准",
    "paymentProcessed": "Payment Processed / 付款已处理",
    "uploadedDocs": "Uploaded Documents / 已上传文件",
    "proofHash": "Proof Hash / 证明哈希"
  },
  "productDetail": {
    "purchasePolicy": "Purchase Policy / 购买保单",
    "total": "Total / 总计",
    "whatsCovered": "What's Covered / 保障范围",
    "approveUsdt": "Approve USDT / 授权 USDT",
    "buyPolicy": "Buy Policy / 购买保单",
    "purchaseSuccessful": "Purchase Successful! / 购买成功！",
    "viewMyPolicies": "View My Policies / 查看我的保单"
  },
  "insurerDashboard": {
    "myProducts": "My Products / 我的产品",
    "activePolicies": "Active Policies / 活跃保单",
    "pendingClaims": "Pending Claims / 待审理赔",
    "totalPoolBalance": "Total Pool Balance / 资金池总余额",
    "recentClaims": "Recent Claims / 近期理赔"
  },
  "adminSystem": {
    "contractStatus": "Contract Status / 合约状态",
    "emergencyControls": "Emergency Controls / 紧急控制",
    "updateVerifier": "Update ZK Verifier / 更新 ZK 验证器",
    "resumeContract": "Resume Contract / 恢复合约",
    "pauseContract": "Pause Contract / 暂停合约"
  }
}
```

---

## 预期成果

完成迁移后：

1. **使用标准库**：采用 react-i18next，更易维护和扩展
2. **完整翻译覆盖**：所有页面 100% 支持中英文
3. **类型安全**：翻译键有 TypeScript 类型检查
4. **更好的开发体验**：支持 IDE 自动补全
5. **语言持久化**：用户选择的语言会保存在 localStorage
6. **浏览器语言检测**：首次访问自动检测用户浏览器语言

---

## 技术细节

### i18next 配置选项

```typescript
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { en: {...}, zh: {...} },
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    }
  });
```

### Header 语言切换按钮

```typescript
const { i18n } = useTranslation();
const toggleLanguage = () => {
  i18n.changeLanguage(i18n.language === 'en' ? 'zh' : 'en');
};
```

