/**
 * IPFS and Product Metadata Utilities
 */

import { PinataSDK } from "pinata";

export interface ProductMetadata {
  name: string;
  description: string;
  image?: string;
  diseases: number[]; // Covered disease IDs
  category?: string;
  terms?: string; // Insurance terms
  [key: string]: any;
}

// Initialize Pinata SDK client
let pinataInstance: PinataSDK | null = null;

function getPinataClient(): PinataSDK | null {
  if (!import.meta.env.VITE_PINATA_JWT) {
    return null;
  }
  
  if (!pinataInstance) {
    pinataInstance = new PinataSDK({
      pinataJwt: import.meta.env.VITE_PINATA_JWT,
      pinataGateway: import.meta.env.VITE_PINATA_GATEWAY,
    });
  }
  
  return pinataInstance;
}

/**
 * Fetch product metadata from URI
 * Supports IPFS, HTTP, and data URI
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
    
    console.warn("Unknown URI format:", uri);
    return getDefaultMetadata();
  } catch (error) {
    console.error("Failed to fetch product metadata:", error);
    return getDefaultMetadata();
  }
}

/**
 * Fetch metadata from IPFS
 */
async function fetchFromIPFS(uri: string): Promise<ProductMetadata> {
  const cid = uri.replace("ipfs://", "");
  
  // 优先使用配置的 Pinata 网关
  const pinataGateway = import.meta.env.VITE_PINATA_GATEWAY;
  const gateways = pinataGateway 
    ? [
        `https://${pinataGateway}/ipfs/${cid}`,
        `https://ipfs.io/ipfs/${cid}`,
        `https://cloudflare-ipfs.com/ipfs/${cid}`,
        `https://gateway.pinata.cloud/ipfs/${cid}`,
      ]
    : [
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
      console.warn(`IPFS gateway failed: ${gateway}`, error);
    }
  }
  
  throw new Error("All IPFS gateways are unreachable");
}

/**
 * 从 HTTP(S) URL 获取元数据
 */
async function fetchFromHTTP(uri: string): Promise<ProductMetadata> {
  const response = await fetch(uri);
  if (!response.ok) {
    throw new Error(`HTTP request failed: ${response.status}`);
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
 * Get default metadata (when loading fails)
 */
function getDefaultMetadata(): ProductMetadata {
  return {
    name: "Insurance Product",
    description: "Metadata loading failed",
    diseases: [],
  };
}

/**
 * Create data URI for product metadata
 * For testing or non-IPFS scenarios
 */
export function createDataURI(metadata: ProductMetadata): string {
  const jsonString = JSON.stringify(metadata);
  const base64 = btoa(jsonString);
  return `data:application/json;base64,${base64}`;
}

/**
 * Upload file to IPFS (using Pinata SDK)
 */
export async function uploadFileToIPFS(file: File): Promise<{
  cid: string;
  url: string;
  ipfsUri: string;
}> {
  const pinata = getPinataClient();
  
  if (!pinata) {
    throw new Error("Pinata not configured. Please set VITE_PINATA_JWT and VITE_PINATA_GATEWAY in .env");
  }

  try {
    const result = await pinata.upload.public
      .file(file)
      .name(file.name)
      .keyvalues({ app: "zk-medical-insurance", type: "file" });
    
    const gateway = import.meta.env.VITE_PINATA_GATEWAY;
    
    return {
      cid: result.cid,
      url: `https://${gateway}/ipfs/${result.cid}`,
      ipfsUri: `ipfs://${result.cid}`,
    };
  } catch (error) {
    console.error("Failed to upload file to IPFS:", error);
    throw error;
  }
}

/**
 * Upload product metadata to IPFS (using Pinata SDK)
 */
export async function uploadMetadataToIPFS(metadata: ProductMetadata): Promise<{
  cid: string;
  url: string;
  ipfsUri: string;
}> {
  const pinata = getPinataClient();
  
  if (!pinata) {
    console.warn("Pinata not configured, falling back to data URI");
    const dataUri = createDataURI(metadata);
    return {
      cid: "",
      url: dataUri,
      ipfsUri: dataUri,
    };
  }

  try {
    const result = await pinata.upload.public
      .json(metadata)
      .name(`product-${metadata.name}-${Date.now()}`)
      .keyvalues({ app: "zk-medical-insurance", type: "metadata" });
    
    const gateway = import.meta.env.VITE_PINATA_GATEWAY;
    
    return {
      cid: result.cid,
      url: `https://${gateway}/ipfs/${result.cid}`,
      ipfsUri: `ipfs://${result.cid}`,
    };
  } catch (error) {
    console.error("Failed to upload metadata to IPFS:", error);
    // Fallback to data URI
    console.warn("Falling back to data URI");
    const dataUri = createDataURI(metadata);
    return {
      cid: "",
      url: dataUri,
      ipfsUri: dataUri,
    };
  }
}

/**
 * Legacy uploadToIPFS function (for compatibility)
 * @deprecated Use uploadMetadataToIPFS instead
 */
export async function uploadToIPFS(
  metadata: ProductMetadata,
  _apiKey?: string // 已弃用的参数，使用下划线前缀避免警告
): Promise<string> {
  const result = await uploadMetadataToIPFS(metadata);
  return result.ipfsUri;
}

/**
 * Validate metadata format
 */
export function validateMetadata(metadata: any): metadata is ProductMetadata {
  return (
    typeof metadata === "object" &&
    typeof metadata.name === "string" &&
    typeof metadata.description === "string" &&
    Array.isArray(metadata.diseases)
  );
}
