var SpellChecker = require('simple-spellchecker');
SpellChecker.getDictionary("en-US", function(err, dictionary) {
    if(!err) {
        var misspelled = ! dictionary.spellCheck('maisonn');
        if(misspelled) {
            var suggestions = dictionary.getSuggestions('maisonn');
        }
    }
});
