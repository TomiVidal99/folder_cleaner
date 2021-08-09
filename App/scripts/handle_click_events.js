// include this on the html to handle all the click froms buttons and forms
const { dialog } = require('electron').remote
const { shell } = require('electron')

// new_path MUST be an array
function add_watching_paths(new_paths) {
    const ul_tag = document.getElementById('watching_paths_list')
    const items_inside_list = ul_tag.children
    const add_list_element = (path) => {
        const class_data = 'list-group-item'
        const onclick_data = 'handle_selected_watching_folder_item(this)'
        const new_list_tag = document.createElement('li')
        new_list_tag.innerHTML = path
        new_list_tag.setAttribute('class', class_data)
        new_list_tag.setAttribute('onclick', onclick_data)
        ul_tag.appendChild(new_list_tag)
    }
    if (items_inside_list.length > 0) {
        // when the user has choosen one or more paths and there are already items on the list
        for (let i = 0; i < new_paths.length; i++) {
            const path_to_add = new_paths[i]
            let is_already_added = false
            for (let j = 0; j < items_inside_list.length; j++) {
                const already_listed_item = items_inside_list[j].innerHTML
                if (path_to_add == already_listed_item) {
                    // when the path that im going to add is not in the list
                    is_already_added = true
                    break
                }
            }
            if (!is_already_added) {
                add_list_element(path_to_add)
            } else {
                // when the path that im going to add is already in the list
                alert(global_language.settings.alerts.watchingPathAlreadySelected + ": " + path_to_add)
                break
            }
        }
    } else if (items_inside_list.length == 0) {
        for (let i = 0; i < new_paths.length; i++) {
            const path_to_add = new_paths[i]
            add_list_element(path_to_add)
        }
    }
    // check if it should display badge
    display_warning_badge_watching_paths()

}

function handle_select_watching_path() {
    dialog.showOpenDialog({
        properties: [
            'openDirectory',
            'multiSelections',
            'createDirectory'
        ]
    }).then((data) => {
        const user_has_cancelled = data.canceled
        const selected_paths = data.filePaths
        if (!user_has_cancelled && selected_paths.length > 0) {
            add_watching_paths(selected_paths)
            let personal_configuration = JSON.parse(localStorageElectron.getItem('personal_configuration'))
            for (let i = 0; i < selected_paths.length; i++) {
                personal_configuration.watchingFolders.push(selected_paths[i])
            }
            update_user_configuration(personal_configuration)
            watch_new_folder(selected_paths)
        }
    }).catch((error) => {
        console.log(error)
    })
}

// handler function when a li tag element of the ul from the watching paths is clicked
function handle_selected_watching_folder_item(selected_li_tag) {
    const previous_class = selected_li_tag.getAttribute('class')
    const splitted_class = previous_class.split('selected_watching_li')
    let new_class
    if (splitted_class.length > 1) {
        // is already selected
        new_class = splitted_class[0]
    } else {
        // is NOT selected
        new_class = previous_class + ' selected_watching_li'
    }
    selected_li_tag.setAttribute('class', new_class)
    display_remove_watching_paths()
}

// handles if it should display a remove button to delete all the selected watching paths
function display_remove_watching_paths() {

    const element_to_remove = document.getElementsByClassName('selected_watching_li')
    const button_element = document.getElementById('remove_watching_folders')
    const button_element_not_displayed = button_element.classList.contains('d-none')
    
    if (element_to_remove.length > 0 && button_element_not_displayed) {
        // there's elements to remove and the button is hidden thus should remove the hide class
        button_element.classList.remove('d-none')
    } else if (element_to_remove.length == 0 && !button_element_not_displayed ) {
        // there's not elements to remove and the button is being display, so i should add the hide class
        button_element.classList.add('d-none')
    }
}

// button to remove selected li elements from watching paths ul tag
function handle_remove_selected_watching_paths() {
    const selected_li_tags = Array.from(document.getElementsByClassName('selected_watching_li'))
    for (let i = (selected_li_tags.length-1); i > -1; i--) {
        console.log('Removed: ', selected_li_tags[i].innerHTML)
        unwatch_old_folder(selected_li_tags[i].innerHTML)
        selected_li_tags[i].remove()
    }

    // i update the personal_configuration file with the new values
    const new_list_of_tags = document.getElementById('watching_paths_list').children
    let personal_configuration = JSON.parse(localStorageElectron.getItem('personal_configuration'))
    let new_path_list = []
    for (let i = 0; i < new_list_of_tags.length; i++) {
        new_path_list.push(new_list_of_tags[i].innerHTML)
    }
    personal_configuration.watchingFolders = new_path_list
    update_user_configuration(personal_configuration)

    // check if there's any element left to display hint text
    display_warning_badge_watching_paths()
    // check if the remove button should be displayed
    display_remove_watching_paths()

}

// checks if a warning badge should exist to hint the user of adding watching folders to the list
function display_warning_badge_watching_paths() {
    const warning_badge = document.getElementById('noWatchingFoldersWarning')
    const ul_list = document.getElementById('watching_paths_list')
    const li_elements = ul_list.children
    if (warning_badge && li_elements.length > 0) {
        // the warning badge exists and there are list elements thus the badge should be removed
        warning_badge.remove()
    } else if (warning_badge == null && li_elements.length == 0) {
        // there's no warning badge and the list is empty, so the badge should be created
        const badge = document.createElement('div')
        const class_data = 'badge badge-warning'
        const badge_id = 'noWatchingFoldersWarning'
        badge.innerHTML = global_language.settings.commonText[badge_id]
        badge.setAttribute('class', class_data)
        badge.setAttribute('id', badge_id)
        ul_list.appendChild(badge)
    }
}

// handler when clicked to add a destination folder
function handle_select_destination_folder() {
    dialog.showOpenDialog({
        properties: [
            'openDirectory'
        ]
    }).then((data) => {
        const user_has_cancelled = data.canceled
        const selected_path = data.filePaths[0]

        // check if the selected path hasnt been already selected
        const destinations_paths = document.getElementById('destination_paths_list').children
        for (let i = 0; i < destinations_paths.length; i++) {
            const item_path = destinations_paths[i].children[0].innerText
            if (item_path == selected_path) {
                // the path its already selected, should display warning
                alert(global_language.settings.alerts['destinationPathAlreadySelected'])
                const destination_items = document.getElementById('destination_paths_list').children
                for (let i = 0; i < destination_items.length; i++) {
                    if (destination_items[i].children[0].innerText == selected_path) {
                        handle_edit_properties(destination_items[i].children[1])
                    }
                }
            }
        }

        if (!user_has_cancelled && selected_path) {
            display_folder_properties(selected_path, false)
        }
    }).catch((error) => {
        console.log(error)
    })
    display_warning_badge_destination_paths()
}

function loadInitialConditions(configuration) {
    let personal_configuration
    if (configuration) {
        personal_configuration = configuration
    } else {
        personal_configuration = JSON.parse(localStorageElectron.getItem('personal_configuration'))
    }

    // loads the watching folders if there are
    const watching_paths = personal_configuration.watchingFolders
    if (watching_paths.length > 0) {
        add_watching_paths(watching_paths)
    }

    // loads the destination folders if there are
    const destination_folders = personal_configuration.destinationFolders
    for (let folder in destination_folders) {
        create_destination_folders_elements(folder, destination_folders[folder].names, destination_folders[folder].formats, destination_folders[folder].regexs)
    }

    display_warning_badge_watching_paths()
    display_warning_badge_destination_paths()
}

// triggered when user selects paths from destination ul tag
function handle_selected_destination_folder_item(selected_item) {
    const selected_class = 'selected_destination_li'
    const previous_class = selected_item.getAttribute('class')
    const splitted_class = previous_class.split(selected_class)
    let new_class
    if (splitted_class.length > 1) {
        // is already selected
        new_class = splitted_class[0]
    } else {
        // is NOT selected
        new_class = previous_class + ' ' + selected_class
    }
    selected_item.setAttribute('class', new_class)
    display_warning_badge_destination_paths()
}

// handler when clicked to remove folder from list
function remove_destination_folder() {
    const selected_li_tags = Array.from(document.getElementsByClassName('selected_destination_li'))
    let personal_configuration = JSON.parse(localStorageElectron.getItem('personal_configuration')) 
    let destination_folders = personal_configuration.destinationFolders

    for (let i = (selected_li_tags.length-1); i > -1; i--) {
        for (let folder in destination_folders) {
            if (selected_li_tags[i].children[0].innerHTML == folder) {
                delete destination_folders[folder]
            }
        }
        selected_li_tags[i].remove()
    }

    // updates the personalConfiguration json file
    update_user_configuration(personal_configuration)

    // check if there's any element left to display hint text
    display_warning_badge_destination_paths()

    // check if the remove button should be displayed
    display_remove_destination_paths()

}

// decides if the button to remove selected path should exist
function display_remove_destination_paths() {
    const element_to_remove = document.getElementsByClassName('selected_destination_li')
    const button_element = document.getElementById('remove_destination_folders')
    const button_hidden = button_element.classList.contains('d-none')
    
    if (element_to_remove.length > 0 && button_hidden) {
        // there's elements to remove and the button is hidden thus should remove the hide class
        button_element.classList.add('d-none')
    } else if (element_to_remove.length == 0 && !button_hidden) {
        // there's not elements to remove and the button is being display, so i should add the hide class
        button_element.classList.remove('d-none')
    }

}

// function to define if the properties for the current selected folder should apppear
function display_folder_properties(path, close) {
    const wrapper = document.getElementById("destination_properties_wrapper")
    const path_display_element = document.getElementById('destination-properties-path-display')
    const splitted_class = wrapper.getAttribute('class').split('d-none')

    // i diplay the current path
    if (path) {
        path_display_element.innerHTML = path
    }

    // display the properties panel if is not being displayed atm
    if (splitted_class.length > 1 && !close) {
        // case when the properties panel is NOT being displayed
        wrapper.setAttribute('class', splitted_class[0])
    } 
    else if (close) {
        // case when the properties panel IS being displayed
        const new_class = splitted_class[0] + ' d-none'
        wrapper.setAttribute('class', new_class)
    }

    display_warning_badge_destination_paths()
}

// when a new property is summited
function handle_destination_property(event, is_summited, type) {
    // is_summited is boolean and is to check if the call comes from the input or the img
    // type is name, format or regex
    // TODO set to lower case property_val
    if (!is_summited || event.keyCode == 13) {
        const input_id = 'destination_' + type + '_property_input'
        const input_tag = document.getElementById(input_id)
        const property_val = input_tag.value.toLowerCase()
        // TODO should check for valid type of names/format/regex
        if (property_val != '') {
            // the user has entered a pattern
            const stored_destination_folders = JSON.parse(window.localStorage.getItem('destination_folders'))
            let property_already_introducted = false
            for (let folder_path in stored_destination_folders) {
                const current_folder_properties= stored_destination_folders[folder_path][type]
                // i loop through all the properties stored in this current folder so i can check
                // if the user has introduced a sorting pattern that already exists
                for (let j = 0; j < current_folder_properties.length; j++) {
                    const stored_name = current_folder_properties[j]
                    if (property_val == stored_name) {
                        // case when the user has introduced an existing property
                        property_already_introducted = true
                        // TODO should bring the folder that contains the property and if the user has already
                        // added some valid properties add them to that folder
                        // ( IDEA: could add an alert option to bring that folder or just keep creating a new one and replace it)
                        const alert_message = property_val + " " + global_language.settings.alerts['destinationPropertyAlreadySelected'] 
                        alert(alert_message)
                    }
                }
            }
            // once i've looped through all the existing properties and found no match i can add the new property
            if (!property_already_introducted) {
                // add the property
                add_property(property_val, type)
                // clear the input 
                input_tag.value = ''
            }
        }
    }
}

// adds property to list inside destination property panel
function add_property(property, type) {
    // adds the element to the list
    const list_tag = document.getElementById('list-folder-properties')
    const new_list_element = document.createElement('li')
    const class_data = 'property-' + type + '-element mx-2 my-1 px-3 py-2'
    new_list_element.innerHTML = property
    new_list_element.setAttribute('class', class_data)
    new_list_element.addEventListener('click', (e) => {remove_property(e)})
    list_tag.appendChild(new_list_element)

    // displays the summit folder button
    display_summit_destination_folder()
}

// removes the clicked property of the list inside destination property panel
function remove_property(el) {
    const element = el.path[0]
    // removes element
    element.remove()
    // check if it should display button
    display_summit_destination_folder()
}

// check if it should display the button to summit the folder with all the properties
function display_summit_destination_folder() {
    const button_element = document.getElementById('summit_destination_folder')
    const splitted_class = button_element.getAttribute('class').split('d-none')
    const properties_list = document.getElementById('list-folder-properties')
    const listed_items = properties_list.children

    // when the button is being displayed splitted_class.length == 1
    if (listed_items.length == 0 && splitted_class.length == 1) {
        const new_class = splitted_class[0] + ' d-none'
        button_element.setAttribute('class', new_class)
    } else if (listed_items.length > 0 && splitted_class.length == 2) {
        const new_class = splitted_class[0]
        button_element.setAttribute('class', new_class)
    }
}

// checks if it should display the button to add the folder to the list
function add_folder_with_properties_to_list() {
    const path = document.getElementById('destination-properties-path-display').innerHTML
    const names_elements = document.getElementsByClassName('property-name-element')
    const formats_elements = document.getElementsByClassName('property-format-element')
    const regexs_elements = document.getElementsByClassName('property-regex-element')

    let names = []
    let formats = []
    let regexs = []

    if (names_elements.length > 0) {
        for (let i = 0; i < names_elements.length; i++) {
            // name 
            const current_name = names_elements[i].outerText
            names.push(current_name)
        }
    }
    if (formats_elements.length > 0) {
        for (let i = 0; i < formats_elements.length; i++) {
            // format
            const current_format = formats_elements[i].outerText
            formats.push(current_format)
        }
    }
    if (regexs_elements.length > 0) {
        for (let i = 0; i < regexs_elements.length; i++) {
            // regex
            const current_regex = regexs_elements[i].outerText
            regexs.push(current_regex)
        }
    }

    // creates the destination folder with all the properties
    create_destination_folders_elements(path, names, formats, regexs)
    
    // hide the properties panel
    display_folder_properties(null, true)

    // apply changes to personal_configuration json file
    let personal_configuration = JSON.parse(localStorageElectron.getItem('personal_configuration'))
    personal_configuration.destinationFolders[path] = {
        "names": [],
        "formats": [],
        "regexs": []
    }
    personal_configuration.destinationFolders[path].names = names
    personal_configuration.destinationFolders[path].formats = formats 
    personal_configuration.destinationFolders[path].regexs = regexs 

    update_user_configuration(personal_configuration)

}

// this funciton creates the actual elements in the settings page
function create_destination_folders_elements(path, names_elements, formats_elements, regexs_elements) {
    const folders_list = document.getElementById('destination_paths_list')
    const properties_list = document.getElementById('list-folder-properties').children
    
    // create the folder li tag
    const new_folder_element = document.createElement('li')
    const class_data_li_element = 'row list-group-item'
    new_folder_element.setAttribute('class', class_data_li_element)
    const path_holder_element = document.createElement('div')
    const onclick_data = 'handle_selected_destination_folder(this)'
    new_folder_element.setAttribute('onclick', onclick_data)
    path_holder_element.setAttribute('class', 'col-10')
    path_holder_element.setAttribute('style', 'display: inline; font-size: 1.1rem;')
    path_holder_element.innerHTML = path
    new_folder_element.appendChild(path_holder_element)
    const properties_container = document.createElement('div')
    properties_container.setAttribute('class', 'col-10 d-flex')
    const edit_folder_button = document.createElement('img')
    //TODO: set the default image src path within the json language file as the others
    //edit_folder_button.setAttribute('img-src', 'editDestinationPathProperties')
    edit_folder_button.setAttribute('onclick', 'handle_edit_properties(this)')
    edit_folder_button.setAttribute('src', './../assets/editDestinationPathProperties.png')
    edit_folder_button.classList.add('editDestinationPathProperties')
    new_folder_element.appendChild(edit_folder_button)

    // if the folder to add already exists delete the old one
    const items_in_list = folders_list.children
    for (let i = 0; i < items_in_list.length; i++) {
        if (items_in_list[i].children[0].innerText == path) {
            items_in_list[i].remove()
        }
    }
    
    // appends all the properties as children to the folder li tag
    if (names_elements.length > 0) {
        for (let i = 0; i < names_elements.length; i++) {
            // name 
            const current_name = names_elements[i]
            const name_element = document.createElement('div')
            name_element.innerHTML = current_name
            const class_data = 'name-property-element property-element'
            name_element.setAttribute('class', class_data)
            properties_container.appendChild(name_element)
        }
    }
    if (formats_elements.length > 0) {
        for (let i = 0; i < formats_elements.length; i++) {
            // format
            const current_format = formats_elements[i]
            const format_element = document.createElement('div')
            format_element.innerHTML = current_format
            const class_data = 'format-property-element property-element'
            format_element.setAttribute('class', class_data)
            properties_container.appendChild(format_element)
        }
    }
    if (regexs_elements.length > 0) {
        for (let i = 0; i < regexs_elements.length; i++) {
            // regex
            const current_regex = regexs_elements[i]
            const regex_element = document.createElement('div')
            regex_element.innerHTML = current_regex
            const class_data = 'regex-property-element property-element'
            regex_element.setAttribute('class', class_data)
            properties_container.appendChild(regex_element)
        }
    }

    // pushes the folder to the list
    new_folder_element.appendChild(properties_container)
    folders_list.appendChild(new_folder_element)

    // clear all the properties from the list
    for (let i = (properties_list.length-1); i >= 0;i--) {
        properties_list[i].remove()
    }
    // hide summit destination button
    display_summit_destination_folder()
    
    // take out the warning_badge
    display_warning_badge_destination_paths()

}

// triggered when a destination folder listed is clicked 
function handle_selected_destination_folder(selected_li_tag) {
    // i toggle the class that indentifies the tag as selected
    const previous_class = selected_li_tag.getAttribute('class')
    const splitted_class = previous_class.split('selected_destination_li')
    let new_class
    if (splitted_class.length > 1) {
        // is already selected
        new_class = splitted_class[0]
    } else {
        // is NOT selected
        new_class = previous_class + ' selected_destination_li'
    }
    selected_li_tag.setAttribute('class', new_class)
    // check if i should display the button to remove the folders
    display_remove_destination_paths()
}

// checks if there should be a badge on the destination folders to warn the user that the list is empty
function display_warning_badge_destination_paths() {
    const warning_badge_id = 'noDestinationFoldersWarning'
    const warning_badge = document.getElementById(warning_badge_id)
    const ul_list = document.getElementById('destination_paths_list')
    const li_elements = ul_list.children
    if (warning_badge && li_elements.length > 0) {
        // the warning badge exists and there are list elements thus the badge should be removed
        warning_badge.remove()
    } else if (warning_badge == null && li_elements.length == 0) {
        // there's no warning badge and the list is empty, so the badge should be created
        const badge = document.createElement('div')
        const class_data = 'badge badge-warning'
        badge.innerHTML = global_language.settings.commonText[warning_badge_id]
        badge.setAttribute('class', class_data)
        badge.setAttribute('id', warning_badge_id)
        ul_list.appendChild(badge)
    }
}

//handle the click on the default parameters selects
function handle_defaultFolderRecursion(e) {
    // should save the value to the personal config
    const val = e.target.value
    let personal_configuration = JSON.parse(localStorageElectron.getItem('personal_configuration'))
    personal_configuration.default_configurations.folderRecursion = parseInt(val)
    update_user_configuration(personal_configuration)
}

function handle_defaultFileAlreadyExists(e) {
    const val = e.target.value
    let personal_configuration = JSON.parse(localStorageElectron.getItem('personal_configuration'))
    personal_configuration.default_configurations.fileAlreadyExists = parseInt(val)
    update_user_configuration(personal_configuration)
}

// handle the opening of the last moved file
function handle_open_last_moved() {
    const filename = document.getElementById("last_moved_path").innerHTML.split("/")
    filename.pop()
    shell.openPath(filename.join("/"))
}

// triggered when click the wrench on the destination paths list items: to modify the item properties
function handle_edit_properties(img_element) {

    const item_element = img_element.parentElement
    const list_folder_properties = document.getElementById('list-folder-properties')
    const path_element = document.getElementById('destination-properties-path-display')

    // clear the previous tags
    list_folder_properties.innerHTML = ""

    // set the path
    path_element.innerHTML = item_element.children[0].innerHTML

    // grab all the types and make separate arrays for them
    const filenames_elements = item_element.children[2].querySelectorAll('.name-property-element')
    const formats_elements = item_element.children[2].querySelectorAll('.format-property-element')
    const regexs_elements = item_element.children[2].querySelectorAll('.regex-property-element')

    // fill the types with names
    for (let i = 0; i < filenames_elements.length; i++) {
        const name = filenames_elements[i].innerText
        add_property(name, 'name')
    }

    // fill the types with formats
    for (let i = 0; i < formats_elements.length; i++) {
        const format = formats_elements[i].innerText
        add_property(format, 'format')
    }

    // fill the types with regexs
    for (let i = 0; i < regexs_elements.length; i++) {
        const regex = regexs_elements[i].innerText
        add_property(regex, 'regex')
    }

    // toggle on the display properties panel
    document.getElementById('destination_properties_wrapper').classList.remove('d-none')

    // unselect all the selected items
    const selected_items = document.getElementById('destination_paths_list').querySelectorAll('.selected_destination_li')
    selected_items.forEach((item) => {item.classList.remove('selected_destination_li')})

}

// button to toggle off the display of the properties panel
function handle_cancel_properties() {

    const properties_panel = document.getElementById('destination_properties_wrapper')
    properties_panel.classList.add('d-none')

    // unselect all the selected items
    const selected_items = document.getElementById('destination_paths_list').querySelectorAll('.selected_destination_li')
    let selected_items_reverse = [];
    selected_items.forEach( (item) => {selected_items_reverse.push(item)})
    selected_items_reverse.forEach((item) => {item.classList.remove('selected_destination_li')})

    // check if the button to remove the selected paths should be visible
    display_remove_destination_paths()

}

// triggered when the select languague is clicked: should change the languague and save the change
function handle_language_change(select_element) {
    const new_value = select_element.value
    console.log(new_value)

    // changes the user language
    localStorageElectron.setItem("user_language", new_value)

    require(localStorageElectron.getItem('scripts_path')+"/"+"handle_language_creation.js").handle_language_creation()

    //console.log(localStorageElectron.getItem("global_language"))
    update_local_language()
    apply_text_to_elements_with_language_attribute()

}
