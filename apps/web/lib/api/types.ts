export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'RISK_MANAGER' | 'VIEWER';
  createdAt: string;
}

export interface Asset {
  id: string;
  name: string;
  description?: string | null;
  assetType: string;
  criticality: string;
  owner: string;
  status: string;
}

export interface Control {
  id: string;
  controlCode: string;
  title: string;
  description?: string | null;
  category: string;
  effectiveness: number;
  status: string;
  owner: string;
}

export interface Risk {
  id: string;
  riskCode: string;
  title: string;
  description: string;
  category: string;
  likelihood: number;
  impact: number;
  inherentRiskScore: number;
  inherentRiskRating: string;
  residualRiskScore: number;
  residualRiskRating: string;
  ownerId: string;
  owner?: User;
  status: string;
  reviewDate: string;
  assetLinks?: Array<{ asset: Asset }>;
  controlLinks?: Array<{ control: Control }>;
  treatments?: Treatment[];
  history?: RiskHistory[];
}

export interface Treatment {
  id: string;
  riskId: string;
  strategy: string;
  description: string;
  owner: string;
  targetDate: string;
  status: string;
  notes?: string | null;
}

export interface RiskHistory {
  id: string;
  eventType: string;
  summary: string;
  createdAt: string;
}

export interface PaginatedRisks {
  items: Risk[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
