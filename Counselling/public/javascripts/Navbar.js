$(document).ready(function () {
    $('#Red').click(function () {
        if (this.checked) {
            $('.navbar').css('background-color','RED');
        }
    });

    $('#Green').click(function () {
        if (this.checked) {
       $('.navbar').css('background-color','GREEN');
        }
    });
    $('#Blue').click(function () {
        if (this.checked) {
           $('.navbar').css('background-color','BLUE');
        }
    });
    $('#Black').click(function () {
        if (this.checked) {
   $('.navbar').css('background-color','BLACK');
        }
    });
    
});

