FROM node:20.18.0

# Create and change to the app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install
RUN npm rebuild bcrypt --build-from-source

# Copy app source code
COPY . .
RUN apt-get update && apt-get install -y redis-tools

# Expose the port your service runs on
EXPOSE 3000

# Start the service
CMD ["node", "dashboard.js"]
