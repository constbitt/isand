#!/bin/bash


rsync -av --delete --exclude=node_modules --exclude=.git /home/denstrygin/nextjs isand23:~/ISAND/web_application/
ssh isand23 'bash -s' < nextjs-app-deploy.sh