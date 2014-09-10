/**
* timbles.js
* definitely the most lightweight jquery table plugin ever
* like, all you can do is generate a table and allow sorting lol that's it
* @author jenn schiffer http://jennmoney.biz
*/

(function($) {

  var pluginName = 'timbles';

  var defaults = {
    sortKey : null,
    sortOrder : null,
  };

  var classes = {
    headerRow : 'timbles-header',
    rowEven : 'even',
    rowOdd : 'odd'
  };
  
  var methods = {

    /** initialize timble, er, i mean table **/
    init : function(opts) {
      return this.each(function() {
        var $this = $(this).addClass(pluginName);
        var options = $.extend({}, defaults, opts);
        data = {
          $this : $this,
          dataConfig: options.dataConfig,
          sorting: options.sorting
        };
        $this.data(pluginName, data);

        // generate table from JSON
        if ( data.dataConfig ) {
          methods.generateTableFromJson.call($this);
        }

        // save all rows to data
        data.$allRows = $this.find('tr');
        data.$headerRow = $this.find('tr').eq(0).addClass(classes.headerRow);
        data.$records = $this.find('tr').not('.'+classes.headerRow);

        // save all this great new data wowowow
        $this.data(pluginName, data);

        // add even/odd classes to records
        data.$records.filter(':odd').addClass(classes.rowOdd);
        data.$records.filter(':even').addClass(classes.rowEven);

        // if sorting set to true, allow sorting
        if ( data.sorting ) {
          methods.enableSorting.call($this);
        }

        // if sortKey is given, sort table by it and order
        if ( data.sortById ) {
          methods.sortByColumn.call($this, data.sortById, data.sortByOrder, data.sortAttr);
        }

      });
    },

    generateTableFromJson : function() {
      var $this = $(this);
      var data = $this.data(pluginName);
      if (!data) { return; }
      
      $this.append('<tr class="' + classes.headerRow + '">');

      // generate and add cell headers to header row
      $.each(data.dataConfig.columns, function(index, value){
        var $cell = $('<th id="' + value.id + '"><span class="' + classes.label + '">' + value.label + '</span></th>');
        $this.find('tr.' + classes.headerRow).append($cell);
      });

      // generate each row of data from json
      var rows;
      $.getJSON( data.dataConfig.json, function(data) {
        rows = data;
      }).then( function(){
        
        $.each(rows, function(index, file){

          var $currentRow = $('<tr>');
          $.each(file, function(property, value){
            $currentRow.append('<td class="' + property + '">' + value + '</td>');
          });

          $this.append($currentRow);
        });


      });
    },

    enableSorting : function() {
      console.log( 'enableSorting soon' );
    },

    sortByColumn : function( key, order, attr) {
      console.log( 'sortByColumn', key, order, attr, ' soon');
    }

  };

  /** module definition */
  $.fn[pluginName] = function (method) {
    if ( methods[method] ) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } 
    else { 
      if ( typeof method === 'object' || !method ) {
        return methods.init.apply(this, arguments);
      } 
      else {
        $.error('The method ' + method + ' literally does not exist. Good job.');
      }
    }
  };

})( jQuery );