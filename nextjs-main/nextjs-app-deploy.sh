docker build -t nextjs-app:latest -f  ~/ISAND/web_application/nextjs/Dockerfile  ~/ISAND/web_application/nextjs
docker stop nextjs-app
docker rm nextjs-app
docker rm $(docker ps -aq -f status=exited)
docker image prune -f
docker run --name nextjs-app -d -p 3000:3000 nextjs-app:latest