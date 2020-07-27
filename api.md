# API

This document defines the RESTful Api interface between the backend server and the front-end web app. It can be used to authenticate, register new request and enter new data.

GET:

> HTTP-GET: /  
> ANSWER: String @200;

> <br>HTTP-GET: /details/<place-id\> > <br>ANSWER: { details: Details of <place-id\> } @200;

> <br>HTTP-GET: /exists/user/<place-id\>/<patiend-id\> ><br>ANSWER: {
> <br> > > > praxisConfirmed: bool,
> <br> > > > userConfirmed: bool,} @200;

POST:

> HTTP-POST: /admin/details
> <br>JSON-PAYLOAD: {
> <br> > > > placeID: integer,
> <br> > > > token: encoded JWT-AccessToken,
> }
> <br>ANSWER: {
> <br> > > > AuthConfirmed: bool,
> <br> > > > details: {Details of PlaceID}
> } @200;

> <br>HTTP-POST: /admin/queue
> <br>JSON-PAYLOAD: {
> <br> > > > placeID: integer,
> <br> > > > token: encoded JWT-AccessToken,
> }
> <br>ANSWER: {
> <br> > > > authConfirmed: true,
> <br> > > > queueData: {Queue Data With Info from <place-id\>}
> }@200;

> <br>HTTP-POST: /auth
> <br>JSON-PAYLOAD: { TODO }
> <br>ANSWER: {
> <br> > > > praxisConfirmed: bool,
> <br> > > > accessToken: encoded JWT-AccessToken | null,
> } @200;
> <br>SIDE-NOTE: never used?

> <br>HTTP-POST: /auth-email
> <br>JSON-PAYLOAD: { email: string }
> <br>ANSWER: { isNewMail: bool,
> } @200;

> <br>HTTP-POST: /registerPraxis
> <br>JSON-PAYLOAD: {
> <br> > > > praxisName: string,
> <br> > > > placeID: integer,
> <br> > > > field: string,
> <br> > > > place: string,
> <br> > > > zipCode: integer,
> <br> > > > street: integer,
> <br> > > > houseNumber: string,
> <br> > > > phoneNumber: string,
> <br> > > > email: string,
> <br> > > > password: hash/string}
> <br>ANSWER: {
> <br> > > > newPlaceID: integer,
> <br> > > > accessToken: encoded JWT-AccessToken | null
> } @200;

> <br>HTTP-POST: /admin/registerpatient
> <br>JSON-PAYLOAD: {
> <br> > > > placeID: integer,
> <br> > > > token: integer,
> <br> > > > id: null,
> <br> > > > pos: null,
> <br> > > > first_name: string,
> <br> > > > surname: string,
> <br> > > > appointment_date: string,
> <br> > > > short_diagnosis: string,
> <br> > > > mobile: string,
> <br> > > > email: string, }
> <br>ANSWER: {
> <br> > > > authConfirmed: bool,
> <br> > > > response: "registered patient",
> <br> > > > id: integer,
> <br> > > > pos: integer,} @200;

> <br>HTTP-POST: /call
> <br>JSON-PAYLOAD: {
> <br> > > > placeID: integer,
> <br> > > > id: integer,
> <br> > > > isCalled: string, }
> <br>EMITS CHANNEL: "called" , integer
> <br>ANSWER: {response: "called patientID" + integer,
> } @200;

> <br>HTTP-POST: /move
> <br>JSON-PAYLOAD: {
> <br> > > > placeID: integer,
> <br> > > > id: integer,
> <br> > > > direction: string,
> <br> > > > index: integer, }
> <br> EMITS CHANNEL: "update" , {QueueData}
> <br>ANSWER: { response: "moved patientID",
> } @200;

> <br>HTTP-POST: /del
> <br>JSON-PAYLOAD: {
> <br> > > > placeID: integer,
> <br> > > > id: integer, }
> <br>ANSWER: {
> response: "deleted patientID" + integer,
> } @200;

## Socket Channels

Auth: Public

The Server sends Real Time information on these channels.

This channel is used to broadcast the information which
patient is called to the front desk.

> CHANNEL-NAME: called
>
> Payload: patientID: Integer

This channel is used to update the waitinglist whenever the positions change

> CHANNEL-NAME: update
>
> Payload: { list: [ {id: jj98, pos: 1}, {id: mr98, pos:2} ] }

This channel is used to send a live estimate of the mean processing time per person (dt). So the nth position has to wait n\*ptpp minutes to be called.

> CHANNEL-NAME: timing
>
> Payload: dt: Integer
