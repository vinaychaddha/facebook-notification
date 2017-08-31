$.views.helpers({
    moment: function(r, format){
        return moment(r).format(format);
    },
    toFixed : function(r){
        return (1 * r).toFixed(2);
    },
    lowerCase: function(r){
        return r.toLowerCase();
    } 
})

var id;

$(document).ready(function () {
    makeTemplates();
    inputScreen.show();
})