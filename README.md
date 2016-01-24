Sense360 Coding Exercise

--------------------
Time
--------------------

4-6 hours

--------------------
Goal
--------------------

Build a service (or program) that determines if a user is inside a restaurant based on input location data.

--------------------
Background
--------------------

We have a mobile app that pulls a users’ location for 2 minutes. It then sends the location information to the server to determine if the user is at a restaurant.

--------------------
Options
--------------------

You are free to build a webapp that ingests the JSON data or to create an program that reads from a file. The instructions assume webapp. Pick whichever option you think is best.

--------------------
Requirements
--------------------

-	Create an endpoint that receives a list of latitude, longitude points along with their accuracies.
-	If the user is determined to be at a restaurant, then the details of the restaurant should be returned. Let us know which details will be returned.
- Create 2 separate algorithms for determining if a user is at a restaurant or not. One algorithm should the simplest you can think of. The second algorithm should be more advanced and completed only if you have time.

-	If the user is determined to NOT be at a restaurant, then a agreed upon response should be returned.
-	You are free to choose any POI provider for the task. Links to Factual’s API are below if needed.
-	Push code to GitHub and share link.

--------------------
Input params
--------------------

1. List of locations (of the user):
  - Latitude/Longitude: The center point of where the user was.
  - Accuracy: A radius in meters from the center point that forms a circle in which we are 100% confident the user is within.
  - Timestamp: The time that the location was pulled
2. Query string parameter (or program switch) that identifies which algorithm to use, simple or advanced algorithm.


--------------------
Documentation
--------------------
-	Factual: http://developer.factual.com
-	Read API: http://developer.factual.com/api-docs/#Read
-	Factual Categories: http://developer.factual.com/working-with-categories/

--------------------
Testing
--------------------

3 sample input files have been provided. They are in "json-lines" format. JSON delimited by newlines.

at_restaurant.jsonl: contains locations, tracking a user who is seated at a restaurant.
walking.jsonl: contains locations, tracking a user who was walking by the restaurant.
bus_stop.jsonl: contains locations, tracking a user who is at a bus stop.

If testing a webapp, the curl command is:

curl -i -X POST -H "Content-Type: application/octet-stream" --data-binary @at_restaurant.jsonl  "http://[your server]:[your port]/[your endpoint]"