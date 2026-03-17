import fs from 'fs';
fetch('https://script.google.com/macros/s/AKfycbx6X3iQrQtiXa8aue1ytlIE7rkKSKMTH46TTlFRqhILRHAEOl-cOK9s8R7FBzsEku1sLg/exec')
  .then(r => r.json())
  .then(data => {
    try {
        const hasChinese = (text) => /[\u4e00-\u9fa5]/.test(text || '');
        let allOk = true;
        data.artworks.forEach((sheetArtwork, index) => {
            try {
                const artworkLearningPoints = data.learningPoints.filter(
                    (lp) => lp.artwork_id === sheetArtwork.artwork_id && !hasChinese(lp.description)
                );
                const artworkQuizQuestions = data.quizQuestions.filter(
                    (qq) => qq.artwork_id === sheetArtwork.artwork_id
                );
                // fake processing
                let imageUrl = sheetArtwork.image_url || `/artworks/${sheetArtwork.artwork_id}.jpg`;
                if (!imageUrl) throw new Error("No image URL");
            } catch(e) {
                console.error("Error on artwork", index, e);
                allOk = false;
            }
        });
        if (allOk) console.log("No errors in mapping!");
    } catch(e) {
        console.error("Outer error", e);
    }
  })
  .catch(console.error);
