#!/usr/bin/env bash
curl -X DELETE -H "Content-Type: application/json" -d '{"email":"spl.troop125@gmail.com"}' http://powerful-sea-27631.herokuapp.com/users
curl -X POST -H "Content-Type: application/json" -d '{"email":"spl.wiltontroop125@gmail.com","name":"Troop 125 SPL","superuser":true}' http://powerful-sea-27631.herokuapp.com/users