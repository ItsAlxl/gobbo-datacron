# Gobbo Datacron

A collection of tools for SWTOR players.

- Gear Calculator
- Bounty Hunter Event Tracker
- Valor Progress Calculator
- Profit Comparison

There's a [live web app](https://itsalxl.github.io/gobbo-datacron) you can use right now.

## Building from Source

You can build and run the tools yourself from the source code; all you need is [NodeJS](https://nodejs.org/).

Execute the following commands within the project root to build the tools.

```sh
# Get dependencies (only needed once, but may take a while!)
npm install

# Build the applications once
npm run build

# Build the applications, and rebuild when changed
# Also provides the URL for the locally-hosted web app
npm run dev
```

The build's output is placed in `dist/` directory. You cannot simply open the html file due to an [intentional security mechanism](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS) built into browsers. Instead, you will need to host the contents of the `apps/web/dist/` directory on a webserver. This can be done locally using Vite (which is installed as a dependency) by executing either of the following commands from the `apps/web/` directory.

```sh
# Use Vite's local webserver
npm run preview

# Live development, as an alternative to repeatedly running 'build' and 'preview'
npm run dev
```

Vite will display the URL for your locally-hosted web app.

Deploying the web app to a production environment only requires serving the contents of the `dist/` directory, which are static.

## Localization

Localization documentation can be found in `src/localize/`
