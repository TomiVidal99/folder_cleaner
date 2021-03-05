// define some required modules
const path = require('path')
const fs = require('fs')
const localStorage = require('electron-localstorage')

// define useful paths
const assets_path = localStorage.getItem('assets_path')

// i select the correct language json file if the user didnt select any i asign en-US as default
function handle_language_creation() {
    console.log("executed language creation")
    const user_language = localStorage.getItem("user_language")
    let global_language
    if (user_language) {
        console.log("Stored user language")
        file_name = user_language + ".json"
        language_path = path.join(assets_path, file_name)
        global_language_raw = require(language_path)
        global_language = JSON.parse(JSON.stringify(global_language_raw))
    } else {
        console.log("NO USER LANGUAGE")
        localStorage.setItem("user_language", "en-US")
        global_language_raw = require(path.join(assets_path, "en-US.json"))
        global_language = JSON.parse(JSON.stringify(global_language_raw))
    }
    localStorage.setItem("global_language", global_language)
}


module.exports = { handle_language_creation }
