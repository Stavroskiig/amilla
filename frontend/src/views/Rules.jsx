import React from 'react';
import { Info } from 'lucide-react';

export default function Rules() {
  return (
    <div className="view-container">
      <div className="card glass" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
          <Info size={28} className="text-indigo-400" />
          <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#f3f4f6' }}>Οδηγίες & Βαθμολογία</h1>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#a5b4fc', marginBottom: '1rem' }}>Πώς παίζεται</h2>
          <p style={{ color: '#d1d5db', lineHeight: '1.6' }}>
            Προβλέψτε τα αποτελέσματα των αγώνων. Για κάθε αγώνα, κερδίζετε πόντους ανάλογα με το αν πετύχατε το <strong>ακριβές σκορ</strong> ή το <strong>σωστό σημείο</strong> (νίκη γηπεδούχου, ισοπαλία, νίκη φιλοξενούμενου). Οι αποδόσεις (odds) των ομάδων/σκορ είναι ο βασικός παράγοντας για τον υπολογισμό των πόντων σας.
          </p>
        </div>

        <div>
          <h2 style={{ color: '#a5b4fc', marginBottom: '1rem' }}>Πώς υπολογίζονται οι πόντοι;</h2>
          <p style={{ color: '#d1d5db', lineHeight: '1.6', marginBottom: '1rem' }}>
            Ο βασικός τύπος υπολογισμού είναι απλός: <strong>10 × Απόδοση</strong> (με στρογγυλοποίηση). Πιο συγκεκριμένα:
          </p>
          
          <ul style={{ color: '#e5e7eb', lineHeight: '1.8', paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
            <li>
              <strong style={{ color: '#4ade80' }}>Ακριβές Σκορ:</strong> Αν πετύχετε το ακριβές σκορ (π.χ. 2-1), κερδίζετε <code>10 × Απόδοση Ακριβούς Σκορ</code>.
              <br/><span style={{ fontSize: '0.9rem', color: '#9ca3af' }}>(Π.χ. αν το 2-1 δίνει απόδοση 8.50, παίρνετε 85 πόντους)</span>
            </li>
            <li>
              <strong style={{ color: '#60a5fa' }}>Σωστό Σημείο (1X2):</strong> Αν βρείτε τον νικητή ή την ισοπαλία αλλά χάσετε το σκορ, κερδίζετε <code>10 × Απόδοση Σημείου</code>.
              <br/><span style={{ fontSize: '0.9rem', color: '#9ca3af' }}>(Π.χ. αν ο "άσος" δίνει 1.80, παίρνετε 18 πόντους)</span>
            </li>
            <li>
              <strong style={{ color: '#f472b6' }}>Πρόκριση (στα Νοκ-Άουτ):</strong> Στα νοκ-άουτ προστίθεται το μπόνους πρόκρισης: <code>+ 10 × Απόδοση Πρόκρισης</code> αν προβλέψετε σωστά την ομάδα που προκρίνεται.
            </li>
            <li>
              <strong style={{ color: '#fbbf24' }}>Πρωταθλητής (Long Term):</strong> Προβλέψτε τον νικητή της διοργάνωσης!
              <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem', fontSize: '0.95rem' }}>
                <li>Πριν την έναρξη του πρώτου αγώνα: <code>20 × Απόδοση Κατάκτησης</code></li>
                <li>Κατά τη διάρκεια των ομίλων: <code>10 × Απόδοση Κατάκτησης</code></li>
              </ul>
            </li>
          </ul>

          <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#9ca3af', fontStyle: 'italic' }}>
            * Σημείωση: Αν πετύχετε το ακριβές σκορ, λαμβάνετε <strong>μόνο</strong> τους πόντους του ακριβούς σκορ. Δεν αθροίζονται με τους πόντους του σημείου.
          </p>
        </div>
      </div>
    </div>
  );
}
