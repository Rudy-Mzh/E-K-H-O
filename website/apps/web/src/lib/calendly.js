export const CALENDLY_URL = 'https://calendly.com/rudymezoughi';

export const openCalendly = () => {
  if (window.Calendly) {
    window.Calendly.initPopupWidget({ url: CALENDLY_URL });
  } else {
    window.open(CALENDLY_URL, '_blank');
  }
};
