
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

### Endpoints
1. /auth/google -> google OAuth login
2. /auth/callback/google -> google OAuth callback endpoint
3. /auth/main/login -> login endpoint (username,password)
4. /auth/main/logout -> logout endpoint (need token)
5. /auth/main/register -> register endpoint (username,password,display_name)
6. /auth/main/email/verify (query param user_id,token)
7. /auth/main/password/reset (oldPassword,newPassword)
8. /users/profile/me (token)
9. /users/list
10. /users/statistics (query param activeSessionsInterval)

### Future Updates
* Frontend integration