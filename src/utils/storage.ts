// LocalStorage helpers for participants, winners, settings
export interface Participant { n: number; name: string; }
export interface Winner extends Participant { pickedAt: string; }
export interface Settings { allowRepeatWinners: boolean; }

const PARTICIPANTS_KEY = 'participants';
const WINNERS_KEY = 'winners';
const SETTINGS_KEY = 'settings';

export function saveParticipants(list: Participant[]) {
  localStorage.setItem(PARTICIPANTS_KEY, JSON.stringify(list));
}
export function getParticipants(): Participant[] {
  return JSON.parse(localStorage.getItem(PARTICIPANTS_KEY) || '[]');
}
export function clearParticipants() {
  localStorage.removeItem(PARTICIPANTS_KEY);
  localStorage.removeItem(WINNERS_KEY);
}
export function saveWinner(winner: Winner) {
  const winners = getWinners();
  winners.unshift(winner);
  localStorage.setItem(WINNERS_KEY, JSON.stringify(winners));
}
export function getWinners(): Winner[] {
  return JSON.parse(localStorage.getItem(WINNERS_KEY) || '[]');
}
export function clearWinners() {
  localStorage.removeItem(WINNERS_KEY);
}
export function saveSettings(settings: Settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
export function getSettings(): Settings {
  return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{"allowRepeatWinners":false}');
}
