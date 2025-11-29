# Stage 1: Build the React application
FROM node:20-alpine as builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if you have one)
# to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Build the React application
# This will create a 'dist' folder with your optimized static files
RUN npm run build

# Stage 2: Serve the built application with a lightweight web server
FROM nginx:alpine

# Copy the built files from the builder stage to Nginx's public directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy a custom Nginx configuration 
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 8080 for the web server
EXPOSE 8080

# Add a healthcheck to verify Nginx is running and responding
HEALTHCHECK --interval=5s --timeout=3s --start-period=5s --retries=3 CMD curl --fail http://localhost:8080/ || exit 1

# Start Nginx when the container runs
ENTRYPOINT ["nginx", "-g", "daemon off;"]
