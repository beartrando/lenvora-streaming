export class AuthorizeProfileUseCase {
    constructor(
        private readonly profileService: ProfileService,
    ) {
    }

    async execute(
        userId: string,
        profileId: string,
        jwt: string,
    ): Promise<boolean> {
        const resp = await this.profileService.getByUser(
            userId,
            jwt,
        );

        return resp?.profile?.id === profileId;
    }
}
