Balanced Gallery
=========
Balanced Gallery is a jQuery plugin that evenly distributes photos across rows or columns, making the most of the space provided.
Photos are scaled based on the size of the 'container' element by default, making Balanced Gallery a great choice for responsive websites.

Demos
-------
[Horizontal Gallery Demo](http://www.ryanepp.com/demos/balanced_gallery/horizontal)

[Vertical Gallery Demo](http://www.ryanepp.com/demos/balanced_gallery/vertical)

Quick Start
----------
Import JQuery and the Plugin:
``` html
<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js"></script>
<script type="text/javascript" src="jquery.balanced-gallery.min.js"></script>
```

Call the plugin on the element containing the gallery's images:
``` javascript
// wait for the page to load
$(window).load(function() {
   $('#myGallery').BalancedGallery({ /* options */ });
});
```

Options
-------
``` javascript
var defaults = {
            autoResize: true,                   // re-partition and resize the images when the window size changes
            background: null,                   // the css properties of the gallery's containing element
            idealHeight: null,                  // ideal row height, only used for horizontal galleries, defaults to half the containing element's height
            idealWidth: null,                   // ideal column width, only used for vertical galleries, defaults to 1/4 of the containing element's width
            maintainOrder: true,                // keeps images in their original order, setting to 'false' can create a slightly better balance between rows
            orientation: 'horizontal',          // 'horizontal' galleries are made of rows and scroll vertically; 'vertical' galleries are made of columns and scroll horizontally
            padding: 5,                         // pixels between images
            shuffleUnorderedPartitions: true,   // unordered galleries tend to clump larger images at the begining, this solves that issue at a slight performance cost
            viewportHeight: null,               // the assumed height of the gallery, defaults to the containing element's height
            viewportWidth: null                 // the assumed width of the gallery, defaults to the containing element's width
        };
```

Browser Compatibility
------------
Tested and working in:
* Chrome
* Safari
* FireFox
* IE 9+
* Mobile Safari
* Mobile Chrome


Contributing
------------
If you'd like to contribute a feature or bugfix, that's awesome. Go for it. As of right now I don't have a specific set of guidelines for contributions but try to follow the plugin's current coding style.

License
---------
Copyright (c) 2013 [Ryan Epp](https://twitter.com/ryanEpp) Licensed under the WTFPL license.

Acknowledgements
----------------
Inspired by [crispymtn](http://www.crispymtn.com/stories/the-algorithm-for-a-perfectly-balanced-photo-gallery).
Linear partitioning algorithm ported from [Óscar López](http://stackoverflow.com/questions/7938809/dynamic-programming-linear-partitioning-please-help-grok/7942946#7942946)
