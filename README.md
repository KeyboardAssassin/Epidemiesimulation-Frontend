
![Epidemiesimulation Frontned](https://i.ibb.co/kXvfvBm/Epidemiesimulation-Frontend.png)

## Konzeption und Implementierung einer Epidemiesimulation 
[![Build Status](https://travis-ci.org/joemccann/dillinger.svg?branch=master)](https://travis-ci.org/joemccann/dillinger) ![enter image description here](https://img.shields.io/github/last-commit/keyboardassassin/Epidemiesimulation)

In diesem Repository wird passend zur [Backend-Komponente](https://github.com/KeyboardAssassin/Epidemiesimulation) ein Frontend  für diese Simulation erschaffen.

## Key Features

- Country summary (overview) with graphical representation 
- Option to view a state or city list with incidences
- Interactive buttons to start measures 
	- vaccination development (and deployment)
	- medication development (and usage)
	- contract restrictions with different
		-  levels (city, state, country)
		- amount of days
	- social distancing (not as strong as contact restrictions)
- Measurelist with possibility to end measure premature
- Representation of the population obedience

## Technologies

The simulation representation (frontend) uses the following:

- [Vue.js 3] - Javascript Framwork (foundation)
- [Quasar] - Javascript Framework for Single Page Applications
- [SCSS] - advanced styling

## Install the dependencies

```bash
yarn
# or
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)

```bash
quasar dev
```




### Customize the configuration

See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js).


## Preview

![enter image description here](https://i.ibb.co/0268HyN/Simulation-1.png)