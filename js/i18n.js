import state from './state.js';

export const LANGUAGES = {
  en: 'English',
  he: 'עברית',
};

const STRINGS = {
  en: {
    appTitle: 'Visual Quality Assessment',
    configErrorTitle: 'Configuration Error',
    configErrorBody: 'Could not load',
    manifestErrorTitle: 'Manifest Error',
    manifestErrorBody: 'Could not load',
    manifestErrorHint: 'Run',
    manifestErrorSuffix: 'after updating the prompts or the image folders.',
    rotatePrompt: 'Please rotate your phone to landscape mode for the best experience.',
    languageLabel: 'Language',
    welcomeDescription:
      'You will compare pairs of AI-generated images across {total} questions. For each pair, choose which image better matches each criterion.',
    howItWorks: 'How it works:',
    welcomePointImages: 'Two images will be shown side by side.',
    welcomePointSelect: 'Select A, Tie, or B for each evaluation criterion.',
    welcomePointFullscreen: 'Click any image to view it full screen.',
    namePlaceholder: 'Enter your name to begin',
    continue: 'Continue',
    beforeBegin: 'Before You Begin',
    instructionsIntro:
      'You will evaluate each pair of images using two separate criteria. Please answer them in this order:',
    quality: 'Quality',
    promptAlignment: 'Prompt Alignment',
    qualityInstruction:
      'first compare the images based only on sheer visual quality. Do not read or consider the prompt for this decision.',
    alignmentInstruction:
      'only after deciding quality, read the prompt and choose which image better matches it.',
    exampleLabel: 'Example:',
    instructionsExample:
      'If the prompt says "a cow" and one image shows a blurry cow while the other shows a high quality sheep, the sheep should win for quality and the cow should win for prompt alignment.',
    startQuestions: 'Start Questions',
    prompt: 'Prompt',
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
    promptsLoadError: 'Could not load the prompts for the selected language.',
    noEligibleQuestions:
      'No eligible questions were found. Check that the manifest includes toktimer and at least one other method for the selected models.',
  },
  he: {
    appTitle: 'הערכת איכות חזותית',
    configErrorTitle: 'שגיאת הגדרות',
    configErrorBody: 'לא ניתן היה לטעון את',
    manifestErrorTitle: 'שגיאת מניפסט',
    manifestErrorBody: 'לא ניתן היה לטעון את',
    manifestErrorHint: 'הריצו',
    manifestErrorSuffix: 'אחרי עדכון קובצי הכיתובים או תיקיות התמונות.',
    rotatePrompt: 'אנא סובבו את הטלפון למצב אופקי לחוויה מיטבית.',
    languageLabel: 'שפה',
    welcomeDescription:
      'תשוו זוגות של תמונות שנוצרו על ידי בינה מלאכותית לאורך {total} שאלות. עבור כל זוג, בחרו איזו תמונה מתאימה יותר לכל קריטריון.',
    howItWorks: 'איך זה עובד:',
    welcomePointImages: 'שתי תמונות יוצגו זו לצד זו.',
    welcomePointSelect: 'בחרו A, תיקו או B עבור כל קריטריון הערכה.',
    welcomePointFullscreen: 'לחצו על תמונה כדי לצפות בה במסך מלא.',
    namePlaceholder: 'הכניסו את שמכם כדי להתחיל',
    continue: 'המשך',
    beforeBegin: 'לפני שמתחילים',
    instructionsIntro:
      'תעריכו כל זוג תמונות לפי שני קריטריונים נפרדים. אנא ענו עליהם לפי הסדר הבא:',
    quality: 'איכות',
    promptAlignment: 'התאמה לכיתוב',
    qualityInstruction:
      'קודם השוו את התמונות רק לפי האיכות החזותית שלהן. אל תקראו ואל תיקחו בחשבון את הכיתוב בהחלטה הזו.',
    alignmentInstruction:
      'רק אחרי שהחלטתם לגבי האיכות, קראו את הכיתוב ובחרו איזו תמונה מתאימה לו יותר.',
    exampleLabel: 'דוגמה:',
    instructionsExample:
      'אם בכיתוב כתוב "פרה", ותמונה אחת מציגה פרה מטושטשת בזמן שהתמונה השנייה מציגה כבשה באיכות גבוהה, הכבשה צריכה לנצח באיכות והפרה צריכה לנצח בהתאמה לכיתוב.',
    startQuestions: 'התחלת השאלות',
    prompt: 'כיתוב',
    next: 'הבא',
    finish: 'סיום',
    image: 'תמונה',
    imageNotFound: 'התמונה לא נמצאה',
    aWins: 'A מנצחת',
    tie: 'תיקו',
    bWins: 'B מנצחת',
    saveExit: 'שמירה ויציאה',
    thankYou: 'תודה!',
    submitting: 'שולחים את התשובות...',
    noEndpoint: 'לא הוגדרה נקודת שליחה. מורידים את התשובות כקובץ JSON.',
    fileDownloaded: 'הקובץ הורד. אפשר לשלוח אותו למארגן המחקר.',
    submitted: 'התשובות נשלחו בהצלחה. תודה!',
    rowsSent: '{count} שורות נשלחו.',
    submissionFailed: 'השליחה נכשלה. מורידים את התשובות כקובץ JSON במקום.',
    sendDownloaded: 'אנא שלחו את הקובץ שהורד למארגן המחקר.',
    promptsLoadError: 'לא ניתן היה לטעון את הכיתובים לשפה שנבחרה.',
    noEligibleQuestions:
      'לא נמצאו שאלות מתאימות. בדקו שהמניפסט כולל toktimer ולפחות שיטה נוספת עבור המודלים שנבחרו.',
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
  if (metric.id === 'quality') return t('quality');
  if (metric.id === 'prompt_alignment') return t('promptAlignment');
  return metric.label;
}
