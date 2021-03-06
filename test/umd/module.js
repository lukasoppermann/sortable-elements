// testing the UMD (module loading capabilities)
describe('Testing UMD (Universal Module Definition) against /src/sortable-elements.src.js', function(){

var assert = require("chai").assert;
var path = require("path");

  describe('Assignment to global variable', function(){
    var test = {};
    before(function(done){
      GLOBAL.sortable = undefined;
      require('jsdom').env({
        html: '<html><body></body></html>',
        scripts: [
          path.resolve(__dirname, '../../src/sortable-elements.src.js')
        ],
        done: function (errors, window) {
          test.sortable = window.sortable;
          done();
        }
      });
    });

    it('sortable should be defined as a function', function(){
      assert.typeOf(test.sortable,"function");
    });

  });

  describe('CommonJS Module', function(){
    before(function(){
      GLOBAL.document = require('jsdom').jsdom('<html lang="en-US"></html>');
      GLOBAL.window = GLOBAL.document.defaultView;
      GLOBAL.sortable = undefined;
    });

    it('should be able to require sortable-elements', function() {
      var sortable = require('../../src/sortable-elements.src.js');
      assert.typeOf(sortable,"function");
      assert.typeOf(GLOBAL.sortable,"undefined");
      assert.typeOf(GLOBAL.window.sortable,"undefined");
    });

  });


  describe('AMD (Asynchronous module definition)', function(){
    var test = {};
    before(function(done){
      GLOBAL.sortable = undefined;
      require('jsdom').env({
        file: path.resolve(__dirname, 'amd.html'),
        features: {
          FetchExternalResources: ["script"],
          ProcessExternalResources: ["script"]
        },
        done: function (errors, window) {
          test.requirejs = window.require;
          setTimeout(function(){
            // timeout is needed so requirejs can load the resources
            test.sortable = window.sortable;
            done();
          },200);
        }
      });
    });

    it("should define sortable", function () {
      assert.typeOf(test.sortable,"function");
      assert.typeOf(GLOBAL.sortable,"undefined");
    });

  });
});
