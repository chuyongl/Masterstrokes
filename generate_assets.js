import fs from 'fs';
import path from 'path';

const targetDir = path.join(process.cwd(), 'src/assets/onboarding');

if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

for (let i = 3; i <= 20; i++) {
    const svgContent = `
<svg width="375" height="812" viewBox="0 0 375 812" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="375" height="812" fill="#F8FAFC"/>
<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="24" fill="#64748B">
    Onboarding Screen ${i}
</text>
<rect x="20" y="700" width="335" height="50" rx="25" fill="#E2E8F0"/>
<text x="50%" y="732" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="16" fill="#94A3B8">
    (Mock Design)
</text>
</svg>
    `.trim();

    fs.writeFileSync(path.join(targetDir, `onboarding_${i}.svg`), svgContent);
    console.log(`Created onboarding_${i}.svg`);
}
