const url = 'https://script.google.com/macros/s/AKfycbzp3Ei6mlhZzOiy8Kuyc-SM-sEdvtTvJeXHL8w7jm7tZc8PHPlAgEX_30jK6A7Kh6YUNQ/exec';
fetch(url, { redirect: 'follow' })
    .then(res => res.text())
    .then(text => {
        console.log(text.substring(0, 1000));
    })
    .catch(err => console.error(err));
