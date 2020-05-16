# Architecture

This document briefly introduces all software components used in this project. 

## Table of Contents
- [Architecture](#architecture)
  - [Table of Contents](#table-of-contents)
  - [Serverside Components](#serverside-components)
    - [Flask](#flask)
  - [Clientside Components](#clientside-components)
    - [React](#react)
  - [Production Setup](#production-setup)
    - [Nginx](#nginx)

## Serverside Components

These software components make up the backend.

### Flask
[Flask](https://palletsprojects.com/p/flask/) is a lightweight WSGI web application framework. It comes as a python library and enables the user to implement functions, which are executed when a certain route is called via HTTP. It does the abstraction from the HTTP Api to python syntax and thus is very useful for the development of a web-accessible API.

## Clientside Components

These building blocks are used to develop the patient UI.

As modern JS applications can become very overwhelming we stick to this [Development Workflow](https://github.com/nitishdayal/cra_closer_look#create-react-app-development-flow). We use facebooks [react-quickstart project](https://github.com/facebook/create-react-app) for maintainable and easy project setup.


### React

[React](https://reactjs.org/) is a javascript library for building user interfaces. The developer can define views for states of the web-app and structure those into components, which are rendered to HTML blocks.

React can also be used to create mobile apps for IOS and Android using [React Native](https://reactnative.dev/). As we maybe want to switch to a standalone App later, this feature makes react the perfect approach for us.

## Production Setup

When going from development phase to production phase, we will need to deploy the flask based backend to a server. The flask internal development server will then no longer fit the needs of the application. 

### Nginx

To ensure scalability we chose to use the [nginx unit application server](https://unit.nginx.org/installation/), which comes preconfigured for a REST Api setup and has a [How-To](https://unit.nginx.org/howto/flask/) for python flask.

With Nginx, the developer can add listeners on ports and assign applications in form of python files. The specified python file must have a callable called `application`. In the case of Flask, that is the entire app.