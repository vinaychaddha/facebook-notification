function setEnv(data) {
    switch (data) {
        case 'PROD':
            appUrl = 'https://facebook-notify.herokuapp.com/';
            break;
        case 'STAGE':
            appUrl = 'http://52.163.63.199:5008/';
            break;
        case 'LOCAL':
            appUrl = 'http://localhost:1200/';
            break;
    }
}

setEnv('PROD');