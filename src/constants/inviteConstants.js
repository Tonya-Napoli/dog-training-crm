export const NOTIFICATION_TYPES = {
  TRAINER_INVITED: 'trainer_invited',
  INVITE_ACCEPTED: 'invite_accepted'
};

export const REQUIRED_INVITE_FIELDS = ['firstName', 'lastName', 'email'];

export const TRAINER_DEFAULTS = {
  ROLE: 'trainer',
  IS_ACTIVE: true,
  AGREES_TO_TERMS: true,
  REGISTRATION_METHOD: 'invite'
};