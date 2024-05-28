# Use an official Node.js runtime as a parent image
FROM node:20-alpine3.16 AS builder

# Set the working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package files
COPY package.json turbo.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy application package files
COPY apps/modgpt/package.json apps/modgpt/
COPY packages/tsconfig packages/tsconfig/
COPY packages/utilities packages/utilities/
COPY packages/filemod packages/filemod/

# Copy shared directory
COPY apps/shared apps/shared

# Install dependencies
RUN pnpm install

# Copy the remaining application files
COPY apps/modgpt/tsconfig.json apps/modgpt/
COPY apps/modgpt/esbuild.config.js apps/modgpt/
COPY apps/modgpt/src apps/modgpt/src/

# Build the application
RUN pnpm build --filter @codemod-com/filemod --filter @codemod-com/utilities --filter @codemod-com/modgpt

# Use a lightweight image for production
FROM node:20-alpine3.16

# Set the working directory
WORKDIR /app

# Adjust the COPY command based on the actual output directory
COPY --from=builder /app/apps/modgpt/build /app/build
COPY --from=builder /app/apps/modgpt/package.json /app

# Expose the port the app runs on
EXPOSE 8082

# Command to run the application
CMD ["node", "build/index.js"]
