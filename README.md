# TracCar2APRS
Simple software to send TracCar positions to APRS network


# How to run:
node traccar2aprs.js

# TracCar config:
on traccar/conf/traccar.xml file add:

<entry key='forward.enable'>true</entry>
<entry key='forward.json'>true</entry>
<entry key='forward.url'>http://localhost:3001/aprs</entry>

