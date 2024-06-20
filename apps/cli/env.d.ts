declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production";
      BACKEND_URL: string;
      AUTH_BACKEND_URL: string;
      CODEMOD_HOME_PAGE_URL: string;
      CODEMOD_STUDIO_URL: string;
      IGNORE_TELEMETRY: boolean;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export type {};
