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
    rowOdd : 'odd',
    label : 'label',
    sortASC : 'sorted-asc',
    sortDESC : 'sorted-desc'
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

        // if sorting is given, sort table by it and order
        if ( data.sorting.keyId ) {
          methods.sortColumn.call($this, data.sorting.keyId, data.sorting.order);
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
      var $this = $(this);
      var data = $this.data(pluginName);
      if (!data) { return; }

      $this.find('th').bind({
        click: function(e) {
          methods.sortColumn.call($this, $(this).attr('id'), false);
        }
      });
    },

    sortColumn : function( key, order) {
      var $this = $(this);
      var data = $this.data(pluginName);
      if (!data) { return; }

      var $headers = $('th');
      var $sortHeader = $('#' + key);

      // determine order
      if ( !order ) {
        order = $sortHeader.hasClass(classes.sortASC) ? 'desc' : 'asc';
      }

      // set classes to sorted headers
      if ( order === 'desc' ) {
        $headers.removeClass(classes.sortASC).removeClass(classes.sortDESC);
        $sortHeader.addClass(classes.sortDESC);
      }
      else {
        $headers.removeClass(classes.sortASC).removeClass(classes.sortDESC);
        $sortHeader.addClass(classes.sortASC);
      }

      console.log('sorted by ' + key + ' and in ' + order + ' order');

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