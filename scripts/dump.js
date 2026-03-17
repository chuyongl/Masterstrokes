import fs from 'fs';
fetch('https://script.google.com/macros/s/AKfycbx6X3iQrQtiXa8aue1ytlIE7rkKSKMTH46TTlFRqhILRHAEOl-cOK9s8R7FBzsEku1sLg/exec')
  .then(r => r.json())
  .then(d => {
    fs.writeFileSync('artworks_dump.json', JSON.stringify(d.artworks, null, 2));
    console.log("Done");
  })
  .catch(console.error);
