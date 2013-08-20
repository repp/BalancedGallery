var kittenGenerator = new function() {

    var kittensToGenerate = 12;

    var minKittenWidth = 200;
    var maxKittenWidth = 600;

    var minKittenHeight = 200;
    var maxKittenHeight = 600;

    function addKitten() {
        var width = minKittenWidth + parseInt(Math.random()*(maxKittenWidth-minKittenWidth));
        var height = minKittenHeight + parseInt(Math.random()*(maxKittenHeight-minKittenHeight));
        var kittenImageElement = '<img src="http://placekitten.com/'+width+'/'+height+'" />';
        $('body').append(kittenImageElement);
    }

    return {
        generateKittens: function() {
            for(var i = 0; i < kittensToGenerate; i++) {
                addKitten();
            }
        }
    }

};