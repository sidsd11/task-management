const EMAIL_STYLES = `
<style>
    body {
        margin: 0;
        padding: 0;
        font-family: 'Open Sans', Arial, sans-serif;
        background: #F6FAFB;
    }

    table, td {
        border-collapse: collapse;
    }

    .container {
        width: 100%;
        max-width: 500px;
        margin: 50px auto;
        background: #ffffff;
    }

    .main-content {
        padding: 40px 30px;
        color: #000000;
    }

    .brand {
        padding-bottom: 24px;
        font-size: 24px;
        font-weight: bold;
        color: #22C55E;
    }

    .heading {
        padding-bottom: 20px;
        font-size: 22px;
        line-height: 150%;
        font-weight: bold;
    }

    .message {
        padding-bottom: 16px;
        font-size: 14px;
        line-height: 180%;
    }

    .otp {
        display: inline-block;
        background: #22C55E;
        color: #ffffff;
        padding: 18px 32px;
        font-size: 32px;
        font-weight: 800;
        letter-spacing: 10px;
        text-align: center;
        border-radius: 8px;
        margin: 0;
    }

    .button {
        display: inline-block;
        background: #22C55E;
        color: #ffffff !important;
        text-decoration: none;
        padding: 12px 24px;
        font-size: 14px;
        font-weight: bold;
        border-radius: 7px;
    }

    .footer {
        padding-top: 20px;
        border-top: 1px solid #eeeeee;
        color: #777777;
        font-size: 12px;
        line-height: 180%;
    }

    @media only screen and (max-width: 480px) {
        .container {
            width: 92% !important;
        }

        .main-content {
            padding: 30px 20px !important;
        }

        .otp {
            font-size: 24px;
            letter-spacing: 6px;
            padding: 14px 24px;
        }
    }
</style>
`

const createEmailLayout = (content, title) => `
<!DOCTYPE html>
<html>
<head>
    <title>${title}</title>
    <meta http-equiv='Content-Type' content='text/html charset=UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <link href='https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap' rel='stylesheet'>
    ${EMAIL_STYLES}
</head>
<body>
    <table width='100%' cellspacing='0' cellpadding='0'
        border='0' bgcolor='#F6FAFB'>
        <tr>
            <td align='center' valign='top'>
                <table class='container' width='500'
                    cellspacing='0' cellpadding='0' border='0'>
                    <tr>
                        <td class='main-content'>
                            <table width='100%' cellspacing='0'
                                cellpadding='0' border='0'>
                                <tr>
                                    <td class='brand'>✓ To-Do List</td>
                                </tr>
                                ${content}
                                <tr>
                                    <td class='footer'>
                                        The To-Do List Team
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`

export const WELCOME_EMAIL_TEMPLATE = ({ name }) =>
	createEmailLayout(
		`
        <tr>
            <td class='heading'>
                Welcome aboard, ${name}! 🎉
            </td>
        </tr>
        <tr>
            <td class='message'>
                Your account has been created successfully.
                We're excited to have you here!
            </td>
        </tr>
        <tr>
            <td class='message'>
                Start organizing your day, managing your tasks,
                and tracking your progress with To-Do List.
            </td>
        </tr>
        <tr>
            <td class='message'>
                Small steps every day lead to big results.
                Let's make today productive!
            </td>
        </tr>
    `,
		'Welcome to To-Do List'
	)

export const EMAIL_VERIFICATION_OTP_TEMPLATE = ({ otp, expiryMinutes = 5 }) =>
	createEmailLayout(
		`
        <tr>
            <td class='heading'>Verify your email</td>
        </tr>
        <tr>
            <td class='message'>
                Use the OTP below to verify your account.
            </td>
        </tr>
        <tr>
            <td style='padding-bottom:24px'>
                <p class='otp'>${otp}</p>
            </td>
        </tr>
        <tr>
            <td class='message'>
                This OTP is valid for ${expiryMinutes} minutes.
                Do not share this code with anyone.
            </td>
        </tr>
    `,
		'Verify Your Email'
	)

export const RESET_PASSWORD_OTP_TEMPLATE = ({ otp, expiryMinutes = 5 }) =>
	createEmailLayout(
		`
        <tr>
            <td class='heading'>Reset your password</td>
        </tr>
        <tr>
            <td class='message'>
                Use the OTP below to reset your password.
            </td>
        </tr>
        <tr>
            <td style='padding-bottom:24px'>
                <p class='otp'>${otp}</p>
            </td>
        </tr>
        <tr>
            <td class='message'>
                This OTP is valid for ${expiryMinutes} minutes.
                Do not share this code with anyone.
            </td>
        </tr>
        <tr>
            <td class='message'>
                If you didn't request a password reset, ignore
                this email. Your password will remain unchanged.
            </td>
        </tr>
    `,
		'Reset Your Password'
	)
