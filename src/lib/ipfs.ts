/**
 * IPFS and Product Metadata Utilities
 * IPFS 和产品元数据工具
 */

export interface ProductMetadata {
  name: string;
  description: string;
  image?: string;
  diseases: number[]; // 覆盖的疾病 ID 列表
  category?: string;
  terms?: string; // 保险条款
  [key: string]: any;
}

/**
 * 从 URI 获取产品元数据
 * 支持 IPFS、HTTP 和 data URI
 */
export async function fetchProductMetadata(uri: string): Promise<ProductMetadata> {
  if (!uri) {
    return getDefaultMetadata();
  }

  try {
    if (uri.startsWith("ipfs://")) {
      return await fetchFromIPFS(uri);
    }
    
    if (uri.startsWith("data:application/json")) {
      return fetchFromDataURI(uri);
    }
    
    if (uri.startsWith("http://") || uri.startsWith("https://")) {
      return await fetchFromHTTP(uri);
    }
    
    console.warn("未知的 URI 格式:", uri);
    return getDefaultMetadata();
  } catch (error) {
    console.error("获取产品元数据失败:", error);
    return getDefaultMetadata();
  }
}

/**
 * 从 IPFS 获取元数据
 */
async function fetchFromIPFS(uri: string): Promise<ProductMetadata> {
  const cid = uri.replace("ipfs://", "");
  
  // 尝试多个 IPFS 网关
  const gateways = [
    `https://ipfs.io/ipfs/${cid}`,
    `https://cloudflare-ipfs.com/ipfs/${cid}`,
    `https://gateway.pinata.cloud/ipfs/${cid}`,
  ];
  
  for (const gateway of gateways) {
    try {
      const response = await fetch(gateway, { timeout: 5000 } as any);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn(`IPFS 网关失败: ${gateway}`, error);
    }
  }
  
  throw new Error("所有 IPFS 网关都无法访问");
}

/**
 * 从 HTTP(S) URL 获取元数据
 */
async function fetchFromHTTP(uri: string): Promise<ProductMetadata> {
  const response = await fetch(uri);
  if (!response.ok) {
    throw new Error(`HTTP 请求失败: ${response.status}`);
  }
  return await response.json();
}

/**
 * 从 data URI 解析元数据
 */
function fetchFromDataURI(uri: string): ProductMetadata {
  const base64Data = uri.split(",")[1];
  const jsonString = atob(base64Data);
  return JSON.parse(jsonString);
}

/**
 * 获取默认元数据（当无法加载时）
 */
function getDefaultMetadata(): ProductMetadata {
  return {
    name: "保险产品",
    description: "元数据加载失败",
    diseases: [],
  };
}

/**
 * 创建产品元数据的 data URI
 * 用于测试或不使用 IPFS 的场景
 */
export function createDataURI(metadata: ProductMetadata): string {
  const jsonString = JSON.stringify(metadata);
  const base64 = btoa(jsonString);
  return `data:application/json;base64,${base64}`;
}

/**
 * 上传产品元数据到 IPFS
 * 需要 Pinata API Key 或其他 IPFS 服务
 */
export async function uploadToIPFS(
  metadata: ProductMetadata,
  apiKey?: string
): Promise<string> {
  if (!apiKey) {
    console.warn("未配置 IPFS API Key，使用 data URI 替代");
    return createDataURI(metadata);
  }

  try {
    // 使用 Pinata API 上传
    const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        pinataContent: metadata,
        pinataMetadata: {
          name: `product_${metadata.name}_${Date.now()}`,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Pinata 上传失败: ${response.status}`);
    }

    const result = await response.json();
    return `ipfs://${result.IpfsHash}`;
  } catch (error) {
    console.error("IPFS 上传失败:", error);
    // 降级到 data URI
    return createDataURI(metadata);
  }
}

/**
 * 验证元数据格式
 */
export function validateMetadata(metadata: any): metadata is ProductMetadata {
  return (
    typeof metadata === "object" &&
    typeof metadata.name === "string" &&
    typeof metadata.description === "string" &&
    Array.isArray(metadata.diseases)
  );
}
