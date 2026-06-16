import { IEnvironmentProvider } from "@opendistil/core";
import { PodmanProvider } from "./providers/podmanProvider";
import { DockerProvider } from "./providers/dockerProvider";
import { LocalProvider } from "./providers/localProvider";

export interface ProviderFactoryConfig {
  defaultProvider: string;
  podman?: { tempDir?: string };
  docker?: { tempDir?: string };
  local?: { workDir?: string };
}

export class ProviderFactory {
  private providers: Map<string, IEnvironmentProvider> = new Map();
  private config: ProviderFactoryConfig;

  constructor(config: ProviderFactoryConfig) {
    this.config = config;
  }

  register(name: string, provider: IEnvironmentProvider): void {
    this.providers.set(name, provider);
  }

  getProvider(name?: string): IEnvironmentProvider {
    const providerName = name ?? this.config.defaultProvider;
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Environment provider "${providerName}" not registered`);
    }
    return provider;
  }

  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  static createDefault(config?: Partial<ProviderFactoryConfig>): ProviderFactory {
    const resolvedConfig: ProviderFactoryConfig = {
      defaultProvider: "podman",
      ...config,
    };

    const factory = new ProviderFactory(resolvedConfig);
    factory.register("podman", new PodmanProvider(resolvedConfig.podman?.tempDir));
    factory.register("docker", new DockerProvider(resolvedConfig.docker?.tempDir));
    factory.register("local", new LocalProvider(resolvedConfig.local?.workDir));

    return factory;
  }
}
