const invoiceHtml = `
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<style>
			* {
				padding: 0px;
				margin: 0px;
				box-sizing: border-box;
			}
			body {
				font-family: 'Roboto', sans-serif;
				margin: 0;
				padding: 0;
				background-color: #ffffff;
				height: 100vh;
			}
			header {
				background-color: #f43db0;
				height: 20px;
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
				padding: 0 80px;
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
				border-bottom: 2px solid lightgray;
				padding-bottom: 5px;
			}
			.box {
				min-height: 60px;
				border-bottom: 2px solid lightgray;
				display: flex;
				justify-content: space-between;
				margin: auto 0;
			}
			.box h2,
			.heading h2 {
				font-weight: 500;
				font-size: 13px;
				text-transform: uppercase;
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
				class="logo"
				alt="logo"
				style="margin: 30px 0"
			/>
			<img
				src="https://cms.dubaidailydeals.app/complete-logo.png"
				class="watermark"
				alt="logo"
			/>

			<div style="width: 100%">
				<div class="heading">
					<h2>Billed To</h2>
					<h2>Invoice: #{{invoiceNumber}}</h2>
				</div>
				<div class="data bottom-border box">
					<div class="flex-1">
						<p class="flex-1" style="text-transform: uppercase">
							{{name}}
						</p>
						<p class="flex-1" style="text-transform: uppercase">
							{{title}}
						</p>
						<p class="flex-1" style="text-transform: uppercase">
							{{address}}
						</p>
					</div>
					<p class="flex-1" style="text-align: right">{{date}}</p>
				</div>

				<div class="box">
					<h2 class="flex-3">package</h2>
					<h2 class="flex-1" style="text-align: center">qty.</h2>
					<h2 class="flex-1" style="text-align: center">
						Unit Price
					</h2>
					<h2 class="flex-1" style="text-align: right">Total</h2>
				</div>
				<div class="box">
					<p class="flex-3">
						DDD {{package}} Subscription for {{time}} year
					</p>
					<p class="flex-1" style="text-align: center">1</p>
					<p class="flex-1" style="text-align: center">{{amount}}</p>
					<p class="flex-1" style="text-align: right">{{amount}}</p>
				</div>
				<div class="box"></div>
				<div class="box"></div>
				<div class="box">
					<div style="margin: auto 0" class="flex-3">
						<p class="flex-3">Total</p>
						<p class="flex-3">{{discount}}</p>
					</div>
					<div style="margin: auto 0">
						<p class="flex-1" style="text-align: right">
							{{amount}}
						</p>
						<p class="flex-1" style="text-align: right">
							{{discountAmount}}
						</p>
					</div>
				</div>
				<div class="heading">
					<h2 class="flex-3">TOTAL DUE</h2>
					<h2 class="flex-1" style="text-align: right">
						AED {{finalAmount}}
					</h2>
				</div>
				<div class="heading" style="min-height: 20px">
					<h2 class="flex-3">{{amountInWords}}</h2>
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
					<div style="display: flex; gap: 10px; margin: 20px 0px">
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
							style="position: absolute; right: 0px; top: -30px"
						>
							<img
								src="https://cms.dubaidailydeals.app/D3-stamp.png"
								class="logo"
								alt="logo"
								style="width: 175px"
							/>
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
	</body>
</html>
`;

export default { invoiceHtml };
