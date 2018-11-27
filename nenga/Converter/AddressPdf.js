define(function (require) {
  require("jquery");
  var app = require("core/app");
  var Utils = require("core/Utils");
  var Uuid = require("core/Uuid");
  var Class = require("core/Class");
  var Storage = require("core/Storage");
  var Connector = require("core/Connector");
  var Contents = require("core/Contents");
  var Locale = require("core/Locale");
  var Toolbar = require("core/Control/Toolbar");
  var Detail = require("core/Control/Detail");
  var Tabs = require("core/Control/Tabs");
  var Menu = require("core/Control/Menu");
  var Dialog = require("core/Dialog");
  var Action = require("core/Action");

  var DRAW_PARAMETERS = {
    SENDER   : { POSTAL_CODE : { FONT_SIZE : 11, BASE : { TOP : 56, LEFTS : [ 15, 27, 38, 54, 66, 79, 90 ] } },
                 NAME        : { FONT_SIZE : 12, BASE : { LEFT  : 10, BOTTOM : 80 }, HEIGHT : 160 },
                 ADDRESS     : { FONT_SIZE : 12, BASE : { BOTTOM : 80 } ,HEIGHT : 170 }
    },
    RECEIVER : { POSTAL_CODE : { FONT_SIZE : 14, BASE : { TOP : 377, LEFTS : [ 135, 156, 177, 199, 220, 240, 261 ] } },
                 NAME        : { FONT_SIZE : 22, BASE : { TOP : 330, CENTER : 145 }, HEIGHT : 280 },
                 ADDRESS     : { FONT_SIZE : 14, BASE : { TOP : 340, LEFT : 260 }, HEIGHT : 280 }
    }
  };

  function split_to_array(str) {
    return str.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[\s\S]/g) || [];
  }

  function add_postal_code(pdf_objects, postal_code, parameters, font_name) {
    if (postal_code == null) {
      return;
    }
    
    var chars = split_to_array(postal_code);
    var max = chars.length <= parameters.BASE.LEFTS.length ? chars.length : parameters.BASE.LEFTS.length;
    for (var i = 0; i < max; i++) {
      pdf_objects.push({
        "direction" : "h",
        "font" : font_name,
        "font_size" : parameters.FONT_SIZE,
        "output_type" : "TextDraw",
        "text" : chars[i],
        "x" : parameters.BASE.LEFTS[i],
        "y" : parameters.BASE.TOP
      });
    }
  }

  var AddressPdf = {
    "convert" : function (event) {
      var ids = event.target.split(":");
      var item = Utils.find(event.item, "id", "items", ids);
      var entry = item.function_entry;
      var view = item.context;
      var detail = view.detail();
      var data = detail.data();
      var types = null;
      var report_layouts = null;

      var grid = detail._controls.receivers._list._grid;
      var recids = grid.selection();
      debugger;
      if (recids.length == 0) {
        //var message = !entry_props ? "Select one or more items." : Locale.translate(entry_props.select_message);
        //Dialog.show(message, item.text);
        return;
      }
      

      var postal_code = data.sender.postal_code;
      var pdf_objects = [];
      var font_name = "KaiTi";
      var params = DRAW_PARAMETERS.SENDER.POSTAL_CODE;
      add_postal_code(pdf_objects, postal_code, DRAW_PARAMETERS.SENDER.POSTAL_CODE, font_name);

      var pdf_data = {
        "title" : "Address PDF",
        "pdf_objects" : pdf_objects,
        "page" : {
          "size" : { "width" : 100, "height" : 150 },
          "margins" : { "top" : 0, "left" : 0, "bottom" : 0, "right" : 0 }
        }
      }
      Connector.pdf(pdf_data);


      /*
      function convert_pdf_params(type, properties) {
        var pdf_params = Utils.clone(properties);
        if (!is_null_or_undefined(properties.cells)) {
          var cells = properties.cells.map(function(cell) {
            var type_id = cell.type.id;
            var _type = types[type_id];
            return convert_pdf_params(_type, cell.type.properties);
          });
          pdf_params.cells = cells;
        }
        // Convert from field information to the real value.
        if (!is_null_or_undefined(properties.field)) {
          delete pdf_params["field"];
          pdf_params.text = data[properties.field.field_name];
        }
        
        // Text
        if (!is_null_or_undefined(pdf_params.text)) {
          pdf_params.text = Locale.translate(pdf_params.text);
        }
        
        pdf_params.output_type = type.output_type;
        return pdf_params;
      }

      $.when(
        Storage.read("77859951-f98d-4740-b151-91c57fe77533").done(function (response) { types = response; }),
        Storage.read("c20afefc-1b66-41ee-8827-62983918206c").done(function (response) { report_layouts = response; })
      ).then(function () {
        var report_layout = report_layouts[entry.properties.report_layout];
        var print_objects = report_layout.pdf_objects.map(function (pdf_object) {
          var type_id = pdf_object.type.id;
          var type = types[type_id];
          var properties = pdf_object.type.properties;
          return convert_pdf_params(type, properties, data);
        });
        var pdf_data = {
          "title" : Locale.translate(report_layout.label),
          "pdf_objects" : print_objects
        };
        Connector.pdf(pdf_data);
      });
      */
    }
  };

  return AddressPdf;
});
