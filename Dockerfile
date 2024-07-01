FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat curl
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi


# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NODE_TLS_REJECT_UNAUTHORIZED="0"
ENV NEXT_TELEMETRY_DISABLED 1
ARG MONGODB_URI
ARG NEXT_PUBLIC_BACKEND_URL
ARG ACCESS_TOKEN
ARG CLOUD_URL
ARG CONTEXT_ID
ARG JWT_SALT
ARG OWNER_TOKEN
ARG PLATFORM_URL
ARG SOLUTION_ID
ARG INSTANCE_ID

ENV MONGODB_URI=${MONGODB_URI} 
ENV NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL} 
ENV ACCESS_TOKEN=${ACCESS_TOKEN} 
ENV CLOUD_URL=${CLOUD_URL} 
ENV CONTEXT_ID=${CONTEXT_ID} 
ENV JWT_SALT=${JWT_SALT} 
ENV OWNER_TOKEN=${OWNER_TOKEN} 
ENV PLATFORM_URL=${PLATFORM_URL} 
ENV SOLUTION_ID=${SOLUTION_ID}
ENV REPLICA_SET=${REPLICA_SET} 
ENV INSTANCE_ID=${INSTANCE_ID}



RUN yarn build

# If using npm comment out above and use below instead
# RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
RUN apk add --no-cache curl


WORKDIR /app
ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED 1

ENV NODE_TLS_REJECT_UNAUTHORIZED="0"
ENV MONGODB_URI=${MONGODB_URI} 
ENV NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL} 
ENV ACCESS_TOKEN=${ACCESS_TOKEN} 
ENV CLOUD_URL=${CLOUD_URL} 
ENV CONTEXT_ID=${CONTEXT_ID} 
ENV JWT_SALT=${JWT_SALT} 
ENV OWNER_TOKEN=${OWNER_TOKEN} 
ENV PLATFORM_URL=${PLATFORM_URL} 
ENV SOLUTION_ID=${SOLUTION_ID}
ENV REPLICA_SET=${REPLICA_SET} 
ENV INSTANCE_ID=${INSTANCE_ID}





RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"]

