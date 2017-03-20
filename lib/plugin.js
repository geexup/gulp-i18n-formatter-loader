var fs = require('fs');
var path = require('path');

var through = require('through2');
var vinyl = require('vinyl');
var vfs = require('vinyl-fs');

var settings = {};

function Plugin (newSettings) {
    settings = newSettings;
}

Plugin.prototype.apply = function (compiler) {
    compiler.plugin("compile", function() {
        vfs.src(settings['i18n']).pipe(through.obj(function(file, encoding, callback) {
            if (file.isNull()) {
                return callback(null, file);
            }

            if (file.isStream()) {
                console.error('error', 'You can\'t compile stream to i18n!');
            }

            const OUTPUT = {};
            const LOCALS = JSON.parse(file._contents.toString('utf8'));

            Object.keys(LOCALS).forEach(function(TITLE) {
                const TRANSLATIONS = LOCALS[TITLE];

                settings.langs.forEach(function(lang) {
                    if(typeof TRANSLATIONS[lang] !== "undefined"){
                        OUTPUT[lang] = (typeof OUTPUT[lang] === 'undefined' ? OUTPUT[lang] = {} : OUTPUT[lang] = OUTPUT[lang]);
                        OUTPUT[lang][TITLE] = TRANSLATIONS[lang];
                    } else {
                        console.error("There's no " + lang + " translation for " + TITLE + "!");
                    }
                });
            });

            checkDirectorySync(settings.output);

            for (const LANG in OUTPUT) {
                this.push(new vinyl({ cwd: '', base: null, path: LANG + ".json",
                    contents: new Buffer(JSON.stringify(OUTPUT[LANG]), 'utf8')
                }));
            }

            return callback();
        })).pipe(vfs.dest(settings.output));
    });
};

function checkDirectorySync(directory) {
    try {
        fs.statSync(directory);
    } catch(e) {
        fs.mkdirSync(directory);
    }
}

module.exports = Plugin;