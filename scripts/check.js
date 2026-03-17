fetch('https://script.google.com/macros/s/AKfycbx6X3iQrQtiXa8aue1ytlIE7rkKSKMTH46TTlFRqhILRHAEOl-cOK9s8R7FBzsEku1sLg/exec')
  .then(r => r.json())
  .then(d => {
    console.log("Total artworks:", d.artworks.length);
    console.log(d.artworks.slice(0, 15).map((a, i) => `${i}: ${a.title} | ${a.era} | ${a.artwork_id}`));
  })
  .catch(console.error);
