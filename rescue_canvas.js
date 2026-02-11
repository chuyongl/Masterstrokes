
import fs from 'fs';

const filePath = 'c:\\Users\\Octopus\\Desktop\\Masterstrokes\\src\\components\\game\\LearningCanvas.tsx';

try {
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Fix the missing </div> in the Tooltip IIFE
    // Look for the end of the tooltip inner content div
    // It ends with:
    //      </button>
    //    </div>
    //    );
    // })()}

    // We want to verify context to be sure.
    // The inner div (372) which holds content ends at 398.
    // 398: </div>
    // 399: );
    // 400: })()}

    // We want to turn this into:
    // 398: </div>
    //      </div>  <-- New close for 364
    // 399: );
    // 400: })()}

    // Let's find this block.
    const tooltipEndBlock = `                                                    </div>
                                                    );
                                        })()}`;

    const tooltipEndBlockFix = `                                                    </div>
                                                </div>
                                                    );
                                        })()}`;

    // 2. Fix the missing closing of activeTooltip IIFE
    // After the Tooltip IIFE closes (})()}), we need to close the Fragment, Return, and activeTooltip IIFE.
    // So we append `</> ); })()}` after the tooltip block.

    // AND we also have `</div >` at 401 which should optionally be `</div>` or it might be correct if it closes 286.
    // But currently `activeTooltip` runs into it.

    // So we want to change:
    // `})()} \n                                    </div >`
    // to
    // `})()} \n                                    </> \n                                ); \n                            })()} \n                                    </div>`

    // Combine 1 and 2.

    // Find:
    // `                                                    </div>
    //                                                 );
    //                                     })()}
    //                                 </div >`

    // Note: Use exact whitespace from view_file if possible, or use regex.
    // From view_file 732:
    // 398:                                                     </div>
    // 399:                                                     );
    // 400:                                         })()}
    // 401:                                     </div >

    // The indentation seems to be 52 spaces for div, 52 for ); 40 for })()}. 36 for </div >?
    // Let's rely on strings.

    const targetBlock = `                                                    </div>
                                                    );
                                        })()}
                                    </div >`;

    // Wait, check spaces in view_file.
    // 398: 52 spaces?
    // 399: 52 spaces?
    // 400: 40 spaces?
    // 401: 36 spaces?

    // Let's try to locate it using unique strings rather than big blocks if possible.
    const uniqueAnchor = '<polyline points="20 6 9 17 4 12"></polyline>';
    const anchorIdx = content.indexOf(uniqueAnchor);

    if (anchorIdx === -1) throw new Error("Anchor not found");

    // From anchor, find the next `</div>`. This is 398.
    const div398Idx = content.indexOf('</div>', anchorIdx);

    // Now verify what follows.
    const chunk = content.substring(div398Idx, div398Idx + 200);
    // console.log("Chunk:", chunk);

    // We expect: `</div>\n [spaces] );\n [spaces] })()}\n [spaces] </div >`

    // New Content construction:
    // 1. `</div>` (398)
    // 2. `</div>` (New 364 close)
    // 3. `);`
    // 4. `})()}`
    // 5. `</>` (New 299 close)
    // 6. `);` (New 298 close)
    // 7. `})()}` (New 294 close)

    // 8. `</div>` (Fixed 286 close - replacing </div >)

    // Let's check where the next `</div>` is (402).
    // In view_file:
    // 401: </div >
    // 402: </div>
    // 403: (Empty)

    // So we want to act before 402.

    // Locate the `</div >` specifically.
    const badDivIdx = content.indexOf('</div >', div398Idx);
    if (badDivIdx === -1) throw new Error("Bad div not found");

    // Reconstruct everything between div398 and badDivIdx + length.

    // Original between 398 and 401 content:
    // `</div>` ... `);` ... `})()}` ... `</div >`

    // New Content:
    const replacement = `</div>
                                                </div>
                                                    );
                                        })()}
                                    </>
                                );
                            })()}
                                    </div>`;

    // We replace from div398Idx to (badDivIdx + 7). ('</div >'.length = 7)

    content = content.substring(0, div398Idx) + replacement + content.substring(badDivIdx + 7);

    fs.writeFileSync(filePath, content);
    console.log("Canvas rescued.");

} catch (e) {
    console.error(e);
    process.exit(1);
}
