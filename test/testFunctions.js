var expect = require('chai').expect;
var setup  = require(__dirname + '/lib/setup');

var objects = null;
var states  = null;
var onStateChanged = null;
var onObjectChanged = null;

function checkConnectionOfAdapter(cb, counter) {
    counter = counter || 0;
    if (counter > 20) {
        cb && cb('Cannot check connection');
        return;
    }

    states.getState('system.adapter.javascript.0.alive', function (err, state) {
        if (err) console.error(err);
        if (state && state.val) {
            cb && cb();
        } else {
            setTimeout(function () {
                checkConnectionOfAdapter(cb, counter + 1);
            }, 1000);
        }
    });
}

function checkValueOfState(id, value, cb, counter) {
    counter = counter || 0;
    if (counter > 20) {
        cb && cb('Cannot check value Of State ' + id);
        return;
    }

    states.getState(id, function (err, state) {
        if (err) console.error(err);
        if (value === null && !state) {
            cb && cb();
        } else
        if (state && (value === undefined || state.val === value)) {
            cb && cb();
        } else {
            setTimeout(function () {
                checkValueOfState(id, value, cb, counter + 1);
            }, 500);
        }
    });
}

describe('Test JS', function() {

    before('Test JS: Start js-controller', function (_done) {
        this.timeout(600000); // because of first install from npm

        setup.setupController(function () {
            var config = setup.getAdapterConfig();
            // enable adapter
            config.common.enabled  = true;
            config.common.loglevel = 'debug';

            config.native.longitude = 43.273709;
            config.native.latitude  = 6.5798918;

            setup.setAdapterConfig(config.common, config.native);

            setup.startController(false, function (id, obj) {
                    if (onObjectChanged) onObjectChanged(id, obj);
                }, function (id, state) {
                    if (onStateChanged) onStateChanged(id, state);
            },
            function (_objects, _states) {
                objects = _objects;
                states  = _states;
                states.subscribe('*');
                var script = {
                    "common": {
                        "name":         "new script global",
                        "engineType":   "Javascript/js",
                        "source":       "function setTestState(val) {\ncreateState('testGlobal', val, function () {\nsetState('testGlobal', val);\n});\n}",
                        "enabled":      true,
                        "engine":       "system.adapter.javascript.0"
                    },
                    "type":             "script",
                    "_id":              "script.js.global.TestGlobalNew.Script",
                    "native": {}
                };
                objects.setObject(script._id, script, function (err) {
                    expect(err).to.be.not.ok;
                    script = {
                        "common": {
                            "name": "Old script global",
                            "engineType": "Javascript/js",
                            "source": "function setTestStateOld(val) {\ncreateState('testGlobalOld', val, function () {\nsetState('testGlobalOld', val);\n});\n}",
                            "enabled": true,
                            "engine": "system.adapter.javascript.0"
                        },
                        "type": "script",
                        "_id": "script.js.global.TestGlobalOld.Script",
                        "native": {}
                    };
                    objects.setObject(script._id, script, function (err) {
                        expect(err).to.be.not.ok;
                        setup.startAdapter(objects, states, function () {
                            _done();
                        });
                    });
                });
            });
        });
    });

    it('Test JS: Check if adapter started', function (done) {
        this.timeout(30000);
        checkConnectionOfAdapter(done);
    });

    it('Test JS: check compareTime between', function (done) {
        this.timeout(4000);
        // add script
        var script = {
            "common": {
                "name":         "check compareTime",
                "engineType":   "Javascript/js",
                "source":       "createState('test10', 0, function () {\n" +
                "   var count = 0;\n" +
/*                "   var date1 = new Date();\n" +
                "   date1.setHours(23);\n" +
                "   date1.setMinutes(30);\n" +
                "   var date2 = new Date();\n" +
                "   date2.setHours(0);\n" +
                "   date2.setMinutes(30);\n" +
                "   count += compareTime('23:00', '01:00', 'between', date1) ? 1 : 0;\n" +
                "   count += compareTime('23:00', '01:00', 'between', date2) ? 1 : 0;\n" +
*/
                "   count += compareTime('23:00', '01:00', 'between', '22:30') ? 0 : 1;\n" +
                "   count += compareTime('23:00', '01:00', 'between', '02:30') ? 0 : 1;\n" +
                "   count += compareTime('10:00', '20:00', 'between', '15:00') ? 1 : 0;\n" +
                "   count += compareTime('10:00', '20:00', 'between', '9:00') ? 0 : 1;\n" +
                "   count += compareTime('10:00', null, '<', '9:00') ? 1 : 0;\n" +
                "   var date1 = new Date();\n" +
                "   date1.setHours(10);\n" +
                "   date1.setMinutes(0);\n" +
                "   count += compareTime(date1, null, '<', '9:00') ? 1 : 0;\n" +
                "   count += compareTime(date1, '20:00', 'between', '15:00') ? 1 : 0;\n" +
                "   count += compareTime('5:00', date1, 'between', '8:00') ? 1 : 0;\n" +
                "   var date2 = new Date(new Date().getTime()+ 24*60*60*1000);\n" +
                "   date2.setHours(2);\n" +
                "   date2.setMinutes(30);\n" +
                "   count += compareTime('23:00', '01:00', 'between', date2) ? 0 : 1;\n" +
                "   setState('test10', count);\n" +
                "});",
                "enabled":      true,
                "engine":       "system.adapter.javascript.0"
            },
            "type":             "script",
            "_id":              "script.js.check_compareTime",
            "native": {}
        };
        onStateChanged = function (id, state) {
            if (id === 'javascript.0.test10') {
                if (state.val === 9) {
                    onStateChanged = null;
                    states.getState('javascript.0.test10', function (err, state) {
                        expect(err).to.be.not.ok;
                        expect(state.val).to.be.equal(9);
                        done();
                    });
                }
                else {
                    console.log('GOT State.val =' + state.val);
                }
            }
        };
        objects.setObject(script._id, script, function (err) {
            expect(err).to.be.not.ok;
        });
    });

    it('Test JS: Catch request error', function (done) {
        this.timeout(10000);
        // add script
        var script = {
            "common": {
                "name":         "Catch request error",
                "engineType":   "Javascript/js",
                "source":       "var request = require('request');" +
                                "createState('check_request_error', function () {" +
                                "   request('http://google1456.com').on('error', function (error) { " +
                                "       console.error(error); setState('check_request_error', true, true);" +
                                "   });" +
                                "});",
                "enabled":      true,
                "engine":       "system.adapter.javascript.0"
            },
            "type":             "script",
            "_id":              "script.js.check_request_error",
            "native": {}
        };
        onStateChanged = function (id, state) {
            if (id === 'javascript.0.check_request_error' && state.val === true) {
                onStateChanged = null;
                done();
            }
        };
        objects.setObject(script._id, script, function (err) {
            expect(err).to.be.not.ok;
        });
    });

    it('Test JS: check creation of state', function (done) {
        this.timeout(2000);
        // add script
        var script = {
            "common": {
                "name":         "check creation of state",
                "engineType":   "Javascript/js",
                "source":       "createState('test1', 5);",
                "enabled":      true,
                "engine":       "system.adapter.javascript.0"
            },
            "type":             "script",
            "_id":              "script.js.check_creation_of_state",
            "native": {}
        };
        onStateChanged = function (id, state) {
            if (id === 'javascript.0.test1' && state.val === 5) {
                onStateChanged = null;
                states.getState('javascript.0.test1', function (err, state) {
                    expect(err).to.be.not.ok;
                    expect(state.val).to.be.equal(5);
                    objects.getObject('javascript.0.test1', function (err, obj) {
                        expect(err).to.be.not.ok;
                        expect(obj).to.be.ok;

                        done();
                    });
                });
            }
        };
        objects.setObject(script._id, script, function (err) {
            expect(err).to.be.not.ok;
        });
    });

    it('Test JS: check creation of state for other instance', function (done) {
        this.timeout(2000);
        // add script
        var script = {
            "common": {
                "name":         "check creation of state",
                "engineType":   "Javascript/js",
                "source":       "createState('javascript.1.test1', 6);",
                "enabled":      true,
                "engine":       "system.adapter.javascript.0"
            },
            "type":             "script",
            "_id":              "script.js.check_creation_of_foreign_state",
            "native": {}
        };
        onStateChanged = function (id, state) {
            if (id === 'javascript.1.test1' && state.val === 6) {
                onStateChanged = null;
                states.getState('javascript.1.test1', function (err, state) {
                    expect(err).to.be.not.ok;
                    expect(state).to.be.ok;
                    expect(state.val).to.be.equal(6);
                    objects.getObject('javascript.1.test1', function (err, obj) {
                        expect(err).to.be.not.ok;
                        expect(obj).to.be.ok;
                        done();
                    });
                });
            }
        };
        objects.setObject(script._id, script, function (err) {
            expect(err).to.be.not.ok;
        });
    });

    it('Test JS: check deletion of state', function (done) {
        this.timeout(2000);
        // add script
        var script = {
            "common": {
                "name":         "check deletion of state",
                "engineType":   "Javascript/js",
                "source":       "deleteState('test1');",
                "enabled":      true,
                "engine":       "system.adapter.javascript.0"
            },
            "type":             "script",
            "_id":              "script.js.check_deletion_of_state",
            "native": {}
        };

        objects.getObject('javascript.0.test1', function (err, obj) {
            expect(err).to.be.not.ok;
            expect(obj).to.be.ok;
            states.getState('javascript.0.test1', function (err, state) {
                expect(err).to.be.not.ok;
                expect(state).to.be.ok;
                expect(state.val).to.be.equal(5);

                onStateChanged = function (id, state) {
                    if (id === 'javascript.0.test1' && state === null) {
                        onStateChanged = null;
                        states.getState('javascript.0.test1', function (err, state) {
                            expect(err).to.be.not.ok;
                            expect(state).to.be.equal(undefined);
                            objects.getObject('javascript.0.test1', function (err, obj) {
                                expect(err).to.be.not.ok;
                                expect(obj).to.be.not.ok;
                                done();
                            });
                        });
                    }
                };

                objects.setObject(script._id, script, function (err) {
                    expect(err).to.be.not.ok;
                });
            });
        });
    });

    it('Test JS: check deletion of foreign state', function (done) {
        this.timeout(2000);
        // add script
        var script = {
            "common": {
                "name":         "check deletion of state",
                "engineType":   "Javascript/js",
                "source":       "deleteState('javascript.1.test1');",
                "enabled":      true,
                "engine":       "system.adapter.javascript.0"
            },
            "type":             "script",
            "_id":              "script.js.check_deletion_of_foreign_state",
            "native": {}
        };

        objects.getObject('javascript.1.test1', function (err, obj) {
            expect(err).to.be.not.ok;
            expect(obj).to.be.ok;
            states.getState('javascript.1.test1', function (err, state) {
                expect(err).to.be.not.ok;
                expect(state).to.be.ok;
                expect(state.val).to.be.equal(6);

                // we cannot delete foreign object, even if we created it.
                setTimeout(function () {
                    objects.getObject('javascript.1.test1', function (err, obj) {
                        expect(err).to.be.not.ok;
                        expect(obj).to.be.ok;
                        states.getState('javascript.1.test1', function (err, state) {
                            expect(err).to.be.not.ok;
                            expect(state).to.be.ok;
                            expect(state.val).to.be.equal(6);
                            done();
                        });
                    });
                }, 400);

                objects.setObject(script._id, script, function (err) {
                    expect(err).to.be.not.ok;
                });
            });
        });
    });

    it('Test JS: open objects.json file must not work', function (done) {
        this.timeout(20000);
        // add script
        var script = {
            "common": {
                "name":         "open objects",
                "engineType":   "Javascript/js",
                "source":       "var fs=require('fs'); try{fs.readFileSync('" + __dirname + "/../tmp/" + setup.appName + "-data/objects.json');}catch(err){createState('error', err.toString());}",
                "enabled":      true,
                "engine":       "system.adapter.javascript.0"
            },
            "type":             "script",
            "_id":              "script.js.open_objects",
            "native": {}
        };

        onStateChanged = function (id, state) {
            if (id === 'javascript.0.error' && state.val === 'Error: Permission denied') {
                onStateChanged = null;
                done();
            }
        };

        objects.setObject(script._id, script, function (err) {
            expect(err).to.be.not.ok;
        });
    });

    it('Test JS: write objects.json file must not work', function (done) {
        this.timeout(2000);
        // add script
        var script = {
            "common": {
                "name":         "open objects",
                "engineType":   "Javascript/js",
                "source":       "var fs=require('fs'); try{fs.writeFileSync('" + __dirname + "/../tmp/" + setup.appName + "-data/objects.json', '');}catch(err){createState('error1', err.toString());}",
                "enabled":      true,
                "engine":       "system.adapter.javascript.0"
            },
            "type":             "script",
            "_id":              "script.js.open_objects",
            "native": {}
        };
        onStateChanged = function (id, state) {
            if (id === 'javascript.0.error1' && state.val === 'Error: Permission denied') {
                onStateChanged = null;
                done();
            }
        };
        objects.setObject(script._id, script, function (err) {
            expect(err).to.be.not.ok;
        });
    });

    it('Test JS: write objects.json not in data directory must work', function (done) {
        this.timeout(2000);
        var time = new Date().toString();
        var fs = require('fs');

        if (fs.existsSync(__dirname + "/../tmp/objects.json")) fs.unlinkSync(__dirname + "/../tmp/objects.json");

        // add script
        var script = {
            "common": {
                "name":         "open objects",
                "engineType":   "Javascript/js",
                "source":       "var fs=require('fs'); try{fs.writeFileSync('" + __dirname.replace(/\\/g, "/") + "/../tmp/objects.json', '" + time + "');}catch(err){createState('error3', err.toString());}",
                "enabled":      true,
                "engine":       "system.adapter.javascript.0"
            },
            "type":             "script",
            "_id":              "script.js.open_objects",
            "native": {}
        };

        objects.setObject(script._id, script, function (err) {
            expect(err).to.be.not.ok;
            setTimeout(function () {
                if (!fs.existsSync(__dirname + '/../tmp/objects.json')) {
                    setTimeout(function () {
                        expect(fs.readFileSync(__dirname + "/../tmp/objects.json").toString()).to.be.equal(time);
                        fs.unlinkSync(__dirname + "/../tmp/objects.json");
                        done();
                    }, 500);
                } else {
                    expect(fs.readFileSync(__dirname + "/../tmp/objects.json").toString()).to.be.equal(time);
                    fs.unlinkSync(__dirname + "/../tmp/objects.json");
                    done();
                }
            }, 500);
        });
    });

    it('Test JS: test getAstroDate', function (done) {
        this.timeout(6000);
        var types = [
            "sunrise",
            "sunriseEnd",
            "goldenHourEnd",
            "solarNoon",
            "goldenHour",
            "sunsetStart",
            "sunset",
            "dusk",
            "nauticalDusk",
            "night",
            "nightEnd",
            "nauticalDawn",
            "dawn",
            "nadir"
        ];
        // add script
        var script = {
            "common": {
                "name":         "getAstroDate",
                "engineType":   "Javascript/js",
                "source":       "",
                "enabled":      true,
                "engine":       "system.adapter.javascript.0"
            },
            "type":             "script",
            "_id":              "script.js.getAstroDate",
            "native": {}
        };
        for (var t = 0; t < types.length; t++) {
            script.common.source += "createState('" + types[t] + "', getAstroDate('" + types[t] + "') ? getAstroDate('" + types[t] + "').toString() : '');"
        }

        var typesChanged = {};
        onStateChanged = function (id, state) {
            if (types.indexOf(id.substring('javascript.0.'.length)) !== -1) {
                typesChanged[id] = true;
                console.log('State change '+ id + ' / ' + Object.keys(typesChanged).length + '-' + types.length + '  = ' + JSON.stringify(state))
                if (Object.keys(typesChanged).length === types.length) {
                    onStateChanged = null;

                    var count = types.length;
                    for (var t = 0; t < types.length; t++) {
                        states.getState('javascript.0.' + types[t], function (err, state) {
                            expect(err).to.be.not.ok;
                            expect(state).to.be.ok;
                            expect(state.val).to.be.ok;
                            if (state) console.log(types[types.length - count] + ': ' + state.val);
                              else console.log(types[types.length - count] + ' ERROR: ' + state);
                            if (!--count) done();
                        });
                    }
                }
            }
        };

        objects.setObject(script._id, script, function (err) {
            expect(err).to.be.not.ok;
        });
    });

    it('Test JS: test setStateDelayed simple', function (done) {
        this.timeout(5000);
        // add script
        var script = {
            "common": {
                "name":         "setStateDelayed",
                "engineType":   "Javascript/js",
                "source":       "createState('delayed', 4, function () {setStateDelayed('delayed', 5, 1000);});",
                "enabled":      true,
                "engine":       "system.adapter.javascript.0"
            },
            "type":             "script",
            "_id":              "script.js.setStateDelayed",
            "native": {}
        };

        var start = 0;
        onStateChanged = function (id, state){
            if (id !== 'javascript.0.delayed') return;
            if (state.val === 4) {
                start = state.ts;
            } else if (state.val === 5) {
                expect(start).to.be.not.equal(0);
                expect(state.ts - start).to.be.least(950);
                onStateChanged = null;
                setTimeout(done, 100);
            }
        };
        objects.setObject(script._id, script);
    });

    it('Test JS: test setStateDelayed nested', function (done) {
        this.timeout(5000);
        // add script
        var script = {
            "common": {
                "name":         "setStateDelayed",
                "engineType":   "Javascript/js",
                "source":       "setStateDelayed('delayed', 6, 500); setStateDelayed('delayed', 7, 1500, false);",
                "enabled":      true,
                "engine":       "system.adapter.javascript.0"
            },
            "type":             "script",
            "_id":              "script.js.setStateDelayed",
            "native": {}
        };

        var start = 0;
        onStateChanged = function (id, state){
            if (id !== 'javascript.0.delayed') return;
            if (state.val === 6) {
                start = state.ts;
            } else if (state.val === 7) {
                expect(start).to.be.not.equal(0);
                expect(state.ts - start).to.be.least(950);
                onStateChanged = null;
                setTimeout(done, 100);
            }
        };
        objects.setObject(script._id, script);
    });

    it('Test JS: test setStateDelayed overwritten', function (done) {
        this.timeout(5000);
        // add script
        var script = {
            "common": {
                "name":         "setStateDelayed",
                "engineType":   "Javascript/js",
                "source":       "setStateDelayed('delayed', 8, 500); setStateDelayed('delayed', 9, 1500);",
                "enabled":      true,
                "engine":       "system.adapter.javascript.0"
            },
            "type":             "script",
            "_id":              "script.js.setStateDelayed",
            "native": {}
        };

        objects.setObject(script._id, script, function (err) {
            expect(err).to.be.not.ok;
            checkValueOfState('javascript.0.delayed', 8, function (err) {
                expect(err).to.be.ok;

                states.getState('javascript.0.delayed', function (err, stateStart) {
                    expect(err).to.be.not.ok;
                    expect(stateStart.val).to.be.not.equal(8);

                    checkValueOfState('javascript.0.delayed', 9, function (err) {
                        expect(err).to.be.not.ok;
                        states.getState('javascript.0.delayed', function (err, stateStop) {
                            expect(err).to.be.not.ok;
                            done();
                        });
                    });
                });
            }, 18);
        });
    });

    it('Test JS: test setStateDelayed canceled', function (done) {
        this.timeout(5000);
        // add script
        var script = {
            "common": {
                "name":         "setStateDelayed",
                "engineType":   "Javascript/js",
                "source":       "setStateDelayed('delayed', 10, 500); clearStateDelayed('delayed');",
                "enabled":      true,
                "engine":       "system.adapter.javascript.0"
            },
            "type":             "script",
            "_id":              "script.js.setStateDelayed",
            "native": {}
        };

        objects.setObject(script._id, script, function (err) {
            expect(err).to.be.not.ok;

            checkValueOfState('javascript.0.delayed', 10, function (err) {
                expect(err).to.be.ok;

                states.getState('javascript.0.delayed', function (err, stateStart) {
                    expect(err).to.be.not.ok;
                    expect(stateStart.val).to.be.not.equal(10);
                    done();
                });
            }, 18);
        });
    });
	
	it('Test JS: test getStateDelayed single', function (done) {
        this.timeout(5000);
        // add script
        var script = {
            "common": {
                "name":         "setStateDelayed",
                "engineType":   "Javascript/js",
                "source":       "createState('delayedResult', '', function () {setStateDelayed('delayed', 10, 1500); setState('delayedResult', JSON.stringify(getStateDelayed('delayed')));});",
                "enabled":      true,
                "engine":       "system.adapter.javascript.0"
            },
            "type":             "script",
            "_id":              "script.js.setStateDelayed",
            "native": {}
        };

        objects.setObject(script._id, script, function (err) {
            expect(err).to.be.not.ok;

			setTimeout(function () {
				states.getState('javascript.0.delayedResult', function (err, delayedResult) {
					expect(err).to.be.not.ok;
					console.log('delayedResult: ' + delayedResult.val);
					var result = JSON.parse(delayedResult.val);
					expect(result[0]).to.be.ok;
					expect(result[0].timerId).to.be.ok;
					expect(result[0].left).to.be.ok;
					expect(result[0].delay).to.be.equal(1500);
					done();
				});
			}, 500);
        });
    });
	
	it('Test JS: test getStateDelayed all', function (done) {
        this.timeout(5000);
        // add script
        var script = {
            "common": {
                "name":         "setStateDelayed",
                "engineType":   "Javascript/js",
                "source":       "createState('delayedResult', '', function () {setStateDelayed('delayed', 11, 2500); setState('delayedResult', JSON.stringify(getStateDelayed()));});",
                "enabled":      true,
                "engine":       "system.adapter.javascript.0"
            },
            "type":             "script",
            "_id":              "script.js.setStateDelayed",
            "native": {}
        };

        objects.setObject(script._id, script, function (err) {
            expect(err).to.be.not.ok;

			setTimeout(function () {
				states.getState('javascript.0.delayedResult', function (err, delayedResult) {
					console.log('delayedResult!: ' + delayedResult.val);
					expect(err).to.be.not.ok;
					var result = JSON.parse(delayedResult.val);
					expect(result['javascript.0.delayed'][0]).to.be.ok;
					expect(result['javascript.0.delayed'][0].timerId).to.be.ok;
					expect(result['javascript.0.delayed'][0].left).to.be.ok;
					expect(result['javascript.0.delayed'][0].delay).to.be.equal(2500);
					done();
				});
			}, 500);
        });
    });

    it('Test JS: test stopScript', function (done) {
        this.timeout(5000);
        // add script
        var script = {
            "common": {
                "name":         "stopScript",
                "engineType":   "Javascript/js",
                "source":       "stopScript('stopScript');",
                "enabled":      true,
                "engine":       "system.adapter.javascript.0"
            },
            "type":             "script",
            "_id":              "script.js.stopScript",
            "native": {}
        };

        objects.setObject(script._id, script, function (err) {
            expect(err).to.be.not.ok;
            setTimeout(function () {
                objects.getObject(script._id, function (err, obj) {
                    expect(err).to.be.not.ok;
                    expect(obj.common.enabled).to.be.false;
                    done();
                });
            }, 1000);
        });
    });

    it('Test JS: test startScript', function (done) {
        this.timeout(5000);
        // add script
        var script = {
            "common": {
                "name":         "startScript",
                "engineType":   "Javascript/js",
                "source":       "startScript('stopScript');",
                "enabled":      true,
                "engine":       "system.adapter.javascript.0"
            },
            "type":             "script",
            "_id":              "script.js.startScript",
            "native": {}
        };
        var stopScript = {
            "common": {
                "name":         "stopScript",
                "engineType":   "Javascript/js",
                "source":       "console.log('aaa');",
                "enabled":      false,
                "engine":       "system.adapter.javascript.0"
            },
            "type":             "script",
            "_id":              "script.js.stopScript",
            "native": {}
        };

        objects.setObject(stopScript._id, stopScript, function (err) {
            objects.getObject(stopScript._id, function (err, obj) {
                expect(err).to.be.not.ok;
                expect(obj.common.enabled).to.be.false;
                objects.setObject(script._id, script, function (err) {
                    expect(err).to.be.not.ok;
                    setTimeout(function () {
                        objects.getObject(stopScript._id, function (err, obj) {
                            expect(err).to.be.not.ok;
                            expect(obj.common.enabled).to.be.true;
                            done();
                        });
                    }, 1000);
                });
            });
        });
    });

    it('Test JS: test global scripts New', function (done) {
        this.timeout(5000);
        // add script
        var script = {
            "common": {
                "name":         "new script non global",
                "engineType":   "Javascript/js",
                "source":       "setTestState(16);",
                "enabled":      true,
                "engine":       "system.adapter.javascript.0"
            },
            "type":             "script",
            "_id":              "script.js.TestGlobalNew.Script",
            "native": {}
        };
        objects.setObject(script._id, script, function (err) {
            expect(err).to.be.not.ok;
            checkValueOfState('javascript.0.testGlobal', 16, function (err) {
                expect(err).to.be.not.ok;

                states.getState('javascript.0.testGlobal', function (err, state) {
                    expect(err).to.be.not.ok;
                    expect(state).to.be.ok;
                    expect(state.val).to.be.equal(16);
                    done();
                });
            }, 18);
        });
    });

    it('Test JS: test global scripts Old', function (done) {
        this.timeout(5000);
        // add script
         var script = {
            "common": {
                "name":         "Old script non global",
                "engineType":   "Javascript/js",
                "source":       "setTestStateOld(17);",
                "enabled":      true,
                "engine":       "system.adapter.javascript.0"
            },
            "type":             "script",
            "_id":              "script.js.TestGlobalOld.Script",
            "native": {}
        };
        objects.setObject(script._id, script, function (err) {
            expect(err).to.be.not.ok;
            checkValueOfState('javascript.0.testGlobalOld', 17, function (err) {
                expect(err).to.be.not.ok;

                states.getState('javascript.0.testGlobalOld', function (err, state) {
                    expect(err).to.be.not.ok;
                    expect(state).to.be.ok;
                    expect(state.val).to.be.equal(17);
                    done();
                });
            }, 18);
        });
    });

    it('Test JS: test ON default', function (done) {
        this.timeout(5000);
        // add script
        var script = {
            "common": {
                "name":         "test ON default",
                "engineType":   "Javascript/js",
                "source":       "createState('testResponse', false);createState('testVar', 0, function () {on('testVar', function (obj) {setState('testResponse', obj.state.val, true);});});",
                "enabled":      true,
                "engine":       "system.adapter.javascript.0"
            },
            "type":             "script",
            "_id":              "script.js.test_ON_default",
            "native": {}
        };

        onStateChanged = function (id, state) {
            if (id === 'javascript.0.testVar' && state.val === 0) {
                states.setState('javascript.0.testVar', 6, function (err) {
                    expect(err).to.be.not.ok;
                });
            }
            if (id === 'javascript.0.testResponse' && state.val === 6) {
                onStateChanged = null;
                done();
            }
        };

        objects.setObject(script._id, script, function (err) {
            expect(err).to.be.not.ok;
        });
    });

    it('Test JS: test ON any', function (done) {
        this.timeout(5000);
        // add script
        var script = {
            "common": {
                "name":         "test ON any",
                "engineType":   "Javascript/js",
                "source":       "createState('testResponse1', false);createState('testVar1', 1, function () {on({id:'testVar1', change:'any'}, function (obj) {setState('testResponse1', obj.state.val, true);});});",
                "enabled":      true,
                "engine":       "system.adapter.javascript.0"
            },
            "type":             "script",
            "_id":              "script.js.test_ON_any",
            "native": {}
        };

        onStateChanged = function (id, state) {
            if (id === 'javascript.0.testVar1' && state.val === 1) {
                setTimeout(function () {
                    states.setState('javascript.0.testVar1', 1, function (err) {
                        expect(err).to.be.not.ok;
                    });
                }, 1000);
            }
            if (id === 'javascript.0.testResponse1' && state.val === 1) {
                onStateChanged = null;
                done();
            }
        };

        objects.setObject(script._id, script, function (err) {
            expect(err).to.be.not.ok;
        });
    });

    it('Test JS: test ON misc', function (done) {

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function scriptFunction (param) {
            var results = '';
            var TEST_VAR = 'javascript.0.device.channel.testVar';
            var TEST_RESULTS = 'javascript.0.testResults';

            var recs = [
                // request Options                                 // on options or iD                       // states to set
                [ { no:  1, cnt: 2, val: true },                   { id: /\.testVar$/, val: true },                            [ true, false, { val: true, ack: true } ] ],
                [ { no:  2, cnt: 2, val: true },                   { id: 0, val: true },                                       [ true, false, { val: true, ack: true } ] ],
                [ { no:  3, cnt: 2, val: false },                  { id: 0, val: false },                                      [ true, false, { val: true, ack: true }, { val: false, ack: true } ] ],
                [ { no:  4, cnt: 1, val: {val: true, ack: true }}, { id: 0, val: true, ack: true },                            [ true, false, { val: true, ack: true }, { val: false, ack: true } ] ],
                [ { no:  5, cnt: 1, val: {val:false, ack: true }}, { id: 0, val: false, ack: true },                           [ true, false, { val: true, ack: true }, { val: false, ack: true } ] ],
                [ { no:  6, cnt: 1, val: true },                   { id: 0, change: 'ne' },                                    [ false, true, true ]],
                [ { no:  7, cnt: 2, val: true },                   { id: 0, change: 'any' },                                   [ true, true ]],
                [ { no:  8, cnt: 1, val: true },                   { id: 0, change: 'gt' },                                    [ false, true, true ]],
                [ { no:  9, cnt: 2, val: true },                   { id: 0, change: 'eq' },                                    [ true, true, true, false ]],
                [ { no: 10, cnt: 1, val: 'World' },                { name: 'Hello', change: 'gt' },                            ['Change', 'World', 'World'] ],
                [ { no: 11, cnt: 0, val: 'World' },                { name: 'hello', change: 'gt' },                            ['Change', 'World', 'World'] ],
                [ { no: 12, cnt: 1, val: 'World' },                { name: /^[h|H]ello/, change: 'any' },                      ['World'] ],

                [ { no: 13, cnt: 1, val: 'B' },                    { id: 0, valGt: 'A' },                                      [ 'B', 'A'] ],
                [ { no: 14, cnt: 2, val: 'B' },                    { id: 0, valGe: 'A' },                                      [ 'B', 'B'] ],
                [ { no: 15, cnt: 1, val: 'B' },                    { id: 0, valGe: 'B' },                                      [ 'B', 'A'] ],
                [ { no: 16, cnt: 1, val: 'A' },                    { id: 0, valLt: 'B' },                                      [ 'A', 'C'] ],
                [ { no: 17, cnt: 1, val: 'A' },                    { id: 0, valLe: 'A' },                                      [ 'A', 'B'] ],
                [ { no: 18, cnt: 1, val: 'B' },                    { id: 0, valNe: 'A' },                                      [ 'B', 'A'] ],
                [ { no: 19, cnt: 1, val: 'onChannel' },            { channelId: 'javascript.0.device.channel' },                      [ 'onChannel'] ],
                [ { no: 20, cnt: 1, val: 'onChannel'},             { channelId: 'javascript.0.device.channel', val: 'onChannel' },    [ 'onChannel', 'xyz'] ],
                [ { no: 21, cnt: 1, val: 'onChannel'},             { channelName: 'Channel' },                                        [ 'onChannel'] ],
                [ { no: 22, cnt: 1, val: 'onChannel'},             { channelName: 'Channel', val: 'onChannel' },                      [ 'onChannel', 'xyz'] ],
                [ { no: 23, cnt: 1, val: 'onDevice'},              { deviceId: 'javascript.0.device' },                               [ 'onDevice'] ],
                [ { no: 24, cnt: 1, val: 'onDevice'},              { deviceId: 'javascript.0.device', val: 'onDevice' },              [ 'onDevice', 'xyz'] ],
                [ { no: 25, cnt: 1, val: 'onDevice'},              { deviceName: 'Device' },                                          [ 'onDevice'] ],
                [ { no: 26, cnt: 1, val: 'onDevice'},              { deviceName: 'Device', val: 'onDevice' },                         [ 'onDevice', 'xyz'] ],

                [ { no: 27, cnt: 1, val: 1, before: false },       { id:0, oldVal: false },                                        [ 1, 1 ] ],
                [ { no: 28, cnt: 1, val: 1, before: 2 },           { id:0, oldValGt: 1 },                                          [ 1, 1 ] ],
                [ { no: 29, cnt: 2, val: 1, before: 2 },           { id:0, oldValGe: 1 },                                          [ 1, 1 ] ],
                [ { no: 30, cnt: 1, before: 2 },                   { id:0, oldValNe: 1 },                                          [ 1, 0 ] ],
                [ { no: 31, cnt: 1, before: 0 },                   { id:0, oldValLt: 1 },                                          [ 1, 0 ] ],
                [ { no: 32, cnt: 2, before: 0 },                   { id:0, oldValLe: 1 },                                          [ 1, 2, 0] ],

                [ { no: 33, cnt: 1, val: 1 },                      { id:0, tsGt: 1 },                                              [ 1 ] ],
                [ { no: 34, cnt: 0 },                              { id:0, tsGt: 0xfffffffffff },                                  [ 1 ] ],
                [ { no: 35, cnt: 1, val: 1 },                      { id:0, tsLt: 0xfffffffffff },                                  [ 1 ] ],
                [ { no: 36, cnt: 0 },                              { id:0, tsLt: 1 },                                              [ 1 ] ],
                [ { no: 37, cnt: 1, val: 1 },                      { id:0, oldTsGt: 1 },                                           [ 1 ] ],
                [ { no: 38, cnt: 0 },                              { id:0, oldTsGt: 0xfffffffffff },                               [ 1 ] ],
                [ { no: 39, cnt: 1, val: 1 },                      { id:0, oldTsLt: 0xfffffffffff },                               [ 1 ] ],
                [ { no: 40, cnt: 0 },                              { id:0, oldTsLt: 1 },                                           [ 1 ] ],
                [ { no: 41, cnt: 1, val: 1 },                      { id:0, lcGt: 1 },                                              [ 1 ] ],
                [ { no: 42, cnt: 1, val: 1 },                      { id:0, lcLt: 0xfffffffffff },                                  [ 1 ] ],
                [ { no: 43, cnt: 0 },                              { id:0, lcLt: 1 },                                              [ 1 ] ],
                [ { no: 44, cnt: 1, val: 1 },                      { id:0, oldLcGt: 1 },                                           [ 1 ] ],
                [ { no: 45, cnt: 0 },                              { id:0, oldLcGt: 0xfffffffffff },                               [ 1 ] ],
                [ { no: 46, cnt: 1, val: 1 },                      { id:0, oldLcLt: 0xfffffffffff },                               [ 1 ] ],
                [ { no: 47, cnt: 0 },                              { id:0, oldLcLt: 1 },                                           [ 1 ] ],

                [ { no: 48, cnt: 1, val: 1 },                      { id:0, from: 'system.adapter.javascript.0' },                  [ 1 ] ],
                [ { no: 49, cnt: 0 },                              { id:0, from: 'system.adapter.javascript.1' },                  [ 1 ] ],
                [ { no: 50, cnt: 1, val: 1 },                      { id:0, oldFrom: 'system.adapter.javascript.0' },               [ 1 ] ],
                [ { no: 51, cnt: 0 },                              { id:0, oldFrom: 'system.adapter.javascript.1' },               [ 1 ] ],

                // not ok with the old patternMatching function
                [ { no: 52, cnt: 1, val: 'onChannel'},          { channelId: /^javascript.0.device.channel$/ },                    [ 'onChannel'] ],
                [ { no: 53, cnt: 1, val: 'onChannel'},          { channelId: /^javascript.0.device.channel$/, val: 'onChannel' },  [ 'onChannel', 'xyz'] ],
                [ { no: 54, cnt: 1, val: 'onChannel'},          { channelName: /^Channel$/ },                                      [ 'onChannel'] ],
                [ { no: 55, cnt: 1, val: 'onChannel'},          { channelName: /^Channel$/, val: 'onChannel' },                    [ 'onChannel', 'xyz'] ],
                [ { no: 56, cnt: 1, val: 'onDevice'},           { deviceId: /^javascript.0.device$/ },                             [ 'onDevice'] ],
                [ { no: 57, cnt: 1, val: 'onDevice'},           { deviceId: /^javascript.0.device$/, val: 'onDevice' },            [ 'onDevice', 'xyz'] ],
                [ { no: 58, cnt: 1, val: 'onDevice'},           { deviceName: /^Device$/ },                                        [ 'onDevice'] ],
                [ { no: 59, cnt: 1, val: 'onDevice'},           { deviceName: /^Device$/, val: 'onDevice' },                       [ 'onDevice', 'xyz'] ]

            ];

            switch (param) {
                case 'recs': return recs;
                case 'TEST_VAR': return TEST_VAR;
            }

            createState(TEST_RESULTS, '', true, { name: 'Testresults', type: 'string' });

            function addResult(name, val) {
                results += name + (val!==undefined ? '=' + val : '') + ';\r\n';
            }

            function handler(result, req, obj) {
                //log ('handler: ' + JSON.stringify (req));
                if (typeof result.val === 'object') {
                    for (var n in result.val) {
                        addResult ('obj.state.' + n + '=' + obj.state[n] + ' val.' + n + '=' + result.val[n]);
                        result.nok = result.nok || (result.val[n] !== obj.state[n]);
                    }
                } else if (result.val !== undefined) {
                    addResult ('obj.state.val=' + obj.state.val + ' val=' + result.val);
                    result.nok = result.nok || (result.val !== obj.state.val);
                }
                result.callCount += 1;
            }

            function createTest(req, obj, ar, callback) {
                results = '';
                if (obj.id === 0) obj.id = TEST_VAR;
                if (req.before === undefined) req.before = false;
                if (req.ack === undefined) req.ack = true;
                if (req.tio === undefined) req.tio = 400; else req.tio *= 1000;
                setState(TEST_VAR, req.before, req.ack, function (_err, _obj) {
                    req.nok = false;
                    req.callCount = 0;
                    if (req.cnt === undefined) req.cnt = 1;
                    var sub = on (obj, handler.bind(1, req, obj));
                    if (!ar) return doIt();
                    var no = 0;
                    (function doIt() {
                        if (no >= ar.length) {
                            setTimeout(function () {
                                unsubscribe(sub);
                                results = ((req.callCount === req.cnt && req.nok === false) ? 'OK;' : 'NOK;') + 'no=' + req.no + ';' + results + 'callCount=' + req.callCount + ';cnt=' + req.cnt;
                                setState(TEST_RESULTS, results, true, callback);
                            }, req.tio);
                            return;
                        }
                        var o = ar[no++];
                        if (typeof o !== 'object') {
                            o = { val: o };
                        }
                        setState(TEST_VAR, o.val, o.ack, doIt)
                    })();
                });
            }

            function runTests (id) {
                createState(id, '', true, { name: 'Hello' }, function (err, obj) {
                    var cnt = 0;
                    (function doIt() {
                        if (cnt >= recs.length) return;
                        var rec = recs[cnt++];
                        createTest(rec[0], rec[1], rec[2], doIt);
                    })();
                });
            }
            runTests(TEST_VAR);
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        var script = {
            "common": {
                "name":         "test ON any",
                "engineType":   "Javascript/js",
                "source":       scriptFunction.toString() + '\r\nscriptFunction();\r\n',
                "enabled":      true,
                "engine":       "system.adapter.javascript.0"
            },
            "type":             "script",
            "_id":              "script.js.test_ON",
            "native": {}
        };


        var recs = scriptFunction('recs');
        var TEST_VAR = scriptFunction('TEST_VAR');
        this.timeout(5000 + 500*recs.length);

        function createObjects(callback) {
            var channel = TEST_VAR.replace(/\.[^.]+$/, '');
            var device = channel.replace(/\.[^.]+$/, '');
            objects.setObject(device, { common: { name: 'Device', type: 'device'}}, function (err, obj) {
                expect(err).to.be.not.ok
                objects.setObject(channel, { common: { name: 'Channel', type: 'channel'}}, callback)
            })
        }

        createObjects(function (err, _obj) {
            expect(err).to.be.not.ok
            // objects.getObject('system.adapter.javascript.0', function(err, obj) {
            //     obj.native.enableSetObject = true;
            //     objects.setObject('system.adapter.javascript.0', function(err, obj) {
            var cnt = 0;

            onStateChanged = function (id, state) {
                if (id === 'javascript.0.testResults' && state.val) {
                    cnt += 1;
                    var ar = /^(OK;no=[\d]+)/.exec(state.val) || ['', state.val];
                    expect(ar).to.be.ok;
                    expect(ar[1]).to.be.equal('OK;no=' + cnt);

                    if (cnt >= recs.length) {
                        onStateChanged = null;
                        done ();
                    }
                }
            };

            objects.setObject(script._id, script, function (err) {
                expect(err).to.be.not.ok;
            });
        })


    });

    it('Test JS: test schedule for seconds', function (done) {
        this.timeout(4000);
        var d = new Date();

        console.log('Must wait 2 seconds[' + ((d.getSeconds() + 2) % 60) + ' * * * * *]' + d.toISOString());
        // add script
        var script = {
            "common": {
                "name":         "test ON any",
                "engineType":   "Javascript/js",
                "source":       "createState('testScheduleResponse', false);schedule('" + ((d.getSeconds() + 2) % 60) + " * * * * *', function (obj) {setState('testScheduleResponse', true, true);});",
                "enabled":      true,
                "engine":       "system.adapter.javascript.0"
            },
            "type":             "script",
            "_id":              "script.js.test_ON_any",
            "native": {}
        };

        onStateChanged = function (id, state) {
            if (id === 'javascript.0.testScheduleResponse' && state.val === true) {
                onStateChanged = null;
                done();
            }
        };

        objects.setObject(script._id, script, function (err) {
            expect(err).to.be.not.ok;
        });
    });

    it('Test JS: test schedule for minutes', function (done) {
        var d = new Date();
        console.log('Must wait ' + (60 - d.getSeconds()) + ' seconds[' + ((d.getMinutes() + 1) % 60) + ' * * * *] ' + d.toISOString());
        this.timeout((64 - d.getSeconds()) * 1000);

        // add script
        var script = {
            "common": {
                "name":         "test ON any",
                "engineType":   "Javascript/js",
                "source":       "createState('testScheduleResponse1', false);schedule('" + ((d.getMinutes() + 1) % 60) + " * * * *', function (obj) {setState('testScheduleResponse1', true, true);});",
                "enabled":      true,
                "engine":       "system.adapter.javascript.0"
            },
            "type":             "script",
            "_id":              "script.js.test_ON_any",
            "native": {}
        };

        onStateChanged = function (id, state) {
            if (id === 'javascript.0.testScheduleResponse1' && state.val === true) {
                onStateChanged = null;
                done();
            }
        };

        objects.setObject(script._id, script, function (err) {
            expect(err).to.be.not.ok;
        });
    });

    it('Test JS: test write file to "javascript"', function (done) {
        this.timeout(5000);
        // add script
        var script = {
            "common": {
                "name":         "test ON any",
                "engineType":   "Javascript/js",
                "source":       "createState('testScheduleResponse2', false, function () {writeFile('/test.txt', 'test', function () {setState('testScheduleResponse2', true, true);});});",
                "enabled":      true,
                "engine":       "system.adapter.javascript.0"
            },
            "type":             "script",
            "_id":              "script.js.test_write",
            "native": {}
        };

        onStateChanged = function (id, state) {
            if (id === 'javascript.0.testScheduleResponse2' && state.val === true) {
                onStateChanged = null;
                done();
            }
        };

        objects.setObject(script._id, script, function (err) {
            expect(err).to.be.not.ok;
        });
    });

    it('Test JS: test read file from "javascript"', function (done) {
        this.timeout(5000);
        // add script
        var script = {
            "common": {
                "name":         "test ON any",
                "engineType":   "Javascript/js",
                "source":       "readFile('/test.txt', function (err, data) {setState('testScheduleResponse2', data, true);});",
                "enabled":      true,
                "engine":       "system.adapter.javascript.0"
            },
            "type":             "script",
            "_id":              "script.js.test_read",
            "native": {}
        };

        onStateChanged = function (id, state) {
            if (id === 'javascript.0.testScheduleResponse2' && state.val === 'test') {
                onStateChanged = null;
                done();
            }
        };

        objects.setObject(script._id, script, function (err) {
            expect(err).to.be.not.ok;
        });
    });

    it('Test JS: test write file  to "vis.0"', function (done) {
        this.timeout(5000);
        // add script
        var script = {
            "common": {
                "name":         "test ON any",
                "engineType":   "Javascript/js",
                "source":       "createState('testScheduleResponse2', false, function () {writeFile('vis.0', '/test1.txt', 'test', function () {setState('testScheduleResponse2', true, true);});});",
                "enabled":      true,
                "engine":       "system.adapter.javascript.0"
            },
            "type":             "script",
            "_id":              "script.js.test_write1",
            "native": {}
        };

        onStateChanged = function (id, state) {
            if (id === 'javascript.0.testScheduleResponse2' && state.val === true) {
                onStateChanged = null;
                done();
            }
        };

        objects.setObject(script._id, script, function (err) {
            expect(err).to.be.not.ok;
        });
    });

    it('Test JS: test read file from "vis.0"', function (done) {
        this.timeout(5000);
        // add script
        var script = {
            "common": {
                "name":         "test ON any",
                "engineType":   "Javascript/js",
                "source":       "readFile('vis.0', '/test1.txt', function (err, data) {setState('testScheduleResponse2', data, true);});",
                "enabled":      true,
                "engine":       "system.adapter.javascript.0"
            },
            "type":             "script",
            "_id":              "script.js.test_read1",
            "native": {}
        };

        onStateChanged = function (id, state) {
            if (id === 'javascript.0.testScheduleResponse2' && state.val === 'test') {
                onStateChanged = null;
                done();
            }
        };

        objects.setObject(script._id, script, function (err) {
            expect(err).to.be.not.ok;
        });
    });

    after('Test JS: Stop js-controller', function (done) {
        this.timeout(6000);

        setup.stopController(function (normalTerminated) {
            console.log('Adapter normal terminated: ' + normalTerminated);
            done();
        });
    });
});
