// NOTE: you can use CommonJS here, for instance:
// var foo = require("npm-dependency");
// var bar = require("./path/to/local/file_without_extension");
// module.exports = someVariable;

var pd = require('./printDescription');

module.exports = class AlbumPrinter {

    constructor(canvasWidth, canvasHeight) {

        this.printDescription = new pd();

        // the current photo position

        // x: percentage offset
        // y: percentage offset
        // scale: scale factor

        this.pos = {name: null, x: 0, y: 0, scale: 1};     
        
        // scale the image in increments of SCALE_INC % of container width

        this.SCALE_INC = 0.5;

        // move the image left or right in increments of POS_INC % of container width
        // move the image up or down in increments of POS_INC % of container height

        this.POS_INC = 0.25;

        this.minScale = 1

        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.aspectRatio = this.canvasWidth / this.canvasHeight;      
       
        this.imageContainer = document.getElementById( "imageContainer" );
        this.debugContainer = document.getElementById( "debugContainer" );

        this.bindEvents();
    }

    bindEvents() {

        // bind events to class functions

        var fileSelector = document.getElementById( "fileSelector" );

        var generateButton = document.getElementById( "generateButton" );        
        var importButton = document.getElementById( "import" );
        var moveLeftButton = document.getElementById( "moveLeft" );
        var moveRightButton = document.getElementById( "moveRight" );
        var moveUpButton = document.getElementById( "moveUp" );
        var moveDownButton = document.getElementById( "moveDown" );
        var zoomOutButton = document.getElementById( "zoomOut" );
        var zoomInButton = document.getElementById( "zoomIn" );              
            
        let self = this;
        
        fileSelector.onchange = function( e ) { self.loadImage(e); }
        generateButton.onclick = function( e ) { self.generate(); }
        importButton.onclick = function( e ) { self.import(); }
        moveLeftButton.onclick = function( e ) { self.moveLeft(); }  
        moveRightButton.onclick = function( e ) { self.moveRight(); }
        moveUpButton.onclick = function( e ) { self.moveUp(); }
        moveDownButton.onclick = function( e ) { self.moveDown(); }        
        zoomInButton.onclick = function( e ) { self.zoomIn(); }
        zoomOutButton.onclick = function( e ) { self.zoomOut(); }        
    }

    log( msg ) {
        // show debug/state message on screen
        this.debugContainer.innerHTML += "<p>" + msg + "</p>";
    }

    loadImage( e ) {

        // get all selected Files
        var files = e.target.files;
        var file;

        var self = this;
    
        for ( var i = 0; i < files.length; ++i ) {
            file = files[ i ];
    
            // check if file is valid Image (just a MIME check)
            switch ( file.type ) {
                case "image/jpeg":
                case "image/jpg":
                case "image/png":
                case "image/gif":
                    // read Image contents from file
                    var reader = new FileReader();
                    reader.onload = function( e ) {
                        // create HTMLImageElement holding image data
                        var img = new Image();
                        img.src = reader.result;
    
                        // reset pos
    
                        self.pos = {name: file.name, x: 0, y: 0, scale: 1};
    
                        // remove existing images from ImageContainer
                        while ( self.imageContainer.childNodes.length > 0 )
                        self.imageContainer.removeChild( imageContainer.childNodes[ 0 ]);
    
                        // add image to container
                        self.imageContainer.appendChild( img );
    
                        img.onload = function() {
                            // grab some data from the image
                            var imageData = {
                                "width": img.naturalWidth,
                                "height": img.naturalHeight
                            };
                            self.log( "Loaded Image w/dimensions " + imageData.width + " x " + imageData.height );

                            self.centerImage()                            
                        }
                        // do your magic here...
                    };
                    reader.readAsDataURL( file );
                    // process just one file.
                    return;
    
    
                default:
                    this.log( "not a valid Image file :" + file.name );
            }
        }
    }

    centerImage() {

        // set the max height of the image container based on the width of the image and the aspect ratio                 

        var maxHeight = this.imageContainer.offsetWidth * (1/this.aspectRatio);
        this.imageContainer.style.maxHeight = maxHeight + "px";      

        var img = this.imageContainer.childNodes[ 0 ];

        // make the image fill the container at the correct aspect ratio

        var cw = this.imageContainer.offsetWidth                        // width of the container
        var ch = this.imageContainer.offsetWidth * (1 / this.aspectRatio) // height of the container

        var w2 = img.width  // current width of the image
        var h2 = img.height // current height of the image

        this.minScale = 1

        if (h2 < ch) {

            // the image does not fill the container vertically

            this.pos.scale = 1 + (ch - h2) / h2

            this.minScale = this.pos.scale

            this.pos.x = -(this.pos.scale - 1) / 2
            this.pos.y = 0         
        }
        else {

            // center the image 

            this.pos.x = -((w2 - cw) / w2) / 2
            this.pos.y = -((h2 - ch) / ch) / 2
        }

        this.minx = this.pos.x;
        this.miny = this.pos.y;           

        this.moveImage()
    }

    generate() {

        if (!this.pos.name) {
            this.log( "GENERATE BUTTON CLICKED: select an image first" );
            return;
        }

        // convert pixels to inches
    
        let width = this.canvasWidth * this.pos.scale
        let height = this.canvasHeight * this.pos.scale
    
        let x = this.canvasWidth * this.pos.x
        let y = this.canvasHeight * this.pos.y
    
        let data = {
            "canvas": {
                "width": this.canvasWidth,
                "height": this.canvasHeight,
                "photo" : {
                    "id": this.pos.name,
                    "width": width,
                    "height": height,
                    "x": x,
                    "y": y
                }
            }
        }      

        this.log('print decription id: ' + this.pos.name + ' saved')

        this.printDescription.save(data)
    }    

    import() {

        this.log('loading the last generated print description')
    
        const items = this.printDescription.get()

        if (!items || items.length == 0)
        {
            this.log('no print descriptions found')
            return
        }

        let item = items[items.length - 1]

        this.log('load print description ' + item.canvas.photo.id)

        // put in a standard image

        var img = new Image();

        while ( this.imageContainer.childNodes.length > 0 )
            this.imageContainer.removeChild( imageContainer.childNodes[ 0 ]);

        this.imageContainer.appendChild( img );        

        img.src = 'app/images/japan.jpg'

        this.minScale = 1

        let photo = item.canvas.photo

        this.pos.scale = photo.width / this.canvasWidth
        this.pos.x =  photo.x / this.canvasWidth
        this.pos.y = photo.y / this.canvasHeight       
   
        this.moveImage()     
    }

    moveLeft() {   

        var img = this.imageContainer.childNodes[ 0 ];

        // calculate new x coordinate of right hand side of image
        // image must be kept wholy within the image container

        let x = (this.pos.x - this.POS_INC) * this.imageContainer.offsetWidth + img.width

        if (x >= this.imageContainer.offsetWidth)
        {    
            this.log( "move Left" )
            this.pos.x -= this.POS_INC
            this.moveImage()
        }
    }

    moveRight() {
    
        if (this.pos.x + this.POS_INC <= 0)    
        {
            this.log( "move Right" )    
            this.pos.x += this.POS_INC
            this.moveImage()
        }     
    }
    
    moveUp() {

        var img = this.imageContainer.childNodes[ 0 ];

        // calculate new y coordinate of bottom of image
        // image must be kept wholy within the image container  
        
        let y = (this.pos.y - this.POS_INC) * this.imageContainer.offsetHeight + img.height

        if (y >= this.imageContainer.offsetHeight)
        {    
            this.log( "move up" )
            this.pos.y -= this.POS_INC
            this.moveImage()
        }    
    }

    moveDown() {

        if (this.pos.y + this.POS_INC <= 0)
        {
            this.log( "move down" )  
            this.pos.y += this.POS_INC
            this.moveImage()
        }     
    }

    zoomIn() {

        this.log( "zoom in" );

        // recenter image
    
        this.pos.scale += this.SCALE_INC
        this.pos.x = this.minx -(this.pos.scale - this.minScale)/2
        this.pos.y = this.miny -(this.pos.scale - this.minScale)/2 

        // this.pos.x -= this.SCALE_INC/2
        // this.pos.y -= this.SCALE_INC/2        
        this.moveImage()
    }
    
    zoomOut( ) {

        //console.log('zoomOut scale = ' + this.pos.scale + ' s2 = ' + (this.pos.scale - this.SCALE_INC))

        if (this.pos.scale - this.SCALE_INC < this.minScale)
            return

        this.log( "zoom out" );    
        
        // recenter image

        this.pos.scale -= this.SCALE_INC
        this.pos.x = this.minx -(this.pos.scale - this.minScale)/2
        this.pos.y = this.miny -(this.pos.scale - this.minScale)/2 

        // this.pos.x += this.SCALE_INC/2
        // this.pos.y += this.SCALE_INC/2        
        this.moveImage()     
    }

    moveImage() {

        // move the image

        //console.log("scale,x,y = " + this.pos.scale,this.pos.x,this.pos.y)
    
        var img = this.imageContainer.childNodes[ 0 ];

        img.style.width = (this.pos.scale * 100) + "%"
        img.style.left = (this.pos.x * this.imageContainer.offsetWidth) + "px"
        img.style.top = (this.pos.y * this.imageContainer.offsetHeight) + "px"        
    }        
}
