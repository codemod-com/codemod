declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production";
      IGNORE_TELEMETRY: boolean;

      BACKEND_URL: string;
      AUTH_BACKEND_URL: string;
      RUNNER_URL: string;
      MODGPT_URL: string;
      CODEMODAI_URL: string

      CODEMOD_HOME_PAGE_URL: string;
      CODEMOD_STUDIO_URL: string;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export type {};
