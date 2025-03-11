# MONSTER-HUNTER: frontend application

## Description

This project is a simple react-native frontend application that interact with the spring backend alloing users to keep track of their monster energy drink cans collection.
This app connects to the backend via a set of REST APIs. This app is built with Expo.

## Usage

- run `npx expo start` to run and test with a mobile device or an android emulator
- run `expo build:android -t apk`to build the apk to install on the mobile device

## Available APIs

- GET /api/v1/cans : returns the list of all cans
- POST /api/v1/cans : insert a new can into the collection
- GET /api/v1/cans/{id} : retrieve a can and its details by id
- PUT /api/v1/cans/{id} : update a can's details
- DELETE /api/v1/cans/{id} : delete a can from the collection

### Versions

- 1.0.0 : initial version

  - retrieve and display the list of all the items in the collection;
  - filter the items by name;
  - added a clear button for the filter;
  - delete an item by swiping left on the list (after a prompt);
  - filtering by "apiurl" let you change the API_URL to connect to the remote APIs

- 1.0.1 :
  - fixed the connection to the APIs from the deployed app, as in https://stackoverflow.com/questions/77157620/how-to-enable-http-requests-using-expo/79435980

- 1.1.0 :
  - added an insert functionality to add a new item to the collection (requires React Navigation);
  - refactoring of the project following guidelines and best practices

- 1.2.0:
  - add sugarless option
  - add images handling (upload via app, refactoring data model)

- 1.3.0:
  - add style and extract all the style into an object
  - manage all the data locally via mmkv. On app startup and refresh try to fetch the data from the server and update the local cache.
    All the operations interact with the local cache at first and try to synch with the remote repository;
  - a datastamp for every item is used to synch the local cache with the remote data;
  - change the app icon

### Future implementations:

- style the ui
- image upload from the mobile app
- implement a detailed view of all the images for a can
- barcode recognition (possibly a front-end feature)
