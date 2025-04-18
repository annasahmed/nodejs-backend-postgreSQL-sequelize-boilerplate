// transformers/UserTransformer.js
class UserSavingsTransformer {
	transform(userSaving) {
		return {
			savings: userSaving.total_savings,
			total_spent: userSaving.total_spent,
		};
	}
}

export default new UserSavingsTransformer();
