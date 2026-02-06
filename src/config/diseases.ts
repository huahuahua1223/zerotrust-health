/**
 * Disease Configuration
 * 疾病配置 - 用于保险产品的疾病覆盖范围
 */

export interface Disease {
  id: number;
  nameKey: string;      // 翻译键，如 "diseases.101"
  categoryKey: string;  // 类别翻译键，如 "diseaseCategories.common"
}

/**
 * 疾病列表
 * 包含所有支持的疾病 ID 及其对应的翻译键
 */
export const DISEASE_LIST: Disease[] = [
  // 常见病 (101-103)
  { id: 101, nameKey: "diseases.101", categoryKey: "diseaseCategories.common" },
  { id: 102, nameKey: "diseases.102", categoryKey: "diseaseCategories.common" },
  { id: 103, nameKey: "diseases.103", categoryKey: "diseaseCategories.common" },
  
  // 呼吸系统 (104)
  { id: 104, nameKey: "diseases.104", categoryKey: "diseaseCategories.respiratory" },
  
  // 消化系统 (105-106)
  { id: 105, nameKey: "diseases.105", categoryKey: "diseaseCategories.digestive" },
  { id: 106, nameKey: "diseases.106", categoryKey: "diseaseCategories.digestive" },
  
  // 心血管 (107, 109-110)
  { id: 107, nameKey: "diseases.107", categoryKey: "diseaseCategories.cardiovascular" },
  { id: 109, nameKey: "diseases.109", categoryKey: "diseaseCategories.cardiovascular" },
  { id: 110, nameKey: "diseases.110", categoryKey: "diseaseCategories.cardiovascular" },
  
  // 代谢疾病 (108)
  { id: 108, nameKey: "diseases.108", categoryKey: "diseaseCategories.metabolic" },
  
  // 外伤 (201-202)
  { id: 201, nameKey: "diseases.201", categoryKey: "diseaseCategories.trauma" },
  { id: 202, nameKey: "diseases.202", categoryKey: "diseaseCategories.trauma" },
  
  // 肿瘤 (203)
  { id: 203, nameKey: "diseases.203", categoryKey: "diseaseCategories.cancer" },
  
  // 肝脏疾病 (301)
  { id: 301, nameKey: "diseases.301", categoryKey: "diseaseCategories.liver" },
  
  // 肾脏疾病 (302)
  { id: 302, nameKey: "diseases.302", categoryKey: "diseaseCategories.kidney" },
  
  // 急症 (401-403)
  { id: 401, nameKey: "diseases.401", categoryKey: "diseaseCategories.emergency" },
  { id: 402, nameKey: "diseases.402", categoryKey: "diseaseCategories.emergency" },
  { id: 403, nameKey: "diseases.403", categoryKey: "diseaseCategories.emergency" },
];

/**
 * 根据疾病 ID 获取疾病信息
 * @param id 疾病 ID
 * @returns 疾病信息，如果未找到则返回 undefined
 */
export function getDiseaseById(id: number): Disease | undefined {
  return DISEASE_LIST.find(d => d.id === id);
}

/**
 * 获取所有疾病 ID
 * @returns 疾病 ID 数组
 */
export function getAllDiseaseIds(): number[] {
  return DISEASE_LIST.map(d => d.id);
}

/**
 * 根据类别获取疾病列表
 * @param categoryKey 类别翻译键
 * @returns 该类别下的所有疾病
 */
export function getDiseasesByCategory(categoryKey: string): Disease[] {
  return DISEASE_LIST.filter(d => d.categoryKey === categoryKey);
}
