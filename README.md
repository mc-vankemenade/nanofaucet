# Nanofaucet

This project makes it easy for someone who is already running a NANO node to host a faucet. Using a prebuilt Docker image you can quickly get up and running. However if you wish to have a custom lay-out or theme you can easily create your own by cloning or forking this repository and modifying the files in the 'srv' directory.

## About the faucet

the faucet uses a nodeJS Express webserver to host a webpage where people can redeem a small amount of nano for free. The webserver communicates directly with a node or a preconfigured [Pippin](https://pypi.org/project/pippin-wallet/) nanowallet. The goal here is to promote the cryptocurrency and allow more people to get their hands on NANO.

## Configuring the faucet

The data the faucet page shows can be configured using enviroment variables when creating the container. I personally recommend [Portainer](https://www.portainer.io/products/community-edition) to set this up and manage my containers. Since that makes it easy to recreate the container if i ever want to change any settings or update the image.

### Requirements

1. A domain pointing towards your host or network.
2. 2 recaptcha keys (1 site-key 1 secret-key) obtained by registering your domain [here](https://www.google.com/recaptcha/admin).
3. A node or Pippin-nanowallet with the RPC endpoint reachable from the host machine.
    1. An account address on that wallet or node to send funds from.
    2. the ID the node or wallet uses to identify a specific nano wallet.
4. Your personal account address to receive any donations.

### Enviroment variables

```bash
HOSTPORT=80 #The port you want to host your faucet on.
WALLETURL="" #The URL for your wallet or node RPC.
WALLETID="" #The ID your node or wallet assigns to your payout account. 
ACCOUNTADDR="" #The NANO address you want to use for payout.
DONATIONADDR="" #the NANO address you wish to receive donations on.
DEPOSITAMOUNTRAW=100000000000000000000000000 #The amount of raw to send with each withdrawal.
CAPTCHASITEKEY="" #The site-key google gives you when you register your site for a recapthca.
CAPTCHASECRETKEY="" #The secret-key google gives you when you register your site.
```

### Quick start

```bash
docker pull mcvankemenade/nanofaucet:latest
```

Pulls the latest docker image.

```bash
docker run -d --restart unless-stopped -e HOSTPORT=80 -e WALLETURL=<user input> -e WALLETID=<user input> -e ACCOUNTADDR=<user input> -e DONATIONADDR=<user input> -e DEPOSITAMOUNTRAW=100000000000000000000000000 -e CAPTCHASITEKEY=<user input> -e CAPTCHASECRETKEY=<user input> -p 80:80 mcvankemenade/nanofaucet:latest
```

Run the docker container with .env variables. (Warning! this exposes port 80 on your machine to the rest of your network!) 

### Using HTTPS

You can secure the connection using something like [NGINX proxy manager.](https://nginxproxymanager.com/) This application also runs inside docker. When running NGINX and the faucet on the same host its possible to use the built in docker 'bridge' network to prevent exposing the unsecured connection to the internet. You can read more about that [here](https://docs.docker.com/network/).

If you're running the faucet on a seperate machine on the same local network you can use port 80 and only forward the NGINX proxy manager ports on your router.

## Disclaimer!

I am not a professional developer in any way. So do your own research! (Thats always a great idea anyway.)