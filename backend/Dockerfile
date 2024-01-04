# Sử dụng image chính thức của Node.js từ Docker Hub
FROM node:14

# Tạo thư mục làm việc trong container
WORKDIR /usr/src/app

# Sao chép package.json và package-lock.json để tận dụng lợi ích của Docker cache layer
COPY package.json /usr/src/app/package.json
COPY package-lock.json /usr/src/app/package-lock.json

# Cài đặt các dependencies của ứng dụng
RUN npm install

RUN npm install -g nodemon

RUN <<EOF
apt-get update
apt-get install -y --no-install-recommends git
EOF

RUN <<EOF
useradd -s /bin/bash -m vscode
groupadd docker
usermod -aG docker vscode
EOF

# Sao chép mã nguồn ứng dụng vào container
COPY . /usr/src/app

# Mở cổng 3000 để ứng dụng có thể được truy cập từ bên ngoài
EXPOSE 5000

# Khởi chạy ứng dụng khi container được triển khai
CMD ["npm", "start"]