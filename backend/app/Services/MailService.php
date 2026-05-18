<?php

namespace App\Services;

use App\Mail\EmailVerificationMail;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

class MailService
{
    public function sendEmailVerification(User $user): void
    {
        Mail::to($user->email)->send(
            new EmailVerificationMail($user, $this->buildEmailVerificationUrl($user))
        );
    }

    private function buildEmailVerificationUrl(User $user): string
    {
        $frontendUrl = rtrim((string) config('app.frontend_url'), '/');

        return $frontendUrl.'/email-confirmation?token='.$user->verification_token;
    }
}
