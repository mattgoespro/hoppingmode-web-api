#!/bin/bash

echoUsage () {
    echo "Usage: $0 <command> [args]"
    echo
    echo "Commands:"
    echo "  build-image             Builds image"
    echo "  run-image <registry>    Starts container from image in registry"
    echo "      - local             Runs the image from local registry"
    echo "      - dockerhub         Runs the image from DockerHub registry"
}

if [ -z "$1" ]; then
    echoUsage
    exit 1 >> /dev/null
fi

case "$1" in
    "build-image")
        if [ ! -f "npm_secret" ]; then
            echo "npm secret file not found."
            exit 1 >> /dev/null
        fi
        
        docker build . -t hoppingmode-web/api --secret id=npm_secret,src=npm_secret
    ;;
    "run-image")
        case "$2" in
            "local")
                (docker rm -f api || true) && docker run -d -p 8080:3000 --name api -e API_GITHUB_TOKEN="$API_GITHUB_TOKEN" -e PORT=3000 hoppingmode-web/api
            ;;
            "dockerhub")
                mattgoespro hoppingmode-web run -i api --rm
            ;;
            *)
                echo "Usage: $0 run-image [local|dockerhub]"
                exit 1 >> /dev/null
        esac
        
        
    ;;
    *)
        echoUsage
        exit 1 >> /dev/null
esac
