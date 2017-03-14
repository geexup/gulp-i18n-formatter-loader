var fs = require('fs');
var path = require('path');

var settings = {};

function Plugin (newSettings) {
    settings = newSettings;
}

Plugin.prototype.apply = function (compiler) {
    compiler.plugin("compile", function(params) {
        const OUTPUT = {};
        const LOCALS = JSON.parse(fs.readFileSync(settings['i18n'], 'utf8'));

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
            fs.writeFileSync(path.join(settings.output, LANG + ".json"), JSON.stringify(OUTPUT[LANG]), 'utf8');
        }
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