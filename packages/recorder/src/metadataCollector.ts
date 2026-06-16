import { AgentStartEvent, AgentEndEvent, TrajectoryMetadata } from "@opendistil/core";

export class MetadataCollector {
  private modelId: string = "";
  private modelProvider: string = "";
  private agentVersion: string = "";
  private toolsUsed: Set<string> = new Set();
  private totalTokens: number = 0;
  private promptTokens: number = 0;
  private completionTokens: number = 0;
  private finalStatus: "success" | "failure" | "timeout" | "error" = "success";
  private startTime: string = "";

  captureAgentStart(event: AgentStartEvent): void {
    this.modelId = event.modelId;
    this.modelProvider = event.modelProvider;
    this.startTime = event.timestamp;
  }

  captureAgentEnd(event: AgentEndEvent): void {
    this.finalStatus = event.finalStatus;
    this.totalTokens = event.usage.totalTokens;
    this.promptTokens = event.usage.promptTokens;
    this.completionTokens = event.usage.completionTokens;
  }

  captureTokenUsage(usage: { totalTokens: number; promptTokens: number; completionTokens: number }): void {
    this.totalTokens = usage.totalTokens;
    this.promptTokens = usage.promptTokens;
    this.completionTokens = usage.completionTokens;
  }

  captureFinalStatus(status: "success" | "failure" | "timeout" | "error"): void {
    this.finalStatus = status;
  }

  registerToolUsage(toolName: string): void {
    this.toolsUsed.add(toolName);
  }

  buildMetadata(): Partial<TrajectoryMetadata> {
    return {
      modelId: this.modelId,
      modelProvider: this.modelProvider,
      toolsUsed: Array.from(this.toolsUsed),
      totalTokens: this.totalTokens,
      promptTokens: this.promptTokens,
      completionTokens: this.completionTokens,
      finalStatus: this.finalStatus,
      agentVersion: this.agentVersion,
      timestamp: this.startTime || new Date().toISOString(),
    };
  }
}
