// required params
// vendor_name : vendor.name
// number_of_venues : vendor.places.count + venue
// amount : package.fee
// date_of_contract : current_date

const { termAndConditonFomrat } = require('./termsAndConditions');

const premuimContractFormat = `<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
				padding: 0;
				background-color: #ffffff;
				height: 100vh;
			}
			header {
				background-color: #f43db0;
				padding: 5px;
				font-size: 1.5rem;
				color: white;
				text-align: center;
			}
			header-2 {
				background-color: #1d95fb;
				padding: 5px;
				font-size: 1.25rem;
				color: white;
				text-align: center;
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
				padding: 0 30px;
				display: flex;
				/* flex-direction: column; */
				/* align-items: center; */
				gap: 50px;
			}
			.bold {
				font-weight: 600;
			}
			.main-section {
				flex: 1;
				display: flex;
				flex-direction: column;
				gap: 10px;
				font-size: 13px;
				line-height: 16px;
				list-style-position: inside;
				margin-top: 15px;
			}
			.main-section ul,
			.main-section ol {
				margin-left: 10px;
			}
			.page {
				page-break-before: always;
				/* padding-top: 170px; */
				/* padding-bottom: 20px; */
			}
			.section-points {
				padding-left: 1rem;
				/* border: 1px solid red; */
			}
			ol {
    list-style-type: upper-alpha; /* A, B, C, ... */
    list-style-position: outside; /* Markers outside the content */
    padding-left: 35px;            /* Indent the list */
  }

  li {
    margin: 5px 0; /* Optional spacing between items */
  }
		</style>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    </head>
    <body>
        <h1 style="font-size: 3rem; font-weight: 400; color: #1d95fb; text-align: center; margin-top: 5px;">DUBAI DAILY DEALS</h1>
        <header>PREMIUM PACKAGE PARTNER CONTRACT</header>
        <main>
            <section class="main-section">
                <div class="content-container">
                    <h3>Parties:</h3>
                    <p>
                        This agreement is entered into between Dubai Daily Deals and {{vendor_name}} for {{number_of_venues}} Premium venue(s):
                    </p>
                </div>
                <div class="content-container">
                    <h3>Agreement:</h3>
                    <p>
                        By signing this contract, the Client agrees to subscribe to the Standard Package offered by the Company for their Dubai daily deals business
                    </p>
                </div>
                <div class="content-container">
                    <h3>
                        Standard Package Details:
                    </h3>
                    <p>
                        As part of the Standard Package, the Client will receive the following benefits:
                    </p>
                    <ul>
                        <li>Detailed and enriched venue description on the Company's app, including three images.</li>
                        <li>Featured promotions and exclusive discounts for the said venue(s)</li>
                        <li>Daily updates on the venue's offerings under the "Happenings" section.</li>
                        <li>Seamless booking process with prominent booking links provided.</li>
                        <li>Direct links to explore the menu offerings of the said venue(s)</li>
                        <li>Dashboard access with detailed reports on transactions and payments.</li>
                        <li>One captivating story shared bi-weekly on the Company's social media platform.</li>
                    </ul>
                </div>
                <div class="content-container">
                    <h3>Discount Offer:</h3>
                    <p>
                        As part of the Standard Package agreement, the Client has agreed to offer (Client to complete)
                    </p>
                </div>
                <div class="content-container">
                    <h3>Commission Structure:</h3>
                    <p>
                        As a Standard or Premium Partner, you'll enter a commission-based setup. Upon signing, you'll receive a unique PIN code for your customers to use. If you already have a PIN from other platforms, feel free to keep using it. Dubai Daily Deals will receive a 5% commission off the total bill after the discount. You'll receive a monthly invoice for the commission owed, which must be paid within 30 days of receiving the invoice. If payment is not received, your partner package will revert to a basic package until payment is made.
                    </p>
                </div>
                <div class="content-container">
                    <h3>Payment Terms:</h3>
                    <p>
                        After the one month trial period, payment must be made within 7 days of signing the contract.
                    </p>
                </div>
            </section>
            <section class="main-section">
                <div class="content-container">
                    <h3>Payment of AED {{amount}} to be made to the following account:</h3>
                    <p style=" background: #EDEEF3; width: fit-content; padding: 10px; border-radius: 10px; margin: 10px 0; font-weight: 600; line-height: 18px;">
                        ACCOUNT NAME: D U DAILY DEALS
                        <br>
                        BANK: WIO BANK
                        <br>
                        ACCOUNT NUMBER: 9249120896
                        <br>
                        IBAN: AE4 80860000009249120896
                        <br>
                        BIC: WIOBAEADXXX
                    </p>
                </div>
                <div class="content-container">
                    <h3>Duration:</h3>
                    <p>
                        This agreement shall be effective for a period of 13 months (1month free trial and 12 months contract period) from the date of signing, unless terminated earlier as per the terms of this contract
                    </p>
                </div>
                <div class="content-container">
                    <h3>Termination:</h3>
                    <p>
                        Either party may terminate this agreement with a thirty (30) days written notice to the other party. In case of early termination, no refund will be provided for the remaining subscription period.
                    </p>
                </div>
                <div class="content-container">
                    <h3>Confidentiality:</h3>
                    <p>
                        Both parties agree to keep confidential any proprietary information shared during the course of this agreement.
                    </p>
                </div>
                <div class="content-container">
                    <h3>Governing Law:</h3>
                    <p>
                        This contract shall be governed by and construed in accordance with the laws of the United Arab Emirates.
                    </p>
                </div>
                <div class="content-container">
                    <h3>Signatures:</h3>
                    <p>
                        The undersigned parties hereby agree to the terms and conditions outlined in this contract.
                    </p>
                </div>
                <div class="content-container" style="position: relative;">
                    <h3>{{vendor_name}}</h3>
                    <p>
                        <br>
                        <br>
                        <br>
                        _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
                    </p>
                    <br>
                    <p>Date: {{date_of_contract}}</p>
                    <br>
                    <h3 style="font-weight: 600;">Sarah Jackson</h3>
                    <p>
                        <div style="height: fit-content;">
                            <img
                                src={{image}}
                                class="logo"
                                alt="signature"
                                style="width: 120px; height:120px; object-fit: contain;"
                            >
                        </div>
                    </p>
                    <br>
                    <p>Date: {{date_of_contract}}</p>
                </div>
                <div style="display: flex; width: 100%; padding-right: 10px; margin-top: -140px; justify-content: flex-end;">
                    <img
                        src="https://cms.dubaidailydeals.app/D3-stamp.png"
                        class="logo"
                        alt="logo"
                        style="width: 175px"
                    >
                </div>
            </section>
        </main>
       ${termAndConditonFomrat}
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

module.exports = { premuimContractFormat };
