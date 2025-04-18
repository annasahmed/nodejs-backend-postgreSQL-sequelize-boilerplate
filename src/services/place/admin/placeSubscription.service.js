const db = require("../../../db/models").default;
const dayjs = require("dayjs");
const { createUpgradeInvoice } = require("../../Admin/stripe.service");

async function createPlaceSubscription(place, packageId) {
	const pkg = await db.packages.findOne({ where: { id: packageId } });
	const subscription = db.subscriptions.build();
	let startDate = place.start_date ? dayjs(place.start_date) : dayjs(); // Fallback to today's date if null

	if (startDate.isBefore(dayjs(), 'day')) {
		startDate = dayjs();
	}

	subscription.start_date = startDate.toDate();
	subscription.end_date = dayjs().add(pkg.month + pkg.trial_months, 'month').toDate()
	subscription.place_id = place.id;
	subscription.first_purchase_date = new Date();
	subscription.renewal_date = dayjs().add(pkg.month + pkg.trial_months, 'month');
	subscription.package_id = packageId;
	subscription.next_package_id = packageId;
	subscription.subscription_status_id = 1;
	await subscription.save();
	//console.log("Upgrade subscription");

	if (pkg.fee > 0) {
		//console.log("Upgrade fee",pkg.fee);
		await createUpgradeInvoice(place.id, subscription, pkg.fee, true);
	}
}
async function updatePlaceSubscription(place, packageId) {
	const pkg = await db.packages.findOne({ where: { id: packageId } });
	const subscription = await db.subscriptions.findOne({ where: { place_id: place.id } });
	if (!subscription) {
		return await createPlaceSubscription(place, packageId);
	}
	if (packageId !== subscription.package_id) {
		const oldPackage = await db.packages.findOne({ where: { id: subscription.package_id } });

		if (oldPackage && pkg) {
			let oldPackageTotalMonths;
			if (oldPackage.fee <= 0) {
				oldPackageTotalMonths = 0;
			} else {
				oldPackageTotalMonths = +oldPackage.month + (oldPackage.trial_months || 0);
			}

			const newPackageTotalMonths = +pkg.month + (pkg.trial_months || 0);

			if (oldPackageTotalMonths <= newPackageTotalMonths || oldPackage.fee < pkg.fee) {
				// Update subscription end date and create invoice
				const remainingMonths = newPackageTotalMonths - oldPackageTotalMonths;

				if (oldPackageTotalMonths <= 0) {
					subscription.end_date = dayjs().add(newPackageTotalMonths, 'month').toDate();
					subscription.renewal_date = dayjs().add(newPackageTotalMonths, 'month').toDate();
				} else {
					subscription.end_date = new Date(subscription.end_date.setMonth(subscription.end_date.getMonth() + remainingMonths));
					subscription.renewal_date = new Date(subscription.end_date.setMonth(subscription.end_date.getMonth() + remainingMonths));
				}
				subscription.package_id = packageId;
				subscription.next_package_id = packageId;

				const proratedPrice = ((pkg.fee / newPackageTotalMonths) * remainingMonths).toFixed(2);
				await createUpgradeInvoice(place.id, subscription, proratedPrice);
				await subscription.save();

				//console.log('Subscription end date updated and invoice created');
			} else {
				// Only update next_package_id
				subscription.next_package_id = packageId;
				await subscription.save();

				//console.log('Subscription next_package_id updated');
			}
		}
	} else {
		//console.log('Package ID is the same as current subscription');
	}
	return subscription;
}

export default {
	createPlaceSubscription,
	updatePlaceSubscription
}
