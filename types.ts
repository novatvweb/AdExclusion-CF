export enum Operator {
  EQUALS = 'equals',
  CONTAINS = 'contains'
}

export type ActionType = 'hide' | 'show';

export type TargetingKey = 
  | 'site' 
  | 'keywords' 
  | 'description_url' 
  | 'ads_enabled' 
  | 'page_type' 
  | 'content_id' 
  | 'domain' 
  | 'section' 
  | 'top_section' 
  | 'ab_test';

export interface TargetingData {
  site: string;
  keywords: string[];
  description_url: string;
  ads_enabled: boolean;
  page_type: string;
  content_id: string;
  domain: string;
  section: string;
  top_section: string;
  ab_test: string;
}

export interface BlacklistRule {
  id: string;
  name: string;
  targetKey: TargetingKey;
  operator: Operator;
  value: string;
  targetElementSelector: string;
  action: ActionType; // 'hide' ili 'show'
  isActive: boolean;
  createdAt: number;
}

export interface PageMeta {
  third_party_apps: {
    ntAds: {
      targeting: TargetingData;
    };
  };
}