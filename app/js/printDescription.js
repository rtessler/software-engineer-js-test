module.exports = class printDescription {

    // handle saving and loading of print descriptions

    constructor() {
        this.tag = "printDescriptions";     // local storage tag
    }    

    save(data) {

         // save a printDescription in local storage

        let items = localStorage.getItem(this.tag);

        items = (items) ? JSON.parse(items) : [];   

        const i = items.findIndex(x => x.canvas.photo.id == data.canvas.photo.id);

        if (i >= 0) {

            // replace item

            items[i] = data;
        }
        else {
            // add data to the items

            items.push(data);
        }

        localStorage.setItem(this.tag, JSON.stringify(items));
    }

    get() {

        // get all print descriptions from local storage

        let items = localStorage.getItem(this.tag);

        return (items) ? JSON.parse(items) : [];
    }    

    getById(id) {

        // get a print description by id from local storage

        let items = localStorage.getItem(this.tag);

        items = (items) ? JSON.parse(items) : [];  

        return items.find(x => { return x.canvas.photo.id == id });
    }
}
