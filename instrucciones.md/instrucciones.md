## tengo instalado docker en mi pc

# isntalar postgresql en docker

docker pull postgres:latest

# para crear una imagen de postgres

docker build -t my-postgres-image .

# Crear el volumen

docker volume create postgres-volume

# para ejecutar la imagen

docker run --name my-postgres --env POSTGRES_PASSWORD=r1101kcn --volume postgres-volume:/var/lib/postgresql/data --publish 5432:5432 --detach postgres
