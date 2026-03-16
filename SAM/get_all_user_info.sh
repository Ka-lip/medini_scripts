#!/bin/sh

# Detect if "docker compose" or "docker-compose" is available
if command -v docker-compose >/dev/null 2>&1; then
  COMPOSE_COMMAND="docker-compose"
elif command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  COMPOSE_COMMAND="docker compose"
else
  echo "Neither 'docker compose' nor 'docker-compose' is installed. Please install Docker Compose and try again."
  exit 1
fi

# Get Postgres container name
POSTGRES_CONTAINER=$(docker container ls --format "{{.Names}}" | grep postgres)
if [ "$(echo "$POSTGRES_CONTAINER" | wc -l)" -ne 1 ]; then
    echo "Could not uniquely identify the Postgres container. Please enter the container name:"
    echo "Available containers:"
        docker container ls --format "{{.Names}}"
    read -r POSTGRES_CONTAINER
fi
echo "Postgres container: "$POSTGRES_CONTAINER

# Get Tomcat container name
TOMCAT_CONTAINER=$(docker container ls --format "{{.Names}}" | grep tomcat)
if [ "$(echo "$TOMCAT_CONTAINER" | wc -l)" -ne 1 ]; then
    echo "Could not uniquely identify the Tomcat container. Please enter the container name:"
    echo "Available containers:"
        docker container ls --format "{{.Names}}"
    read -r TOMCAT_CONTAINER
fi
echo "Tomcat container: "$TOMCAT_CONTAINER

SERVER_URL=$(docker exec -i $TOMCAT_CONTAINER sh -c 'echo $CLOUDMODELING_REDIRECTURI' | tr -d '\r')
echo "Server URL: $SERVER_URL"

SQL_QUERY="SELECT userid,username,emailaddress,status FROM public.webuser;"
QUERY_RESULT=$(docker exec -i "$POSTGRES_CONTAINER" psql -U dbuser -d cloudmodeling -t -A -c "$SQL_QUERY")
(echo "userid|username|emailaddress|status"; \
       	echo $QUERY_RESULT | tr ' ' '\n') | column -t -s '|'

exit 0
