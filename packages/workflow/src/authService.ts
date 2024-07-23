let authService: AuthServiceInterface | undefined;

export interface AuthServiceInterface {
  getGithubAPIKey(): Promise<string | undefined>;
  ensureGithubScopes(scopes?: string[]): Promise<boolean>;
}

export function setAuthService(service: AuthServiceInterface) {
  authService = service;
}

export function getAuthService(): AuthServiceInterface | undefined {
  return authService;
}
