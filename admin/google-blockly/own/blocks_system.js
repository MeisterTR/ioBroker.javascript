'use strict';

goog.provide('Blockly.JavaScript.System');

goog.require('Blockly.JavaScript');

// translations
Blockly.Words = {};
Blockly.Words['System'] = {'en': 'System', 'de': 'System', 'ru': 'Системные'};

Blockly.CustomBlocks = Blockly.CustomBlocks || [];
Blockly.CustomBlocks.push('System');

function getHelp(word) {
    return 'https://github.com/ioBroker/ioBroker.javascript/blob/master/README.md#' + Blockly.Words[word][systemLang];
}

Blockly.System = {
    HUE: 210,
    blocks: {}    
};

// --- Debug output --------------------------------------------------
Blockly.Words['debug']         = {'en': 'debug output', 'de': 'debug output',   'ru': 'debug output'};
Blockly.Words['debug_tooltip'] = {'en': 'Debug',        'de': 'Debug',          'ru': 'Debug'};
Blockly.Words['debug_help']    = {'en': 'log---gives-out-the-message-into-log', 'de': 'log---gives-out-the-message-into-log', 'ru': 'log---gives-out-the-message-into-log'};

Blockly.System.blocks['debug'] = 
      '<block type="debug">'
    + '     <value name="TEXT">'
    + '         <shadow type="text">'
    + '             <field name="TEXT">test</field>'
    + '         </shadow>'
    + '     </value>'
    + '</block>';
    
Blockly.Blocks['debug'] = {
    init: function() {
        this.appendValueInput('TEXT')
            .setCheck(null)
            .appendField(Blockly.Words['debug'][systemLang]);

        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([["info", "log"], ["debug", "debug"], ["warning", "warn"], ["error", "error"]]), "Severity");

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setInputsInline(false);
        this.setColour(Blockly.System.HUE);
        this.setTooltip(Blockly.Words['debug_tooltip'][systemLang]);
        this.setHelpUrl(getHelp('debug_help'));
    }
};

Blockly.JavaScript['debug'] = function(block) {
    var value_text = Blockly.JavaScript.valueToCode(block, 'TEXT', Blockly.JavaScript.ORDER_ATOMIC);
    var dropdown_severity = block.getFieldValue('Severity');
    return 'console.' + dropdown_severity + '(' + value_text + ');\n';
};

// --- comment --------------------------------------------------
Blockly.Words['comment']         = {'en': 'comment',                           'de': 'Kommentar',      'ru': 'описание'};
Blockly.Words['comment_tooltip'] = {'en': 'Enter comment to explain the code', 'de': 'Debug',          'ru': 'Debug'};

Blockly.System.blocks['comment'] =
    '<block type="comment">'
    + '     <value name="COMMENT">'
    + '     </value>'
    + '</block>';

Blockly.Blocks['comment'] = {
    init: function() {
        this.appendDummyInput('COMMENT')
            .appendField(new Blockly.FieldTextInput(Blockly.Words['comment'][systemLang]), 'COMMENT');

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setInputsInline(false);
        this.setColour('#FFFF00');
        this.setTooltip(Blockly.Words['comment_tooltip'][systemLang]);
    }
};

Blockly.JavaScript['comment'] = function(block) {
    var comment = block.getFieldValue('COMMENT');
    return '// ' + comment + '\n';
};

// --- control -----------------------------------------------------------
Blockly.Words['control']                = {'en': 'сontrol',        'de': 'steuere',             'ru': 'установить'};
Blockly.Words['control_tooltip']        = {'en': 'Control state',  'de': 'Steuere Zustand',     'ru': 'Установить состояние'};
Blockly.Words['control_help']           = {'en': 'setstate',       'de': 'setstate',            'ru': 'setstate'};
Blockly.Words['control_with']           = {'en': 'with',           'de': 'mit',                 'ru': 'на'};
Blockly.Words['control_delay']          = {'en': 'with delay',     'de': 'mit Verzögerung',     'ru': 'с задержкой'};
Blockly.Words['control_ms']             = {'en': 'ms',             'de': 'ms',                  'ru': 'мс'};
Blockly.Words['control_sec']            = {'en': 'sec',            'de': 'Sek',                 'ru': 'сек.'};
Blockly.Words['control_min']            = {'en': 'min',            'de': 'Min',                 'ru': 'мин.'};
Blockly.Words['control_clear_running']  = {'en': ', clear running',  'de': ', löschen falls läuft', 'ru': ', остановить уже запущенный'};

Blockly.System.blocks['control'] =
    '<block type="control">'
    + '     <value name="OID">'
    + '     </value>'
    + '     <value name="VALUE">'
    + '     </value>'
    + '     <value name="WITH_DELAY">'
    + '     </value>'
    + '     <mutation delay_input="false"></mutation>'
    + '     <value name="DELAY_MS">'
    + '     </value>'
    + '     <value name="UNIT">'
    + '     </value>'
    + '     <value name="CLEAR_RUNNING">'
    + '     </value>'
    + '</block>';

Blockly.Blocks['control'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(Blockly.Words['control'][systemLang]);

        this.appendDummyInput('OID')
            .appendField(new Blockly.FieldOID('Object ID', main.initSelectId(), main.objects), 'OID');

        this.appendValueInput('VALUE')
            .setCheck(null)
            .appendField(Blockly.Words['control_with'][systemLang]);

        this.appendDummyInput('WITH_DELAY')
            .appendField(Blockly.Words['control_delay'][systemLang])
            .appendField(new Blockly.FieldCheckbox('FALSE', function(option) {
                var delayInput = (option == true);
                this.sourceBlock_.updateShape_(delayInput);
            }), 'WITH_DELAY');


        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(Blockly.System.HUE);
        this.setTooltip(Blockly.Words['control_tooltip'][systemLang]);
        this.setHelpUrl(getHelp('control_help'));
    },
    mutationToDom: function() {
        var container = document.createElement('mutation');
        container.setAttribute('delay_input', this.getFieldValue('WITH_DELAY') === 'TRUE');
        return container;
    },
    domToMutation: function(xmlElement) {
        this.updateShape_(xmlElement.getAttribute('delay_input') == 'true');
    },
    updateShape_: function(delayInput) {
        // Add or remove a delay Input.
        var inputExists = this.getInput('DELAY');

        if (delayInput) {
            if (!inputExists) {
                this.appendDummyInput('DELAY')
                    .appendField(' ')
                    .appendField(new Blockly.FieldTextInput('1000'), 'DELAY_MS')
                    .appendField(new Blockly.FieldDropdown([
                        [Blockly.Words['control_ms'][systemLang], 'ms'],
                        [Blockly.Words['control_sec'][systemLang], 'sec'],
                        [Blockly.Words['control_min'][systemLang], 'min']
                    ]), 'UNIT');
                    //.appendField(Blockly.Words['control_ms'][systemLang]);
            }
        } else if (inputExists) {
            this.removeInput('DELAY');
        }

        inputExists = this.getInput('CLEAR_RUNNING_INPUT');

        if (delayInput) {
            if (!inputExists) {
                this.appendDummyInput('CLEAR_RUNNING_INPUT')
                    .appendField(Blockly.Words['control_clear_running'][systemLang])
                    .appendField(new Blockly.FieldCheckbox(), 'CLEAR_RUNNING');
            }
        } else if (inputExists) {
            this.removeInput('CLEAR_RUNNING_INPUT');
        }
    }
};

Blockly.JavaScript['control'] = function(block) {
    var valueObjectID = block.getFieldValue('OID');

    Blockly.Msg.VARIABLES_DEFAULT_NAME = 'value';

    var valueDelay   = parseInt(block.getFieldValue('DELAY_MS'), 10);
    var unit  = block.getFieldValue('UNIT');
    if (unit === 'min') {
        valueDelay *= 60000;
    } else if (unit === 'sec') {
        valueDelay *= 1000;
    }
    var clearRunning = block.getFieldValue('CLEAR_RUNNING') === 'TRUE';
    var valueValue   = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_ATOMIC);
    var objectName   = main.objects[valueObjectID] && main.objects[valueObjectID].common && main.objects[valueObjectID].common.name ? main.objects[valueObjectID].common.name : '';
    var code;

    if (this.getFieldValue('WITH_DELAY') === 'TRUE') {
        code = 'setStateDelayed("' + valueObjectID + '"' + (objectName ? '/*' + objectName + '*/' : '') + ', ' + valueValue + ', ' + valueDelay + ', ' + clearRunning + ');\n';
    } else {
        code = 'setState("' + valueObjectID + '"' + (objectName ? '/*' + objectName + '*/' : '') + ', ' + valueValue + ');\n';
    }

    return code;
};

// --- toggle -----------------------------------------------------------
Blockly.Words['toggle']                = {'en': 'toggle',         'de': 'umschalten',             'ru': 'переключить'};
Blockly.Words['toggle_tooltip']        = {'en': 'Toggle the state',  'de': 'Schalte Zustand um',     'ru': 'Изменить состояние'};
Blockly.Words['toggle_help']           = {'en': 'setstate',       'de': 'setstate',            'ru': 'setstate'};
Blockly.Words['toggle_with']           = {'en': 'with',           'de': 'mit',                 'ru': 'на'};
Blockly.Words['toggle_delay']          = {'en': 'with delay',     'de': 'mit Verzögerung',     'ru': 'с задержкой'};
Blockly.Words['toggle_ms']             = {'en': 'in ms',          'de': 'in ms',               'ru': 'в мс'};
Blockly.Words['toggle_clear_running']  = {'en': ', clear running',  'de': ', löschen falls läuft', 'ru': ', остановить уже запущенный'};

Blockly.System.blocks['toggle'] =
    '<block type="toggle">'
    + '     <value name="OID">'
    + '     </value>'
    + '     <value name="WITH_DELAY">'
    + '     </value>'
    + '     <mutation delay_input="false"></mutation>'
    + '     <value name="DELAY_MS">'
    + '     </value>'
    + '     <value name="UNIT">'
    + '     </value>'
    + '     <value name="CLEAR_RUNNING">'
    + '     </value>'
    + '</block>';

Blockly.Blocks['toggle'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(Blockly.Words['toggle'][systemLang]);

        this.appendDummyInput('OID')
            .appendField(new Blockly.FieldOID('Object ID', main.initSelectId(), main.objects), 'OID');

        this.appendDummyInput('WITH_DELAY')
            .appendField(Blockly.Words['toggle_delay'][systemLang])
            .appendField(new Blockly.FieldCheckbox('FALSE', function(option) {
                var delayInput = (option == true);
                this.sourceBlock_.updateShape_(delayInput);
            }), 'WITH_DELAY');

        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(Blockly.System.HUE);
        this.setTooltip(Blockly.Words['toggle_tooltip'][systemLang]);
        this.setHelpUrl(getHelp('toggle_help'));
    },
    mutationToDom: function() {
        var container = document.createElement('mutation');
        container.setAttribute('delay_input', this.getFieldValue('WITH_DELAY') === 'TRUE');
        return container;
    },
    domToMutation: function(xmlElement) {
        this.updateShape_(xmlElement.getAttribute('delay_input') == 'true');
    },
    updateShape_: function(delayInput) {
        // Add or remove a delay Input.
        var inputExists = this.getInput('DELAY');

        if (delayInput) {
            if (!inputExists) {
                this.appendDummyInput('DELAY')
                    .appendField(' ')
                    .appendField(new Blockly.FieldTextInput('1000'), 'DELAY_MS')
                    .appendField(new Blockly.FieldDropdown([
                        [Blockly.Words['control_ms'][systemLang], 'ms'],
                        [Blockly.Words['control_sec'][systemLang], 'sec'],
                        [Blockly.Words['control_min'][systemLang], 'min']
                    ]), 'UNIT');
                    //.appendField(Blockly.Words['toggle_ms'][systemLang]);
            }
        } else if (inputExists) {
            this.removeInput('DELAY');
        }

        inputExists = this.getInput('CLEAR_RUNNING_INPUT');

        if (delayInput) {
            if (!inputExists) {
                this.appendDummyInput('CLEAR_RUNNING_INPUT')
                    .appendField(Blockly.Words['toggle_clear_running'][systemLang])
                    .appendField(new Blockly.FieldCheckbox(), 'CLEAR_RUNNING');
            }
        } else if (inputExists) {
            this.removeInput('CLEAR_RUNNING_INPUT');
        }
    }
};

Blockly.JavaScript['toggle'] = function(block) {
    var valueObjectID = block.getFieldValue('OID');

    Blockly.Msg.VARIABLES_DEFAULT_NAME = 'value';

    var valueDelay   = parseInt(block.getFieldValue('DELAY_MS'), 10);
    var unit  = block.getFieldValue('UNIT');
    if (unit === 'min') {
        valueDelay *= 60000;
    } else if (unit === 'sec') {
        valueDelay *= 1000;
    }
    var clearRunning = block.getFieldValue('CLEAR_RUNNING') === 'TRUE';
    var objectName   = main.objects[valueObjectID] && main.objects[valueObjectID].common && main.objects[valueObjectID].common.name ? main.objects[valueObjectID].common.name : '';
    var objectType   = main.objects[valueObjectID] && main.objects[valueObjectID].common && main.objects[valueObjectID].common.type ? main.objects[valueObjectID].common.type : 'boolean';
    var code;
    var setCommand;
    if (objectType === 'number') {
        var max = 100;
        var min = 0;
        if (main.objects[valueObjectID].common.max !== undefined) {
            max = parseFloat(main.objects[valueObjectID].common.max);
        }
        if (main.objects[valueObjectID].common.min !== undefined) {
            min = parseFloat(main.objects[valueObjectID].common.min);
        }
        setCommand = '    setState("' + valueObjectID + '"' + (objectName ? '/*' + objectName + '*/' : '') + ', state ? (state.val == ' + min + ' ?  ' + max + ' : '  + min + ') : ' + max + ');\n';
    } else {
        setCommand = '    setState("' + valueObjectID + '"' + (objectName ? '/*' + objectName + '*/' : '') + ', state ? !state.val : true);\n';
    }

    if (this.getFieldValue('WITH_DELAY') === 'TRUE') {
        code =
            'getState("' + valueObjectID + '", function (err, state) {\n' +
            '    setStateDelayed("' + valueObjectID + '"' + (objectName ? '/*' + objectName + '*/' : '') + ', state ? !state.val : true, ' + valueDelay + ', ' + clearRunning + ');\n' +
            '});\n';
    } else {
        code =
        'getState("' + valueObjectID + '", function (err, state) {\n' +
        setCommand +
        '});\n';
    }

    return code;
};

// --- update -----------------------------------------------------------
Blockly.Words['update']         = {'en': 'update',          'de': 'aktualisiere',           'ru': 'обновить'};
Blockly.Words['update_tooltip'] = {'en': 'Update state',    'de': 'Zustand aktualisieren',  'ru': 'Обновить состояние'};
Blockly.Words['update_help']    = {'en': 'setstate',        'de': 'setstate',               'ru': 'setstate'};
Blockly.Words['update_with']    = {'en': 'with',            'de': 'mit',                    'ru': 'с'};
Blockly.Words['update_delay']   = {'en': 'with delay',      'de': 'mit Verzögerung',        'ru': 'с задержкой'};
Blockly.Words['update_ms']      = {'en': 'in ms',           'de': 'in ms',                  'ru': 'в мс'};

Blockly.System.blocks['update'] =
    '<block type="update">'
    + '     <value name="OID">'
    + '     </value>'
    + '     <value name="VALUE">'
    + '     </value>'
    + '     <value name="WITH_DELAY">'
    + '     </value>'
    + '     <mutation delay_input="false"></mutation>'
    + '     <value name="DELAY_MS">'
    + '     </value>'
    + '     <value name="UNIT">'
    + '     </value>'
    + '     <value name="CLEAR_RUNNING">'
    + '     </value>'
    + '</block>';

Blockly.Blocks['update'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(Blockly.Words['update'][systemLang]);

        this.appendDummyInput('OID')
            .appendField(new Blockly.FieldOID("Object ID", main.initSelectId(), main.objects), 'OID');


        this.appendValueInput('VALUE')
            .setCheck(null)
            .appendField(Blockly.Words['update_with'][systemLang]);

        this.appendDummyInput('WITH_DELAY')
            .appendField(Blockly.Words['update_delay'][systemLang])
            .appendField(new Blockly.FieldCheckbox('FALSE', function(option) {
                this.sourceBlock_.updateShape_(option == true);
            }), 'WITH_DELAY');

        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(Blockly.System.HUE);
        this.setTooltip(Blockly.Words['update_tooltip'][systemLang]);
        this.setHelpUrl(getHelp('update_help'));
    },
    mutationToDom: function() {
        var container = document.createElement('mutation');
        container.setAttribute('delay_input', this.getFieldValue('WITH_DELAY') === 'TRUE');
        return container;
    },
    domToMutation: function(xmlElement) {
        this.updateShape_(xmlElement.getAttribute('delay_input') == 'true');
    },
    updateShape_: function(delayInput) {
        // Add or remove a delay Input.
        var inputExists = this.getInput('DELAY');

        if (delayInput) {
            if (!inputExists) {
                this.appendDummyInput('DELAY')
                    .appendField(' ')
                    .appendField(new Blockly.FieldTextInput('1000'), 'DELAY_MS')
                    .appendField(new Blockly.FieldDropdown([
                        [Blockly.Words['control_ms'][systemLang], 'ms'],
                        [Blockly.Words['control_sec'][systemLang], 'sec'],
                        [Blockly.Words['control_min'][systemLang], 'min']
                    ]), 'UNIT');
                    //.appendField(Blockly.Words['update_ms'][systemLang]);
            }
        } else if (inputExists) {
            this.removeInput('DELAY');
        }

        inputExists = this.getInput('CLEAR_RUNNING_INPUT');

        if (delayInput) {
            if (!inputExists) {
                this.appendDummyInput('CLEAR_RUNNING_INPUT')
                    .appendField(Blockly.Words['control_clear_running'][systemLang])
                    .appendField(new Blockly.FieldCheckbox(), 'CLEAR_RUNNING');
            }
        } else if (inputExists) {
            this.removeInput('CLEAR_RUNNING_INPUT');
        }
    }
};

Blockly.JavaScript['update'] = function(block) {
    var value_objectid = block.getFieldValue('OID');

    Blockly.Msg.VARIABLES_DEFAULT_NAME = 'value';

    var value_value  = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_ATOMIC);
    var value_delay  = parseInt(block.getFieldValue('DELAY_MS'), 10);
    var clearRunning = block.getFieldValue('CLEAR_RUNNING') === 'true' || block.getFieldValue('CLEAR_RUNNING') === true;
    var unit  = block.getFieldValue('UNIT');
    if (unit === 'min') {
        value_delay *= 60000;
    } else if (unit === 'sec') {
        value_delay *= 1000;
    }
    var objectname = main.objects[value_objectid] && main.objects[value_objectid].common && main.objects[value_objectid].common.name ? main.objects[value_objectid].common.name : '';
    var code;
    if (this.getFieldValue('WITH_DELAY') === 'TRUE') {
        code = 'setStateDelayed("' + value_objectid + '"' + (objectname ? '/*' + objectname + '*/' : '') + ', ' + value_value + ', true, ' + value_delay + ', ' + clearRunning + ');\n';
    } else {
        code = 'setState("' + value_objectid + '"' + (objectname ? '/*' + objectname + '*/' : '') + ', ' + value_value + ', true);\n';
    }

    return code;
};

// --- direct binding -----------------------------------------------------------
Blockly.Words['direct']                 = {'en': 'bind',           'de': 'binde',            'ru': 'связять'};
Blockly.Words['direct_tooltip']         = {'en': 'Bind two states with each other',          'de': 'Binde zwei Zustände miteinander',     'ru': 'Связать два состояния между собой'};
Blockly.Words['direct_help']            = {'en': 'setstate',       'de': 'setstate',         'ru': 'setstate'};
Blockly.Words['direct_oid_src']         = {'en': '',               'de': '',                 'ru': ''};
Blockly.Words['direct_only_changes']    = {'en': 'only changes',   'de': 'nur Änderungen',   'ru': 'только изменения'};
Blockly.Words['direct_oid_dst']         = {'en': 'with',           'de': 'mit',              'ru': 'c'};

Blockly.System.blocks['direct'] =
    '<block type="direct">'
    + '     <value name="OID_SRC">'
    + '         <shadow type="field_oid">'
    + '             <field name="oid">Object ID 1</field>'
    + '         </shadow>'
    + '     </value>'
    + '     <value name="OID_DST">'
    + '         <shadow type="field_oid">'
    + '             <field name="oid">Object ID 2</field>'
    + '         </shadow>'
    + '     </value>'
    + '     <value name="ONLY_CHANGES">'
    + '     </value>'
    + '</block>';

Blockly.Blocks['direct'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(Blockly.Words['direct'][systemLang]);

        this.appendValueInput('OID_SRC')
            .setCheck('String')
            .appendField(Blockly.Words['direct_oid_src'][systemLang]);

        this.appendValueInput('OID_DST')
            .setCheck('String')
            .appendField(Blockly.Words['direct_oid_dst'][systemLang]);

        this.appendDummyInput('ONLY_CHANGES')
            .appendField(Blockly.Words['direct_only_changes'][systemLang])
            .appendField(new Blockly.FieldCheckbox('TRUE'), 'ONLY_CHANGES');

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(Blockly.System.HUE);
        this.setTooltip(Blockly.Words['direct_tooltip'][systemLang]);
        this.setHelpUrl(getHelp('direct_help'));
    }
};

Blockly.JavaScript['direct'] = function(block) {
    var oidSrc = Blockly.JavaScript.valueToCode(block, 'OID_SRC', Blockly.JavaScript.ORDER_ATOMIC);
    var onlyChanges = block.getFieldValue('ONLY_CHANGES');
    var oidDest = Blockly.JavaScript.valueToCode(block, 'OID_DST', Blockly.JavaScript.ORDER_ATOMIC);

    return 'on({id: ' + oidSrc + ', change: "' + (onlyChanges == 'TRUE' ? 'ne' : 'any') + '"}, function (obj) {\n  setState(' + oidDest + ', obj.state.val);\n});';
};

// --- control ex -----------------------------------------------------------
Blockly.Words['control_ex']                = {'en': 'write',          'de': 'schreibe',            'ru': 'записать'};
Blockly.Words['control_ex_tooltip']        = {'en': 'Control state',  'de': 'Steuere Zustand',     'ru': 'Установить состояние'};
Blockly.Words['control_ex_control']        = {'en': 'сontrol',        'de': 'steuere',             'ru': 'установить'};
Blockly.Words['control_ex_update']         = {'en': 'update',         'de': 'aktualisiere',        'ru': 'обновить'};
Blockly.Words['control_ex_delay']          = {'en': 'delay in ms',    'de': 'Verzögerung in ms',   'ru': 'Задержка в мс'};
Blockly.Words['control_ex_value']          = {'en': 'value',          'de': 'Wert',                'ru': 'значение'};
Blockly.Words['control_ex_clear_running']  = {'en': 'clear running',  'de': 'löschen falls läuft', 'ru': 'остановить уже запущенный'};

Blockly.System.blocks['control_ex'] =
    '<block type="control_ex">'
    + '     <value name="OID">'
    + '         <shadow type="field_oid">'
    + '             <field name="oid">Object ID</field>'
    + '         </shadow>'
    + '     </value>'
    + '     <value name="VALUE">'
    + '         <shadow type="logic_boolean">'
    + '             <field name="BOOL">TRUE</field>'
    + '         </shadow>'
    + '     </value>'
    + '     <value name="TYPE">'
    + '     </value>'
    + '     <value name="DELAY_MS">'
    + '         <shadow type="math_number">'
    + '             <field name="NUM">0</field>'
    + '         </shadow>'
    + '     </value>'
    + '     <value name="CLEAR_RUNNING">'
    + '     </value>'
    + '</block>';

Blockly.Blocks['control_ex'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(Blockly.Words['control_ex'][systemLang]);

        this.appendValueInput('OID')
            .setCheck('String')
            .appendField(Blockly.Words['field_oid_OID'][systemLang]);

        this.appendDummyInput('TYPE')
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Words['control_ex_control'][systemLang],   'false'],
                [Blockly.Words['control_ex_update'][systemLang],    'true']
            ]), 'TYPE');

        this.appendValueInput('VALUE')
            .setCheck(null)
            .appendField(Blockly.Words['control_ex_value'][systemLang]);

        this.appendValueInput('DELAY_MS')
            .setCheck('Number')
            .appendField(Blockly.Words['control_ex_delay'][systemLang]);

        this.appendDummyInput('CLEAR_RUNNING_INPUT')
            .appendField(Blockly.Words['control_ex_clear_running'][systemLang])
            .appendField(new Blockly.FieldCheckbox(), 'CLEAR_RUNNING');

        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(Blockly.System.HUE);
        this.setTooltip(Blockly.Words['control_tooltip'][systemLang]);
        this.setHelpUrl(getHelp('control_help'));
    }
};

Blockly.JavaScript['control_ex'] = function(block) {
    var valueObjectID = Blockly.JavaScript.valueToCode(block, 'OID', Blockly.JavaScript.ORDER_ATOMIC);
    var value         = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_ATOMIC);
    var valueDelay    = Blockly.JavaScript.valueToCode(block, 'DELAY_MS', Blockly.JavaScript.ORDER_ATOMIC);
    var clearRunning  = block.getFieldValue('CLEAR_RUNNING') === 'TRUE';
    var type          = block.getFieldValue('TYPE') === 'true';
    return 'setStateDelayed(' + valueObjectID + ', ' + value + ', ' + type + ', parseInt(' + valueDelay + ', 10), ' + clearRunning + ');\n';
};

// --- create state --------------------------------------------------
Blockly.Words['create']         = {'en': 'create state',    'de': 'Zustand erzeugen',   'ru': 'создать состояние'};
Blockly.Words['create_jsState'] = {'en': 'jsState',         'de': 'jsState',            'ru': 'jsState'};
Blockly.Words['create_tooltip'] = {'en': 'create state',    'de': 'Zustand erzeugen',   'ru': 'создать состояние'};
Blockly.Words['create_help']    = {'en': 'createstate',     'de': 'createstate',        'ru': 'createstate'};

Blockly.System.blocks['create'] =
    '<block type="create">'
    + '     <value name="NAME">'
    + '     </value>'
    + '     <value name="STATEMENT">'
    + '     </value>'
    + '</block>';

Blockly.Blocks['create'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(Blockly.Words['create'][systemLang]);

        this.appendDummyInput('NAME')
            .appendField(new Blockly.FieldTextInput(Blockly.Words['create_jsState'][systemLang]), 'NAME');

        this.appendStatementInput('STATEMENT')
            .setCheck(null);

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);

        this.setInputsInline(true);
        this.setColour(Blockly.System.HUE);
        this.setTooltip(Blockly.Words['create_tooltip'][systemLang]);
        this.setHelpUrl(getHelp('create_help'));
    }
};

Blockly.JavaScript['create'] = function(block) {
    var name = block.getFieldValue('NAME');
    var statement = Blockly.JavaScript.statementToCode(block, 'STATEMENT');

    return 'createState("' + name + '", function () {\n' + statement + '});\n';
};

// --- get value --------------------------------------------------
Blockly.Words['get_value']         = {'en': 'Get state value',                  'de': 'Zustandswert nehmen',                'ru': 'Взять значение состояния'};
Blockly.Words['get_value_OID']     = {'en': 'of Object ID',                     'de': 'vom Objekt ID',                      'ru': 'у объекта'};
Blockly.Words['get_value_tooltip'] = {'en': 'Select object ID with dialog',     'de': 'Objekt ID mit Dialog selektieren',   'ru': 'Выбрать ID объекта'};
Blockly.Words['get_value_help']    = {'en': 'getstate',                         'de': 'getstate',                           'ru': 'getstate'};
Blockly.Words['get_value_default'] = {'en': 'select ID',                        'de': 'ID auswählen',                       'ru': 'Выбрать ID'};

Blockly.Words['get_value_val']     = {'en': 'Value',                            'de': 'Wert',                               'ru': 'Значение'};
Blockly.Words['get_value_ack']     = {'en': 'Acknowledge',                      'de': 'anerkannt',                          'ru': 'Подтверждение'};
Blockly.Words['get_value_ts']      = {'en': 'Timestamp',                        'de': 'Zeitstempel',                        'ru': 'Время'};
Blockly.Words['get_value_lc']      = {'en': 'Last change ',                     'de': 'Letze Änderung',                     'ru': 'Последнее изменеие'};
Blockly.Words['get_value_q']       = {'en': 'Quality',                          'de': 'Qualität',                           'ru': 'Качество'};
Blockly.Words['get_value_from']    = {'en': 'Source',                           'de': 'Quelle',                             'ru': 'Происхождение'};

Blockly.System.blocks['get_value'] =
    '<block type="get_value">'
    + '     <value name="ATTR">'
    + '     </value>'
    + '     <value name="OID">'
    + '     </value>'
    + '</block>';

Blockly.Blocks['get_value'] = {
    // Checkbox.
    init: function() {

        this.appendDummyInput('ATTR')
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Words['get_value_val'][systemLang],    'val'],
                [Blockly.Words['get_value_ack'][systemLang],    'ack'],
                [Blockly.Words['get_value_ts'][systemLang],     'ts'],
                [Blockly.Words['get_value_lc'][systemLang],     'lc'],
                [Blockly.Words['get_value_q'][systemLang] ,     'q'],
                [Blockly.Words['get_value_from'][systemLang],   'from']
            ]), 'ATTR');

        this.appendDummyInput()
            .appendField(Blockly.Words['get_value_OID'][systemLang]);

        this.appendDummyInput()
            .appendField(new Blockly.FieldOID(Blockly.Words['get_value_default'][systemLang], main.initSelectId(), main.objects), 'OID');

        this.setInputsInline(true);
        this.setOutput(true);
        this.setColour(Blockly.System.HUE);
        this.setTooltip(Blockly.Words['get_value_tooltip'][systemLang]);
        this.setHelpUrl(getHelp('get_value_help'));
    }
};

Blockly.JavaScript['get_value'] = function(block) {
    var oid  = block.getFieldValue('OID');
    var attr = block.getFieldValue('ATTR');
    return ['getState("' + oid + '").' + attr, Blockly.JavaScript.ORDER_ATOMIC];
};

// --- get value async--------------------------------------------------
Blockly.Words['get_value_async']         = {'en': 'Get state value',                  'de': 'Zustandswert nehmen',                'ru': 'Взять значение состояния'};

Blockly.System.blocks['get_value_async'] =
    '<block type="get_value_async">'
    + '     <value name="ATTR">'
    + '     </value>'
    + '     <value name="OID">'
    + '     </value>'
    + '     <value name="STATEMENT">'
    + '     </value>'
    + '</block>';

Blockly.Blocks['get_value_async'] = {
    // Checkbox.
    init: function() {

        this.appendDummyInput('ATTR')
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Words['get_value_val'][systemLang],    'val'],
                [Blockly.Words['get_value_ack'][systemLang],    'ack'],
                [Blockly.Words['get_value_ts'][systemLang],     'ts'],
                [Blockly.Words['get_value_lc'][systemLang],     'lc'],
                [Blockly.Words['get_value_q'][systemLang] ,     'q'],
                [Blockly.Words['get_value_from'][systemLang],   'from']
            ]), 'ATTR');

        this.appendDummyInput()
            .appendField(Blockly.Words['get_value_OID'][systemLang]);

        this.appendDummyInput()
            .appendField(new Blockly.FieldOID(Blockly.Words['get_value_default'][systemLang], main.initSelectId(), main.objects), 'OID');

        this.appendStatementInput('STATEMENT')
            .setCheck(null);

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        
        this.setInputsInline(true);
        this.setColour(Blockly.System.HUE);
        this.setTooltip(Blockly.Words['get_value_tooltip'][systemLang]);
        this.setHelpUrl(getHelp('get_value_help'));
    }
};

Blockly.JavaScript['get_value_async'] = function(block) {
    var oid  = block.getFieldValue('OID');
    var attr = block.getFieldValue('ATTR');
    var statement = Blockly.JavaScript.statementToCode(block, 'STATEMENT');
    return 'getState("' + oid + '", function (err, state) {\n   var value = state.' + attr + ';\n' + statement + '});\n';
};

// --- select OID --------------------------------------------------
Blockly.Words['field_oid']         = {'en': 'Select OID',    'de': 'Zustand erzeugen',   'ru': 'создать состояние'};
Blockly.Words['field_oid_OID']     = {'en': 'Object ID',         'de': 'Objekt ID',            'ru': 'ID объекта'};
Blockly.Words['field_oid_tooltip'] = {'en': 'Select object ID with dialog',    'de': 'Objekt ID mit Dialog selektieren',   'ru': 'Выбрать ID объекта'};

Blockly.System.blocks['field_oid'] =
    '<block type="field_oid">'
    + '     <value name="TEXT">'
    + '     </value>'
    + '</block>';

Blockly.Blocks['field_oid'] = {
    // Checkbox.
    init: function() {

        this.appendDummyInput()
            .appendField(Blockly.Words['field_oid_OID'][systemLang]);

        this.appendDummyInput()
            .appendField(new Blockly.FieldOID('default', main.initSelectId(), main.objects), 'oid');

        this.setInputsInline(true);
        this.setColour(Blockly.System.HUE);
        this.setOutput(true, "String");
        this.setTooltip(Blockly.Words['field_oid_tooltip'][systemLang]);
    }
};

Blockly.JavaScript['field_oid'] = function(block) {
    var oid = block.getFieldValue('oid');
    return ['\'' + oid + '\'', Blockly.JavaScript.ORDER_ATOMIC]
};

