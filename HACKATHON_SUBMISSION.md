
# Masterstrokes: Gamifying Art Appreciation

## Inspiration
Art museums can be overwhelming. "Museum fatigue" is real—we walk past hundreds of masterpieces, glancing at them for an average of just 15 seconds, often missing the profound stories and details hidden within. We wanted to build a **"Duolingo for Art History"**: an application that gamifies visual literacy and rewards users for *truly looking* at art, not just seeing it. Our goal was to make high culture accessible, addictive, and deeply educational.

## What it does
Masterstrokes is an immersive web game that challenges players to explore high-resolution classical paintings.

1.  **Learning Phase**: Users are guided to find specific details (e.g., "The hidden skull" in *The Ambassadors* or "The pearl earring" in Vermeer's masterpiece). We use an interactive pan-and-zoom interface to make this feel like a treasure hunt.
2.  **Quiz Phase**: After exploring, players test their observation skills. Instead of boring text questions, we present visual challenges. Players must identify the correct detail among AI-generated distractors (e.g., grayscale, inverted, or sepia-toned versions) to prove they internalized the visual information.
3.  **Progression System**: Players journey through different Art Eras (Renaissance, Baroque, Impressionism), unlocking new paintings and earning stars as they master each period.

## How we built it
We built Masterstrokes with a modern, performance-focused stack:

-   **Frontend**: React + TypeScript + Vite for a blazing fast experience.
-   **State Management**: Zustand for handling complex game states (progress, scores, unlocked levels).
-   **Styling**: Tailwind CSS for a responsive, mobile-first design.
-   **Core Mechanic**: We leveraged the **HTML5 Canvas API** for real-time image manipulation. Instead of pre-generating thousands of crop images, the app dynamically crops and processes high-res artwork on the fly to generate quiz options.
-   **CMS**: We used **Google Sheets** as our backend database. This allows non-technical team members to add new artworks and metadata easily.
-   **AI Integration**: We built a custom Google Apps Script pipeline that uses **Gemini Vision AI** to analyze artworks, identify key regions of interest, and automatically generate the coordinate data (x, y, radius) needed for the game.

## Challenges we ran into
-   **Performance Optimization**: Loading high-resolution art images (often 200MB+) crashed mobile browsers. We solved this by implementing an aggressive optimization pipeline and building a smart preloading strategy ensuring smoothness without sacrificing visual fidelity.
-   **Responsive Hotspots**: Mapping absolute pixel coordinates from a 4K image to a responsive CSS layout was tricky. We developed a coordinate normalization system (converting to percentages) to ensure "click areas" remained accurate on any screen size.
-   **Generating Relevant Distractors**: Initially, random crops were too easy to guess. We iterated to use **CSS Filters** (Invert, Grayscale, Sepia) on the *correct* answer to create "visual confusables"—forcing the user to truly recognize the correct color and texture.

## Accomplishments that we're proud of
-   **Seamless Deployment**: We set up a fully automated CI/CD pipeline with GitHub Actions. Every push to `main` automatically builds and deploys the latest version to GitHub Pages.
-   **Dynamic Image Processing**: The quiz engine is entirely client-side and dynamic. It doesn't rely on a heavy backend to serve cropped images; the browser does the heavy lifting instantly.
-   **Intuitive UI/UX**: The "Roadmap" interface, with its curved paths and unlockable nodes, successfully mimics the addictive progression loops of top-tier mobile games.

## What we learned
-   **Visual Performance**: We learned deep lessons about browser rendering limits, the importance of `canvas` over DOM elements for image manipulation.
-   **Gamification Mechanics**: Balancing "education" and "fun" is hard. We learned that shorter, bite-sized loops (Explore -> Quiz -> Reward) keep users engaged far longer than long-form reading.

## What's next for Masterstrokes
-   **Real-time AI Generation**: Moving the Gemini integration from a pre-processing step to a real-time feature, allowing users to upload *any* image and instantly generate a game level.
-   **Social Leaderboards**: Compete with friends on who can spot details the fastest.
-   **"Restoration" Mode**: A new game mode where users must "clean" dirty paintings to reveal the masterpiece underneath.
