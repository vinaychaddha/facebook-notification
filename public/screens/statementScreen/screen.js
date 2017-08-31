var statementScreen = new function(){
    this.show = function(req){
        render('.mainContainer', 'statement', {data : req});
        bind('.statementScreen .screenHeader .image', function(){
            inputScreen.show();
        })
    }
}