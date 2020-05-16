# API

This document defines the RESTful Api interface between the backend server and the front-end web app. It can be used to authenticate, register new request and enter new data.

## APIs for patient UI
Auth: Public

Retrieve queue status with ticket-number and place-id. Patient received these IDs upon registration.

> HTTP-GET: /places/\<place-id\>/\<ticket-id\>
>
> Answer: 200/OK;\
> JSON-Payload: { relPosition: number; wasCalled: boolean }
>
> Answer: 4xx/Not ok

