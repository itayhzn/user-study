import state from './state.js';

export const LANGUAGES = {
  en: 'English',
  he: 'עברית',
};

const STRINGS = {
  en: {
    appTitle: 'Image Description Assessment',
    configErrorTitle: 'Configuration Error',
    configErrorBody: 'Could not load',
    manifestErrorTitle: 'Manifest Error',
    manifestErrorBody: 'Could not load',
    manifestErrorHint: 'Run',
    manifestErrorSuffix: 'to rebuild the study data.',
    rotatePrompt: 'Please rotate your phone to landscape mode for the best experience.',
    languageLabel: 'Language',
    welcomeDescription: 'You will compare pairs of AI-generated descriptions of photos across {total} questions. For each pair, choose which description is better on each criterion.',
    howItWorks: 'How it works:',
    welcomePointImages: 'A photo and two English descriptions of it will be shown. Places where the descriptions differ are highlighted.',
    welcomePointSelect: 'Select A, Tie, or B for each evaluation criterion.',
    welcomePointFullscreen: 'Click a description or the photo to view it full screen.',
    namePlaceholder: 'Enter your name to begin',
    continue: 'Continue',
    beforeBegin: 'Before You Begin',
    instructionsIntro: 'You will compare each pair of descriptions using three separate criteria. Please answer them in this order:',
    exampleLabel: 'Example:',
    instructionsExample: 'For a photo of a brown dog on grass, A says "A brown dog sits with." and B says "A black dog sits on the grass." B wins on fluency, because A is a broken sentence. A wins on accuracy, because B has the color wrong. B wins on correct details, because it adds the grass.',
    startQuestions: 'Start Questions',
    prompt: 'Task',
    next: 'Next',
    finish: 'Finish',
    image: 'Image',
    imageNotFound: 'Image not found',
    aWins: 'A Wins',
    tie: 'Tie',
    bWins: 'B Wins',
    saveExit: 'Save & Exit',
    thankYou: 'Thank You!',
    submitting: 'Submitting your responses...',
    noEndpoint: 'No submission endpoint configured. Downloading your responses as JSON.',
    fileDownloaded: 'File downloaded. You can send it to the study organizer.',
    submitted: 'Responses submitted successfully. Thank you!',
    rowsSent: '{count} row(s) sent.',
    submissionFailed: 'Submission failed. Downloading your responses as JSON instead.',
    sendDownloaded: 'Please send the downloaded file to the study organizer.',
    noEligibleQuestions: 'No eligible questions were found. Rebuild the study data with scripts/build_study.py.',
    fluency: 'Fluency',
    accuracy: 'Accuracy',
    details: 'Correct Details',
    fluencyQuestion: 'Which reads better?',
    accuracyQuestion: 'Which has fewer false claims?',
    detailsQuestion: 'Which tells you more that is true?',
    fluencyInstruction: 'first compare only the language: which text is more grammatical and natural? Ignore the photo for this decision.',
    accuracyInstruction: 'then look at the photo: which text makes fewer false claims about it (wrong objects, colors, positions, counts or actions)? Opinions and mood do not count.',
    detailsInstruction: 'finally, which text gives more correct information about what is in the photo?',
    instructionsTie: 'Choose Tie when you see no real difference. The descriptions are often almost identical, so a tie is a perfectly good answer. A highlighted empty mark shows where the other description has extra words.',
    consent: 'Participation is voluntary and you may stop at any time with Save & Exit. Your answers are stored with the name you enter and reported only in aggregate, for research.',
    hint: 'Compare the highlighted differences. Click a description or the photo to enlarge it.',
    text: 'Description',
  },
  he: {
    appTitle: 'הערכת תיאורי תמונות',
    configErrorTitle: 'שגיאת הגדרות',
    configErrorBody: 'לא ניתן היה לטעון את',
    manifestErrorTitle: 'שגיאת מניפסט',
    manifestErrorBody: 'לא ניתן היה לטעון את',
    manifestErrorHint: 'הריצו',
    manifestErrorSuffix: 'כדי לבנות מחדש את נתוני המחקר.',
    rotatePrompt: 'אנא סובבו את הטלפון למצב אופקי לחוויה מיטבית.',
    languageLabel: 'שפה',
    welcomeDescription: 'תשוו זוגות של תיאורי תמונות שנוצרו על ידי בינה מלאכותית לאורך {total} שאלות. עבור כל זוג, בחרו איזה תיאור טוב יותר לפי כל קריטריון.',
    howItWorks: 'איך זה עובד:',
    welcomePointImages: 'תוצג תמונה ולצידה שני תיאורים שלה באנגלית. המקומות שבהם התיאורים שונים מסומנים.',
    welcomePointSelect: 'בחרו A, תיקו או B עבור כל קריטריון הערכה.',
    welcomePointFullscreen: 'לחצו על תיאור או על התמונה כדי לצפות בהם במסך מלא.',
    namePlaceholder: 'הכניסו את שמכם כדי להתחיל',
    continue: 'המשך',
    beforeBegin: 'לפני שמתחילים',
    instructionsIntro: 'תשוו כל זוג תיאורים לפי שלושה קריטריונים נפרדים. אנא ענו עליהם לפי הסדר הבא:',
    exampleLabel: 'דוגמה:',
    instructionsExample: 'בתמונה נראה כלב חום על דשא. תיאור A הוא <bdi dir="ltr">"A brown dog sits with."</bdi> ותיאור B הוא <bdi dir="ltr">"A black dog sits on the grass."</bdi>. תיאור B מנצח בשטף, כי המשפט ב-A שבור. תיאור A מנצח בדיוק, כי הצבע ב-B שגוי. תיאור B מנצח בפרטים נכונים, כי הוא מוסיף את הדשא.',
    startQuestions: 'התחלת השאלות',
    prompt: 'משימה',
    next: 'הבא',
    finish: 'סיום',
    image: 'תמונה',
    imageNotFound: 'התמונה לא נמצאה',
    aWins: 'A מנצח',
    tie: 'תיקו',
    bWins: 'B מנצח',
    saveExit: 'שמירה ויציאה',
    thankYou: 'תודה!',
    submitting: 'שולחים את התשובות...',
    noEndpoint: 'לא הוגדרה נקודת שליחה. מורידים את התשובות כקובץ JSON.',
    fileDownloaded: 'הקובץ הורד. אפשר לשלוח אותו למארגן המחקר.',
    submitted: 'התשובות נשלחו בהצלחה. תודה!',
    rowsSent: '{count} שורות נשלחו.',
    submissionFailed: 'השליחה נכשלה. מורידים את התשובות כקובץ JSON במקום.',
    sendDownloaded: 'אנא שלחו את הקובץ שהורד למארגן המחקר.',
    noEligibleQuestions: 'לא נמצאו שאלות מתאימות. בנו מחדש את נתוני המחקר באמצעות scripts/build_study.py.',
    fluency: 'שטף',
    accuracy: 'דיוק',
    details: 'פרטים נכונים',
    fluencyQuestion: 'איזה תיאור קריא יותר?',
    accuracyQuestion: 'באיזה תיאור יש פחות טענות שגויות?',
    detailsQuestion: 'איזה תיאור מוסר יותר מידע נכון?',
    fluencyInstruction: 'קודם השוו רק את השפה: איזה תיאור תקין וטבעי יותר? התעלמו מהתמונה בהחלטה הזו.',
    accuracyInstruction: 'לאחר מכן הסתכלו בתמונה: באיזה תיאור יש פחות טענות שגויות לגביה (עצמים, צבעים, מיקומים, כמויות או פעולות שגויים)? דעות ואווירה לא נחשבות.',
    detailsInstruction: 'לבסוף, איזה תיאור מוסר יותר מידע נכון על מה שנראה בתמונה?',
    instructionsTie: 'בחרו תיקו כשאינכם רואים הבדל של ממש. לעתים קרובות התיאורים כמעט זהים, ולכן תיקו היא תשובה טובה לגמרי. סימון ריק מודגש מציין מקום שבו בתיאור השני יש מילים נוספות.',
    consent: 'ההשתתפות היא מרצון ואפשר להפסיק בכל שלב באמצעות ״שמירה ויציאה״. התשובות נשמרות עם השם שתזינו ומדווחות רק באופן מצטבר, לצורכי מחקר.',
    hint: 'השוו את ההבדלים המסומנים. לחצו על תיאור או על התמונה כדי להגדיל.',
    text: 'תיאור',
  },
};

export function setLanguage(language) {
  state.language = STRINGS[language] ? language : 'en';
  document.documentElement.lang = state.language;
  document.documentElement.dir = state.language === 'he' ? 'rtl' : 'ltr';
  document.title = t('appTitle');
  const portraitText = document.querySelector('.portrait-overlay__text');
  if (portraitText) {
    portraitText.textContent = t('rotatePrompt');
  }
}

export function t(key, vars = {}) {
  const strings = STRINGS[state.language] || STRINGS.en;
  const fallback = STRINGS.en[key] || key;
  return (strings[key] || fallback).replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? '');
}

export function metricLabel(metric) {
  const label = t(metric.id);
  return label === metric.id ? metric.label : label;
}
