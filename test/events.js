describe('Testing events', function(){
    // testing basic api
    var assert = require("chai").assert;
    GLOBAL.document = require('jsdom').jsdom('<html lang="en-US"></html>');
    GLOBAL.window = GLOBAL.document.defaultView;
    GLOBAL.$ = require('jquery');
    var $ul;
    var ul;
    var sortable = require("../src/sortable-elements.src.js");
    var resetSortable = function(){
        $('body').html('').append('<ul class="sortable">'+
        '<li class="item">Item 1</li>'+
        '<li class="item">Item 2</li>'+
        '<li class="item">Item 3</li>'+
        '<li class="item with-handle"><span href="#" class="handle">Item 4</span></li>'+
        '<li class="item"><a href="#" class="notHandle">a clever ruse</a></li>'+
        '</ul>');
        $ul = $('.sortable');
        ul = $ul.get();
        $lis = $ul.find('li');
    };

    beforeEach(function(){
        resetSortable();
        $li = $ul.find('li').first();
    });

    it('should drag with the handle', function() {
        var event;
        sortable(ul, {
            'items': 'li',
            'handle': '.handle',
            draggingClass: 'test-dragging'
        });

        event = sortable.__testing._makeEvent('dragstart');
        event.pageX = 100;
        event.pageY = 100;
        event.dataTransfer = {
            setData: function(val){
                this.data = val;
            }
        };

        $ul.find('.handle').get(0).dispatchEvent(event);
        console.log($ul.find('.handle').parent()[0].outerHTML);
        assert.equal($ul.find('.handle').parent().attr('aria-grabbed'),'true');
        assert.isFalse($ul.find('.handle').parent().hasClass('test-dragging'));
    });

    it('should not let non-handle draggables initiate a dragstart event', function() {
        var event;
        sortable(ul, {
            'items': 'li',
            'connectWith': '.test',
            'handle': '.handle',
            placeholderClass: 'test-placeholder',
            draggingClass: 'test-dragging'
        });
        event = sortable.__testing._makeEvent('dragstart');
        event.pageX = 100;
        event.pageY = 100;
        event.dataTransfer = {
            setData: function(val) {
                this.data = val;
            }
        };

        var $grabTarget = $ul.find('.notHandle').first();
        $grabTarget[0].dispatchEvent(event);

        assert.equal($grabTarget.parent().attr('aria-grabbed'),'false');
        assert.isFalse($grabTarget.parent().hasClass('test-dragging'));
    });

    it('should correctly run dragstart event', function(){
        var event;
        sortable(ul, {
            'items': 'li',
            'connectWith': '.test',
            placeholderClass: 'test-placeholder',
            draggingClass: 'test-dragging'
        });
        event = sortable.__testing._makeEvent('dragstart');
        event.pageX = 100;
        event.pageY = 100;
        event.dataTransfer = {
            setData: function(val){
                this.data = val;
            }
        };
        $li.get(0).dispatchEvent(event);

        assert.equal($li.attr('aria-grabbed'),'true');
        assert.isTrue($li.hasClass('test-dragging'));

    });

    it('should not add class on hover event', function(){
        sortable(ul, {
            'items': 'li',
            hoverClass: false,
        });
        $li.trigger( 'mouseover' );
        assert.isFalse($li.hasClass('sortable-over'));
    });

    it('should correctly add class on hover event', function(){
        sortable(ul, {
            'items': 'li',
            hoverClass: true,
        });
        $li.get(0).dispatchEvent(sortable.__testing._makeEvent('mouseenter'));
        assert.isTrue($li.hasClass('sortable-over'));
    });

    it('should correctly add class on hover event', function(){
        sortable(ul, {
            'items': 'li',
            hoverClass: 'sortable-item-over',
        });
        $li.get(0).dispatchEvent(sortable.__testing._makeEvent('mouseenter'));
        assert.isTrue($li.hasClass('sortable-item-over'));
    });

});
