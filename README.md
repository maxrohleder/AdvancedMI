# Digital Waitingroom

Find the current patient UI design draft at [our figma page](https://www.figma.com/file/NUWYQQ6T5zKVLng4IAdxSJ/digital-waiting?node-id=0%3A1).

- [Digital Waitingroom](#digital-waitingroom)
  - [User Stories](#user-stories)
    - [Emergency/Accute visit w/o scheduled appointment](#emergencyaccute-visit-wo-scheduled-appointment)
  - [Working points](#working-points)
    - [Minimum Viable Product (minimum feature set):](#minimum-viable-product-minimum-feature-set)
    - [Additional Features](#additional-features)
  - [Open Questions](#open-questions)
  - [Project Architecture](#project-architecture)

## User Stories

### Emergency/Accute visit w/o scheduled appointment

1. Calls doctors office and request direct treatment
2. Receptionist enters new patient user profile
   1. (appointment time --> now)
   2. Full Name
   3. Short diagnosis --> emergency/acute
   4. mobile number
3. Patient receives SMS with link to personal digital waiting room
4. Travel to areas of doctors office (outside waiting area or personal car)
5. Enter waiting room by clicking Button on welcome page
6. App displays number of patients in front of you, estimated time and waiting number
7. When doctor is ready, receptionist clicks on "call patient"
8. Patient view changes to "Bitte in die Praxis kommen"


*SMS:*
> Hallo NAME, 
> hier findest du den digitalen Warteraum:
> www.wartefrei.de/queues/21/number=17
>  Deine Nummer ist 17. Wenn du bereit bist in die Praxis zu kommen, klicke auf Beitreten!
> Bitte halte dich 
> von anderen fern, um das Infektionrisiko zu senken.
> Deine Praxis Dr. Müller

## Working points

Here is a overview over the functions that the App should provide.

### Minimum Viable Product (minimum feature set):

One waiting queue per doctors office. The welcome page of a medical institution can be accessed with the placeID appended to the base url.

- back-end
  - functionalities:
    - store patient pseudonyms, waiting number and status (waiting, called, done)
    - return waiting position when given the waiting number
    - secure REST-Api calls (auth, encryption)
    - delete all patients at end of day
- front-end
  - admin
    - functionalities:
      - enter a new queue entry (name or pseudonym)
      - notify a patient (set patient status on called)
      - delete patient from queue
  - patient
    - functionalities:
      - show waiting number
      - show doctors office name (and image?)
      - show number of patients in front you
      - notification when called

### Additional Features

- Multiple queues (corona, emergency, normal) or (Dr. Maier, Dr. Schmidt)
- Estimate waiting time based on moving average
- Enable a primitive form of patient-receptionist communication (confirm proximity button @ patient front-end)
- integrate with scheduling tool and appointment tool

## Open Questions

- Active patient front-end polling or backend-initiated push notification?
- Encryption (serverside, front-end key in session token?)
- How does the patient get to the queue page?
  - Receive Waiting Room ID and personal Waiting Room #
  - Receive A Mail/SMS Upon registration at the front desk via phone
  - Sign in to doctors office completely remote?
    - select doctors office

## Project Architecture

This project is (as outlined before) structured into backend and front end. The used software stack is described in [Architecture](architecture.md). 

There is one flask-based webserver, which exposes the administrative functionality of the project via a REST-Api. The sources for these backend functions can be found in the folder `./backend`.

The client side of the application was written using React. The code can be seen in the folder called `./frontend`.