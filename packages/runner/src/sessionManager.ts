import { IEnvironmentProvider, EnvironmentSpec, Environment } from "@opendistil/core";

export class SessionManager {
  private sessions: Map<string, { environmentId: string; createdAt: string }> =
    new Map();

  async createSession(
    provider: IEnvironmentProvider,
    spec: EnvironmentSpec,
  ): Promise<{ sessionId: string; environment: Environment }> {
    const environment = await provider.createEnvironment(spec);
    const sessionId = `session-${environment.id}`;

    this.sessions.set(sessionId, {
      environmentId: environment.id,
      createdAt: new Date().toISOString(),
    });

    return { sessionId, environment };
  }

  async destroySession(
    sessionId: string,
    provider: IEnvironmentProvider,
  ): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      await provider.destroyEnvironment(session.environmentId);
      this.sessions.delete(sessionId);
    }
  }

  getSession(sessionId: string): { environmentId: string; createdAt: string } | null {
    return this.sessions.get(sessionId) ?? null;
  }

  listSessions(): Array<{ sessionId: string; environmentId: string; createdAt: string }> {
    return Array.from(this.sessions.entries()).map(([sessionId, data]) => ({
      sessionId,
      ...data,
    }));
  }
}
