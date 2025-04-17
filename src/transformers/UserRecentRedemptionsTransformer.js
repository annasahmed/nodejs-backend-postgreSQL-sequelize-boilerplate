class UserRecentRedemptionsTransformer {
	transform(transaction) {
		return {
			total: transaction.total,
			page: transaction.page,
			data: transaction.data.map((transaction) => {
				transaction.place_title = transaction.place?.title;
				return {
					id:transaction.id,
					place_title: transaction.place_title??"Title not found",
					percentage: transaction.discount_percentage,
					saved_amount: transaction.discount_amount,
					total_amount: transaction.total,
					date: transaction.created_date_time,
				}
			}),
			limit: transaction.limit,
		};
	}
}

module.exports = new UserRecentRedemptionsTransformer();
