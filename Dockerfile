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

# Copy a custom Nginx configuration (optional, but good for SPAs)
# Create a file named 'nginx.conf' in your project root with the content below
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for the web server
EXPOSE 80

# Start Nginx when the container runs
CMD ["nginx", "-g", "daemon off;"]
