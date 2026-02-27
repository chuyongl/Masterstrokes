const url = 'https://script.google.com/macros/s/AKfycbzp3Ei6mlhZzOiy8Kuyc-SM-sEdvtTvJeXHL8w7jm7tZc8PHPlAgEX_30jK6A7Kh6YUNQ/exec';
fetch(url, { redirect: 'follow' })
    .then(res => res.json())
    .then(data => {
        const ancientArt = data.artworks.find(a => a.era === 'Ancient-Egyptian');
        console.log(ancientArt);
    })
    .catch(err => console.error(err));
