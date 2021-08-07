# FOLDER CLEANER
> _GUI program made with electron for organizing and backing up your folders._ 
__We used chokidar to watch the folder changes thus making the program more resource efficient.__

## Table of content
* [Setup](#INSTALLATION)
* [How to modify it](HOW-TO-MODIFY-IT)
* [Todo](#TODO)
* [Contributors](#CONTRIBUTORS)

## INSTALLATION
> _Linux: You can download the latest packaged version from **https://drive.google.com/file/d/1AEpwDxUfJj3DrD09kbtJ5tRse0_bviEO/view?usp=sharing**, or you can clone this repo and pack the app with electron-packager executing: **yarn build:linux** and then you will have the packed app in the builds folders._
_Windows: Currently it does not support Windows._

## HOW TO MODIFY IT
> _You want to make some changes to improve your own experience? or maybe you want to contribute to this project?_ then **clone** this repo and execute **yarn start** when you're **inside the folder**.

## TODO
* - [ ] fix: when a new destination path is added should reload watchers.
* - [ ] fix: sizing issue with the folders destinations list and the parameters elements.
* - [ ] fix: when a new destination folder is added check if the sorting filters are not already being used.
* - [x] fix: remove devtools from settings window.
* - [x] fix: tray cleaning animation.
* - [ ] fix: remove shouldInit from personalConfig.json and check auto-launch on checkbox from tray menu.
* - [ ] new feature: folder backup.
* - [x] new feature: folder cleaning.
* - [x] new feature: handle languages system.
* - [x] new feature: tray icon and cleaning animation.
* - [ ] new feature: when user closes the settings panel and there's some list empty worn the user that the program may not work.
* - [ ] new feature: be able to set if the watch is folder recursive or not.
* - [ ] new feature: handle priority better if a file has multiple sorting parameters.
* - [x] new feature: add the option to edit a destination folder.
* - [x] new feature: when a file is not sorted should pop up a message to advise the user that should add more filters.
* - [ ] new feature: to be more efficient should only take out or add the watchers that correspond the specific path, instead of loading everything again.
* - [ ] new feature: choose if when launched should organize all the existing files.
* - [ ] new feature: add copy counter when the destination folder holds a file with the same name as the file to be moved.
* - [x] new feature: add the icons for the settings page.
* - [x] new feature: option to automatically launch up on startup.
* - [x] new feature: style the scrollbar of the settings window.
* - [x] new feature: create 'moved file notifications'.
* - [x] new feature: add notification when a file has been moved, and be able to open container folder (button inside notification).
* - [x] new feature: add option on tray menu to switch enable notifications.
* - [x] new feature: should add a section for changing the moving files parameters.
* - [ ] new feature: when list element clicked to remove only show the folder name, not the entire path.

## KNOWN ISSUES
> _We've launched the app knowning that it has some bugs yet to be fixed, some appear up in the TODO list to be fixed, but in this list we only included the ones that may affect the user experience, because it can cause data loss for example_
> * When a file that is being copied over to a destination folder already exists (with that name and format), it will replace the one that is already in the destination folder with the new one. (at the moment we don't have a mechanism to decide what to do in these scenarios)
> * Currently it does not work on windows, (still figuring out whats going on)

## CONTRIBUTORS
**_TOMAS VIDAL_**
