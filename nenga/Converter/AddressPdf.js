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
    SENDER   : { POSTAL_CODE : { FONT_SIZE : 11, BASE : { TOP : 50, LEFTS : [ 12, 24, 35, 51, 63, 76, 87 ] } },
                 NAME        : { FONT_SIZE : 12, BASE : { LEFT  : 10, BOTTOM : 80 }, HEIGHT : 160 },
                 ADDRESS     : { FONT_SIZE : 12, BASE : { BOTTOM : 80 } ,HEIGHT : 170 }
    },
    RECEIVER : { POSTAL_CODE : { FONT_SIZE : 14, BASE : { TOP : 367, LEFTS : [ 130, 151, 173, 195, 216, 236, 257 ] } },
                 NAME        : { FONT_SIZE : 22, BASE : { TOP : 330, CENTER : 145 }, HEIGHT : 280 },
                 ADDRESS     : { FONT_SIZE : 14, BASE : { TOP : 340, LEFT : 260 }, HEIGHT : 280 }
    }
  };

  function split_to_array(str) {
    return str.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[\s\S]/g) || [];
  }
  
  function get_preferred_font_size(default_font_size, height, length) {
    if (length == 0) {
      return default_font_size;
    }
    
    var size = height / length;
    return (default_font_size < size) ? default_font_size : size;
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

  function add_address(pdf_objects, address, font_name, calculator) {
    var space = "";
    var max_length = 0;
    var address_array = address.split("\n");
    for (var i = 0; i < address_array.length; i++) {
      address_array[i] = space + address_array[i];
      space += "　";
      
      if (max_length < address_array[i].length) {
        max_length = address_array[i].length;
      }
    }
    
    var font_size = calculator.get_font_size(max_length);
    
    var top_base = calculator.get_top_base(font_size, max_length);
    
    var left_base = calculator.get_left_base(font_size, address_array.length);
    var left_bases = [];
    for (var i = 0; i < address_array.length; i++) {
      left_bases.push(left_base - (i * font_size));
    }
    
    for (var i = 0; i < address_array.length; i++) {
      function convert_numbers(match, offset, string) {
        var targets = { "-" : "ー", "0" : "〇", "1" : "一", "2" : "二", "3" : "三", "4" : "四", "5" : "五", "6" : "六", "7" : "七", "8" : "八", "9" : "九" };
        return targets[match];
      }
      var clean_address = address_array[i].replace(/[-0-9]/g, convert_numbers);
      pdf_objects.push({
        "direction" : "v",
        "font" : font_name,
        "font_size" : font_size,
        "output_type" : "TextDraw",
        "text" : clean_address,
        "x" : left_bases[i],
        "y" : top_base
      });
    }
  }

  function get_max_length(strings) {
    var string_lengths = strings.map(function (string) { return string.length; });
    return Math.max.apply(null, string_lengths);
  }
  
  function add_names(pdf_objects, household, honorific, font_name, calculator) {
    var given_names = household.given_names.split("\n");
    var max_given_name_length = get_max_length(given_names);
    var family_name_length = household.family_name.length;
    var honorific_length = honorific == null ? 0 : honorific.length;
    var total_length = family_name_length + 1 + max_given_name_length + (honorific_length == 0 ? 0 : 1) + honorific_length;
    
    var preferred_font_size = calculator.get_font_size(total_length);
    var top_base = calculator.get_top_base(preferred_font_size, total_length);
    
    var given_names_top = top_base - (preferred_font_size * (family_name_length + (family_name_length == 0 ? 0 : 1)));
    
    var honer_top = given_names_top - (preferred_font_size * (max_given_name_length + 1));
    
    var left_base = calculator.get_left_base(preferred_font_size, given_names.length);
    
    var left_bases = [left_base];
    //var font_sizes = [preferred_font_size];
    for (var i = 1; i < given_names.length; i++) {
      left_bases.push(left_bases[i - 1] - preferred_font_size);
      //font_sizes.push(preferred_font_size);
    }

    // Family Name
    pdf_objects.push({
      "direction" : "v",
      "font" : font_name,
      "font_size" : preferred_font_size,
      "output_type" : "TextDraw",
      "text" : household.family_name,
      "x" : left_base,
      "y" : top_base
    });
    
    // Given Names & Honorific
    for (var i = 0; i < given_names.length; i++) {
      pdf_objects.push({
        "direction" : "v",
        "font" : font_name,
        "font_size" : preferred_font_size,
        "output_type" : "TextDraw",
        "text" : given_names[i],
        "x" : left_bases[i],
        "y" : given_names_top
      });
      
      pdf_objects.push({
        "direction" : "v",
        "font" : font_name,
        "font_size" : preferred_font_size,
        "output_type" : "TextDraw",
        "text" : honorific,
        "x" : left_bases[i],
        "y" : honer_top
      });
    }
  }

  function add_sender(pdf_objects, sender, font_name) {
    add_postal_code(pdf_objects, sender.postal_code, DRAW_PARAMETERS.SENDER.POSTAL_CODE, font_name);
    add_address(pdf_objects, sender.address, font_name, {
      get_top_base : function (font_size, string_length) {
        return DRAW_PARAMETERS.SENDER.ADDRESS.BASE.BOTTOM + (font_size * string_length);
      },
      get_left_base : function(font_size, count) {
        var given_names = sender.given_names.split("\n");
        var max_given_name_length = get_max_length(given_names);
        var family_name_length = sender.family_name.length;
        var total_length = family_name_length + 1 + max_given_name_length;
        var name_font_size = get_preferred_font_size(DRAW_PARAMETERS.SENDER.NAME.FONT_SIZE, DRAW_PARAMETERS.SENDER.NAME.HEIGHT, total_length);
        var offset = name_font_size * given_names.length;
        return font_size * (2 + count) + offset;
      },
      get_font_size : function (length) {
        return get_preferred_font_size(DRAW_PARAMETERS.SENDER.ADDRESS.FONT_SIZE, DRAW_PARAMETERS.SENDER.ADDRESS.HEIGHT, length);
      }
    });
    add_names(pdf_objects, sender, null, font_name, {
      get_top_base : function (font_size, string_length) {
        return DRAW_PARAMETERS.SENDER.NAME.BASE.BOTTOM + (font_size * string_length);
      },
      get_left_base : function(font_size, count) {
        return DRAW_PARAMETERS.SENDER.NAME.BASE.LEFT + (font_size * count);
      },
      get_font_size : function (length) {
        return get_preferred_font_size(DRAW_PARAMETERS.SENDER.NAME.FONT_SIZE, DRAW_PARAMETERS.SENDER.NAME.HEIGHT, length);
      }
    });
  }
  
  function add_receiver(pdf_objects, receiver, font_name) {
    add_postal_code(pdf_objects, receiver.household.postal_code, DRAW_PARAMETERS.RECEIVER.POSTAL_CODE, font_name);
    add_address(pdf_objects, receiver.household.address, font_name, {
      get_top_base : function (font_size, string_length) {
        return DRAW_PARAMETERS.RECEIVER.ADDRESS.BASE.TOP;
      },
      get_left_base : function(font_size, count) {
        return DRAW_PARAMETERS.RECEIVER.ADDRESS.BASE.LEFT;
      },
      get_font_size : function (length) {
        return get_preferred_font_size(DRAW_PARAMETERS.RECEIVER.ADDRESS.FONT_SIZE, DRAW_PARAMETERS.RECEIVER.ADDRESS.HEIGHT, length);
      }
    });
    add_names(pdf_objects, receiver.household, receiver.honorific, font_name, {
      get_top_base : function (font_size, string_length) {
        return DRAW_PARAMETERS.RECEIVER.NAME.BASE.TOP;
      },
      get_left_base : function(font_size, count) {
        return DRAW_PARAMETERS.RECEIVER.NAME.BASE.CENTER + (font_size / 2.0) * (count - 1);
      },
      get_font_size : function (length) {
        return get_preferred_font_size(DRAW_PARAMETERS.RECEIVER.NAME.FONT_SIZE, DRAW_PARAMETERS.RECEIVER.NAME.HEIGHT, length);
      }
    });
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
      var recids = grid.selection(true);
      if (recids.length == 0) {
        var message = !entry.properties ? "Select one or more receivers." : Locale.translate(entry.properties.message_no_selected);
        Dialog.show(message, item.text);
        grid.refresh();
        return;
      }

      var postal_code = data.sender.postal_code;
      var pdf_objects = [];
      var font_name = entry.properties.font;
      for (var i = 0; i < recids.length; i++) {
        add_sender(pdf_objects, data.sender, font_name);
        add_receiver(pdf_objects, data.receivers[recids[i]], font_name);
        pdf_objects.push({
          "output_type" : "NewPage",
        });
      }
  
      var pdf_data = {
        "title" : "Address PDF",
        "pdf_objects" : pdf_objects,
        "page" : {
          "size" : { "width" : 100, "height" : 150 },
          "margins" : { "top" : 0, "left" : 0, "bottom" : 0, "right" : 0 }
        }
      }
      console.log(pdf_data);
      Connector.pdf(pdf_data);
      grid.refresh();

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
