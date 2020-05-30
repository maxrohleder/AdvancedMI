# API

This document defines the RESTful Api interface between the backend server and the front-end web app. It can be used to authenticate, register new request and enter new data.


> HTTP-GET: /places/\<place-id\>/\<ticket-id\>
>
> Answer: 200/OK;\
> JSON-Payload: { relPosition: number; wasCalled: boolean }
>
> Answer: 4xx/Not ok
> HTTP-GET: /places/\<place-id\>/\<ticket-id\>
>
> Answer: 200/OK;\
> JSON-Payload: { relPosition: number; wasCalled: boolean }
>
> Answer: 4xx/Not ok
> HTTP-GET: /places/\<place-id\>/\<ticket-id\>
>
> Answer: 200/OK;\
> JSON-Payload: { relPosition: number; wasCalled: boolean }
>
> Answer: 4xx/Not ok

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
