export class InviteResponseBuilder {
  static buildInviteSuccessResponse({ invite, emailResult }) {
    return {
      success: true,
      message: 'Trainer invite sent successfully',
      inviteId: invite._id,
      emailId: emailResult.emailId
    };
  }

  static buildValidateInviteResponse(invite) {
    return {
      success: true,
      invite: {
        firstName: invite.firstName,
        lastName: invite.lastName,
        email: invite.email,
        specialties: invite.specialties,
        expiresAt: invite.expiresAt
      }
    };
  }

  static buildAcceptInviteResponse(trainer) {
    return {
      success: true,
      message: 'Registration completed successfully',
      user: {
        id: trainer._id,
        firstName: trainer.firstName,
        lastName: trainer.lastName,
        email: trainer.email,
        role: trainer.role
      }
    };
  }
}