;(function ( $, window, document, undefined ) {

    var pluginName = 'BalancedGallery',
        balancedGallery,
        defaults = {
            background: null,
            idealHeight: null,
            idealWidth: null,
            maintainOrder: true,
            orientation: 'horizontal',
            padding: 5,
            shuffleUnorderedPartitions: true,
            viewportHeight: null,
            viewportWidth: null
        },
        resizeTimeout = null;

    //this wrapper prevents multiple instantiations of the plugin:
    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName, new BalancedGallery( this, options ));
            }
        });
    };

    function BalancedGallery( element, options ) {
        balancedGallery = this; // for contexts when 'this' doesn't refer to the BalancedGallery class.
        this.element = element;
        this.elementChildren = $(element).children('*');
        this.options = $.extend( {}, defaults, options); // merge arg options and defaults

        this.init();
        this.createGallery();
    }

    BalancedGallery.prototype.init = function () {
        if(this.options.viewportWidth == null) {
            this.options.viewportWidth = $(this.element).width();
        }

        if(this.options.viewportHeight == null) {
            this.options.viewportHeight = $(this.element).height();
        }

        if(this.options.idealWidth == null) {
            this.options.idealWidth = $(this.element).width() / 4;
        }

        if(this.options.idealHeight == null) {
            this.options.idealHeight = $(this.element).height() / 2;
        }

        if(this.options.background != null) {
            $(this.element).css({background: this.options.background});
        }

        this.elementChildren.css({display: 'inline-block'});
        var padding = this.options.padding + 'px';
        $(this.element).css({fontSize: 0, paddingTop: padding, paddingLeft: padding});
    };

    BalancedGallery.prototype.createGallery = function() {
        var orientation = (this.options.orientation).toLowerCase();
        if(orientation == 'horizontal') {
            this.createHorizontalGallery();
        } else if(orientation == 'vertical') {
            this.createVerticalGallery();
        } else {
            throw("BalancedGallery: Invalid Orientation.");
        }
    };

    BalancedGallery.prototype.createHorizontalGallery = function() {
        var rows, weights, partitions;
        rows = this.getRows();
        if(rows == 0) {
            this.fallbackToStandardSize();
        } else {
            weights = this.getWidthWeights();
            partitions = this.getPartitions(weights, rows);
            this.resizeHorizontalElements(partitions);
        }
    };

    BalancedGallery.prototype.createVerticalGallery = function() {
        var cols, weights, partitions;
        cols = this.getColumns();
        weights = this.getHeightWeights();
        partitions = this.getPartitions(weights, cols);
        this.orientElementsVertically(partitions);
        this.resizeVerticalElements(partitions);
    };

    BalancedGallery.prototype.getRows = function () {
        return Math.round( this.collectiveIdealWidth() / (this.options.viewportWidth-this.options.padding) );
    };

    BalancedGallery.prototype.getColumns = function () {
        return Math.round( this.collectiveIdealHeight() / (this.options.viewportHeight-this.options.padding) );
    };

    BalancedGallery.prototype.collectiveIdealWidth = function() {
        var sum = 0;
        this.elementChildren.each(function () {
            sum += balancedGallery.idealWidth($(this));
        });
        return sum;
    };

    BalancedGallery.prototype.collectiveIdealHeight = function() {
        var sum = 0;
        this.elementChildren.each(function () {
            sum += balancedGallery.idealHeight($(this));
        });
        return sum;
    };

    BalancedGallery.prototype.idealWidth = function($image) {
        return this.aspectRatio($image) * (this.options.idealHeight + this.options.padding);
    };

    BalancedGallery.prototype.idealHeight = function($image) {
        return (1/this.aspectRatio($image)) * (this.options.idealWidth + this.options.padding);
    };

    BalancedGallery.prototype.fallbackToStandardSize = function() {
        //todo fix
        var idealHeight = this.options.idealHeight;
        this.elementChildren.each(function () {
            $(this).height( idealHeight );
            $(this).width( balancedGallery.idealWidth($(this)) );
        });
    };

    BalancedGallery.prototype.getWidthWeights = function () {
        return this.elementChildren.map(function () {
            var weight = parseInt( balancedGallery.aspectRatio($(this)) * 100 );
            return {element: this, weight: weight };
        });
    };

    BalancedGallery.prototype.getHeightWeights = function () {
        return this.elementChildren.map(function () {
            var weight = parseInt( (1/balancedGallery.aspectRatio($(this))) * 100 );
            return {element: this, weight: weight };
        });
    };

    BalancedGallery.prototype.getPartitions = function (weights, sections) {
        if(this.options.maintainOrder) {
            return this.getOrderedPartition(weights, sections);
        } else {
            var partitions = this.getUnorderedPartition(weights, sections);
            if(this.options.shuffleUnorderedPartitions) {
                partitions = this.shufflePartitions(partitions);
            }
            this.reorderElements(partitions);
            return partitions;
        }
    };

    BalancedGallery.prototype.getOrderedPartition = function (weights, sections) {
        var elementCount = weights.length;

        if(sections <= 0) {
            return [];
        }

        if(sections >= elementCount) {
            return weights.map(function(key, value) { return [([value])]; });
        }

        var solution  = this.createSolutionTable(weights, sections);
        elementCount -= 1;
        sections -= 2;
        var partitions = [];

        while(sections >= 0) {
            partitions = [function() {
                var results = [];
                for(var f = (solution[elementCount-1][sections]+1); f < elementCount+1; f++){
                    results.push(weights[f]);
                }
                return results;
            }()].concat(partitions);

            elementCount = solution[elementCount-1][sections];
            sections -= 1;
        }

        return [function() {
            var results = [];
            for(var r = 0; r < elementCount+1; r++) {
                results.push(weights[r]);
            }
            return results;
        }()].concat(partitions);
    };

    // Used as part of the ordered partition function:
    BalancedGallery.prototype.createSolutionTable = function(weights, sections) {
        var elementCount = weights.length;

        var table = [];
        for (var i = 0; i < elementCount; i++) {
            table.push((function() {
                var res = [];
                for (var j = 0; j < sections; j++) {
                    res.push(0);
                }
                return res;
            })());
        }

        var solution = [];
        for (var k = 0; k < elementCount-1; k++) {
            solution.push((function() {
                var res;
                res = [];
                for (var l = 0; l < sections-1; l++) {
                    res.push(0);
                }
                return res;
            })());
        }

        for(var m = 0; m < elementCount; m++) {
            table[m][0] = weights[m].weight + (m != 0 ? table[m-1][0] : 0);
        }
        for(var n = 0; n < sections; n++) {
            table[0][n] = weights[0].weight;
        }

        for(var p = 1; p < elementCount; p++) {
            for(var q = 1; q < sections; q++) {
                var arr = (function() {
                    var results = [];
                    for (var r = 0; r < p; r++) {
                        results.push([ Math.max( table[r][q - 1], table[p][0]-table[r][0] ), r ]);
                    }
                    return results.sort(function(a, b){ return a[0]-b[0]; })[0];
                })();
                table[p][q] = arr[0];
                solution[p-1][q-1] = arr[1];
            }
        }

        return solution;
    };


    BalancedGallery.prototype.getUnorderedPartition = function (weights, sections) {
        var sortedWeights = weights.sort(function(a,b){ return b.weight - a.weight; });

        var partitions = new Array(sections);
        for (var i=0; i <sections; i++) partitions[i] = [];


        for(var j = 0; j < sortedWeights.length; j++) {
            var shortestPartition = partitions[0];
            var shortestPartitionWeight = balancedGallery.getPartitionWeight(shortestPartition);

            for(var k = 0; k < partitions.length; k++) {
                var pWeight = balancedGallery.getPartitionWeight(partitions[k]);
                if(pWeight < shortestPartitionWeight) {
                    shortestPartition = partitions[k];
                    shortestPartitionWeight = pWeight;
                }
            }
            shortestPartition.push(sortedWeights[j]);
        }

        return partitions;
    };

    BalancedGallery.prototype.getPartitionWeight = function (partition) {
        var weight = 0;
        $.each(partition, function(index, value) {
            weight += value.weight;
        });
        return weight;
    };

    BalancedGallery.prototype.shufflePartitions = function(partitions) {
        for(var i = 0; i < partitions.length; i++) {
            partitions[i] = balancedGallery.shuffleArray(partitions[i]);
        }
        return balancedGallery.shuffleArray(partitions);
    };

    BalancedGallery.prototype.reorderElements = function(partitions) {
        $(this.element).html(''); //remove all elements
        for(var i = 0; i < partitions.length; i++) {
            var subPartition = partitions[i];
            for(var j = 0; j < subPartition.length; j++) {
                $(this.element).append(subPartition[j].element);
            }
        }
    };

    BalancedGallery.prototype.resizeHorizontalElements = function(partitions) {
        var padding = balancedGallery.options.padding;
        for(var i = 0; i < partitions.length; i++) {
            var summedRowRatios = 0;
            for(var j = 0; j < partitions[i].length; j++) {
                summedRowRatios += balancedGallery.aspectRatio( $(partitions[i][j].element) );
            }
            for(var k = 0; k < partitions[i].length; k++) {
                var $image = $(partitions[i][k].element);
                var rawImgHeight = (this.options.viewportWidth - padding) / summedRowRatios  ;
                var imgHeight = parseInt( rawImgHeight );
                var imgWidth = parseInt( imgHeight * balancedGallery.aspectRatio($image) ) - padding;
                $image.width(imgWidth);
                $image.height(imgHeight);
                $image.css({margin: 0, marginRight:padding+'px', marginBottom:padding+'px'});
            }
        }

        if(this.element != document.body) {
            $(this.element).css({overflow:'scroll'});
        }

    };

    BalancedGallery.prototype.resizeVerticalElements = function(partitions) {
        var padding = balancedGallery.options.padding;
        for(var i = 0; i < partitions.length; i++) {
            var summedColRatios = 0;
            for(var j = 0; j < partitions[i].length; j++) {
                summedColRatios += 1/balancedGallery.aspectRatio( $(partitions[i][j].element) );
            }
            for(var k = 0; k < partitions[i].length; k++) {
                var $image = $(partitions[i][k].element);
                var rawImgWidth = (this.options.viewportHeight - padding) / summedColRatios  ;
                var imgWidth = parseInt( rawImgWidth );
                var imgHeight = parseInt( imgWidth * (1/balancedGallery.aspectRatio($image)) ) - padding;
                $image.width(imgWidth);
                $image.height(imgHeight);
                $image.css({margin: 0, marginRight:padding+'px', marginBottom:padding+'px'})
            }
        }

        //Resize Container for horizontal scrolling
        $('.balanced-gallery-column').css({display:'inline-block', padding: 0, margin: 0});
        $(this.container).width(function() {
            var sum = 0;
            $('.balanced-gallery-column').each(function() { sum += ($(this).width()); });
            return sum;
        }());
        $(this.element).parent().css({overflowX: 'scroll'});

        //If there's horizontal overflow the scrollbar causes vertical scrolling
        if(this.options.viewportHeight != this.element.clientHeight) {
            this.options.viewportHeight = this.element.clientHeight - this.options.padding;
            $(this.element).height(this.options.viewportHeight - this.options.padding);
            this.resizeVerticalElements(partitions);
        }
    };

    BalancedGallery.prototype.orientElementsVertically = function(partitions) {
        var $element = $(this.element);
        $element.html(''); //clear the images
        $element.css({overflow: 'scroll'});
        if(this.element != document.body) {
            var $container = $('<div id="balanced-gallery-col-container"></div>');
            $element.append($container[0]);
        } else {
            var $container = $(this.element);
        }
        this.container = $container[0];


        for(var i = 0; i < partitions.length; i++) {
            var colName = 'balanced-gallery-col'+i;
            var column = '<div class="balanced-gallery-column" id="'+colName+'"></div>';
            $container.append(column);
            for(var j = 0; j < partitions[i].length; j++) {
                var child = partitions[i][j].element;
                var $col = $($container.find("div#"+colName));
                $col.append(child).append('<br />');
            }
        }

    };

    BalancedGallery.prototype.aspectRatio = function ($image) {
        var padding = this.options.padding;
        return ($image.width()+padding) / ($image.height()+padding);
    };

    BalancedGallery.prototype.shuffleArray = function(array) {
            var counter = array.length, temp, index;
            while (counter--) {
                index = (Math.random() * counter) | 0;
                temp = array[counter];
                array[counter] = array[index];
                array[index] = temp;
            }
            return array;
    };

})( jQuery, window, document );