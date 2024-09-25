# Use the official Go image as the base image
FROM golang:1.22.1-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the Go module files
COPY go.mod go.sum ./

# Download the Go module dependencies
RUN go mod download

# Copy the source code into the container
COPY . .

# Build the Go application
RUN go build -o server ./server.go

# Expose the port the server will run on
EXPOSE 8080

# Command to run the executable
CMD ["./server"]
