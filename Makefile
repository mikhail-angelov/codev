HOST=$(shell grep '^HOST=' .env | cut -d '=' -f 2)

install:
	@echo "Installing server..."
	-ssh root@$(HOST) "mkdir -p /opt/codev"
	scp ./.env root@$(HOST):/opt/codev/.env
	scp ./docker-compose.yml root@$(HOST):/opt/codev/docker-compose.yml

deploy:
	@echo "Deploying server..."
	ssh root@$(HOST) "docker pull ghcr.io/mikhail-angelov/codev:latest"
	-ssh root@$(HOST) "cd /opt/codev && docker compose down"
	ssh root@$(HOST) "cd /opt/codev && docker compose up -d"