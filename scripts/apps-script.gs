/**
 * Masterstrokes Apps Script — Full Version
 * 粘贴此内容完整替换 Apps Script 编辑器里的所有代码，然后重新部署。
 *
 * Sheets 读取：
 *   Artworks / LearningPoints / EraDialogues
 *   Q1_Hotspot / Q2_Composition / Q3_TrueFalse / Q4_Match / Q5_FillBlank / Q6_Coloring / Q7_Jigsaw
 *
 * 变更历史:
 *   2026-03-17  Q1/Q3/Q4/Q5 加 point_id 章节门控；Q5 加 category_tag；LearningPoints 加 category_tag
 */

function doGet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var result = {
    artworks: readSheet(ss, 'Artworks', [
      'artwork_id', 'title', 'artist', 'image_url', 'era'
    ]),

    learningPoints: readSheet(ss, 'LearningPoints', [
      'artwork_id', 'point_id', 'label', 'point_type', 'description', 'ai_prompt', 'category_tag'
    ]),

    eraEntryDialogues: readSheet(ss, 'EraDialogues', [
      'era_id', 'progress_state', 'dialogue'
    ]),

    // Q1 Hotspot — point_id = correct region; decoy_point_ids = comma-separated wrong regions
    q1Hotspot: readSheet(ss, 'Q1_Hotspot', [
      'artwork_id', 'question_id', 'question_text', 'point_id', 'decoy_point_ids', 'era'
    ]),

    // Q2 Composition — not point-gated
    q2Composition: readSheet(ss, 'Q2_Composition', [
      'artwork_id', 'question_id', 'question_text',
      'correct_composition', 'wrong_compositions', 'explanation', 'era'
    ]),

    // Q3 True/False — point_id may be comma-separated (question spans multiple LPs)
    q3TrueFalse: readSheet(ss, 'Q3_TrueFalse', [
      'artwork_id', 'question_id', 'statement',
      'correct_answer', 'explanation', 'difficulty', 'point_id', 'era'
    ]),

    // Q4 Match — each row is one pair; point_id may be comma-separated
    q4Match: readSheet(ss, 'Q4_Match', [
      'artwork_id', 'question_id', 'question_text',
      'pair_id', 'left_label', 'right_label', 'point_id', 'era'
    ]),

    // Q5 Fill Blank — point_id = region to blank; category_tag for distractor lookup
    q5FillBlank: readSheet(ss, 'Q5_FillBlank', [
      'artwork_id', 'question_id', 'question_text', 'point_id', 'category_tag', 'era'
    ]),

    // Q6 Coloring — not point-gated
    q6Coloring: readSheet(ss, 'Q6_Coloring', [
      'artwork_id', 'question_id', 'question_text',
      'target_point_id', 'correct_color', 'wrong_colors', 'era'
    ]),

    // Q7 Jigsaw — not point-gated, one entry per artwork
    q7Jigsaw: readSheet(ss, 'Q7_Jigsaw', [
      'artwork_id', 'difficulty_levels', 'era'
    ]),
  };

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * 通用读取函数：列名 case-insensitive + trim 匹配，允许 sheet 列顺序任意。
 * 缺失的列返回空字符串，空行跳过。
 */
function readSheet(ss, sheetName, columns) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    console.log('Sheet not found: ' + sheetName);
    return [];
  }

  var rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return [];

  // Header matching: lowercase + trim
  var headers = rows[0].map(function(h) {
    return String(h).trim().toLowerCase();
  });

  return rows.slice(1)
    .filter(function(row) {
      return row.some(function(cell) { return cell !== '' && cell !== null; });
    })
    .map(function(row) {
      var obj = {};
      columns.forEach(function(col) {
        var idx = headers.indexOf(col.toLowerCase());
        var val = idx >= 0 ? row[idx] : '';
        obj[col] = (val !== null && val !== undefined) ? String(val).trim() : '';
      });
      return obj;
    });
}
