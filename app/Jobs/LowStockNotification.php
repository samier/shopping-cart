<?php

namespace App\Jobs;

use App\Mail\LowStockMail;
use App\Models\Product;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;

class LowStockNotification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public array $products
    ) {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // Get admin user (type = 1)
        $admin = User::where('type', User::TYPE_ADMIN)->first();

        if ($admin && !empty($this->products)) {
            Mail::to($admin->email)->send(new LowStockMail($this->products));
        }
    }
}
