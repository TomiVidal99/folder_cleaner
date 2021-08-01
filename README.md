# FOLDER CLEANER
> _GUI program made with electron for organizing and backing up your folders._ 
__We used chokidar to watch the folder changes thus making the program more resource efficient.__

# HOW TO MODIFY IT
_You want to make some changes to improve your own experience? or maybe you want to contribute to this project?_ then **clone** this repo and execute **yarn start** when you're **inside the folder**.

# INSTALLATION
_Linux: You can download the latest packaged version from **https://drive.google.com/file/d/1PU7Xmap2G1qdhw9NRfVA9hCE1Tka9Pp4/view?usp=sharing**, or you can clone this repo and pack the app with electron-packager executing: **yarn build:linux** and then you will have the packed app in the builds folders._
_Windows: Currently it does not support Windows._

## TODO
* - [ ] folder backup.
* - [x] folder cleaning.
* - [ ] handle languagues system.
* - [x] tray icon and cleaning animation.
* - [ ] when user closes the settings panel and there's some list empty worn the user that the program may not work.
* - [ ] be able to set if the watch is folder recursive or not.
* - [ ] handle priority better if a file has multiple sorting parameters.
* - [ ] add the option to edit a destination folder.
* - [x] when a file is not sorted should pop up a message to advise the user that should add more filters.
* - [ ] to be more efficient should only take out or add the watchers that correspond the specific path, instead of loading everything again.
* - [ ] choose if when launched should organize all the existing files.
* - [ ] when a new destination folder is added check if the sorting filters are not already being used.
* - [ ] add copy counter when the destination folder holds a file with the same name as the file to be moved.
* - [x] add the icons for the settings page.
* - [x] option to automatically launch up on startup.
* - [x] remove devtools from settings window.
* - [x] style the scrollbar of the settings window.
* - [x] fix tray cleaning animation.
* - [ ] remove shouldInit from personalConfig.json and check auto-launch on checkbox from tray menu.
* - [ ] create 'moved file notifications'.
* - [x] add option on tray menu to switch enable the 'moved file notifications'.
* - [ ] should add a section for changing the moving files parameters.
* - [ ] when list element clicked to remove only show the folder name, not the entire path.

## KNOWN ISSUES
_We've launched the app knowning that it has some bugs yet to be fixed, some appear up in the TODO list to be fixed, but in this list we only included the ones that may affect the user experience, because it can cause data loss for example_
* When a file that is being copied over to a destination folder already exists (with that name and format), it will replace the one that is already in the destination folder with the new one. (at the moment we don't have a mechanism to decide what to do in these scenarios)
* Currently it does not work on windows, (still figuring out whats going on)

## CONTRIBUTORS
**_TOMAS VIDAL_**
