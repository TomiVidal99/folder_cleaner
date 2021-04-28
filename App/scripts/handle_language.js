// with this script i pass all the variables from electron-localStorage to the window.localStorage
const electronLocalStorage = require('electron-localstorage')
const global_language = electronLocalStorage.getItem('global_language')
window.localStorage.setItem('global_language', JSON.stringify(global_language))

const user_configuration_string = electronLocalStorage.getItem('personal_configuration')
let user_configuration
if (user_configuration_string) {
    user_configuration = JSON.parse(user_configuration_string)
    window.localStorage.setItem('personal_configuration', user_configuration_string)
}

// i loop through all the elements that require the language change and apply it
function apply_text_to_elements_with_language_attribute() {
    const elements_to_modify = document.querySelectorAll("[language]")
    for (let i = (elements_to_modify.length-1); i > -1; i--) {
        const current_element = elements_to_modify[i]
        const attribute = current_element.getAttribute("language")
        if (current_element.tagName == "INPUT") {
            // case when we got an input tag
            current_element.placeholder = global_language.settings.commonText[attribute]
        } else if (current_element.tagName == "BUTTON") {
            // case when we got an input tag
            const element_to_modify = Array.from(current_element.children)[0]
            element_to_modify.innerHTML = global_language.settings.commonText[attribute]
        } else {
            // all other cases
            const childrens = Array.from(current_element.children)
            if (childrens.length > 0) {
                for (let j = 0; j < (childrens.length-1); j++) {
                    current_element.innerHTML = global_language.settings.commonText[attribute]
                    current_element.appendChild(childrens[j])
                }
            } else {
                const attribute = current_element.getAttribute("language")
                current_element.innerHTML = global_language.settings.commonText[attribute]
            }
        }
    }

    // i apply the current version to the correct tag
    document.getElementById('app_version').innerHTML = electronLocalStorage.getItem('app_version')


}

// this function applies the metadata to the elements that requires it
function apply_metadata_to_elements() {
    const custom_attributes_elements = document.querySelectorAll("[custom-attributes]")
    const img_src_elements = document.querySelectorAll("[img-src]")

    for (let i = 0; i < custom_attributes_elements.length; i++) {
        const current_element = custom_attributes_elements[i]
        const current_element_tag = current_element.tagName
        if (current_element_tag == "IMG") {
            const button_parent_language = current_element.parentElement.getAttribute('language') 
            const src_value = global_language.settings.paths[button_parent_language + "ImgSrc"]
            current_element.setAttribute('src', src_value)
        }
    }

    for (let i = 0; i < img_src_elements.length; i++) {
        const current_element = img_src_elements[i]
        const src_attribute_value = current_element.getAttribute('img-src')
        const new_src_attribute = global_language.settings.paths[src_attribute_value]
        current_element.setAttribute('src', new_src_attribute)
    }
}

// i only apply the language change when all the elements have loaded
window.onload = () => {
    // apply the text accordingly to the current language
    apply_text_to_elements_with_language_attribute()
    apply_metadata_to_elements()
    // creates the initial conditions for the elements
    loadInitialConditions()

}
