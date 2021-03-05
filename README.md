# FOLDER CLEANER
_GUI program made with electron for organizing and backing up your folders._
__We used chokidar to watch the folder changes thus making the program more resource efficient.__

# HOW TO MODIFY IT
_You want to make some changes to improve your own experience? or maybe you want to contribute to this project?_ then **clone** this repo and execute **yarn start** when you're **inside the folder**.

# INSTALLATION
_You can download the latest packaged version from **https://drive.google.com/drive/folders/1whSN66UTOQHYBsykzFaHpOZVt6LGyRMg?usp=sharing**, or you can clone this repo and pack the app with electron-packager executing: **electron-packager [SOURCE-DIRECTOY] packaged_app --icons**, or also by executing **yarn build** inside the cloned folder it will package the app (this last method currently doesn't work straight up from the clone, you'll have to create a folder named resources and then iside of it another one called app, and then copy assets, configurations, scripts to app).

## TODO
* - [ ] folder backup 
* - [x] folder cleaning
* - [ ] handle languagues system
* - [x] tray icon and cleaning animation
* - [ ] when user closes the settings panel and there's some list empty worn the user that the program may not work
* - [ ] be able to set if the watch is folder recursive or not
* - [ ] handle priority better if a file has multiple sorting parameters
* - [ ] add the option to edit a destination folder
* - [ ] when a file is not sorted should pop up a message to advise the user that should add more filters
* - [ ] to be more efficient should only take out or add the watchers that correspond the specific path, instead of loading everything again
* - [ ] add auto startup functionality
* - [ ] choose if when launched should organize all the existing files
* - [ ] when a new destination folder is added check if the sorting filters are not already being used
* - [ ] add copy counter when the destination folder holds a file with the same name as the file to be moved
* - [x] add the icons for the settings page
* - [ ] option to automatically launch up on startup 
* - [ ] remove devtools from settings window
* - [ ] style the bar of the settings window
* - [ ] fix tray cleaning animation 

## KNOWN ISSUES
_We've launched the app knowning that it has some bugs yet to be fixed, some appear up in the TODO list to be fixed, but in this list we only included the ones that may affect the user experience, because it can cause data loss for example_
* When a file that is being copied over to a destination folder already exists (with that name and format), it will replace the one that is already in the destination folder with the new one. (at the moment we don't have a mechanism to decide what to do in these scenarios)
* Currently it does not work on windows, (still figuring out whats going on)

## CONTRIBUTORS
**_TOMAS VIDAL_**
