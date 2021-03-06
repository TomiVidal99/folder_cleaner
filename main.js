// this is the main file for the program
// the objective is for it to control all the logic 

// import modules
const { app, Menu, Tray, BrowserWindow, ipcMain, Notification, shell } = require('electron')
const localStorage = require('electron-localstorage')
const fs = require('fs')
const url = require('url')
const path = require('path')
const chokidar = require('chokidar')
const isDev = process.env.APP_DEV ? (process.env.APP_DEV.trim() == "true") : false
const AutoLaunch = require('auto-launch')

// create the AutoLaunch object
let appLauncher = new AutoLaunch({
    name: 'Folder Cleaner'
});

// define useful paths
let app_directory, should_display_warning_notifications
if (isDev) {
    console.log('in development...')
    app_directory = process.cwd()
} else {
    app_directory = path.join(process.resourcesPath, 'app')
}
localStorage.setItem('app_directory', app_directory)
const assets_path = path.join(app_directory, "App/assets")
localStorage.setItem('assets_path', assets_path)
const pages_path = path.join(app_directory, "App/pages")
localStorage.setItem('pages_path', pages_path)
const scripts_path = path.join(app_directory, "App/scripts")
localStorage.setItem('scripts_path', scripts_path)
const configurations_path = path.join(app_directory, "App/configurations")
localStorage.setItem('configurations_path', configurations_path)
localStorage.setItem('app_version', app.getVersion())

// import the cokidar class
const { chokidar_class } = require(path.join(scripts_path, 'chokidar_class.js'))
const watcher = new chokidar_class(chokidar, null, handle_folder_change)

const watch_new_folder = (new_folder) => {
    console.log('called watch_new_folder on main')
    watcher.watch_new_folder(new_folder)
}
const unwatch_old_folder = (old_folder) => {
    console.log('got argument: ', old_folder)
    watcher.unwatch_old_folder(old_folder)
}
const update_folders = (new_folders) => {
    console.log('got arguments: ', new_folders)
    watcher.update_folders(new_folders)
}
const reset_watcher = () => {
    watcher.reset_watcher()
}
const enable_watch = () => {
    watcher.create_watcher()
}
const disable_watch = () => {
    watcher.shutdown_watch()
}
const switch_watching_state = () => {
    console.log('switch_watching_state is clicked')
    watcher.switch_watching_state()
}
const return_watched = async () => {
    const response = await watcher.return_watched() 
    return response
}
ipcMain.once('watch-new-folder', (event, folder) => { watch_new_folder(folder) })
ipcMain.once('unwatch-old-folder', (event, folder) => { unwatch_old_folder(folder) } )
ipcMain.once('reset-watcher', reset_watcher)
ipcMain.once('update-folders', (event, folders) => { update_folders(folders) })
ipcMain.handle('return-watched', return_watched )
ipcMain.once('enable-watch', enable_watch)
ipcMain.once('disable-watch', disable_watch)

// defining tray icons
const tray_icon = "trayIcon_16x16.png"
const tray_icon_watching_1 = "trayIconWatchingActive1.png"
const tray_icon_watching_2 = "trayIconWatchingActive2.png"
const tray_icon_backup_1 = "trayIconBackupActive1.png"
const tray_icon_backup_2 = "trayIconBackupActive2.png"

// execute the function that stores global language and user_language on electron-localstorage
require(path.join(scripts_path, "handle_language_creation.js")).handle_language_creation()

// i define the text of the context menu accordingly to the current language
const user_language = localStorage.getItem("user_language")
const raw_json = require(path.join(assets_path, user_language + ".json"))
const global_language_texts = JSON.parse(JSON.stringify(raw_json)).mainjs
const notifications_texts = JSON.parse(JSON.stringify(raw_json)).notifications
const tray_text_settings = global_language_texts.tray_text_settings
const tray_text_watching = global_language_texts.tray_text_watching
const tray_text_backups = global_language_texts.tray_text_backups
const tray_text_language = global_language_texts.tray_text_language
const tray_text_quit = global_language_texts.tray_text_quit
const tray_text_startup = global_language_texts.tray_text_startup
const tray_text_version = global_language_texts.tray_text_version
const tray_text_warning_notifications = global_language_texts.tray_text_warning_notifications

// function to create notifications
function showNotification(TITLE, BODY, callback) {
    const noti = {
        title: TITLE,
        body: BODY
    }
    new Notification(noti).show()
}

// define general variables
const switching_time_animation = 700 //miliseconds
let switching_icon_interval = null
let switching_state = false

// define the settings window
let settings_window
let is_settings_hidden = true

// i create the icon tray
let tray = null
let context_menu = Menu.buildFromTemplate([
    { 
        label: tray_text_settings,
        type: 'normal',
        click: handle_open_settings
    },
    { 
        type: 'separator', 
    },
    { 
        label: tray_text_watching,
        type: 'checkbox', 
        checked: true,
        click: () => {handle_tray_watching_click(context_menu.items[1].checked)}
    },
    //{ 
        //label: tray_text_backups,
        //type: 'checkbox', 
        //click: () => {handle_tray_backups_click(context_menu.items[2].checked)}
    //},
    { 
        label: tray_text_startup,
        type: 'checkbox',
        click: handle_tray_startup_click
    },
    { 
        label: tray_text_warning_notifications,
        type: 'checkbox', 
        checked: true,
        click: handle_tray_warning_notifications_click
    },
    { 
        type: 'separator', 
    },
    { 
        label: tray_text_language + user_language,
        type: 'normal',
        click: handle_tray_language_click
    },
    { 
        label: tray_text_version + app.getVersion(),
        type: 'normal', 
    },
    { 
        type: 'separator', 
    },
    { 
        label: tray_text_quit,
        type: 'normal',
        click: handle_tray_quit_click
    },
])

function handle_tray_warning_notifications_click() {
    // called when clicked on the tray menu
    // should switch the value on the config file
    let personal_configuration = JSON.parse(localStorage.getItem('personal_configuration'))
    if (should_display_warning_notifications)  {
        personal_configuration.warning_notifications = "disabled"
        context_menu.items[4].checked = false
    } else {
        personal_configuration.warning_notifications = "enabled"
        context_menu.items[4].checked = true
    }

    should_display_warning_notifications = !should_display_warning_notifications

    localStorage.setItem('personal_configuration', JSON.stringify(personal_configuration))
    tray.setContextMenu(context_menu)

    console.log("changed warnings to: ", context_menu.items[4].checked)

}

// TODO finish both functions to apply the states to the configuration file
// define the function that handles the click on the icon tray
function handle_tray_watching_click(new_state) {
    console.log("Watching is: ", new_state)
    switch_watching_state()
}

function handle_tray_startup_click() {
    // function to switch between enable and disable of the auto startup script
   
    // do not run while in dev
    if (isDev) {
        return;
    }
    
    console.log("Should switch auto-launch state")

    // switch the enable state of the startup script
    appLauncher.isEnabled().then( function(enabled) {
        console.log("Switched state")
        if (enabled) {
            return appLauncher.disable()
        } else {
            return appLauncher.enable()
        }
    }).then( function(err) {
        console.log(err);
    });

}

function handle_cleaning_animation_tray_icon(new_state) {
    clearInterval(switching_icon_interval)
    if (new_state) {
        let animation_count = 0
        switching_icon_interval = setInterval(() => {
            animation_count += 1
            if (animation_count < 6) {
                if (switching_state) {
                    tray.setImage(path.join(assets_path, tray_icon_watching_1))
                } else {
                    tray.setImage(path.join(assets_path, tray_icon_watching_2))
                }
                switching_state = !switching_state
            } else {
                handle_cleaning_animation_tray_icon(false)
            }
        }, switching_time_animation)
    } else {
        tray.setImage(path.join(assets_path, tray_icon))
    }
}

// define the function that handles the click on the backup tray text
function handle_tray_backups_click(new_state) {
    console.log("backups to: ", new_state)
    clearInterval(switching_icon_interval)
    if (new_state) {
        switching_icon_interval = setInterval(() => {
            if (switching_state) {
                tray.setImage(path.join(assets_path, tray_icon_backup_1))
            } else {
                tray.setImage(path.join(assets_path, tray_icon_backup_2))
            }
            switching_state = !switching_state
        }, switching_time_animation)
    } else {
            tray.setImage(path.join(assets_path, tray_icon))
    }
}

// TODO change icon to a wrench or smth like that when the settings menu is opened
// function to handle when the tray settings button is clicked, it should open the settings window
function handle_open_settings() {
    if (is_settings_hidden) {
        settings_window.show()
        showNotification(notifications_texts.chokidarBugNotification.title, notifications_texts.chokidarBugNotification.body, null)
    } else {
        settings_window.hide()
    }
    is_settings_hidden = !is_settings_hidden
}

// this function is trigger when the language button is clicked at the context menu on the tray
function handle_tray_language_click() {
    console.log("Should change language")
}

// triggers when quit button on tray context menu is clicked
function handle_tray_quit_click() {
    settings_window.close()
    disable_watch()
    if (process.platform != "darwin") {
        app.quit()
    }
    app.exit(0)
}

// handle the creation of the app language
function handle_language_locale(lang) {
    const user_language = localStorage.getItem('user_language')
    const available_languages = require(path.join(configurations_path, 'defaultConfiguration.json')).availableLanguages
    if (user_language == undefined) {
        let should_apply_new_language = false
        for (let i = 0; i < available_languages.length; i++) {
            if (available_languages[i] == lang) {
                should_apply_new_language = true
            }
        }
        if (should_apply_new_language) {
            localStorage.setItem('user_language', lang)
        } else {
            localStorage.setItem('user_language', 'en-US')
        }
    }
}

// create the settings window
function createWindow() { 
    settings_window = new BrowserWindow({
        width: 800,
        height: 600,
        minWidth: 400,
        minHeight: 400,
        devTools: false,
        webPreferences: {
            //contextIsolation: false,
            nodeIntegration: true,
            enableRemoteModule: true
        },
        resizable: true,
        show: isDev,
        //show: true,
        title: 'Folder Cleaner Settings Panel',
    }) 
    const main_page_path = path.join(pages_path, "settings.html")
    settings_window.loadURL(url.format({ 
        pathname:  main_page_path,
        protocol: 'file:', 
        slashes: true
    })) 
    settings_window.on('close', (event) => {
        event.preventDefault()
        handle_open_settings()
    })
    if (!isDev) {
        settings_window.removeMenu()
    }
}  

app.whenReady().then( () => {

    createWindow()

    // set the value of the warning_notifications after the personalConfiguration is loaded, do it before it loads the contextMenu of the tray
    tray = new Tray(path.join(assets_path, tray_icon))
    tray.setToolTip('Folder Cleaner')

    if (localStorage.getItem('personal_configuration')) {
        const show_warning_notifications = JSON.parse(localStorage.getItem('personal_configuration')).warning_notifications
         should_display_warning_notifications = show_warning_notifications ? (show_warning_notifications == "enabled") : false
        context_menu.items[4].checked = should_display_warning_notifications
    }
    
    tray.setContextMenu(context_menu)

    // sets the language if theres no language defined currently
    handle_language_locale(app.getLocale())
    
    // tray user interaction improved, just works on Windows and MacOS
    tray.on('click', handle_open_settings)
    tray.on('double-click', handle_open_settings)
    const watching_folders = JSON.parse(localStorage.getItem('personal_configuration')).watchingFolders
    watcher.update_folders(watching_folders)

    // set the settings panel icon
    const icon_path = path.join(assets_path, 'settings_icon_64x64.png')
    settings_window.setIcon(icon_path)

    check_load_on_startup()

}).catch( (error) => {
    console.log(error)
})

// checks if next system startup should open the app
function check_load_on_startup() {
    // if the auto_launch is active set the checkbox to true
    console.log("loading previous data...")
    appLauncher.isEnabled().then( (is_enabled) => {
        console.log("Got new value: ", is_enabled)
        context_menu.items[3].checked = is_enabled
    }).catch( (e) => {
        if (e) throw e
    })
    tray.setContextMenu(context_menu)
}

// i execute the command to trigger the current state in case that some checkbox is already checked
handle_tray_watching_click(context_menu.items[1].checked)

// handle the load of the user configuration
require(path.join(scripts_path, "handle_configuration")).load_user_configuration()

// TODO move all functions of sorting the files to an independent file
function move_file(from, to) {
    // return TRUETRUE  if the file was moved to the location
    // if the file was not moved return FALSE
    // TODO: add option to change this variable to change the app behavior
    const should_cancel_on_same_destination_file = 'dont_copy' 
    try {
        switch (should_cancel_on_same_destination_file) {
            case 'dont_copy':
                fs.copyFileSync(from, to, fs.constants.COPYFILE_EXCL)
                break;
            case 'keep_both': 
                fs.copyFileSync(from, to, fs.constants.COPYFILE_FICLONE_FORCE)
                break;
        }
        fs.copyFileSync(from, to)
        // on copy sucess remove copied file
        try {
            fs.unlinkSync(from)
            const today = new Date()
            const complete_date = today.getHours()+':'+today.getMinutes()+':'+today.getSeconds()+' '+today.getDate()+'/'+today.getMonth()
            console.log('At: ', complete_date)
            display_last_file_moved(to, complete_date)
            save_last_moved_path(to, complete_date)
            console.log('copied')
            showNotification(notifications_texts.fileMoved.title, to + " " + notifications_texts.fileMoved.title + " " + complete_date, () => {
                shell.openPath(filename.join("/"))
            })
            return(true)
        } catch (err) {
            console.log(err)
            return(false)
        }
    } catch (err) {
        console.log(err)
        return(false)
    }
}

function sort_out_file(folder, file, complete_path, keywords, unfiltered) {
    // i check if the format exists, if not just quit
    if (unfiltered == undefined) {
        return;
    }
    // first i loop through all the keywords 
    for (let k = 0; k < keywords.length; k++) {
        const keyword = keywords[k]
        const unfiltered_splitted = unfiltered.toLowerCase().split(keyword) // i ignore upper cases
        // if there is a keyword proceed to move the file and return true, else return false
        if (unfiltered_splitted.length > 1) {
            // when the file format is one that has to be moved 
            const to_path = path.join(folder, file)
            // only copy the file if the destination folder exists
            the_path_exists = fs.existsSync(folder)
            if (!the_path_exists) {
                // create the path and then move the file
                try {
                    fs.mkdirSync(folder)
                } catch (err) {
                    console.log(err)
                    showNotification(notifications_texts.filePathError.title, notifications_texts.filePathError.body, null)
                }
            } else {
                // check if a file with the same name is already there
                the_name_is_already_taken = fs.existsSync(to_path)

                // if there is not such a file, move it 
                if (!the_name_is_already_taken) {
                    console.log("from: ", complete_path)
                    console.log("to: ", to_path)
                    // TODO: make error handling if the file was not move because there was a problem
                    file_was_moved = move_file(complete_path, to_path)
                    return(true)
                } else {
                    // TODO else pop a menu of what to do
                    if (should_display_warning_notifications) {
                        showNotification(notifications_texts.fileAlreadyExists.title, notifications_texts.fileAlreadyExists.body, null)
                    }
                    console.log('Error, the file was not moved, another one was already in the folder')
                    // this should be false if the file was not move, but then handling the more filters recommendation should be different
                    return(true)
                }
            }
        } 
    }
    return(false)
}

// callback when a file is added to a watching folder
function handle_folder_change(complete_path) {
    handle_cleaning_animation_tray_icon(true)
    // when a change of files has ocurred
    const destination_folders = JSON.parse(localStorage.getItem('personal_configuration')).destinationFolders
    const splitted_path = complete_path.split('/')
    const file = splitted_path[(splitted_path.length-1)]
    const file_name = file.split('.')[0]
    const file_format = file.split('.')[1]

    splitted_path.pop()
    const file_path = splitted_path.reduce((a,b) => { return a+'/'+b })

    // priority on this one
    // sorts by names
    let is_sorted = false

    // filter by names
    for (let folder in destination_folders) {
        const current_names_array = destination_folders[folder].names
        let result = sort_out_file(folder, file, complete_path, current_names_array, file_name)
        if (result) {
            is_sorted = result
        }
    }

    // filter by formats
    if (!is_sorted) {
        for (let folder in destination_folders) {
            const current_formats_array = destination_folders[folder].formats
            let result = sort_out_file(folder, file, complete_path, current_formats_array, file_format)
            if (result) {
                is_sorted = result
            }
        }
    }

    console.log(is_sorted)
    if (!is_sorted && should_display_warning_notifications) {
        // send a notification for the user to warn him to add more filter to the app
        console.log("The file was not sorted")
        showNotification(notifications_texts.fileNotSorted.title, notifications_texts.fileNotSorted.body, null)
    }

}


//function that display whats the last file moved and it shows a button to open up with a file manager
function display_last_file_moved(file, date) {
    const code = `document.getElementById("last_moved_path").innerHTML = "${file}"; document.getElementById("last_moved_date").innerHTML = "${date}";`
    settings_window.webContents.executeJavaScript(code)
    settings_window.webContents.executeJavaScript("document.getElementById('display_path_wrapper').setAttribute('style', 'display: block')")
}

//function to save to personal configuration the path of the moved file
function save_last_moved_path(path, date) {
    let personal_configuration = JSON.parse(localStorage.getItem('personal_configuration'))
    personal_configuration.last_moved.path = path
    personal_configuration.last_moved.date = date
    fs.writeFile(`${configurations_path}/personalConfiguration.json`, JSON.stringify(personal_configuration), (error) => {if (error) throw error})
}

// when a new destiantion or watching folder is added should reset watchers
ipcMain.on('should-reset-watchers', () => {
    console.log("RESETTING WATCHERS @ ", new Date().getSeconds());
    reset_watcher();
})
