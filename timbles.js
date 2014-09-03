/**
* timbles.js
* definitely the most lightweight jquery table plugin ever
* @author jenn schiffer http://jennmoney.biz
*/

(function($) {

  var pluginName = 'timbles';

  var defaults = {
    sortKey : null,
    sortOrder : null,
  };

  var classes = {
  };
  
  var methods = {

    /** init table **/
    init : function(opts) {
      return this.each(function() {
        var $this = $(this).addClass(pluginName);
        var options = $.extend({}, defaults, opts);
        data = {
          $this : $this,
          
        };

        $this.data(pluginName, data);
      });
    },

  };

  /** module definition */
  $.fn[pluginName] = function (method) {
    if ( methods[method] ) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this,arguments);
    } else {
      $.error('The method ' + method + ' does not actually exist. Good job.');
    }
  };

})( jQuery );