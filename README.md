📖 See the [Remix Vite docs][remix-vite-docs] for details on supported features.

## About

Dactylo is a crowd sourced sign language dictionary. Users upload videos and once approved other users vote on the best video for a word or phrase.

## Setup

This project uses pnpm to install in your local system follow [these](https://pnpm.io/installation) directions, once installed run the following commands

_This project was built with node v21. Currently there is no lts version for 21 at the time of writing this we were using v21.5.0_

```shell
nvm use 21
```

```shell
pnpm install
```

### Environment Variables

```shell
mv env-example ./.env
```

Once you have a .env in your root directory you can fill out all of the required variables.

## Running

```shellscript
pnpm run dev
```

Or build your app for production and run it:

```shellscript
npm run build
npm run start
```

[remix-vite-docs]: https://remix.run/docs/en/main/future/vite

## Local DB

```shell
docker pull mysql
```

```shell
docker run --name mysql-planetscale -e MYSQL_ROOT_PASSWORD=your_password -d mysql
```

```shell
docker exec -it mysql-planetscale mysql -uroot -pyour_password
```

Get the ip address of your docker image for the `DATABASE_URL` in your .env

```shell
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' mysql-planetscale
```

it should end up looking something like this

```shell
## Replace USER, PASSWORD, HOST, PORT, and DATABASE with your specific details
mysql://USER:PASSWORD@HOST:PORT/DATABASE
```

## Local Deployment Testing:

```shell
docker build -t dact-local .
```

```shell
docker run -d -p 3000:3000 --name dact-container dact-local
```