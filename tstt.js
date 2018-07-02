var SpellChecker = require('simple-spellchecker');
SpellChecker.getDictionary("en-US", function(err, dictionary) {
    console.log(err);
    if(!err) {
        var misspelled = ! dictionary.spellCheck('maisonn');
        if(misspelled) {
            var suggestions = dictionary.getSuggestions('maisonn');
        }
    }
});
