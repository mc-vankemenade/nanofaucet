# Nanofaucet

This project makes it easy for someone who is already running a NANO node to host a faucet. Using a prebuilt Docker image you can quickly get up and running. However if you wish to have a custom lay-out or theme you can easily create your own by cloning or forking this repository and modifying the files in the 'srv' directory.

## About the faucet

the faucet uses a nodeJS Express webserver to host a webpage where people can redeem a small amount of nano for free. The webserver communicates directly with a node or a preconfigured [Pippin](https://pypi.org/project/pippin-wallet/) nanowallet. The goal here is to promote the cryptocurrency and allow more people to get their hands on NANO.

## Configuring the faucet

You can easily configure the faucet by editing the 'sample-config.yaml' file.

### Requirements

1. A domain pointing towards your host or network.
2. 2 recaptcha keys (1 site-key 1 secret-key) obtained by registering your domain [here](https://www.google.com/recaptcha/admin).
3. A node or Pippin-nanowallet with the RPC endpoint reachable from the host machine.
    1. An account address on that wallet or node to send funds from.
    2. the ID the node or wallet uses to identify a specific nano wallet.
4. Your personal account address to receive any donations.

### Quick start

```bash
git clone https://github.com/mc-vankemenade/nanofaucet
```

Pulls the latest version of the repository.

```bash
cd nanofaucet/
```

Open the downloaded directory.

```bash
mv sample-config.yaml config.yaml
```

Changes the sample config file name to the file used by the container.

```bash
sudo nano config.yaml
```

Opens the config file in the nano text editor. Here you can configure the different variables.

```bash
docker build -t mcvankemenade/nanofaucet .
```

Builds a docker image from the project. If you want to change your settings in the config you can recreate the image or run the container with a volume.

```bash
docker run -d -p 80:80 --restart=unless-stopped mcvankemenade/nanofaucet
```

runs the docker container. WARNING: this exposes the faucet webpage to your network on port 80. use a reverse proxy if you want to expose it to the internet.

### Using HTTPS

You can secure the connection using something like [NGINX proxy manager.](https://nginxproxymanager.com/) This application also runs inside docker. When running NGINX and the faucet on the same host its possible to use the built in docker 'bridge' network to prevent exposing the unsecured connection to the internet. You can read more about that [here](https://docs.docker.com/network/).

If you're running the faucet on a seperate machine on the same local network you can use port 80 and only forward the NGINX proxy manager ports on your router.

## Disclaimer!

I am not a professional developer in any way. So do your own research! (which is a great idea anyway.)