# Use an official Node runtime as a parent image
FROM node:20

# Set the working directory in the container
WORKDIR /usr/src/app

# Sao chép package.json và package-lock.json để tận dụng lợi ích của Docker cache layer
COPY package.json /usr/src/app/package.json
COPY package-lock.json /usr/src/app/package-lock.json

# Install app dependencies
# RUN npm install

# Install the latest npm version
RUN npm install -g npm@latest

RUN <<EOF
apt-get update
apt-get install -y --no-install-recommends git
EOF

RUN <<EOF
useradd -s /bin/bash -m vscode
groupadd docker
usermod -aG docker vscode
EOF

# Copy the local code to the container
COPY . /usr/src/app

# Expose port 3000 to the outside world
EXPOSE 3000

# Define the command to run your app
CMD ["npm", "start"]
