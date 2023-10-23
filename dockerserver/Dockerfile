# Use the official Node.js image as the base image
FROM node:14

# Create a directory for your Node.js application
WORKDIR /app

# Copy your Node.js application files to the container
COPY package*.json ./
RUN npm install

# Copy your HTML file to the container
COPY index.html ./

# Create a Node.js server file
COPY server.js ./

# Expose port 80
EXPOSE 80

# Start the Node.js server
CMD ["node", "server.js"]

