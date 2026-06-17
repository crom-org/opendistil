import { TrajectoryMetadata } from "@opendistil/core";

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

  setModelInfo(modelId: string, modelProvider: string): void {
    this.modelId = modelId;
    this.modelProvider = modelProvider;
  }

  setStartTime(time: string): void {
    this.startTime = time;
  }

  setTokenUsage(total: number, prompt: number, completion: number): void {
    this.totalTokens = total;
    this.promptTokens = prompt;
    this.completionTokens = completion;
  }

  setFinalStatus(status: "success" | "failure" | "timeout" | "error"): void {
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
