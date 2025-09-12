// Core types for Design Tokens Usage Tracker

export interface TokenMetadata {
  tokenId: string;
  currentVersion: string;
  value: string | number | object;
  category: 'color' | 'typography' | 'spacing' | 'shadow' | 'border' | 'animation' | 'breakpoint';
  usage: {
    teams: TeamUsage[];
    channels: ChannelUsage[];
    patterns: PatternUsage[];
  };
  dependencies: string[];
  history: TokenHistory[];
  contributor: Contributor;
  governance: {
    criticality: 'low' | 'medium' | 'high';
    reviewRequired: boolean;
    deprecationStatus?: 'stable' | 'deprecated' | 'sunset';
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamUsage {
  teamId: string;
  teamName: string;
  applicationIds: string[];
  usageCount: number;
  lastUsed: Date;
  implementationMethod: 'css-variables' | 'scss-import' | 'js-object' | 'design-tokens';
  contactEmail: string;
}

export interface ChannelUsage {
  channelId: string;
  channelName: string;
  channelType: 'website' | 'mobile-app' | 'desktop-app' | 'email' | 'social';
  domain?: string;
  usageCount: number;
  lastScanned: Date;
  integrationStatus: 'active' | 'inactive' | 'error';
}

export interface PatternUsage {
  patternId: string;
  patternName: string;
  tokenIds: string[];
  usageCount: number;
  teams: string[];
  dependency: {
    level: 'direct' | 'indirect';
    parentPatterns: string[];
  };
}

export interface TokenHistory {
  version: string;
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  changedBy: Contributor;
  changedAt: Date;
  approvedBy?: Contributor;
  approvedAt?: Date;
  rollbackInfo?: {
    canRollback: boolean;
    rollbackToVersion: string;
  };
}

export interface Contributor {
  id: string;
  name: string;
  email: string;
  team: string;
  role: 'designer' | 'developer' | 'manager' | 'admin';
  avatarUrl?: string;
}

export interface ScanResult {
  tokens: TokenUsageResult[];
  patterns: PatternUsageResult[];
  dependencies: DependencyGraph;
  coverage: number;
  scanDate: Date;
  repositoryInfo: RepositoryInfo;
}

export interface TokenUsageResult {
  tokenId: string;
  occurrences: TokenOccurrence[];
  totalUsage: number;
  files: string[];
}

export interface TokenOccurrence {
  filePath: string;
  line: number;
  column: number;
  context: string;
  type: 'css-variable' | 'scss-variable' | 'js-object' | 'design-token';
}

export interface PatternUsageResult {
  patternId: string;
  tokenDependencies: string[];
  usageLocations: string[];
  complexity: 'simple' | 'medium' | 'complex';
}

export interface DependencyGraph {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
  totalUsage: number;
}

export interface DependencyNode {
  id: string;
  type: 'token' | 'pattern' | 'component';
  name: string;
  usageCount: number;
}

export interface DependencyEdge {
  from: string;
  to: string;
  relationship: 'uses' | 'extends' | 'references';
  strength: number;
}

export interface RepositoryInfo {
  url: string;
  branch: string;
  lastCommit: string;
  team: string;
  scanConfig: ScanConfig;
}

export interface ScanConfig {
  includePatterns: string[];
  excludePatterns: string[];
  tokenFormats: TokenFormat[];
  depth: 'shallow' | 'deep';
}

export interface TokenFormat {
  type: 'css-variables' | 'scss-variables' | 'js-object' | 'design-tokens';
  pattern: RegExp;
  fileExtensions: string[];
}

export interface ChangeRequest {
  id: string;
  type: 'create' | 'update' | 'delete' | 'deprecate';
  tokenId: string;
  proposedChanges: Partial<TokenMetadata>;
  requestedBy: Contributor;
  requestedAt: Date;
  reason: string;
  impact: ImpactAnalysis;
  status: 'pending' | 'approved' | 'rejected' | 'in-review';
  reviewers: Contributor[];
  testDeploymentId?: string;
}

export interface ImpactAnalysis {
  affectedTokens: string[];
  affectedApplications: string[];
  affectedTeams: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  estimatedEffort: {
    hours: number;
    complexity: 'simple' | 'medium' | 'complex';
  };
  recommendedActions: string[];
  rollbackPlan: RollbackPlan;
  breakingChanges: boolean;
}

export interface RollbackPlan {
  canRollback: boolean;
  steps: string[];
  estimatedTime: number;
  requiredApprovals: string[];
}

export interface NotificationConfig {
  channels: ('email' | 'slack' | 'dashboard' | 'webhook')[];
  recipients: NotificationRecipient[];
  template: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  schedule?: {
    immediate: boolean;
    delay?: string;
    recurring?: boolean;
  };
}

export interface NotificationRecipient {
  id: string;
  type: 'user' | 'team' | 'role';
  contactInfo: {
    email?: string;
    slack?: string;
    webhook?: string;
  };
}

export interface DashboardMetrics {
  totalTokens: number;
  activeTokens: number;
  deprecatedTokens: number;
  totalUsage: number;
  teamAdoption: TeamAdoptionMetric[];
  channelCoverage: ChannelCoverageMetric[];
  recentActivity: ActivityEvent[];
  systemHealth: {
    score: number;
    issues: string[];
    lastScan: Date;
  };
}

export interface TeamAdoptionMetric {
  teamId: string;
  teamName: string;
  adoptionScore: number;
  tokensUsed: number;
  patternsUsed: number;
  lastActivity: Date;
  trend: 'up' | 'down' | 'stable';
}

export interface ChannelCoverageMetric {
  channelId: string;
  channelName: string;
  coveragePercentage: number;
  tokensImplemented: number;
  integrationHealth: 'healthy' | 'warning' | 'error';
  lastSync: Date;
}

export interface ActivityEvent {
  id: string;
  type: 'token-created' | 'token-updated' | 'token-deprecated' | 'scan-completed' | 'approval-requested';
  timestamp: Date;
  actor: Contributor;
  details: string;
  metadata?: Record<string, any>;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    timestamp: Date;
  };
}

// WebSocket event types
export interface WebSocketEvent {
  type: string;
  payload: any;
  timestamp: Date;
  id?: string;
}

export interface UsageUpdateEvent extends WebSocketEvent {
  type: 'USAGE_UPDATE';
  payload: {
    tokenId: string;
    usageChange: number;
    source: string;
  };
}

export interface TokenChangeEvent extends WebSocketEvent {
  type: 'TOKEN_CHANGE';
  payload: {
    tokenId: string;
    changeType: 'created' | 'updated' | 'deprecated' | 'deleted';
    changes: Partial<TokenMetadata>;
  };
}

export interface ApprovalStatusEvent extends WebSocketEvent {
  type: 'APPROVAL_STATUS';
  payload: {
    changeRequestId: string;
    newStatus: ChangeRequest['status'];
    reviewer?: Contributor;
  };
}
