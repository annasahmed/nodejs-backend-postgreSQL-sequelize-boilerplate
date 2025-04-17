const { numberToWords, padNumber } = require('../../utils/globals');
const dayjs = require('dayjs');
const receiptFormat = (vendor, records, data) => {
	let html = `
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<style>
			@page {
				margin: 0;
			}
			* {
				padding: 0px;
				margin: 0px;
				box-sizing: border-box;
			}
			body {
				font-family: 'Roboto', sans-serif;
				margin: 0;
				padding: 0 0 20mm 0;
				background-color: #ffffff;
				/* height: 100vh; */
			}
			header {
				background-color: #f43db0;
				height: 20px;
				position: fixed;
				top: 0px;
				right: 0px;
				border: 1px solid red;
				width: 100%;
			}
			.page {
				page-break-before: always;
				padding-top: 170px;
				
			}
			.main-logo {
				width: 220px;
				object-fit: contain;
				position: fixed;
				top: 10px;
			}
			footer {
				position: fixed;
				bottom: 0px;
				right: 0px;
				width: 100%;
				/* max-width: 100%; */
				background-color: #1d95fb;
				display: flex;
				justify-content: space-between;
				align-items: center;
				color: #ffffff;
				font-size: 11px;
				letter-spacing: 1px;
				font-weight: 400;
				padding: 15px;
			}
			.footer-label {
				display: flex;
				align-items: center;
				gap: 5px;
			}
			.footer-icon-container {
				border: 1px solid #ffffff;
				border-radius: 50%;
				width: 20px;
				height: 20px;
				transform: translate(-45);
				display: flex;
				justify-content: center;
				align-items: center;
				padding-left: 0.3px;
			}
			.footer-icons {
				transform: rotate(-45deg);
			}
			main {
				width: 100%;
				padding: 0 80px 80px;
				display: flex;
				flex-direction: column;
				align-items: center;
			}
			.logo {
				width: 240px;
				object-fit: contain;
			}
			.watermark {
				position: fixed;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%) rotate(-40deg);
				opacity: 0.05;
				z-index: 99;
				color: white;
				width: 700px;
			}
			.flex-1 {
				flex: 1;
			}
			.flex-3 {
				flex: 3;
			}
			.heading {
				font-size: 16px;
				text-transform: uppercase;
				font-weight: 500;
				display: flex;
				justify-content: space-between;
				min-height: 50px;
			}
			.data {
				font-size: 14px;
				display: flex;
				justify-content: space-between;
			}
			.bottom-border {
				border-bottom: 1px solid lightgray;
				padding-bottom: 5px;
			}
			.box {
				min-height: 60px;
				border-bottom: 1px solid lightgray;
				display: flex;
				justify-content: space-between;
				margin: auto 0;
				gap: 10px;
			}
			.box h2,
			.heading h2 {
				font-weight: 500;
				font-size: 13px;
				margin: auto 0;
			}
			.box p,
			.heading p {
				font-weight: 400;
				font-size: 12px;
				font-style: italic;
				margin: auto 0;
				line-height: 20px;
				text-transform: none;
			}
			.flex {
				display: flex;
				justify-content: space-between;
				align-items: center;
			}
			.px-2 {
				padding-left: 0.5rem;
				padding-right: 0.5rem;
			}
			table {
				width: 100%; /* Make the table span the full width of the container */
				border-collapse: collapse; /* Remove default spacing between table cells */
			}

			table th,
			table td {
				border-bottom: 1px solid #ddd; /* Add bottom border to all rows */
				text-align: left; /* Align text to the left */
				padding: 8px; /* Add padding for better readability */
				width: auto; /* Ensure columns adjust to equal width */
			}

			table th {
				font-weight: 500; /* Make headings slightly bold */
				/* background-color: #f9f9f9; Optional: Light background for table headers */
				font-weight: 500;
				font-size: 13px;
				margin: auto 0;
			}

			table td {
				vertical-align: top; /* Ensure proper alignment of cell content */
				font-weight: 400;
				font-size: 12px;
				font-style: italic;
				margin: auto 0;
				line-height: 20px;
				text-transform: none;
			}
		</style>
		<link
			rel="stylesheet"
			href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
		/>
	</head>
	<body>
		<header></header>
		<main>
			<img
				src="https://cms.dubaidailydeals.app/logo-ddd-slogan.png"
				class="main-logo"
				alt="logo"
				style="margin: 30px 0"
			/>
			<img
				src="https://cms.dubaidailydeals.app/complete-logo.png"
				class="watermark"
				alt="logo"
			/>

			<div style="width: 100%" class="page">
				<div class="heading">
					<h2>Billed To</h2>
					<h2>Invoice: #${padNumber(data.id)}</h2>
				</div>
				<div class="data bottom-border box">
					<div class="flex-1">
						<p class="flex-1" style="text-transform: uppercase">
							${vendor.name}
						</p>
						<p class="flex-1" style="text-transform: uppercase">
							${vendor.contact_person_name ? vendor.contact_person_name : ''}
						</p>
					</div>
					<p class="flex-1" style="text-align: right">${dayjs(data.created_date_time).format('DD/MM/YYYY')}</p>
				</div>`;
	html += `
        <div class="box">
					<h2 class="flex-1">Place</h2>
					<h2 class="flex-1" style="text-align: right">Amount</h2>
				</div>`;

	records.length > 0
		? records.forEach((place) => {
				html += `<div class="box">
					<p class="flex-1 px-2">
						${place.vendor_place?.place?.title || vendor.name}
					</p>
					<p class="flex-1 px-2" style="text-align: right">AED ${place.total_amount}</p> 
				</div>`;
			})
		: (html += `<div class="box">
					<p class="flex-1 px-2">
						${vendor.name}
					</p>
					<p class="flex-1 px-2" style="text-align: right">AED ${data.total}</p> 
				</div>`);
	html += `<br><br>
				<div class="heading">
					<h2 class="flex-3">TOTAL Payable</h2>
					<h2 class="flex-1" style="text-align: right">
						AED ${data.total}
					</h2>
				</div>
				<div class="heading" style="min-height: 20px">
					<h2 class="flex-3">${numberToWords(data.total)}</h2>
				</div>
				<div>
					<img
						src="https://cms.dubaidailydeals.app/thank-you-img.png"
						class="logo"
						alt="logo"
						style="margin: 20px 0 15px; width: 200px"
					/>
				</div>

				<div class="heading" style="display: block; position: relative">
					<h2 class="flex-3">PAYMENT INFORMATION</h2>
					<div style="display: flex; gap: 10px; margin: 20px 0">
						<div style="">
							<p>Bank:</p>
							<p>Account Name:</p>
							<p>Account Number:</p>
							<p>IBAN:</p>
							<p>BIC:</p>
						</div>
						<div style="">
							<h2>WIO BANK</h2>
							<h2>D U DAILY DEALS</h2>
							<h2>9249120896</h2>
							<h2>AE4 808600000092491 20896</h2>
							<h2>WIOBAEADXXX</h2>
						</div>
						<div
							class=""
							style="position: absolute; right: 0px; top: -100px"
						>
							<img
								src="https://cms.dubaidailydeals.app/D3-stamp.png"
								class="logo"
								alt="logo"
								style="width: 175px"
							/>
						</div>
						<div
							class=""
							style="position: absolute; right: 20px; top: 70px"
						>
							<img
								src="https://cms.dubaidailydeals.app/invoice-paid.png"
								class="logo"
								alt="logo"
								style="width: 175px"
							/>
							<p style="text-align: right; padding-top: 8px">
								Date:
								${dayjs(data.paid_at).format('DD/MM/YYYY')}
							</p>
						</div>
					</div>
				</div>
				<div class="heading" style="display: block">
					<p>
						Payment is required within 14 business days of invoice
						date.
					</p>
					<p>
						Please send the deposit receipt to
						info@dubaidailydeals.app
					</p>
				</div>
			</div>
		</main>

		<footer>
			<p>FOR INQUIRIES:</p>
			<div class="footer-label">
				<p class="footer-icon-container">
					<i class="fa-solid fa-phone-volume footer-icons"></i>
				</p>
				+971 556955390
			</div>
			<div class="footer-label">
				<p class="footer-icon-container">
					<i class="fa-solid fa-envelope"></i>
				</p>
				info@dubaidailydeals.app
			</div>
			<div class="footer-label">
				<p class="footer-icon-container">
					<i class="fa-brands fa-instagram"></i>
				</p>
				@dubaidailydeals
			</div>
		</footer>
		</main>	</body></html>

`;

	return html;
};

module.exports = { receiptFormat };
