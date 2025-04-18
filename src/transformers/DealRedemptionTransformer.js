// transformers/UserTransformer.js
class DealRedemptionTransformer {
	transform(dealRedemption) {
		return {
			id: dealRedemption.id,
			discount_amount: dealRedemption.discount_amount,
			discount_percentage: dealRedemption.discount_percentage,
			deal_sequence: dealRedemption.deal_sequence,
			total: dealRedemption.total,
			barcode: dealRedemption.barcode_path,
		};
	}
}

export default new DealRedemptionTransformer();
