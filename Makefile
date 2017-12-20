all: grunt build

grunt:
	grunt 

build: 
	go build -o ./dist/simple-plugin_linux_amd64 .