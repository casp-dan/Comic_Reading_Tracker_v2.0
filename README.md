The second version of my comic reading tracking app. This version uses electron.js with HTML and CSS, with a Python backend using Flask. Integrates a PostgreSQL database with Supabase. The structure for the database is included in the SQL folder. 

This app can:
- track all singular comic issues being read
- present all issues of any series in the database as well as the date each issue has been read
- present every issue read on a given date indicating the series name and issue number
- present all issues logged associated to a given creator
- display all series read in a given time frame
- provide stats on reading habits by publisher. Can filter for individual months, years, or between any two given dates.

Launches as an electron app.

## Requires:
- Account on https://metron.cloud/
- Account, API credentials, and creation of a schema with RPC functions on https://supabase.com/    Schema structure and RPC functions can be found in the SQL folder

## Coming Soon:
Easy user authentication

## Check out the older java version here: 
https://github.com/casp-dan/Comic_Reading_Tracker_v1.0
