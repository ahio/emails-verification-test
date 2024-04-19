# TEST EMAILS VERIFICATION

An experimental application designed to validate emails (currently lacking proper verification,
instead utilizing simulated verification), coupled with Server-Sent Events (SSE) functionality. 
This enables the server to publish data to subscribers, allowing them to observe real-time updates on status changes.

## HOW TO START

In the project directory run in console:

##### `docker compose up -d`

It will run frontend server on http://localhost:3000 and backend server on http://localhost:3001.

### Tests

In order to run backend tests in the project directory run in console:

```
// to create and start containers for backend server
> docker compose up -d main-server

// to run backend integration tests
> docker compose run -e API_HOST='main-server' main-server npm run test
```
