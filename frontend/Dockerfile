# Use an official Node runtime as a parent image
FROM --platform=linux/x86_64 node:14

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy dependency definitions
COPY package.json /usr/src/app
COPY package-lock.json /usr/src/app

# Install app dependencies
RUN npm install

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
