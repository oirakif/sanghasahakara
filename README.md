
# Simple User Statistics Service

A simple backend service made in typescript, to simulate simple auth flow with google OAuth & basic email&password, email validation, and simple user statistic panel

## Features
* Google OAuth login
* Simple auth (login, register) with JWT integration, with basic auth as auth module
* User Statistics read

## Tools Stack & prerequisites
* typescript
* postgresql (need to install it locally / use docker)
* JWT
* redis
* expressJS

## DB Schema
WIP

## Quickstart
* Migrate the DB schema, the script is located at `migrations/migrations.sql` file
* Make local env file
```
 touch .env
```
* Fill the .env file with the desired variables based on your local setting. Example is in the .env.example file
```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_OAUTH_CALLBACK_URL=
DB_HOST=
PORT=
DB_USERNAME=
DB_PASSWORD=
DB_HOST=
DB_NAME=
DB_PORT=
MAIN_SERVICE_URL=
EMAIL_USER=
EMAIL_PASS=
JWT_SECRET=

```
* Install node modules
```
npm i
```
* Run the server
```
npm run build && npm start
```
* Enjoy !

### Future Updates
* Frontend integration