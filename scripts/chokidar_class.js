class chokidar_class {
    // the class is programmed suppossing that is always given an array of the folders paths
    constructor(chokidar_library, folders, folder_change_callback) {
        if (folders != null) {
            this.folders = folders 
        } else {
            this.folders = []
        }
        this.chokidar = chokidar_library
        this.folder_change_callback = folder_change_callback
        this.is_watching_enable = false
        this.recursive_depth = 0
        this.ignore_initial_files = true
    }

    create_watcher = () => {

        console.log('watcher created')
        console.log('folders: ', this.folders)

        this.watcher = this.chokidar.watch(
            this.folders,
            { 
                ignored: /(^|[\/\\])\../, // ignore dotfiles
                persistent: false, // runs after process is closed
                ignoreInitial: this.ignore_initial_files, // ignores the files at initial state
                depth: this.recursive_depth, // recursive depth of folders
                disableGlobbing: false,
                usePolling: false,
                interval: 100,
                binaryInterval: 300,
                alwaysStat: false,
                awaitWriteFinish: {
                    stabilityThreshold: 2000,
                    pollInterval: 100
                },
            }
        )

        // i handle the callback event of the watchers
        this.watcher.on('add', (file) => {this.folder_change_callback(file)})

        this.is_watching_enable = true
        console.log('watcher is now active: ', this.is_watching_enable)

    }

    shutdown_watch = async () => {
        // return true if the watcher is still enabled
        // false else

        console.log('watcher removed')

        if (this.is_watching_enable) {
            this.watcher.close().then( () => {
                console.log('finally watcher closed')
                this.is_watching_enable = false
            }).catch( (e) => {
                if (e) throw e
            })
        }
    }

    switch_watching_state = async () => {

        console.log('watcher is: ', this.is_watching_enable)

        if (this.is_watching_enable) {
            this.shutdown_watch()
        } else {
            this.create_watcher() 
        }
    }

    return_watched = () => {
        return this.watcher.getWatched()
    }

    // only these two functions recieves a string path as argument 
    watch_new_folder = (new_folder) => {
        console.log('adding new folder')
        if (new_folder != null) {
            this.watcher.add(new_folder)
            this.folders.push(new_folder)
        } else {
            throw 'null argument'
        }
    }
    unwatch_old_folder = (old_folder) => {
        console.log('removing old folder')
        if (old_folder != null) {
            this.watcher.unwatch(old_folder)
            this.folders.slice(this.folders.indexOf(old_folder), 1)
        } else {
            throw 'null argument'
        }
    }
    // --------------

    update_folders = (new_folders) => {
        console.log('update_folders: ', new_folders)
        this.folders = new_folders
        console.log(this.is_watching_enable)
        if (this.is_watching_enable) {
            this.reset_watcher()
        }
    }

    reset_watcher = () => {

        console.log('resetting watcher')
        console.log(this.is_watching_enable)
        if (this.is_watching_enable) {
            this.shutdown_watch()
            this.create_watcher()
        } else {
            this.create_watcher()
        }

    }
        
}

module.exports = { chokidar_class }
