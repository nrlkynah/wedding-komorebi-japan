// ============================================================
//  Komorebi: all wedding details live here. Change them once
//  and the whole invitation updates.
//
//  DEMO: every value below except the names and date is a placeholder.
// ============================================================

window.WEDDING = {
  // Set to false when the details are real: this removes the "demo" notes.
  isDemo: true,

  bride: 'Futaba',
  groom: 'Tanaka',

  // Which name is shown first. ['groom', 'bride'] shows TANAKA & FUTABA.
  nameOrder: ['groom', 'bride'],

  tagline: 'A Love Story Written Beneath the Sakura',

  // YYYY-MM-DD
  date: '2027-02-20',

  // The moment the countdown counts down to, with its time zone (+08:00 is Malaysia).
  countdownTarget: '2027-02-20T17:00:00+08:00',

  ceremonyTime: '5:00 PM',
  receptionTime: '7:30 PM',

  venue: 'Sakura Garden Pavilion',

  // PLACEHOLDER: paste the venue's real Google Maps link here.
  mapsUrl: 'https://www.google.com/maps',
};
