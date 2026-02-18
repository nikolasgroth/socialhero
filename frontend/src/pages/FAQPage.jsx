import { ChevronRight } from '../components/Icons';

const faqs = [
  { q: 'Was ist SocialHero?', a: 'SocialHero ist eine App, die dich mit hilfsbereiten Menschen in deiner Nähe verbindet. Bei Gefühlen von Unsicherheit oder Bedrohung kannst du per Knopfdruck einen Hilferuf senden.' },
  { q: 'Wie funktioniert die Alarmierung?', a: 'Nach dem Auslösen des SOS-Knopfs hast du 5 Sekunden zum Abbrechen. Danach werden alle SocialHero-Nutzer im Umkreis von 1 km benachrichtigt. Sie sehen zunächst deinen groben Standort und bei Annahme den genauen.' },
  { q: 'Wer sieht meinen Standort?', a: 'Nur Personen, die deinen Hilferuf aktiv annehmen, sehen deinen genauen Standort. Im Normalbetrieb wird dein Standort nicht erfasst oder geteilt.' },
  { q: 'Wie werde ich als Helfer alarmiert?', a: 'Wenn jemand in deiner Nähe (1 km) einen Hilferuf sendet, erhältst du eine Benachrichtigung. Du hast 30 Sekunden, den Einsatz anzunehmen. Bei Annahme öffnet sich automatisch die Navigation.' },
  { q: 'Ist die Nutzung kostenlos?', a: 'Ja, SocialHero ist komplett kostenlos. Es gibt keine versteckten Kosten oder In-App-Käufe.' },
  { q: 'Wie kann ich den Notruf erreichen?', a: 'Während eines aktiven Einsatzes kannst du direkt über die App den Notruf 112 wählen. SocialHero ersetzt nicht den Notruf, sondern ergänzt ihn.' },
  { q: 'Wie schützt SocialHero meine Daten?', a: 'Wir speichern nur die minimal notwendigen Daten. Dein Standort wird nur während einer aktiven Alarmierung erfasst und nicht dauerhaft gespeichert.' },
  { q: 'Was passiert bei Missbrauch?', a: 'Wiederholter Missbrauch der SOS-Funktion führt zur Sperrung des Accounts. Wir nehmen die Sicherheit unserer Community sehr ernst.' },
];

export default function FAQPage() {
  return (
    <div className="animate-fade" style={{ padding: '60px 24px 100px' }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Häufige Fragen</h2>
      <div>
        {faqs.map((faq, i) => (
          <details key={i} className="faq-item">
            <summary>
              {faq.q}
              <ChevronRight />
            </summary>
            <p>{faq.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
