Daily Sales Report - {{ $salesData['date'] }}

Summary:
- Total Orders: {{ $salesData['total_orders'] }}
- Total Revenue: ${{ number_format($salesData['total_revenue'], 2) }}

Products Sold:
@foreach($salesData['products_sold'] as $product)
- {{ $product['name'] }}: {{ $product['quantity'] }} units - ${{ number_format($product['revenue'], 2) }}
@endforeach

Thank you for your business!

