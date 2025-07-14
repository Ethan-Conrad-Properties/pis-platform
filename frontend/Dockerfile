FROM node:18-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the application code
COPY . .

# Build the application
RUN npm run build

# Copy the built application from the builder stage
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/tailwind.config.js ./tailwind.config.js
COPY --from=builder /app/postcss.config.js ./postcss.config.js


# Install only production dependencies
RUN npm install --only=production

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]

