export interface EnvironmentSpec {
  image: string;
  memoryLimit?: string;
  cpuLimit?: string;
  envVars?: Record<string, string>;
  networkAccess: boolean;
  mountPoints?: Array<{
    hostPath: string;
    containerPath: string;
    readOnly: boolean;
  }>;
  timeoutMs: number;
}

export interface Environment {
  id: string;
  spec: EnvironmentSpec;
  status: "provisioning" | "running" | "ready" | "error" | "destroyed";
  createdAt: string;
  metadata: Record<string, unknown>;
}

export interface EnvironmentHealthCheck {
  status: "healthy" | "unhealthy";
  message?: string;
  lastCheck: string;
}
