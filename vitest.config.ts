import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    setupFiles: [
      `${__dirname}/apps/auth-service/node_modules/dotenv/config`,
      `${__dirname}/apps/backend/node_modules/dotenv/config`,
    ],
    env: {
      NODE_ENV: "test",
      PORT: "8081",
      AUTH_SERVICE_URL: "http://localhost:8081",
      DATABASE_URI: "sqlite://:memory:",
      VERIFIED_PUBLISHERS: "",
      CLERK_PUBLISH_KEY: "CLERK_PUBLISH_KEY",
      CLERK_SECRET_KEY: "CLERK_SECRET_KEY",
      CLERK_JWT_KEY: "CLERK_JWT_KEY",
      TASK_MANAGER_QUEUE_NAME: "TASK_MANAGER_QUEUE_NAME",
      CODEMOD_COM_API_URL: "https://codemod.com/api",
      ENCRYPTION_KEY: "abcdefg321",
      SIGNATURE_PRIVATE_KEY: "topsecret",
      SLACK_TOKEN: "xoxb-123123123",
      SLACK_CHANNEL: "my-channel",
      FRONTEND_URL: "http://localhost:3000",
      AWS_PUBLIC_BUCKET_NAME: "codemod-test",
      AWS_PRIVATE_BUCKET_NAME: "codemod-test",
      ZAPIER_PUBLISH_HOOK: "https://hooks.zapier.com/hooks/catch/123123/123123",
    },
    exclude: [...configDefaults.exclude, "./packages/deprecated/**"],
    include: [...configDefaults.include, "**/test/*.ts"],
    passWithNoTests: true,
    testTimeout: 15_000,
  },
});
