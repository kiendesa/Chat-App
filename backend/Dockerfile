# Sử dụng image chính thức của Node.js từ Docker Hub
FROM --platform=linux/x86_64 node:14

# Tạo thư mục làm việc trong container
WORKDIR /usr/src/app

# Sao chép package.json và package-lock.json để tận dụng lợi ích của Docker cache layer
COPY package*.json ./

# Cài đặt các dependencies của ứng dụng
RUN npm install

RUN npm install -g nodemon

# Sao chép mã nguồn ứng dụng vào container
COPY . .

# Mở cổng 3000 để ứng dụng có thể được truy cập từ bên ngoài
EXPOSE 5000

# Khởi chạy ứng dụng khi container được triển khai
CMD ["npm", "start"]