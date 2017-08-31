var inputScreen = new function () {
    this.show = function () {
        render('.mainContainer', 'inputScreen');
        if (id != undefined) {
            $('.mainContainer .inputScreen .input').val(id);
        }
        bind('.mainContainer .inputScreen .btn', function () {
            var type = $(this).data('id');
            id = $('.mainContainer .inputScreen .input').val().trim();
            $('.mainContainer .inputScreen .loadingArea').show();
            $('.mainContainer .inputScreen .textArea').hide();
            $('.mainContainer .inputScreen .loadingArea .loader').show();
            $('.mainContainer .inputScreen .loaderText').text('Please Wait...');
            execute('getLog', {
                    type: type,
                    id: id
                }, function (r) {
                    if (r) {
                        if (type == 'qc') {
                            statementScreen.show(r);
                        } else {
                            $('.mainContainer .inputScreen .loadingArea').hide();
                            if (r.msg == 'Transaction successful.') {
                                $('.mainContainer .inputScreen .textArea .currency').text('Available Balence');
                                $('.mainContainer .inputScreen .textArea .balence').text('Rs. ' + r.amount);
                                $('.mainContainer .inputScreen .textArea').show();
                            } else {
                                $('.mainContainer .inputScreen .textArea .currency').text('Transaction Error try again!');
                            }
                        }

                    } else {
                        console.log('No log Found');
                        $('.mainContainer .inputScreen .loadingArea .loader').hide();
                        $('.mainContainer .inputScreen .loaderText').text('No record on available');

                    }

                },
                function () {
                    $('.mainContainer .inputScreen .loadingArea .loader').hide();
                    $('.mainContainer .inputScreen .loaderText').text('Request timeout try again');
                })
        })
    }
}