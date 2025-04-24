# Zigbee2MQTT WindFront

A frontend UI for [Zigbee2MQTT](https://github.com/Koenkk/zigbee2mqtt).

> Based on https://github.com/nurikk/zigbee2mqtt-frontend

> [!IMPORTANT]
> Work in progress!

# Develop

Install dependencies

```bash
npm install
````

### Develop using mock data

```bash
npm run start
open http://localhost:3030/
````

### Develop using your z2m instance

```bash
Z2M_API_URI="ws://192.168.1.200:8080" npm run start
open http://localhost:3030/
```

## Tests

```bash
npm run test:cov
```

## Build

```bash
npm install
npm run build
```
