<?php

namespace App\Console\Commands;

use App\Mail\DailySalesReportMail;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendDailySalesReport extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sales:daily-report';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send daily sales report to admin';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $today = now()->startOfDay();
        $tomorrow = now()->endOfDay();

        $orders = Order::whereBetween('created_at', [$today, $tomorrow])->get();

        $totalOrders = $orders->count();
        $totalRevenue = $orders->sum('total_amount');

        $orderItems = OrderItem::whereHas('order', function ($query) use ($today, $tomorrow) {
            $query->whereBetween('created_at', [$today, $tomorrow]);
        })->with('product')->get();

        $productsSold = [];
        foreach ($orderItems as $item) {
            $productName = $item->product->name;
            if (!isset($productsSold[$productName])) {
                $productsSold[$productName] = [
                    'name' => $productName,
                    'quantity' => 0,
                    'revenue' => 0,
                ];
            }
            $productsSold[$productName]['quantity'] += $item->quantity;
            $productsSold[$productName]['revenue'] += $item->quantity * $item->price;
        }

        $salesData = [
            'date' => now()->format('Y-m-d'),
            'total_orders' => $totalOrders,
            'total_revenue' => $totalRevenue,
            'products_sold' => array_values($productsSold),
        ];

        // Get admin user (type = 1)
        $admin = User::where('type', User::TYPE_ADMIN)->first();

        if ($admin) {
            Mail::to($admin->email)->send(new DailySalesReportMail($salesData));
            $this->info('Daily sales report sent successfully to ' . $admin->email);
        } else {
            $this->error('No admin user found. Please create an admin user.');
        }
    }
}
