/**
 * telc-focused German exam syllabus items from A1 to C2.
 * Structured by CEFR levels, categories, and sub-points.
 */
export const telcSyllabus = {
  A1: [
    { id: 'a1-t1', category: 'Themen', title: 'Begrüßung & Vorstellen', sub: 'Name, Alter, Herkunft' },
    { id: 'a1-t2', category: 'Themen', title: 'Essen & Trinken', sub: 'Im Restaurant, Lebensmittel' },
    { id: 'a1-t3', category: 'Themen', title: 'Alltag & Uhrzeit', sub: 'Tagesablauf, Wochentage' },
    { id: 'a1-g1', category: 'Grammatik', title: 'Präsens & W-Fragen', sub: 'Verbkonjugation, wer/wie/was' },
    { id: 'a1-g2', category: 'Grammatik', title: 'Artikel & Akkusativ', sub: 'der/die/das, ein/eine, mich/dich' },
    { id: 'a1-g3', category: 'Grammatik', title: 'Modalverben', sub: 'können, müssen, wollen' },
    { id: 'a1-e1', category: 'Prüfung', title: 'Sprechen Teil 1', sub: 'Sich vorstellen (Alphabet, Zahlen)' }
  ],
  A2: [
    { id: 'a2-t1', category: 'Themen', title: 'Wohnen & Haushalt', sub: 'Möbel, Hausarbeit, Umzug' },
    { id: 'a2-t2', category: 'Themen', title: 'Arbeit & Beruf', sub: 'Stellenanzeigen, Arbeitsalltag' },
    { id: 'a2-t3', category: 'Themen', title: 'Gesundheit & Körper', sub: 'Beim Arzt, Körperteile' },
    { id: 'a2-g1', category: 'Grammatik', title: 'Perfekt & Präteritum', sub: 'Vergangenheit (haben/sein), Modalverben' },
    { id: 'a2-g2', category: 'Grammatik', title: 'Wechselpräpositionen', sub: 'in, an, auf, unter (Dativ/Akkusativ)' },
    { id: 'a2-g3', category: 'Grammatik', title: 'Nebensätze', sub: 'weil, dass, wenn' },
    { id: 'a2-e1', category: 'Prüfung', title: 'Schreiben Teil 1', sub: 'Eine kurze SMS/E-Mail schreiben' },
    { id: 'a2-e2', category: 'Prüfung', title: 'Sprechen Teil 3', sub: 'Etwas aushandeln (Termin finden)' }
  ],
  B1: [
    { id: 'b1-t1', category: 'Themen', title: 'Reisen & Kultur', sub: 'Urlaubsbuchung, Sehenswürdigkeiten' },
    { id: 'b1-t2', category: 'Themen', title: 'Medien & Kommunikation', sub: 'Internet, Fernsehen, Zeitungen' },
    { id: 'b1-g1', category: 'Grammatik', title: 'Relativsätze', sub: 'der, die, das im Nominativ/Akkusativ/Dativ' },
    { id: 'b1-g2', category: 'Grammatik', title: 'Passiv Präsens', sub: 'werden + Partizip II' },
    { id: 'b1-g3', category: 'Grammatik', title: 'Konjunktiv II', sub: 'Höflichkeit, Ratschläge (könnte, sollte)' },
    { id: 'b1-e1', category: 'Prüfung', title: 'Sprechen Teil 2', sub: 'Ein Thema präsentieren / Bildbeschreibung' }
  ],
  B2: [
    { id: 'b2-t1', category: 'Themen', title: 'Bewerbung & Lebenslauf', sub: 'Vorstellungsgespräch, Qualifikationen' },
    { id: 'b2-g1', category: 'Grammatik', title: 'N-Deklination', sub: 'der Student, des Studenten' },
    { id: 'b2-g2', category: 'Grammatik', title: 'Zweiteilige Konnektoren', sub: 'zwar... aber, entweder... oder' },
    { id: 'b2-e1', category: 'Prüfung', title: 'Schreiben', sub: 'Formelle Beschwerde oder Bitte' }
  ],
  C1: [
    { id: 'c1-t1', category: 'Themen', title: 'Wissenschaft & Forschung', sub: 'Universität, Studien, Analysen' },
    { id: 'c1-g1', category: 'Grammatik', title: 'Nominalisierung', sub: 'Verben zu Nomen machen (für akademische Texte)' }
  ],
  C2: [
    { id: 'c2-t1', category: 'Themen', title: 'Redewendungen & Nuancen', sub: 'Idiome, Metaphern, Register' },
    { id: 'c2-g1', category: 'Grammatik', title: 'Passiversatzformen', sub: 'sein + zu, sich lassen, -bar/-lich' }
  ]
};

export const syllabusData = {};
Object.keys(telcSyllabus).forEach(level => {
  syllabusData[level] = telcSyllabus[level].map(item => ({
    id: item.id,
    title: item.title,
    category: item.category,
    sub: item.sub,
    subPoints: item.sub.split('&').join(',').split('/').join(',').split(',').map(s => s.trim()).filter(Boolean)
  }));
});

export const levelDescriptions = {
  A1: { name: "A1 - Anfänger (Breakthrough)", desc: "Can understand and use familiar, everyday expressions and very simple sentences." },
  A2: { name: "A2 - Grundlagen (Waystage)", desc: "Can understand sentences and frequently used expressions related to areas of immediate relevance." },
  B1: { name: "B1 - Aufbau (Threshold)", desc: "Can understand the main points of clear standard input on familiar matters regularly encountered." },
  B2: { name: "B2 - Fortgeschritten (Vantage)", desc: "Can understand the main ideas of complex text on both concrete and abstract topics." },
  C1: { name: "C1 - Fachkundig (Effective Proficiency)", desc: "Can understand a wide range of demanding, longer texts, and recognize implicit meaning." },
  C2: { name: "C2 - Beherrschung (Mastery)", desc: "Can understand with ease virtually everything heard or read, expressing themselves spontaneously." }
};
