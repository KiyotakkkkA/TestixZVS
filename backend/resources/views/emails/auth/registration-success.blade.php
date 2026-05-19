<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Регистрация завершена</title>
</head>
<body style="margin:0;padding:0;background-color:#141414;color:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;margin:0;padding:0;background-color:#141414;border-collapse:collapse;">
        <tr>
            <td align="center" style="padding:36px 16px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;max-width:520px;border-collapse:collapse;">
                    <tr>
                        <td align="center" style="padding:0 0 28px;">
                            <div style="color:#ffffff;font-size:26px;font-weight:700;line-height:1;letter-spacing:1px;">Testix</div>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color:#2d2d2d;border-radius:8px;padding:28px 28px 24px;">
                            <h1 style="margin:0 0 18px;color:#ffffff;font-size:24px;line-height:1.25;font-weight:700;text-align:center;">Завершение регистрации</h1>

                            <div style="margin:0 0 22px;padding:14px 16px;background-color:#15352d;border:1px solid #0f7a61;border-radius:8px;">
                                <p style="margin:0;color:#c7f4e6;font-size:14px;line-height:1.55;">
                                    Аккаунт успешно активирован. Теперь вам доступны все возможности Testix.
                                </p>
                            </div>

                            <p style="margin:0 0 18px;color:#d8d8d8;font-size:15px;line-height:1.6;">
                                Здравствуйте, {{ $user->name }}. Учетная запись для
                                <span style="color:#ffffff;font-weight:700;">{{ $user->email }}</span>
                                подтверждена и готова к работе.
                            </p>

                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;">
                                <tr>
                                    <td align="center" style="padding:6px 0 22px;">
                                        <a href="{{ rtrim((string) config('app.frontend_url'), '/') }}" style="display:inline-block;width:100%;max-width:320px;box-sizing:border-box;background-color:#e6e6e6;color:#252525;text-decoration:none;text-align:center;font-size:16px;font-weight:700;line-height:1.2;padding:13px 18px;border-radius:6px;">
                                            Перейти в Testix
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin:0;color:#bdbdbd;font-size:13px;line-height:1.55;">
                                Если это действие выполнили не вы, пожалуйста, смените пароль или обратитесь в поддержку.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding:18px 10px 0;">
                            <p style="margin:0;color:#7d7d7d;font-size:12px;line-height:1.5;">
                                Это автоматическое письмо от Testix, отвечать на него не нужно.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
