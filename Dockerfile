# Use an official Node LTS image
FROM node:20-slim

# Set working directory inside the container
WORKDIR /app

# Copy package files first (better Docker layer caching)
COPY package*.json ./

# Install ALL dependencies (including devDependencies, since we need
# tailwindcss to build the CSS during this build step)
RUN npm install

# Copy the rest of the project
COPY . .

# Build Tailwind CSS ONCE (no --watch — this is a production build, not a dev server)
RUN npx tailwindcss -i ./views/input.css -o ./public/output.css --minify

# Create the uploads folder if it doesn't exist, so multer has somewhere to write
RUN mkdir -p uploads

# Expose the port the app listens on
EXPOSE 3002

# Run the app directly with node — no nodemon, no --watch, this is production
CMD ["node", "app.js"]