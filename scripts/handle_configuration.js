const fs = require('fs')
const path = require('path')
const localStorageElectron = require('electron-localstorage')
const { app } = require('electron')
const { ipcRenderer } = require('electron')

//const { update_watcher, reset_watcher, return_watched } = require(path.join(localStorageElectron.getItem('scripts_path'), 'handle_organization.js'))

const unwatch_old_folder = (folder) => { ipcRenderer.send('unwatch-old-folder', folder) }
const watch_new_folder = (folder) => { ipcRenderer.send('watch-new-folder', folder) }
const update_folders = (folders) => { ipcRenderer.send('update-folders', folders) }
const reset_watcher = () => { ipcRenderer.send('reset-watcher') }
const return_watched = () => { ipcRenderer.invoke('return-watched').then( (response) => {console.log(response)}) }
const enable_watch = () => { ipcRenderer.send('enable-watch') }
const disable_watch = () => { ipcRenderer.send('disable-watch') }

function load_user_configuration() {
    console.log('loading user configuration...')
    const configurations_path = localStorageElectron.getItem('configurations_path')
    const user_configuration_path = path.join(configurations_path, 'personalConfiguration.json')
    fs.exists(user_configuration_path, (does_file_exists) => {
        if (does_file_exists) {
            // when the app has already been launched 
            const personal_configuration = require(user_configuration_path)
            localStorageElectron.setItem('personal_configuration', JSON.stringify(personal_configuration))
        } else {

            let default_configuration = require(path.join(configurations_path, 'defaultConfiguration.json'))

            if (default_configuration.watchingFolders.length == 0) {

                console.log('setting up configuration for the first time...')
                // this is the first time launching the app
                // should load the proper config file
                
                // default folders to be watched for changes
                const downloads_path = app.getPath('downloads')
                const desktop_path = app.getPath('desktop')

                // default folders to be a destination
                const documents_path = app.getPath('documents') // for .txt .docx .pdf .pptx
                const music_path = app.getPath('music') // for .mp3 
                const videos_path = app.getPath('videos') // for .mp4 .wav
                const pictures_path = app.getPath('pictures') // for .png .jpeg



                // i add config to the default one
                default_configuration.watchingFolders.push(downloads_path)
                default_configuration.watchingFolders.push(desktop_path)

                default_configuration.destinationFolders[documents_path] = {
                    "names": [],
                    "formats": [],
                    "regexs": []
                }
                default_configuration.destinationFolders[documents_path].formats.push("txt") 
                default_configuration.destinationFolders[documents_path].formats.push("docx") 
                default_configuration.destinationFolders[documents_path].formats.push("pdf") 
                default_configuration.destinationFolders[documents_path].formats.push("pptx") 

                default_configuration.destinationFolders[music_path] = {
                    "names": [],
                    "formats": [],
                    "regexs": []
                }
                default_configuration.destinationFolders[music_path].formats.push("mp3") 

                default_configuration.destinationFolders[videos_path] = {
                    "names": [],
                    "formats": [],
                    "regexs": []
                }
                default_configuration.destinationFolders[videos_path].formats.push("mp4") 
                default_configuration.destinationFolders[videos_path].formats.push("wav") 

                default_configuration.destinationFolders[pictures_path] = {
                    "names": [],
                    "formats": [], 
                    "regexs": []
                }
                default_configuration.destinationFolders[pictures_path].formats.push("png") 
                default_configuration.destinationFolders[pictures_path].formats.push("jpeg") 

                // i set the initial values for the default configuration
                fs.writeFile(path.join(configurations_path, 'defaultConfiguration.json'), JSON.stringify(default_configuration), (error) => {
                    if (error) throw error
                    console.log("default configuration created")
                })
                const user_configuration = default_configuration
                // create the file with user's personalConfiguration
                update_user_configuration(user_configuration)
            } else {
                const user_configuration = default_configuration
                // create the file with user's personalConfiguration
                update_user_configuration(user_configuration)
            }
        }
    })
}

// function to handle the update on the user's configuration data
// case when you want to modify some value or add a new one
function update_user_configuration(new_user_config) {
    console.log("updating...")
    const configurations_path = localStorageElectron.getItem('configurations_path')
    fs.writeFile(path.join(configurations_path, 'personalConfiguration.json'), JSON.stringify(new_user_config), (error) => {
        if (error) throw error
        console.log("new configuration loaded")
    })
    // upload the configuration to localStorageElectron
    localStorageElectron.setItem('personal_configuration', JSON.stringify(new_user_config))
}

// function to reset to the initial configuration 
function reset_personal_configuration() {
    console.log('Resetting personal configuration...')
    // delete personal_configuration file 
    const configurations_path = localStorageElectron.getItem('configurations_path')
    const personal_configuration_file_path = path.join(configurations_path ,'personalConfiguration.json')
    const default_configuration_file_path = path.join(configurations_path ,'defaultConfiguration.json')
    fs.unlink(personal_configuration_file_path, () => {
        // recreate the personalConfiguration json file
        fs.copyFile(default_configuration_file_path, personal_configuration_file_path, (error) => {
            if (error) throw error
            // on copy sucess
            // reloads page
            const watching_paths_list = Array.from(document.getElementById('watching_paths_list').children)
            const destination_paths_list = Array.from(document.getElementById('destination_paths_list').children)
            for (let i = 0; i < watching_paths_list.length; i++) {
                watching_paths_list[i].remove()
            }
            for (let i = 0; i < destination_paths_list.length; i++) {
                destination_paths_list[i].remove()
            }
            const personal_configuration = require(path.join(configurations_path, 'personalConfiguration.json'))
            loadInitialConditions(personal_configuration)
            console.log('updating folders: ', personal_configuration.watchingFolders)
            update_folders(personal_configuration.watchingFolders)
            enable_watch()
        })
    })
}

module.exports = { load_user_configuration, update_user_configuration, reset_personal_configuration }
