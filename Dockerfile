# Use Node compatible with Angular
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first (cache optimization)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Expose Angular default port
EXPOSE 4200

# Start Angular with ng serve
CMD ["npm", "start"]
