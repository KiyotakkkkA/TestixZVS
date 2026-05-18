<?php

namespace App\Services;

use App\Mail\EmailVerificationMail;
use App\Mail\RegistrationSuccessMail;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class MailService
{
    public function sendEmailVerification(User $user): bool
    {
        return $this->send(
            $user,
            new EmailVerificationMail($user, $this->buildEmailVerificationUrl($user)),
            'email_verification',
        );
    }

    public function sendRegistrationSuccess(User $user): bool
    {
        return $this->send($user, new RegistrationSuccessMail($user), 'registration_success');
    }

    private function send(User $user, mixed $mail, string $mailType): bool
    {
        try {
            Mail::to($user->email)->send($mail);

            return true;
        } catch (Throwable $exception) {
            Log::warning('Mail sending failed.', [
                'mail_type' => $mailType,
                'email' => $user->email,
                'exception' => $exception::class,
                'message' => $exception->getMessage(),
            ]);

            return false;
        }
    }

    private function buildEmailVerificationUrl(User $user): string
    {
        $frontendUrl = rtrim((string) config('app.frontend_url'), '/');

        return $frontendUrl.'/email-confirmation?token='.$user->verification_token;
    }
}
